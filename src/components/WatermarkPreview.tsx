import React, { useMemo } from 'react';
import { WatermarkSettings } from '../types';
import { createWatermarkPreview } from '../utils/watermarkUtils';

interface WatermarkPreviewProps {
  originalCanvas: HTMLCanvasElement | null;
  settings: WatermarkSettings;
}

export const WatermarkPreview: React.FC<WatermarkPreviewProps> = ({
  originalCanvas,
  settings
}) => {
  const previewDataUrl = useMemo(() => {
    if (!originalCanvas || !settings.enabled) {
      return originalCanvas?.toDataURL('image/jpeg', 0.8) || null;
    }
    
    try {
      return createWatermarkPreview(originalCanvas, settings);
    } catch (error) {
      console.error('Error creating watermark preview:', error);
      return originalCanvas.toDataURL('image/jpeg', 0.8);
    }
  }, [originalCanvas, settings]);

  if (!previewDataUrl) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-4">
      <h4 className="text-lg font-medium text-gray-800 mb-3 text-center">
        Watermark Preview
      </h4>
      <div className="relative">
        <img
          src={previewDataUrl}
          alt="Watermark preview"
          className="w-full h-auto rounded border border-gray-200 bg-gray-50"
        />
        {!settings.enabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded">
            <span className="text-white text-sm font-medium bg-black bg-opacity-60 px-3 py-1 rounded">
              Watermark Disabled
            </span>
          </div>
        )}
      </div>
    </div>
  );
};