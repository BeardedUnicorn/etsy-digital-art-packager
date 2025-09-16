import { useMemo } from 'react';
import { classNames } from '../utils/classNames';
import { theme } from '../theme';
import type { CroppedImage } from '../types';

interface GeneratedPreviewModalProps {
  images: CroppedImage[];
  open: boolean;
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onStep: (direction: number) => void;
  onDownload?: (image: CroppedImage) => void;
}

export function GeneratedPreviewModal({
  images,
  open,
  currentIndex,
  onClose,
  onNavigate,
  onStep,
  onDownload,
}: GeneratedPreviewModalProps) {
  const clampedIndex = useMemo(() => {
    if (images.length === 0) return 0;
    return Math.min(Math.max(currentIndex, 0), images.length - 1);
  }, [currentIndex, images.length]);

  if (!open || images.length === 0) {
    return null;
  }

  const image = images[clampedIndex];
  const hasMultiple = images.length > 1;

  const handleBackdropClick = () => {
    onClose();
  };

  const handleDialogClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(image);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 px-4 py-8"
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      <div
        className={classNames(
          theme.panel,
          'relative w-full max-w-5xl rounded-3xl p-6 shadow-2xl shadow-black/60',
        )}
        onClick={handleDialogClick}
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-purple-300/80">Preview</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-100">{image.name}</h2>
            <p className={`${theme.subheading} text-sm mt-1`}>
              {image.width.toLocaleString()} × {image.height.toLocaleString()} px · {image.category} · {image.appliedDpi} DPI
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onDownload && (
              <button
                type="button"
                onClick={handleDownload}
                className={`${theme.accentButton} inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition-transform hover:scale-[1.01]`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 10v6m0 0l-3-3m3 3 3-3M7 20h10a2 2 0 002-2V8a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Download
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`${theme.subtleButton} inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-200 transition-transform hover:scale-105`}
              aria-label="Close preview"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div className="mt-6 flex items-center justify-center gap-4">
          {hasMultiple && (
            <button
              type="button"
              onClick={() => onStep(-1)}
              className={`${theme.subtleButton} hidden h-12 w-12 items-center justify-center rounded-full text-slate-200 transition-transform hover:scale-110 sm:flex`}
              aria-label="Previous image"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">
            <img src={image.dataUrl} alt={image.name} className="w-full object-contain" />
            {hasMultiple && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 rounded-full bg-slate-950/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
                {clampedIndex + 1} of {images.length}
              </div>
            )}
          </div>

          {hasMultiple && (
            <button
              type="button"
              onClick={() => onStep(1)}
              className={`${theme.subtleButton} hidden h-12 w-12 items-center justify-center rounded-full text-slate-200 transition-transform hover:scale-110 sm:flex`}
              aria-label="Next image"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {hasMultiple && (
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            {images.map((thumb, index) => {
              const isActive = index === clampedIndex;
              return (
                <button
                  key={thumb.id}
                  type="button"
                  onClick={() => onNavigate(index)}
                  className={classNames(
                    'relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-2xl border transition-all duration-150',
                    isActive ? 'border-purple-500 shadow-lg shadow-purple-900/30' : 'border-slate-800 hover:border-purple-500/40',
                  )}
                  aria-label={`Preview ${thumb.name}`}
                >
                  <img src={thumb.dataUrl} alt={thumb.name} className="h-full w-full object-cover" />
                  {isActive && (
                    <span className="absolute inset-0 border-2 border-purple-400/60" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export type { GeneratedPreviewModalProps };
