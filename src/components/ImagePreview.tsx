import { CroppedImage } from '../types';
import { Panel } from './common/Panel';
import { theme } from '../theme';

interface ImagePreviewProps {
  images: CroppedImage[];
  onDownload: (image: CroppedImage) => void;
  onDownloadAll: () => void;
}

const downloadButtonClass = `${theme.successButton} inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.01]`;
const badgeClass = `${theme.badge} inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide`;
const badgeAccent = `${theme.badgeAccent} inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide`;
const badgeWarning = `${theme.badgeWarning} inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide`;

export function ImagePreview({ images, onDownload, onDownloadAll }: ImagePreviewProps) {
  if (images.length === 0) {
    return null;
  }

  const groupedImages = images.reduce<Record<string, CroppedImage[]>>((acc, image) => {
    if (!acc[image.category]) {
      acc[image.category] = [];
    }
    acc[image.category].push(image);
    return acc;
  }, {});

  return (
    <Panel
      title="Generated images"
      description={`${images.length} ${images.length === 1 ? 'file' : 'files'} ready for download.`}
      headerAction={
        <button onClick={onDownloadAll} className={`${theme.accentButton} inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition-transform hover:scale-[1.02]`}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 10v6m0 0l-3-3m3 3 3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download all
        </button>
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
              {categoryImages.map((image) => (
                <div
                  key={image.id}
                  className="image-preview-card group relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/70 p-5 shadow-lg shadow-black/40 transition-all duration-200 hover:-translate-y-1 hover:border-purple-400/60 hover:shadow-purple-900/30"
                >
                  <div className="relative mb-4 flex h-32 items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                    <img
                      src={image.dataUrl}
                      alt={image.name}
                      className="max-h-full w-auto max-w-full object-contain"
                      loading="lazy"
                    />
                    <div className="absolute bottom-2 right-2 inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-300">
                      {image.width.toLocaleString()} × {image.height.toLocaleString()} px
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-semibold text-slate-100 truncate" title={image.name}>
                        {image.name}
                      </h5>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={badgeAccent}>{image.appliedDpi} DPI</span>
                        <span className={image.dpiSource === 'override' ? badgeWarning : badgeClass}>
                          {image.dpiSource === 'override' ? 'Override' : 'Default'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDownload(image)}
                      className={`${downloadButtonClass} w-full`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 10v6m0 0l-3-3m3 3 3-3M7 20h10a2 2 0 002-2V8a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export type { ImagePreviewProps };
