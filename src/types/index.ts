export interface CropRatio {
  name: string;
  ratio: number;
  sizes: Array<{
    name: string;
    width: number;
    height: number;
    unit: 'in' | 'mm';
  }>;
}

export interface WatermarkSettings {
  text: string;
  opacity: number;
  fontSize: number;
  color: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'repeat';
  enabled: boolean;
  rotation: number;
  marginX: number; // Horizontal margin/spacing
  marginY: number; // Vertical margin/spacing
}

export interface CroppedImage {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
  size: string;
  category: string;
}

export interface ProcessingProgress {
  current: number;
  total: number;
  currentTask: string;
  isComplete: boolean;
}