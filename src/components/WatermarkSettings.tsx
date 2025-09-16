import type { WatermarkSettings } from '../types';
import { Panel } from './common/Panel';
import { theme } from '../theme';

interface WatermarkSettingsFormProps {
  settings: WatermarkSettings;
  onChange: (settings: WatermarkSettings) => void;
}

const inputBase = `${theme.input} w-full rounded-xl px-4 py-2 transition-colors duration-200`;
const smallInput = `${theme.input} w-full rounded-lg px-3 py-2 text-sm transition-colors duration-200`;
const sliderClass = 'w-full h-2 rounded-full appearance-none accent-purple-500 bg-slate-800/80';
const badgeClass = `${theme.badge} inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium`;

export function WatermarkSettingsForm({ settings, onChange }: WatermarkSettingsFormProps) {
  const updateSetting = <K extends keyof WatermarkSettings>(key: K, value: WatermarkSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <Panel
      title="Watermark"
      description="Configure the watermark that will be applied to all generated outputs. Final (non-watermarked) versions are generated alongside the watermark."
    >
      <p className={`${theme.subheading} text-sm -mt-2`}>
        Watermarking is always enabled so your shared previews remain protected.
      </p>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">Watermark text</label>
          <input
            type="text"
            value={settings.text}
            onChange={(event) => updateSetting('text', event.target.value)}
            className={inputBase}
            placeholder="© Your Name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Opacity</label>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.opacity}
                onChange={(event) => updateSetting('opacity', parseFloat(event.target.value))}
                className={sliderClass}
              />
              <div className={`${badgeClass} justify-center w-full`}>{Math.round(settings.opacity * 100)}%</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Base font size</label>
            <div className="relative">
              <input
                type="number"
                min="12"
                max="200"
                value={settings.fontSize}
                onChange={(event) => updateSetting('fontSize', parseInt(event.target.value) || 12)}
                className={`${inputBase} pr-12`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs uppercase tracking-wide text-slate-400">
                px
              </span>
            </div>
            <p className={`${theme.muted} text-xs mt-2`}>Automatically scales with image size.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Position</label>
            <select
              value={settings.position}
              onChange={(event) =>
                updateSetting('position', event.target.value as WatermarkSettings['position'])
              }
              className={`${inputBase} pr-10`}
            >
              <option value="top-left">Top left</option>
              <option value="top-right">Top right</option>
              <option value="bottom-left">Bottom left</option>
              <option value="bottom-right">Bottom right</option>
              <option value="center">Center</option>
              <option value="repeat">Repeat pattern</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.color}
                onChange={(event) => updateSetting('color', event.target.value)}
                className="h-12 w-14 rounded-xl border border-slate-700 bg-transparent"
              />
              <input
                type="text"
                value={settings.color}
                onChange={(event) => updateSetting('color', event.target.value)}
                className={`${inputBase} font-mono text-xs uppercase tracking-wide`}
                placeholder="#FFFFFF"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              {settings.position === 'repeat' ? 'Rotation angle' : 'Margins'}
            </label>
            {settings.position === 'repeat' ? (
              <div className="space-y-3">
                <input
                  type="range"
                  min="-90"
                  max="90"
                  step="5"
                  value={settings.rotation || 0}
                  onChange={(event) => updateSetting('rotation', parseInt(event.target.value) || 0)}
                  className={sliderClass}
                />
                <div className={`${badgeClass} justify-center w-full`}>{settings.rotation || 0}°</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`${theme.subheading} text-xs mb-1 block`}>Horizontal</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={settings.marginX}
                    onChange={(event) => updateSetting('marginX', parseInt(event.target.value) || 0)}
                    className={smallInput}
                  />
                </div>
                <div>
                  <label className={`${theme.subheading} text-xs mb-1 block`}>Vertical</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={settings.marginY}
                    onChange={(event) => updateSetting('marginY', parseInt(event.target.value) || 0)}
                    className={smallInput}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {settings.position === 'repeat' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Horizontal spacing</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={settings.marginX}
                  onChange={(event) => updateSetting('marginX', parseInt(event.target.value) || 0)}
                  className={`${inputBase} pr-12`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs uppercase tracking-wide text-slate-400">
                  px
                </span>
              </div>
              <p className={`${theme.muted} text-xs mt-2`}>Distance between repeated text horizontally.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Vertical spacing</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={settings.marginY}
                  onChange={(event) => updateSetting('marginY', parseInt(event.target.value) || 0)}
                  className={`${inputBase} pr-12`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs uppercase tracking-wide text-slate-400">
                  px
                </span>
              </div>
              <p className={`${theme.muted} text-xs mt-2`}>Distance between rows in the pattern.</p>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

export type { WatermarkSettingsFormProps };
