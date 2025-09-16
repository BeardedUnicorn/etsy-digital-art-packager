import { CROP_RATIOS } from '../constants/cropRatios';
import { FileUpload } from '../components/FileUpload';
import { PageHeader } from '../components/common/PageHeader';
import { ProgressBar } from '../components/ProgressBar';
import { ImagePreview } from '../components/ImagePreview';
import { WatermarkPreview } from '../components/WatermarkPreview';
import { Panel } from '../components/common/Panel';
import { theme } from '../theme';
import { CroppedImage, ProcessingProgress, WatermarkSettings } from '../types';

interface GeneratorPageProps {
  previewImage: string | null;
  originalImage: HTMLCanvasElement | null;
  croppedImages: CroppedImage[];
  processing: boolean;
  progress: ProcessingProgress;
  onFileSelect: (file: File) => void;
  onRemoveImage: () => void;
  onGenerate: () => void | Promise<void>;
  onDownload: (image: CroppedImage) => void | Promise<void>;
  onDownloadAll: () => void | Promise<void>;
  watermarkSettings: WatermarkSettings;
}

export function GeneratorPage({
  previewImage,
  originalImage,
  croppedImages,
  processing,
  progress,
  onFileSelect,
  onRemoveImage,
  onGenerate,
  onDownload,
  onDownloadAll,
  watermarkSettings,
}: GeneratorPageProps) {
  const totalSizes = CROP_RATIOS.reduce((sum, ratio) => sum + ratio.sizes.length, 0);
  const hasImage = Boolean(originalImage);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Generate print-ready crops"
        subtitle="Upload a high-resolution source image, then automatically produce cropped outputs across every supported ratio and size."
      />

      <FileUpload
        onFileSelect={onFileSelect}
        disabled={processing}
        uploadedImage={previewImage}
        onRemove={onRemoveImage}
      />

      {hasImage && (
        <div className="grid gap-8 xl:grid-cols-[1.6fr,1fr]">
          <Panel
            title="Generation"
            description="Run the cropper with current settings. Processing happens locally for full privacy."
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-200">Ready to generate</p>
                <p className={`${theme.subheading} text-sm`}>
                  {totalSizes} sizes across {CROP_RATIOS.length} aspect ratios will be produced.
                </p>
              </div>

              <button
                onClick={onGenerate}
                disabled={processing}
                className={`${theme.accentButton} inline-flex items-center justify-center gap-3 rounded-2xl px-6 py-3 text-base font-semibold text-white shadow-lg shadow-purple-900/40 transition-transform duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                  processing ? '' : 'hover:scale-[1.02]'
                }`}
              >
                {processing ? (
                  <>
                    <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-purple-200 border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Generate images ({totalSizes})
                  </>
                )}
              </button>
            </div>
          </Panel>

          <WatermarkPreview originalCanvas={originalImage} settings={watermarkSettings} />
        </div>
      )}

      {processing && <ProgressBar progress={progress} />}

      <ImagePreview images={croppedImages} onDownload={onDownload} onDownloadAll={onDownloadAll} />
    </div>
  );
}

export type { GeneratorPageProps };
