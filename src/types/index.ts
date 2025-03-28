// Types for the photo booth application
export interface Control {
  id: string;
  icon: React.ComponentType<{ className: string; title?: string }>;
  action: string;
}

export interface StepProgressProps {
  currentStep: number;
}

export interface PhotoShootProps {
  capturedImages: string[];
  setCapturedImages: React.Dispatch<React.SetStateAction<string[]>>;
  canProceedToLayout: boolean;
  goToLayoutScreen: () => void;
}

export interface PhotoStripItem {
  count: number;
  overlayUrl: string | null;
  backgroundUrl: string | null;
}

export interface Frame {
  id: string;
  name: string;
  photostrip: PhotoStripItem[];
}

export interface LayoutSelectionProps {
  capturedImages: string[];
  previewRef: React.RefObject<HTMLDivElement | null>;
  layoutType: number;
  selectedIndices: number[];
  setSelectedIndices: React.Dispatch<React.SetStateAction<number[]>>;
  setLayoutType: React.Dispatch<React.SetStateAction<number>>;
  selectedFrame: string | null;
  setSelectedFrame: React.Dispatch<React.SetStateAction<string | null>>;
  retakePhotos: () => void;
  downloadComposite: (layoutType: number) => Promise<void>;
  canDownload: boolean;
  isDownloading: boolean;
  uploadAndGenerateQR: () => Promise<void>;
  isUploading: boolean;
  imageUrl: string | null;
  setImageUrl: React.Dispatch<React.SetStateAction<string | null>>;
}
