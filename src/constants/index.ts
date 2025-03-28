import { Control } from "@/types";
import {
  FlipHorizontal,
  Sun,
  Contrast,
  ImageOff,
  Sparkles,
  Wand,
  RefreshCw,
} from "lucide-react";

// Constants
export const MAX_CAPTURE = 8;

export const DEFAULT_FILTERS = {
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  sepia: 0,
  saturate: 100,
  blur: 0,
};

// Filter Controls
export const FILTER_CONTROLS: Control[] = [
  { id: "mirror", icon: FlipHorizontal, action: "mirror" },
  { id: "brightness", icon: Sun, action: "brightness" },
  { id: "contrast", icon: Contrast, action: "contrast" },
  { id: "grayscale", icon: ImageOff, action: "filter" },
  { id: "sepia", icon: Sparkles, action: "filter" },
  { id: "saturate", icon: Wand, action: "filter" },
  { id: "reset", icon: RefreshCw, action: "reset" },
];

// Timer options
export const TIMER_OPTIONS = [1, 3, 5, 10] as const;
export const DEFAULT_TIMER_INDEX = 1; // Default to 3 seconds (index 1)
