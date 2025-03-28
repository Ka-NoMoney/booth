"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Check,
  GripHorizontal,
  Copy,
  Share2,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { LayoutSelectionProps } from "@/types";
import { COLOR_PALETTE, GRADIENT_PRESETS } from "@/constants/styles";
import { FRAMES } from "@/constants/assets";
import { QRCodeCanvas } from "qrcode.react";
import { FrameSelector } from "./frame-selector";

export function LayoutSelection({
  capturedImages,
  previewRef,
  layoutType,
  selectedIndices,
  setSelectedIndices,
  setLayoutType,
  selectedFrame,
  setSelectedFrame,
  retakePhotos,
  downloadComposite,
  canDownload,
  isDownloading,
  uploadAndGenerateQR,
  isUploading,
  imageUrl,
  setImageUrl,
}: LayoutSelectionProps) {
  const [frameColor, setFrameColor] = useState<string>("#FFFFFF");
  const [selectedGradient, setSelectedGradient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"solid" | "gradient" | "frames">(
    "solid",
  );
  const [copied, setCopied] = useState(false);
  const [showQRSection, setShowQRSection] = useState(false);

  const t = useTranslations("HomePage");

  // Update preview dimensions when it changes
  useEffect(() => {
    if (previewRef.current) {
      const updateDimensions = () => {
        // Implementation for dimension updates if needed
      };

      updateDimensions();

      // Use ResizeObserver to detect changes in the preview element size
      const resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(previewRef.current);

      return () => {
        if (previewRef.current) {
          resizeObserver.unobserve(previewRef.current);
        }
      };
    }
  }, [previewRef, layoutType]);

  // Show QR section when imageUrl is available
  useEffect(() => {
    if (imageUrl) {
      setShowQRSection(true);
    }
  }, [imageUrl]);

  // Reset copied state when imageUrl changes
  useEffect(() => {
    setCopied(false);
  }, [imageUrl]);

  const selectLayoutType = (type: number) => {
    setLayoutType(type);
    setSelectedIndices([]);
    setImageUrl(null);
  };

  const toggleSelect = (index: number) =>
    setSelectedIndices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : prev.length < layoutType
          ? [...prev, index]
          : prev,
    );

  const handleColorChange = (color: string) => {
    setFrameColor(color);
    setSelectedGradient(null);
    setImageUrl(null);
  };

  const handleGradientChange = (gradient: string) => {
    setSelectedGradient(gradient);
    setImageUrl(null);
  };

  const copyToClipboard = async () => {
    if (!imageUrl) return;

    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const shareUrl = async () => {
    if (!imageUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Photo Booth Creation",
          text: "Check out my photo booth creation!",
          url: imageUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      copyToClipboard();
    }
  };

  const renderCell = (idx: number) => {
    const cellContent =
      selectedIndices[idx] !== undefined ? (
        <img
          src={capturedImages[selectedIndices[idx]] || "/placeholder.svg"}
          alt={`Slot ${idx}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-400">
          <span className="text-xs">Empty</span>
        </div>
      );

    const baseClass =
      "w-full aspect-[4/3] flex items-center justify-center transition-all duration-200 overflow-hidden border border-transparent";
    const emptyClass = "border-dashed border-gray-200 bg-gray-50/50";

    return (
      <div
        key={idx}
        className={cn(
          baseClass,
          selectedIndices[idx] === undefined && emptyClass,
        )}
      >
        {cellContent}
      </div>
    );
  };

  const renderPreview = () => {
    const commonClasses =
      "mx-auto overflow-hidden rounded-md border border-gray-200 shadow-md";

    // Frame background
    const frameBackground =
      selectedFrame &&
      FRAMES.find((f) => f.id === selectedFrame)?.photostrip?.find(
        (p) => p.count === layoutType,
      )?.backgroundUrl ? (
        <div className="pointer-events-none absolute inset-0 z-0">
          <img
            src={
              FRAMES.find((f) => f.id === selectedFrame)?.photostrip?.find(
                (p) => p.count === layoutType,
              )?.backgroundUrl || ""
            }
            alt="Frame Background"
            className="h-full w-full object-contain"
          />
        </div>
      ) : null;

    // Frame overlay
    const frameOverlay =
      selectedFrame &&
      FRAMES.find((f) => f.id === selectedFrame)?.photostrip?.find(
        (p) => p.count === layoutType,
      )?.overlayUrl ? (
        <div className="pointer-events-none absolute inset-0 z-20">
          <img
            src={
              FRAMES.find((f) => f.id === selectedFrame)?.photostrip?.find(
                (p) => p.count === layoutType,
              )?.overlayUrl || ""
            }
            alt="Frame Overlay"
            className="h-full w-full object-contain"
          />
        </div>
      ) : null;

    const backgroundStyle = selectedGradient
      ? { background: selectedGradient }
      : { backgroundColor: frameColor };

    if (layoutType === 4) {
      return (
        <div
          className={cn(
            "relative max-w-[calc((100%-8px)/2+16px)]",
            commonClasses,
          )}
        >
          <div
            ref={previewRef}
            className="relative flex aspect-[1/3] flex-col gap-4 px-4 pt-4"
            style={backgroundStyle}
          >
            {frameBackground}
            <div className="relative z-10 grid grid-cols-1 gap-2">
              {Array.from({ length: 4 }, (_, idx) => renderCell(idx))}
            </div>
            {frameOverlay}
          </div>
        </div>
      );
    }

    return (
      <div className={cn(commonClasses, "relative")}>
        <div
          ref={previewRef}
          className="aspect-[2/3] px-4 pt-4"
          style={backgroundStyle}
        >
          {frameBackground}
          <div className="relative z-10 grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }, (_, idx) => renderCell(idx))}
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }, (_, idx) => renderCell(idx + 4))}
            </div>
          </div>
          {frameOverlay}
        </div>
      </div>
    );
  };

  // QR Code Section Component
  const QRCodeSection = () => {
    if (!imageUrl) return null;

    return (
      <motion.div
        className="rounded-lg border border-gray-200 bg-white p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center">
          <div className="mb-3 flex items-center gap-2">
            <Smartphone className="text-primary h-5 w-5" />
            <h3 className="text-base font-medium text-gray-800">
              {t("scan_to_view_on_mobile")}
            </h3>
          </div>

          <div className="mb-4 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            <QRCodeCanvas
              value={imageUrl}
              size={200}
              level="H"
              includeMargin={true}
              className="max-w-full"
            />
          </div>

          <p className="mb-3 max-w-xs text-center text-xs text-gray-500">
            {t("scan_content")}
          </p>

          <div className="flex w-full flex-wrap justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center text-xs"
              onClick={() => window.open(imageUrl, "_blank")}
            >
              <Download className="mr-1 h-3 w-3" />
              {t("open_link")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center text-xs"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="mr-1 h-3 w-3" />
              ) : (
                <Copy className="mr-1 h-3 w-3" />
              )}
              {copied ? `${t("copied")}!` : t("copy_link")}
            </Button>
            {typeof navigator.share === "function" && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center text-xs"
                onClick={shareUrl}
              >
                <Share2 className="mr-1 h-3 w-3" />
                {t("share")}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-3">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          {/* Photo Selection Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <h2 className="mb-2 text-lg font-semibold text-gray-800">
              {t("select_photos")}
            </h2>
            <div className="mb-3 flex gap-3">
              <Button
                onClick={() => selectLayoutType(4)}
                variant={layoutType === 4 ? "default" : "outline"}
                className="h-auto rounded-full px-4 py-1 text-sm"
                size="sm"
              >
                {t("photo_strip", {
                  count: 4,
                })}
              </Button>
              <Button
                onClick={() => selectLayoutType(8)}
                variant={layoutType === 8 ? "default" : "outline"}
                className="h-auto rounded-full px-4 py-1 text-sm"
                size="sm"
              >
                {t("photo_strip", {
                  count: 8,
                })}
              </Button>
            </div>

            <p className="mb-2 text-xs text-gray-600">
              {t("select_prompt", {
                count: layoutType,
                selectedCount: selectedIndices.length,
              })}
            </p>

            <div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 bg-white p-2 sm:grid-cols-3">
              {capturedImages.map((img, index) => {
                const isSelected = selectedIndices.includes(index);
                const selectionIndex = selectedIndices.indexOf(index) + 1;

                return (
                  <motion.div
                    key={index}
                    onClick={() => toggleSelect(index)}
                    className={cn(
                      "relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200",
                      isSelected ? "border-primary z-10" : "border-gray-200",
                    )}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`Photo ${index}`}
                      className="h-full w-full object-cover"
                    />
                    {isSelected && (
                      <div className="bg-primary text-primary-foreground absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold">
                        {selectionIndex}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Enhanced Frame Customization Section */}
          <motion.div
            className="rounded-lg border border-gray-200 bg-white p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                {t("frame_customization")}
              </h2>
            </div>

            {/* Tabs for different customization options */}
            <motion.div
              className="animate-fade-in mb-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-3 flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("solid")}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors",
                    activeTab === "solid"
                      ? "border-primary text-primary border-b-2"
                      : "hover:text-primary text-gray-500",
                  )}
                >
                  {t("solid_colors")}
                </button>
                <button
                  onClick={() => setActiveTab("gradient")}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors",
                    activeTab === "gradient"
                      ? "border-primary text-primary border-b-2"
                      : "hover:text-primary text-gray-500",
                  )}
                >
                  {t("gradients")}
                </button>
                <button
                  onClick={() => setActiveTab("frames")}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors",
                    activeTab === "frames"
                      ? "border-primary text-primary border-b-2"
                      : "hover:text-primary text-gray-500",
                  )}
                >
                  {t("frames")}
                </button>
              </div>
            </motion.div>

            {/* Content based on active tab */}
            <div className="mb-4">
              {activeTab === "solid" && (
                <div className="mb-3 grid grid-cols-6 gap-2">
                  {COLOR_PALETTE.map((color) => {
                    const isSelected =
                      frameColor === color && !selectedGradient;
                    return (
                      <motion.button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        style={{ backgroundColor: color }}
                        className={cn(
                          "relative h-8 w-full rounded-md border-2 transition-all hover:shadow-sm",
                          isSelected
                            ? "border-primary shadow-sm"
                            : "border-gray-200",
                        )}
                        aria-label={`Select ${color}`}
                      >
                        {isSelected && (
                          <div className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full border border-gray-200 bg-white">
                            <Check className="text-primary h-2 w-2" />
                          </div>
                        )}
                        <span className="sr-only">{color}</span>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {activeTab === "gradient" && (
                <div className="grid grid-cols-2 gap-2">
                  {GRADIENT_PRESETS.map((gradient) => {
                    const isSelected = selectedGradient === gradient.value;
                    return (
                      <motion.button
                        key={gradient.name}
                        onClick={() => handleGradientChange(gradient.value)}
                        style={{ background: gradient.value }}
                        className={cn(
                          "relative h-10 w-full rounded-md border-2 transition-all hover:shadow-sm",
                          isSelected
                            ? "border-primary shadow-sm"
                            : "border-gray-200",
                        )}
                        aria-label={`Select ${gradient.name} gradient`}
                      >
                        {isSelected && (
                          <div className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full border border-gray-200 bg-white">
                            <Check className="text-primary h-2 w-2" />
                          </div>
                        )}
                        <span className="text-xs font-medium text-gray-800 drop-shadow-sm">
                          {gradient.name}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {activeTab === "frames" && (
                <FrameSelector
                  selectedFrame={selectedFrame}
                  setSelectedFrame={setSelectedFrame}
                  setImageUrl={setImageUrl || (() => {})}
                />
              )}
            </div>

            {/* Current Selection Preview for colors */}
            {activeTab === "solid" && (
              <div className="mt-3 flex items-center gap-3 rounded-md bg-gray-50 p-2">
                {/* Color Picker */}
                <input
                  type="color"
                  value={frameColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-6 w-6 cursor-pointer"
                  title="Pick a color"
                />

                <div
                  className="pointer-events-none absolute h-6 w-6 rounded-md border border-gray-200"
                  style={
                    selectedGradient
                      ? { background: selectedGradient }
                      : { backgroundColor: frameColor }
                  }
                ></div>

                <span className="text-xs text-gray-700">
                  {selectedGradient
                    ? `Gradient: ${GRADIENT_PRESETS.find((g) => g.value === selectedGradient)?.name || "Custom"}`
                    : `Color: ${frameColor}`}
                </span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Layout Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            {t("layout_preview")}
          </h2>
          <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-4">
            <div className="w-full max-w-md">{renderPreview()}</div>
          </div>

          {/* Preview tips */}
          <div className="mt-3 rounded-md bg-gray-50 p-3">
            <div className="flex items-start gap-2">
              <GripHorizontal className="mt-0.5 h-4 w-4 text-gray-500" />
              <div>
                <h3 className="text-sm font-medium text-gray-700">
                  {t("layout_tips")}
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  {t("layout_tips_content")}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button
          onClick={retakePhotos}
          variant="outline"
          className="flex items-center justify-center rounded-full px-4 py-2"
          size="sm"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {t("retake")}
        </Button>
        <Button
          onClick={() => downloadComposite(layoutType)}
          disabled={!canDownload || isDownloading}
          className={cn(
            "flex items-center justify-center rounded-full px-4 py-2 font-medium",
            !canDownload && "cursor-not-allowed",
          )}
          variant={canDownload && !isDownloading ? "default" : "secondary"}
          size="sm"
        >
          {isDownloading ? (
            <>
              <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
              {t("processing")}...
            </>
          ) : (
            <>
              <Download className="mr-1 h-4 w-4" />
              {canDownload
                ? t("download")
                : t("select_more", {
                    count: layoutType - selectedIndices.length,
                  })}
            </>
          )}
        </Button>
        <Button
          onClick={uploadAndGenerateQR}
          disabled={!canDownload || isUploading}
          className={cn(
            "flex items-center justify-center rounded-full px-4 py-2 font-medium",
            !canDownload && "cursor-not-allowed",
          )}
          variant={canDownload && !isUploading ? "default" : "secondary"}
          size="sm"
        >
          {isUploading ? (
            <>
              <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
              {t("uploading")}...
            </>
          ) : (
            <>
              <Smartphone className="mr-1 h-4 w-4" />
              {t("send_to_phone")}
            </>
          )}
        </Button>

        {/* Close QR button - only visible on mobile when QR is shown */}
        {imageUrl && showQRSection && (
          <Button
            onClick={() => setShowQRSection(false)}
            variant="outline"
            className="flex items-center justify-center rounded-full px-4 py-2 md:hidden"
            size="sm"
          >
            {t("hide_qr")}
          </Button>
        )}
      </div>

      {/* QR Code Modal for Mobile - Only shown when imageUrl exists and on small screens */}
      {imageUrl && showQRSection && (
        <div className="flex items-center justify-center">
          <QRCodeSection />
        </div>
      )}
    </div>
  );
}
