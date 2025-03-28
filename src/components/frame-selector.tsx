"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FRAMES } from "@/constants/assets";
import { handleFrameSelection } from "@/lib/frame-utils";

interface FrameSelectorProps {
  selectedFrame: string | null;
  setSelectedFrame: (frameId: string | null) => void;
  setImageUrl: (url: string | null) => void;
  className?: string;
}

export function FrameSelector({
  selectedFrame,
  setSelectedFrame,
  setImageUrl,
  className,
}: FrameSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectFrame = async (frameId: string | null) => {
    // Reset any previous errors
    setError(null);

    // Clear image URL when changing frames
    setImageUrl(null);

    // If selecting the same frame, deselect it
    if (frameId === selectedFrame) {
      setSelectedFrame(null);
      return;
    }

    setIsLoading(true);

    try {
      await handleFrameSelection(frameId, (selectedFrameId) => {
        setSelectedFrame(selectedFrameId);
      });
    } catch (err) {
      setError("Failed to select frame. Please try again.");
      console.error("Frame selection error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-medium text-gray-700">Frames</h3>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {FRAMES.map((frame) => {
          const isSelected = selectedFrame === frame.id;

          return (
            <motion.button
              key={frame.id}
              onClick={() => selectFrame(frame.id)}
              disabled={isLoading}
              className={cn(
                "relative flex h-16 w-full flex-col items-center justify-center rounded-md border-2 transition-all",
                isSelected ? "border-primary shadow-sm" : "border-gray-200",
                isLoading && "cursor-wait opacity-50",
              )}
            >
              {isSelected && (
                <div className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full border border-gray-200 bg-white">
                  <Check className="text-primary h-2 w-2" />
                </div>
              )}

              <span className="mt-1 text-xs font-medium text-gray-800">
                {frame.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
