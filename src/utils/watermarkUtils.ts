import { WatermarkSettings } from '../types';
import { DPI } from '../constants/cropRatios';

export const addWatermarkToCanvas = (
  canvas: HTMLCanvasElement,
  settings: WatermarkSettings
): HTMLCanvasElement => {
  if (!settings.enabled || !settings.text.trim()) {
    return canvas;
  }

  const watermarkedCanvas = document.createElement('canvas');
  const ctx = watermarkedCanvas.getContext('2d')!;
  
  watermarkedCanvas.width = canvas.width;
  watermarkedCanvas.height = canvas.height;
  
  // Draw the original image first
  ctx.drawImage(canvas, 0, 0);
  
  // Calculate scaled font size based on image resolution
  const baseWidth = 4 * DPI; // 2400 pixels
  const currentWidth = canvas.width;
  const scaleFactor = Math.max(0.3, currentWidth / baseWidth);
  const scaledFontSize = Math.round(settings.fontSize * scaleFactor);
  
  // Calculate scaled margins
  const scaledMarginX = settings.marginX * scaleFactor;
  const scaledMarginY = settings.marginY * scaleFactor;
  
  // Set up watermark style BEFORE setting opacity
  ctx.font = `${scaledFontSize}px Arial`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = settings.color;
  
  // Calculate text metrics
  const textMetrics = ctx.measureText(settings.text);
  const textWidth = textMetrics.width;
  const textHeight = scaledFontSize;
  
  // Add text shadow for better visibility (before opacity)
  const shadowColor = settings.color === '#ffffff' ? '#000000' : '#ffffff';
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = Math.max(2, scaleFactor * 2);
  ctx.shadowOffsetX = Math.max(1, scaleFactor);
  ctx.shadowOffsetY = Math.max(1, scaleFactor);
  
  // Set opacity AFTER other properties
  ctx.globalAlpha = settings.opacity;
  
  if (settings.position === 'repeat') {
    // Repeat watermark across the image with custom spacing
    const spacingX = textWidth + scaledMarginX;
    const spacingY = textHeight + scaledMarginY;
    
    // Save context for rotation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((settings.rotation * Math.PI) / 180);
    
    // Calculate coverage area
    const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
    const coverageArea = diagonal * 1.4; // Increased coverage
    
    const cols = Math.ceil(coverageArea / spacingX) + 2;
    const rows = Math.ceil(coverageArea / spacingY) + 2;
    
    const startX = -(coverageArea / 2);
    const startY = -(coverageArea / 2) + textHeight;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;
        ctx.fillText(settings.text, x, y);
      }
    }
    
    ctx.restore();
  } else {
    // Single watermark at specified position
    let x: number, y: number;
    
    switch (settings.position) {
      case 'top-left':
        x = scaledMarginX;
        y = scaledMarginY + textHeight;
        break;
      case 'top-right':
        x = canvas.width - textWidth - scaledMarginX;
        y = scaledMarginY + textHeight;
        break;
      case 'bottom-left':
        x = scaledMarginX;
        y = canvas.height - scaledMarginY;
        break;
      case 'bottom-right':
        x = canvas.width - textWidth - scaledMarginX;
        y = canvas.height - scaledMarginY;
        break;
      case 'center':
        x = (canvas.width - textWidth) / 2;
        y = (canvas.height + textHeight) / 2;
        break;
      default:
        x = scaledMarginX;
        y = scaledMarginY + textHeight;
    }
    
    ctx.fillText(settings.text, x, y);
  }
  
  // Reset context properties
  ctx.globalAlpha = 1;
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  return watermarkedCanvas;
};

// Helper function for live preview (smaller canvas for performance)
export const createWatermarkPreview = (
  originalCanvas: HTMLCanvasElement,
  settings: WatermarkSettings,
  maxSize: number = 400
): string => {
  // Scale down for preview
  const scale = Math.min(maxSize / originalCanvas.width, maxSize / originalCanvas.height, 1);
  const previewWidth = Math.round(originalCanvas.width * scale);
  const previewHeight = Math.round(originalCanvas.height * scale);
  
  const previewCanvas = document.createElement('canvas');
  const ctx = previewCanvas.getContext('2d')!;
  
  previewCanvas.width = previewWidth;
  previewCanvas.height = previewHeight;
  
  // Draw scaled original image
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(originalCanvas, 0, 0, previewWidth, previewHeight);
  
  // Apply watermark to preview
  const watermarkedPreview = addWatermarkToCanvas(previewCanvas, settings);
  
  return watermarkedPreview.toDataURL('image/jpeg', 0.8);
};