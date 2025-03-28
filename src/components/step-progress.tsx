"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { StepProgressProps } from "@/types";

export function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <motion.div
      className="my-4 flex items-center justify-center space-x-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Step 1 */}
      <motion.div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all duration-300",
          currentStep === 1
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-gray-200 text-gray-600",
        )}
        whileTap={{ scale: 0.95 }}
      >
        1
      </motion.div>

      {/* Connection line */}
      <div className="relative h-0.5 w-12 bg-gray-200">
        <motion.div
          className="bg-primary absolute inset-0"
          initial={{ width: "0%" }}
          animate={{
            width: currentStep === 1 ? "0%" : "100%",
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      {/* Step 2 */}
      <motion.div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all duration-300",
          currentStep === 2
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-gray-200 text-gray-600",
        )}
        whileTap={{ scale: 0.95 }}
      >
        2
      </motion.div>
    </motion.div>
  );
}
