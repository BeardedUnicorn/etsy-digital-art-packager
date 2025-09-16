import { useMemo } from 'react';
import { CroppedImage } from '../types';
import { Panel } from './common/Panel';
import { theme } from '../theme';

interface ImagePreviewProps {
  images: CroppedImage[];
  onDownload: (image: CroppedImage) => void;
  onDownloadAll: () => void;
  onPreview?: (index: number) => void;
  onPreviewAll?: () => void;
}

const downloadButtonClass = `${theme.successButton} inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.01]`;
const previewButtonClass = `${theme.subtleButton} inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-200 transition-transform hover:scale-[1.01]`;
const badgeClass = `${theme.badge} inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide`;
const badgeAccent = `${theme.badgeAccent} inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide`;
const badgeWarning = `${theme.badgeWarning} inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide`;
const variantBadgeWatermarked = `${theme.badgeAccent} inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide`;
const variantBadgeFinal = `${theme.badge} inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide`;

export function ImagePreview({
  images,
  onDownload,
  onDownloadAll,
  onPreview,
  onPreviewAll,
}: ImagePreviewProps) {
  if (images.length === 0) {
    return null;
  }

  const indexLookup = useMemo(() => {
    return images.reduce<Record<string, number>>((acc, image, index) => {
      acc[image.id] = index;
      return acc;
    }, {});
  }, [images]);

  const groupedImages = useMemo(() => {
    return images.reduce<Record<string, CroppedImage[]>>((acc, image) => {
      if (!acc[image.category]) {
        acc[image.category] = [];
      }
      acc[image.category].push(image);
      return acc;
    }, {});
  }, [images]);

  return (
    <Panel
      title="Generated images"
      description={`${images.length} ${images.length === 1 ? 'file' : 'files'} ready for download.`}
      headerAction={
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
          {typeof onPreviewAll === 'function' && (
            <button
              type="button"
              onClick={onPreviewAll}
              className={`${previewButtonClass}`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 10l4.553-.379a.5.5 0 01.447.757L16 16m-5-6l-4.553-.379a.5.5 0 00-.447.757L8 16m1 4h6m-5-4l-1-4m5 4l1-4m-3-7v3m0 0a3 3 0 100 6 3 3 0 000-6z" />
              </svg>
              Preview gallery
            </button>
          )}
          <button
            type="button"
            onClick={onDownloadAll}
            className={`${theme.accentButton} inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition-transform hover:scale-[1.02]`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 10v6m0 0l-3-3m3 3 3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download all
          </button>
        </div>
      }
    >
      <div className="space-y-10">
        {Object.entries(groupedImages).map(([category, categoryImages]) => (
          <div key={category} className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <h4 className="text-lg font-semibold text-slate-100">{category}</h4>
              <span className={badgeClass}>
                {categoryImages.length} {categoryImages.length === 1 ? 'size' : 'sizes'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {categoryImages.map((image) => {
                const imageIndex = indexLookup[image.id] ?? 0;
                return (
                  <div
                    key={image.id}
                    className="image-preview-card group relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/70 p-5 shadow-lg shadow-black/40 transition-all duration-200 hover:-translate-y-1 hover:border-purple-400/60 hover:shadow-purple-900/30"
                  >
                    <div className="relative mb-4 flex h-32 items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                      {typeof onPreview === 'function' ? (
                        <button
                          type="button"
                          onClick={() => onPreview(imageIndex)}
                          className="group relative flex h-full w-full items-center justify-center"
                        >
                          <img
                            src={image.thumbnailUrl}
                            alt={image.name}
                            className="max-h-full w-auto max-w-full object-contain"
                            loading="lazy"
                          />
                          <span className="absolute inset-0 hidden items-center justify-center bg-slate-950/60 text-sm font-semibold uppercase tracking-wide text-slate-200 transition-opacity group-hover:flex">
                            Preview
                          </span>
                        </button>
                      ) : (
                        <img
                          src={image.thumbnailUrl}
                          alt={image.name}
                          className="max-h-full w-auto max-w-full object-contain"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute bottom-2 right-2 inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-300">
                        {image.width.toLocaleString()} × {image.height.toLocaleString()} px
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-semibold text-slate-100 truncate" title={image.name}>
                          {image.name}
                        </h5>
                        <p className={`${theme.subheading} text-[11px] font-mono`}>{image.fileName}.jpg</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className={badgeAccent}>{image.appliedDpi} DPI</span>
                          <span className={image.dpiSource === 'override' ? badgeWarning : badgeClass}>
                            {image.dpiSource === 'override' ? 'Override' : 'Default'}
                          </span>
                          <span className={image.variant === 'watermarked' ? variantBadgeWatermarked : variantBadgeFinal}>
                            {image.variant === 'watermarked' ? 'Watermarked' : 'Final'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {typeof onPreview === 'function' && (
                          <button
                            type="button"
                            onClick={() => onPreview(imageIndex)}
                            className={previewButtonClass}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 10l4.553-.379a.5.5 0 01.447.757L16 16m-5-6l-4.553-.379a.5.5 0 00-.447.757L8 16m1 4h6m-5-4l-1-4m5 4l1-4m-3-7v3m0 0a3 3 0 100 6 3 3 0 000-6z" />
                            </svg>
                            Preview
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDownload(image)}
                          className={downloadButtonClass}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 10v6m0 0l-3-3m3 3 3-3M7 20h10a2 2 0 002-2V8a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export type { ImagePreviewProps };
