import { useMemo } from 'react';
import { WatermarkSettings } from '../types';
import { createWatermarkPreview } from '../utils/watermarkUtils';
import { Panel } from './common/Panel';
import { theme } from '../theme';

interface WatermarkPreviewProps {
  originalCanvas: HTMLCanvasElement | null;
  settings: WatermarkSettings;
}

export function WatermarkPreview({ originalCanvas, settings }: WatermarkPreviewProps) {
  const previewDataUrl = useMemo(() => {
    if (!originalCanvas) {
      return null;
    }

    try {
      return createWatermarkPreview(originalCanvas, { ...settings, enabled: true });
    } catch (error) {
      console.error('Error creating watermark preview:', error);
      return originalCanvas.toDataURL('image/jpeg', 0.8);
    }
  }, [originalCanvas, settings]);

  if (!previewDataUrl) {
    return null;
  }

  return (
    <Panel title="Watermark preview" description="Preview based on the most recent upload." className="max-w-xl">
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
        <img src={previewDataUrl} alt="Watermark preview" className="w-full h-auto" />
      </div>
      <p className={`${theme.subheading} text-xs`}>Adjust settings to update this preview; final versions export alongside the watermarked images.</p>
    </Panel>
  );
}

export type { WatermarkPreviewProps };
