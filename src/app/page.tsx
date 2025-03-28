"use client";

import { useEffect } from "react";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas-pro";
import { Navbar } from "@/components/navbar";
import { StepProgress } from "@/components/step-progress";
import { PhotoShoot } from "@/components/photo-shoot";
import { LayoutSelection } from "@/components/layout-selection";
import { MAX_CAPTURE } from "@/constants";
import {
  uploadToCloudinary,
  checkDailyQRLimit,
  updateQRGenerationCount,
} from "@/lib/upload-utils";
import { toast } from "sonner";
import Footer from "@/components/footer";

export default function PhotoBoothApp() {
  const [step, setStep] = useState<"shoot" | "layout">("shoot");
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [layoutType, setLayoutType] = useState<number>(4);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<string | null>("none");
  const [isDownloading, setIsDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const canProceedToLayout = capturedImages.length === MAX_CAPTURE;
  const canDownload = selectedIndices.length === layoutType;

  const handleStepChange = () => {
    setStep("layout");
  };

  const retakePhotos = () => {
    setCapturedImages([]);
    setSelectedIndices([]);
    setImageUrl(null);
    setStep("shoot");
  };

  const downloadComposite = async (layoutType: number) => {
    if (!previewRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      // Set default desired output dimensions for an 8-panel layout (2 columns x 4 rows)
      // 8-panel composite: 1200 x 1800 pixels (assumes preview includes padding/gaps)
      let desiredWidth = 1200; // pixels
      let desiredHeight = 1800; // pixels

      // For a 4-panel layout (vertical strip), use these dimensions
      if (layoutType === 4) {
        desiredWidth = 600; // pixels
        desiredHeight = 1800; // pixels
      }

      // Get the current displayed size of the element
      const rect = previewRef.current.getBoundingClientRect();
      const currentWidth = rect.width;
      const currentHeight = rect.height;

      // Calculate the scale factor based on the desired width
      const scaleFactor = desiredWidth / currentWidth;

      // Render the element with html2canvas at its current size, then scale it up
      const canvas = await html2canvas(previewRef.current, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: null,
        width: currentWidth, // original width
        height: currentHeight, // original height
        scale: scaleFactor, // scale factor to achieve desired width
      });

      // Create a new canvas with fixed dimensions
      const forcedCanvas = document.createElement("canvas");
      forcedCanvas.width = desiredWidth;
      forcedCanvas.height = desiredHeight;
      const ctx = forcedCanvas.getContext("2d");
      if (!ctx) {
        throw new Error("Unable to get 2D context");
      }

      // Draw the generated canvas onto the new canvas,
      // scaling it to fill the entire forced canvas area
      ctx.drawImage(
        canvas, // source canvas
        0,
        0,
        canvas.width,
        canvas.height, // source rectangle (full canvas)
        0,
        0,
        desiredWidth,
        desiredHeight, // destination rectangle in the forced canvas
      );

      // Set the download file name based on the layout type
      // Use "1x4" for a 4-panel layout, and "2x4" for an 8-panel layout
      const fileName =
        layoutType === 4
          ? `thanhtuanphotobooth_1x4_${Date.now()}.jpeg`
          : `thanhtuanphotobooth_2x4_${Date.now()}.jpeg`;

      // Create a link to download the final image
      const link = document.createElement("a");
      link.download = fileName;
      link.href = forcedCanvas.toDataURL("image/jpeg", 1.0);
      link.click();
    } catch (error) {
      console.error("Error generating the image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Update the uploadAndGenerateQR function to use the utility functions
  const uploadAndGenerateQR = async () => {
    if (checkDailyQRLimit()) {
      toast("You have reached the daily limit for generating QR codes.");
      return;
    }

    if (!previewRef.current || isUploading) return;
    setIsUploading(true);
    setImageUrl(null);

    try {
      const canvas = await html2canvas(previewRef.current, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: null,
        scale: 2,
      });

      const fileToUpload = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.8);
      });

      if (!fileToUpload) throw new Error("No file to upload");

      const secureUrl = await uploadToCloudinary(fileToUpload);
      setImageUrl(secureUrl);

      // Update the QR generation count
      updateQRGenerationCount();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast("Failed to upload. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    document.addEventListener("contextmenu", (event) => event.preventDefault());
    document.addEventListener("selectstart", (event) => event.preventDefault());
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col overflow-hidden">
      <Navbar />

      <StepProgress currentStep={step === "shoot" ? 1 : 2} />

      <AnimatePresence mode="wait">
        {step === "shoot" ? (
          <motion.div
            key="shoot"
            className="flex-1 overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            <PhotoShoot
              capturedImages={capturedImages}
              setCapturedImages={setCapturedImages}
              canProceedToLayout={canProceedToLayout}
              goToLayoutScreen={handleStepChange}
            />
          </motion.div>
        ) : (
          <motion.div
            key="layout"
            className="flex-1 overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
          >
            <LayoutSelection
              capturedImages={capturedImages}
              previewRef={previewRef}
              layoutType={layoutType}
              selectedIndices={selectedIndices}
              setSelectedIndices={setSelectedIndices}
              setLayoutType={setLayoutType}
              selectedFrame={selectedFrame}
              setSelectedFrame={setSelectedFrame}
              retakePhotos={retakePhotos}
              downloadComposite={downloadComposite}
              canDownload={canDownload}
              isDownloading={isDownloading}
              uploadAndGenerateQR={uploadAndGenerateQR}
              isUploading={isUploading}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
