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
  fileName: string;
  dataUrl: string;
  width: number;
  height: number;
  size: string;
  category: string;
  appliedDpi: number;
  dpiSource: 'default' | 'override';
  variant: 'watermarked' | 'final';
  isWatermarked: boolean;
  thumbnailUrl: string;
}

export interface ProcessingProgress {
  current: number;
  total: number;
  currentTask: string;
  isComplete: boolean;
}

export interface ProcessingSettings {
  // JPEG quality for output encoding (0.1 - 1.0)
  jpegQuality: number;
  // Default DPI used when no override exists for a size
  defaultDpi: number;
  // Per-size DPI overrides keyed by `${ratioName}|${sizeName}`
  dpiOverrides: Record<string, number>;
  // Shop name prefix appended to output filenames (no spaces)
  shopName: string;
}

export interface SourceImageInfo {
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
}

