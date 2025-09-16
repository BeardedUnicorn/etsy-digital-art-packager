import type { ReactNode } from 'react';
import { CROP_RATIOS } from '../constants/cropRatios';
import { FileUpload } from '../components/FileUpload';
import { PageHeader } from '../components/common/PageHeader';
import { ProgressBar } from '../components/ProgressBar';
import { ImagePreview } from '../components/ImagePreview';
import { WatermarkPreview } from '../components/WatermarkPreview';
import { Panel } from '../components/common/Panel';
import { EmptyState } from '../components/common/EmptyState';
import { classNames } from '../utils/classNames';
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
  watermarkSettings: WatermarkSettings;
  sourceInfo: SourceImageInfo | null;
  onOpenSettings: () => void;
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
  sourceInfo,
  onOpenSettings,
}: GeneratorPageProps) {
  const totalSizes = CROP_RATIOS.reduce((sum, ratio) => sum + ratio.sizes.length, 0);
  const hasImage = Boolean(originalImage);
  const hasResults = croppedImages.length > 0;

  type StepKey = 'upload' | 'settings' | 'generate' | 'download';
  const steps: Array<{
    key: StepKey;
    title: string;
    description: string;
    hint?: string;
    complete: boolean;
  }> = [
    {
      key: 'upload',
      title: 'Upload image',
      description: 'Drag and drop a single high-resolution JPG or PNG.',
      hint: sourceInfo
        ? `${sourceInfo.width.toLocaleString()} × ${sourceInfo.height.toLocaleString()} px`
        : 'Recommended: 600 DPI or higher',
      complete: hasImage,
    },
    {
      key: 'settings',
      title: 'Review settings',
      description: 'Adjust watermark and output defaults before generating.',
      hint: watermarkSettings.enabled ? 'Watermark enabled' : 'Watermark disabled',
      complete: hasResults,
    },
    {
      key: 'generate',
      title: 'Generate outputs',
      description: `${totalSizes} crops will be rendered locally with your settings.`,
      complete: hasResults,
    },
    {
      key: 'download',
      title: 'Download files',
      description: 'Save assets individually or export them all at once.',
      complete: false,
    },
  ];

  let activeAssigned = false;
  const computedSteps = steps.map((step) => {
    if (step.complete) {
      return { ...step, status: 'complete' as const };
    }
    if (!activeAssigned) {
      activeAssigned = true;
      return { ...step, status: 'active' as const };
    }
    return { ...step, status: 'upcoming' as const };
  });

  return (
    <div className="space-y-10">
      <PageHeader
        title="Generate print-ready crops"
        subtitle="Upload a high-resolution source image, then automatically produce cropped outputs across every supported ratio and size."
      />

      <Panel
        title="Workflow"
        description="Stay on track with these quick steps for producing exports."
      >
        <ol className="space-y-3">
          {computedSteps.map((step, index) => {
            const status = step.status;
            const containerClasses = classNames(
              'flex flex-col gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between',
              status === 'active' && 'border-purple-500/40 shadow-lg shadow-purple-900/30',
              status === 'complete' && 'border-emerald-500/30',
            );
            const indicatorClasses = classNames(
              'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
              status === 'complete' && 'border-emerald-500 text-emerald-200 bg-emerald-500/10',
              status === 'active' && 'border-purple-500 text-purple-200 bg-purple-500/10',
              status === 'upcoming' && 'border-slate-700 text-slate-500',
            );
            const indicatorContent =
              status === 'complete' ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              );

            let action: ReactNode = null;
            if (step.key === 'settings') {
              action = (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className={`${theme.subtleButton} rounded-xl px-4 py-2 text-sm font-semibold text-slate-200 hover:scale-[1.01] transition-transform`}
                >
                  Open settings
                </button>
              );
            } else if (step.key === 'download' && hasResults) {
              action = (
                <button
                  type="button"
                  onClick={onDownloadAll}
                  className={`${theme.accentButton} rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition-transform hover:scale-[1.01]`}
                >
                  Download all
                </button>
              );
            }

            return (
              <li key={step.key} className={containerClasses}>
                <div className="flex items-start gap-4">
                  <span className={indicatorClasses}>{indicatorContent}</span>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-slate-100">{step.title}</p>
                    <p className={classNames('text-sm', theme.subheading)}>{step.description}</p>
                    {step.hint && <p className="text-xs text-slate-500">{step.hint}</p>}
                  </div>
                </div>
                {action && <div className="sm:self-center">{action}</div>}
              </li>
            );
          })}
        </ol>
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

      {!processing && !hasResults && !hasImage && (
        <EmptyState
          title="Upload an image to begin"
          description="We'll guide you through watermarking and exporting as soon as a source image is loaded."
          icon={
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6H16a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v8" />
            </svg>
          }
          action={
            <button
              type="button"
              onClick={onOpenSettings}
              className={`${theme.subtleButton} rounded-xl px-4 py-2 text-sm font-semibold text-slate-200 transition-transform hover:scale-[1.01]`}
            >
              Review settings
            </button>
          }
        />
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
        <ImagePreview images={croppedImages} onDownload={onDownload} onDownloadAll={onDownloadAll} />
      )}
    </div>
  );
}

export type { GeneratorPageProps };
