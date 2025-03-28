"use client";

import React, { useEffect, useRef, useState } from "react";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* =================== VIDEO SEGMENT & COLLAGE COMPONENTS =================== */

/**
 * VideoSegment:
 * Hiển thị một segment của clip dựa vào blob video,
 * tự động đưa về thời điểm bắt đầu, và khi đạt tới thời gian kết thúc sẽ reset (loop) lại.
 */
interface VideoSegmentProps {
  blob: Blob;
  start: number;
  end: number;
}

const VideoSegment: React.FC<VideoSegmentProps> = ({ blob, start, end }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const url = URL.createObjectURL(blob);
    videoEl.src = url;
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.autoplay = true;

    const handleLoadedMetadata = () => {
      videoEl.currentTime = start;
      videoEl.play().catch((err) =>
        console.error("Error playing video:", err)
      );
    };

    const handleTimeUpdate = () => {
      // Sử dụng epsilon để tránh trường hợp đứng do đạt đúng end
      if (videoEl.currentTime >= end - 0.1) {
        videoEl.currentTime = start;
        // Có thể thêm delay ngắn để đảm bảo video tiếp tục chạy
        setTimeout(() => {
          videoEl.play().catch((err) =>
            console.error("Error replaying video:", err)
          );
        }, 50);
      }
    };

    videoEl.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoEl.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      videoEl.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoEl.removeEventListener("timeupdate", handleTimeUpdate);
      URL.revokeObjectURL(url);
    };
  }, [blob, start, end]);

  return (
    <video
      ref={videoRef}
      className="w-full h-auto rounded shadow"
      // Các thuộc tính autoplay, muted, playsInline đã được set qua JS.
    />
  );
};

/**
 * VideoCollage:
 * Hiển thị 4 VideoSegment theo dạng grid 2x2.
 */
interface VideoCollageProps {
  recordedVideo: Blob;
}

const VideoCollage: React.FC<VideoCollageProps> = ({ recordedVideo }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <VideoSegment blob={recordedVideo} start={0} end={3} />
      <VideoSegment blob={recordedVideo} start={3} end={6} />
      <VideoSegment blob={recordedVideo} start={6} end={9} />
      <VideoSegment blob={recordedVideo} start={9} end={12} />
    </div>
  );
};

/* =================== MAIN APP COMPONENT =================== */

export default function Page() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState<number>(12);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [photoFrames, setPhotoFrames] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");

  // Khởi tạo camera khi component mount
  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }
    initCamera();

    return () => {
      mediaStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  /**
   * startRecord:
   * - Ghi clip liên tục 12 giây từ camera.
   * - Trong quá trình ghi, hiển thị overlay countdown từ 12 xuống 0.
   * - Sau khi ghi, tạo blob, từ đó capture 4 frame (0,3,6,9 giây) để tạo Photo Collage.
   * - Đồng thời lưu blob video để sử dụng cho Video Collage.
   */
  const startRecord = async () => {
    if (!mediaStream) return;
    setRecording(true);
    setRecordedVideo(null);
    setPhotoFrames([]);
    setCountdown(12);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const recorder = new MediaRecorder(mediaStream, { mimeType: "video/webm" });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = async () => {
      clearInterval(countdownInterval);
      const blob = new Blob(chunks, { type: "video/webm" });
      setRecordedVideo(blob);
      setRecording(false);
      setCountdown(0);

      // Tạo Photo Collage: capture frame tại 0, 3, 6, 9 giây từ clip vừa ghi.
      const tempVideo = document.createElement("video");
      const tempUrl = URL.createObjectURL(blob);
      tempVideo.src = tempUrl;
      tempVideo.muted = true;
      tempVideo.playsInline = true;
      await new Promise<void>((resolve) => {
        tempVideo.addEventListener("loadedmetadata", () => resolve(), { once: true });
      });
      await delay(500);
      const frames: string[] = [];
      for (const t of [0, 3, 6, 9]) {
        tempVideo.currentTime = t;
        await new Promise<void>((resolve) =>
          tempVideo.addEventListener("seeked", () => resolve(), { once: true })
        );
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          canvas.width = tempVideo.videoWidth;
          canvas.height = tempVideo.videoHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
            frames.push(canvas.toDataURL("image/png"));
          }
        }
      }
      setPhotoFrames(frames);
      URL.revokeObjectURL(tempUrl);
    };

    recorder.start();
    setTimeout(() => {
      if (recorder.state !== "inactive") {
        recorder.stop();
      }
    }, 12000);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="mb-4 text-2xl font-bold">Web Photo Booth</h1>
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-96 h-72 rounded bg-black shadow"
        />
        {/* Canvas ẩn dùng để capture frame */}
        <canvas ref={canvasRef} className="hidden" />
        {/* Overlay countdown */}
        {recording && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded bg-black bg-opacity-50 px-4 py-2 text-4xl font-bold text-white">
              {countdown}
            </div>
          </div>
        )}
      </div>
      <button
        onClick={startRecord}
        disabled={recording}
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600 disabled:opacity-50"
      >
        {recording ? "Recording..." : "Record"}
      </button>

      {(recordedVideo || photoFrames.length === 4) && (
        <div className="mt-8 w-full max-w-4xl">
          <div className="mb-4 flex justify-center space-x-4">
            <button
              onClick={() => setActiveTab("photos")}
              className={`rounded px-4 py-2 ${
                activeTab === "photos"
                  ? "bg-blue-500 text-white"
                  : "border bg-white text-blue-500"
              }`}
            >
              Photo Collage
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`rounded px-4 py-2 ${
                activeTab === "videos"
                  ? "bg-blue-500 text-white"
                  : "border bg-white text-blue-500"
              }`}
            >
              Video Collage
            </button>
          </div>
          {activeTab === "photos" && photoFrames.length === 4 && (
            <div className="grid grid-cols-2 gap-4">
              {photoFrames.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Frame ${index + 1}`}
                  className="w-full h-auto rounded shadow"
                />
              ))}
            </div>
          )}
          {activeTab === "videos" && recordedVideo && (
            <VideoCollage recordedVideo={recordedVideo} />
          )}
        </div>
      )}
    </div>
  );
}
