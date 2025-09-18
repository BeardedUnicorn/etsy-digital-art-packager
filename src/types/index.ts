export type DimensionUnit = 'in' | 'mm';

export type DpiLevel = 600 | 1200;

export interface PixelDimensions {
  width: number;
  height: number;
}

export interface CropSize {
  name: string;
  width: number;
  height: number;
  unit: DimensionUnit;
  referencePixels: Record<DpiLevel, PixelDimensions>;
}

export interface CropRatio {
  name: string;
  ratio: number;
  sizes: CropSize[];
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
  // Optional data URL representing the shop logo for branded documents
  shopLogoDataUrl: string | null;
  // Optional tagline displayed beneath the shop name in the PDF footer
  instructionsFooterTagline: string;
  // Customizable closing copy shown at the end of the instructions PDF
  instructionsThankYouMessage: string;
}

export interface SourceImageInfo {
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
}

