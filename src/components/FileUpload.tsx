import { useCallback, useMemo, useState } from 'react';
import { theme } from '../theme';
import type { SourceImageInfo } from '../types';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  uploadedImage?: string | null;
  onRemove?: () => void;
  fileInfo?: SourceImageInfo | null;
}

const dropzoneBase = `${theme.panel} relative border-2 border-dashed border-slate-700/80 rounded-3xl p-10 text-center transition-all duration-300`;
const uploadButtonClass = `${theme.accentButton} inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-transform duration-200`;

export function FileUpload({ onFileSelect, disabled, uploadedImage, onRemove, fileInfo }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const formattedSize = useMemo(() => {
    if (!fileInfo) return null;
    const size = fileInfo.size;
    if (size <= 0) return '—';
    const units = ['B', 'KB', 'MB', 'GB'];
    const exponent = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
    const value = size / Math.pow(1024, exponent);
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`;
  }, [fileInfo]);

  const formattedDimensions = useMemo(() => {
    if (!fileInfo) return null;
    return `${fileInfo.width.toLocaleString()} × ${fileInfo.height.toLocaleString()} px`;
  }, [fileInfo]);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);
      if (disabled) return;

      const files = Array.from(event.dataTransfer.files);
      const imageFile = files.find((file) => file.type === 'image/png' || file.type === 'image/jpeg');

      if (imageFile) {
        onFileSelect(imageFile);
      }
    },
    [onFileSelect, disabled],
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleRemove = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (onRemove) {
        onRemove();
      }
    },
    [onRemove],
  );

  if (uploadedImage) {
    return (
      <div className={`${theme.panel} relative rounded-3xl p-6`} aria-live="polite">
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <img src={uploadedImage} alt="Uploaded preview" className="w-full h-72 object-contain bg-slate-950" />
          {onRemove && (
            <button
              onClick={handleRemove}
              disabled={disabled}
              className={`${theme.destructiveButton} absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg shadow-black/40 transition-transform disabled:cursor-not-allowed disabled:opacity-60`}
              title="Remove image"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr),auto] md:items-center">
          <div className={`${theme.panelInset} rounded-2xl border border-slate-800/70 bg-slate-950/40 p-5 text-left`}>
            <div className={`flex flex-wrap items-center gap-3 text-sm ${theme.subheading}`}>
              {fileInfo?.type && (
                <span className={`${theme.badge} rounded-full px-3 py-1`}>{fileInfo.type.toUpperCase()}</span>
              )}
              <span className={`${theme.badge} rounded-full px-3 py-1`}>{formattedDimensions ?? 'Dimensions unavailable'}</span>
              {formattedSize && <span className={`${theme.badge} rounded-full px-3 py-1`}>{formattedSize}</span>}
            </div>
            <dl className={`mt-4 grid gap-3 text-sm ${theme.subheading}`}>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">File name</dt>
                <dd className="text-slate-200 font-medium truncate">{fileInfo?.name ?? 'Unknown'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Summary</dt>
                <dd>Ready for processing. You can adjust defaults in Settings before generating.</dd>
              </div>
            </dl>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row">
            <label
              htmlFor="file-input-replace"
              className={`${theme.accentButton} cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition-transform duration-200 hover:scale-[1.01] ${disabled ? 'pointer-events-none opacity-60' : ''}`}
            >
              Replace image
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleFileChange}
              className="hidden"
              id="file-input-replace"
              disabled={disabled}
            />
            <button
              type="button"
              onClick={handleRemove}
              className={`${theme.subtleButton} rounded-xl px-4 py-2 text-sm font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-60`}
              disabled={disabled}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${dropzoneBase} ${
        disabled
          ? 'cursor-not-allowed opacity-60'
          : isDragOver
            ? 'border-purple-400/70 bg-slate-900/60 scale-[1.01]'
            : 'hover:border-purple-400/80 hover:bg-slate-900/60 hover:shadow-xl'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept="image/png,image/jpeg"
        onChange={handleFileChange}
        className="hidden"
        id="file-input"
        disabled={disabled}
      />

      <label htmlFor="file-input" className={`block ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-200 shadow-inner shadow-purple-900/40">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6H16a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <div className="mt-8 space-y-3">
          <p className="text-2xl font-semibold text-slate-100">
            {isDragOver ? 'Drop your image here' : 'Upload an image'}
          </p>
          <p className={`${theme.subheading} text-sm`}>Drag & drop or click to browse high-resolution files.</p>
          <div className={`${uploadButtonClass} mx-auto max-w-xs hover:scale-105`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
            </svg>
            Choose file
          </div>
        </div>

        <div className={`mt-8 border-t border-dashed ${theme.divider} pt-4 text-sm ${theme.subheading}`}>
          <p>
            <strong className="text-slate-200">Formats:</strong> PNG, JPG
          </p>
          <p>
            <strong className="text-slate-200">Tip:</strong> upload 600 DPI or higher for best print quality.
          </p>
        </div>
      </label>
    </div>
  );
}
