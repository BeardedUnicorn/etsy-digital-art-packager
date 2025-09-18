import { CROP_RATIOS, REFERENCE_DPI_LEVELS } from '../constants/cropRatios';
import { ProcessingSettings } from '../types';
import { getSizeKey } from '../utils/imageUtils';
import { Panel } from './common/Panel';
import { theme } from '../theme';

interface OutputSettingsProps {
  settings: ProcessingSettings;
  onChange: (settings: ProcessingSettings) => void;
}

const rangeClass = 'w-full h-2 rounded-full appearance-none accent-purple-500 bg-slate-800/80';
const inputClass = `${theme.input} rounded-xl px-4 py-2 transition-colors duration-200`;
const smallInputClass = `${theme.input} rounded-lg px-3 py-2 text-sm transition-colors duration-200`;

export function OutputSettings({ settings, onChange }: OutputSettingsProps) {
  const setJpegQuality = (value: number) => {
    const quality = Math.max(0.1, Math.min(1, value));
    onChange({ ...settings, jpegQuality: quality });
  };

  const setDefaultDpi = (value: number) => {
    const dpi = Math.max(72, Math.min(2400, Math.round(value) || 72));
    onChange({ ...settings, defaultDpi: dpi });
  };

  const setOverride = (key: string, value: number | '') => {
    const overrides = { ...settings.dpiOverrides };
    if (value === '' || Number.isNaN(Number(value))) {
      delete overrides[key];
    } else {
      const dpi = Math.max(72, Math.min(2400, Math.round(Number(value))));
      overrides[key] = dpi;
    }
    onChange({ ...settings, dpiOverrides: overrides });
  };

  const clearOverride = (key: string) => {
    const overrides = { ...settings.dpiOverrides };
    delete overrides[key];
    onChange({ ...settings, dpiOverrides: overrides });
  };

  return (
    <Panel
      title="Output"
      description="Control the quality and DPI for every generated size. Overrides are optional and fall back to the default DPI above."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">JPEG quality</label>
          <div className="space-y-3">
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={settings.jpegQuality}
              onChange={(event) => setJpegQuality(parseFloat(event.target.value))}
              className={rangeClass}
            />
            <div className={`${theme.badge} rounded-full px-4 py-1 text-center inline-flex justify-center`}
              >{Math.round(settings.jpegQuality * 100)}%</div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-slate-200 mb-2">Default DPI</label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="number"
              min={72}
              max={2400}
              value={settings.defaultDpi}
              onChange={(event) => setDefaultDpi(parseInt(event.target.value))}
              className={`${inputClass} w-full sm:w-48`}
            />
            <p className={`${theme.subheading} text-sm`}>Applied when no override exists.</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-slate-100 mb-4">Per-size DPI overrides</h4>
        <div className="space-y-6">
          {CROP_RATIOS.map((ratio) => (
            <div
              key={ratio.name}
              className={`${theme.panelInset} rounded-2xl overflow-hidden`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-4 border-b border-slate-800/60">
                <span className="text-sm font-semibold text-slate-200 uppercase tracking-wide">{ratio.name}</span>
                <span className={`${theme.subheading} text-xs`}>Aspect ratio {ratio.ratio.toFixed(4)}</span>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {ratio.sizes.map((size) => {
                  const key = getSizeKey(ratio.name, size.name);
                  const current = settings.dpiOverrides[key] ?? '';
                  const hasOverride = key in settings.dpiOverrides;
                  const referenceDetails = REFERENCE_DPI_LEVELS.map((level) => {
                    const reference = size.referencePixels[level];
                    if (!reference) {
                      return null;
                    }
                    const formattedWidth = reference.width.toLocaleString();
                    const formattedHeight = reference.height.toLocaleString();
                    return `${level} DPI: ${formattedWidth} × ${formattedHeight} px`;
                  }).filter(Boolean);
                  return (
                    <div
                      key={key}
                      className={`rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 flex flex-col gap-3`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-100">{size.name}</span>
                          {hasOverride && (
                            <span className={`${theme.badgeAccent} px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide`}>
                              override
                            </span>
                          )}
                        </div>
                        <p className={`${theme.subheading} text-xs mt-1`}>
                          {size.width} × {size.height} {size.unit}
                        </p>
                        {referenceDetails.length > 0 && (
                          <p className={`${theme.subheading} text-[11px] mt-2`}>{referenceDetails.join(' • ')}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          placeholder={`${settings.defaultDpi}`}
                          value={current as number | ''}
                          min={72}
                          max={2400}
                          onChange={(event) => {
                            const value = event.target.value === '' ? '' : parseInt(event.target.value);
                            setOverride(key, value as number | '');
                          }}
                          className={`${smallInputClass} w-full`}
                        />
                        {hasOverride && (
                          <button
                            type="button"
                            onClick={() => clearOverride(key)}
                            className={`${theme.subtleButton} px-3 py-1 rounded-lg text-xs font-medium text-slate-200`}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

export type { OutputSettingsProps };
