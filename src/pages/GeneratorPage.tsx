import { CROP_RATIOS } from '../constants/cropRatios';
import { FileUpload } from '../components/FileUpload';
import { PageHeader } from '../components/common/PageHeader';
import { ProgressBar } from '../components/ProgressBar';
import { ImagePreview } from '../components/ImagePreview';
import { WatermarkPreview } from '../components/WatermarkPreview';
import { Panel } from '../components/common/Panel';
import { EmptyState } from '../components/common/EmptyState';
import { theme } from '../theme';
import type { CroppedImage, ProcessingProgress, SourceImageInfo, WatermarkSettings } from '../types';

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
  onPreviewImage: (index: number) => void;
  onPreviewAll: () => void;
  watermarkSettings: WatermarkSettings;
  sourceInfo: SourceImageInfo | null;
  shopName: string;
  artTitle: string;
  downloadLink: string;
  onArtTitleChange: (title: string) => void;
  onDownloadLinkChange: (link: string) => void;
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
  onPreviewImage,
  onPreviewAll,
  watermarkSettings,
  sourceInfo,
  shopName,
  artTitle,
  downloadLink,
  onArtTitleChange,
  onDownloadLinkChange,
}: GeneratorPageProps) {
  const totalSizes = CROP_RATIOS.reduce((sum, ratio) => sum + ratio.sizes.length, 0);
  const totalVariants = totalSizes * 2;
  const hasImage = Boolean(originalImage);
  const hasResults = croppedImages.length > 0;
  const showStickyProgress = !progress.isComplete && progress.total > 0;
  const sanitizeSegment = (value: string) =>
    value
      .replace(/×/g, 'x')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '')
      .toLowerCase();
  const sanitizedShopName = sanitizeSegment(shopName || '');
  const sanitizedArtTitle = sanitizeSegment(artTitle || '');
  const exampleParts = [sanitizedShopName || 'shop', sanitizedArtTitle || 'untitled', 'ratio', 'size'];
  const exampleBase = exampleParts.filter(Boolean).join('_');
  const exampleWatermarked = `${exampleBase}_wm.jpg`;
  const exampleFinal = `${exampleBase}_final.jpg`;

  return (
    <div className="space-y-10">
      {showStickyProgress && (
        <div className="sticky top-0 z-30 -mx-4 -mt-10 border-b border-slate-900/70 bg-slate-950/90 px-4 py-5 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
          <div className="mx-auto max-w-5xl">
            <ProgressBar progress={progress} variant="compact" />
          </div>
        </div>
      )}

      <PageHeader
        title="Generate print-ready crops"
        subtitle="Upload a high-resolution source image, then automatically produce cropped outputs across every supported ratio and size."
      />

      <Panel
        title="Artwork details"
        description="Set a title used in the exported filenames for both watermarked and clean variants."
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200" htmlFor="art-title-input">
            Artwork title
          </label>
          <input
            id="art-title-input"
            type="text"
            value={artTitle}
            onChange={(event) => onArtTitleChange(event.target.value)}
            className={`${theme.input} w-full rounded-xl px-4 py-2 transition-colors duration-200`}
            placeholder="Sunset Over Sea"
          />
          <p className={`${theme.subheading} text-xs`}>
            Example filenames: <span className="font-mono text-slate-300">{exampleWatermarked}</span> / <span className="font-mono text-slate-300">{exampleFinal}</span>
          </p>
        </div>
      </Panel>

      <Panel
        title="Delivery link"
        description="Provide a URL or set of instructions that will be embedded in the download PDF for your customers."
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200" htmlFor="download-link-input">
            Download URL or instructions
          </label>
          <input
            id="download-link-input"
            type="text"
            value={downloadLink}
            onChange={(event) => onDownloadLinkChange(event.target.value)}
            className={`${theme.input} w-full rounded-xl px-4 py-2 transition-colors duration-200`}
            placeholder="https://yourshop.com/downloads/abc123"
          />
          <p className={`${theme.subheading} text-xs`}>
            The PDF will include this link as a clickable section so customers can grab their files instantly.
          </p>
        </div>
      </Panel>

      <FileUpload
        onFileSelect={onFileSelect}
        disabled={processing}
        uploadedImage={previewImage}
        onRemove={onRemoveImage}
        fileInfo={sourceInfo}
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
                  {totalSizes} sizes across {CROP_RATIOS.length} aspect ratios will produce {totalVariants} files (watermarked + clean).
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
                    Generate image sets ({totalSizes})
                  </>
                )}
              </button>
            </div>
          </Panel>

          <WatermarkPreview originalCanvas={originalImage} settings={watermarkSettings} />
        </div>
      )}

      {!processing && hasImage && !hasResults && (
        <EmptyState
          title="Generate your image set"
          description="Run the generator to create crops with your latest watermark and output defaults. Everything stays on this device."
          icon={
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          action={
            <button
              type="button"
              onClick={onGenerate}
              className={`${theme.accentButton} rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60`}
              disabled={processing}
            >
              Start generation
            </button>
          }
        />
      )}

      {hasResults && (
        <ImagePreview
          images={croppedImages}
          onDownload={onDownload}
          onDownloadAll={onDownloadAll}
          onPreview={onPreviewImage}
          onPreviewAll={onPreviewAll}
        />
      )}
    </div>
  );
}

export type { GeneratorPageProps };
