import { DPI } from '../constants/cropRatios';

export const convertToPixels = (value: number, unit: 'in' | 'mm'): number => {
  if (unit === 'in') {
    return Math.round(value * DPI);
  } else {
    // Convert mm to inches first, then to pixels
    return Math.round((value / 25.4) * DPI);
  }
};

export const cropImageToRatio = (
  sourceCanvas: HTMLCanvasElement,
  targetRatio: number
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  const sourceRatio = sourceCanvas.width / sourceCanvas.height;
  
  let cropWidth, cropHeight, cropX, cropY;
  
  if (sourceRatio > targetRatio) {
    // Source is wider, crop width
    cropHeight = sourceCanvas.height;
    cropWidth = cropHeight * targetRatio;
    cropX = (sourceCanvas.width - cropWidth) / 2;
    cropY = 0;
  } else {
    // Source is taller, crop height
    cropWidth = sourceCanvas.width;
    cropHeight = cropWidth / targetRatio;
    cropX = 0;
    cropY = (sourceCanvas.height - cropHeight) / 2;
  }
  
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  
  ctx.drawImage(
    sourceCanvas,
    cropX, cropY, cropWidth, cropHeight,
    0, 0, cropWidth, cropHeight
  );
  
  return canvas;
};

export const resizeImageToTargetSize = (
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement => {
  // Log the target dimensions for debugging
  console.log(`Target dimensions: ${targetWidth}x${targetHeight}`);
  
  // Check browser canvas size limits
  const MAX_CANVAS_AREA = 268435456; // 16384 * 16384 (common browser limit)
  const targetArea = targetWidth * targetHeight;
  
  if (targetArea > MAX_CANVAS_AREA) {
    // Scale down proportionally to fit within area limits
    const scale = Math.sqrt(MAX_CANVAS_AREA / targetArea);
    targetWidth = Math.floor(targetWidth * scale);
    targetHeight = Math.floor(targetHeight * scale);
    console.warn(`Large image scaled down to ${targetWidth}x${targetHeight} due to browser limits`);
  }
  
  // Additional check for individual dimension limits
  // Most browsers (and Canvas) cap a single dimension to 16384px.
  // Using 16384 makes generation reliable across environments.
  const MAX_CANVAS_DIMENSION = 16384;
  if (targetWidth > MAX_CANVAS_DIMENSION || targetHeight > MAX_CANVAS_DIMENSION) {
    const scale = Math.min(MAX_CANVAS_DIMENSION / targetWidth, MAX_CANVAS_DIMENSION / targetHeight);
    targetWidth = Math.floor(targetWidth * scale);
    targetHeight = Math.floor(targetHeight * scale);
    console.warn(`Large image dimensions scaled down to ${targetWidth}x${targetHeight}`);
  }

  // Guard against zero after scaling
  targetWidth = Math.max(1, Math.floor(targetWidth));
  targetHeight = Math.max(1, Math.floor(targetHeight));
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  try {
    // For very large scaling differences, use multi-step approach
    if (sourceCanvas.width > targetWidth * 2 || sourceCanvas.height > targetHeight * 2) {
      console.log('Using multi-step scaling for better quality');
      
      // Calculate intermediate size (halfway point)
      const intermediateScale = Math.max(0.5, Math.min(
        targetWidth / sourceCanvas.width,
        targetHeight / sourceCanvas.height
      ) * 2);
      
      const intermediateWidth = Math.round(sourceCanvas.width * intermediateScale);
      const intermediateHeight = Math.round(sourceCanvas.height * intermediateScale);
      
      // Create intermediate canvas
      const intermediateCanvas = document.createElement('canvas');
      const intermediateCtx = intermediateCanvas.getContext('2d');
      
      if (intermediateCtx && intermediateWidth > 0 && intermediateHeight > 0) {
        intermediateCanvas.width = intermediateWidth;
        intermediateCanvas.height = intermediateHeight;
        intermediateCtx.imageSmoothingEnabled = true;
        intermediateCtx.imageSmoothingQuality = 'high';
        intermediateCtx.drawImage(sourceCanvas, 0, 0, intermediateWidth, intermediateHeight);
        
        // Final scaling
        ctx.drawImage(intermediateCanvas, 0, 0, targetWidth, targetHeight);
      } else {
        // Fallback to direct scaling
        ctx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
      }
    } else {
      // Direct scaling for smaller differences
      ctx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
    }
    
    console.log(`Successfully created canvas: ${canvas.width}x${canvas.height}`);
    return canvas;
  } catch (error) {
    console.error('Error in resizeImageToTargetSize:', error);
    throw error;
  }
};

export const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      console.log(`Loaded image: ${img.naturalWidth}x${img.naturalHeight}`);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

export const imageToCanvas = (img: HTMLImageElement): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  
  ctx.drawImage(img, 0, 0);
  
  return canvas;
};
