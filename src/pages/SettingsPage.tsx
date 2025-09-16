import { PageHeader } from '../components/common/PageHeader';
import { WatermarkSettings, ProcessingSettings } from '../types';
import { WatermarkSettingsForm } from '../components/WatermarkSettings';
import { OutputSettings } from '../components/OutputSettings';
import { Panel } from '../components/common/Panel';
import { classNames } from '../utils/classNames';
import { theme } from '../theme';

interface SettingsPageProps {
  watermarkSettings: WatermarkSettings;
  onWatermarkChange: (settings: WatermarkSettings) => void;
  processingSettings: ProcessingSettings;
  onProcessingChange: (settings: ProcessingSettings) => void;
  onResetWatermark: () => void;
  onResetProcessing: () => void;
}

export function SettingsPage({
  watermarkSettings,
  onWatermarkChange,
  processingSettings,
  onProcessingChange,
  onResetWatermark,
  onResetProcessing,
}: SettingsPageProps) {
  const overrideCount = Object.keys(processingSettings.dpiOverrides).length;
  const watermarkBadgeClass = classNames(
    watermarkSettings.enabled ? theme.badgeAccent : theme.badge,
    'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
  );
  const positionLabel = watermarkSettings.position.replace('-', ' ');
  const formattedPosition = positionLabel.charAt(0).toUpperCase() + positionLabel.slice(1);
  const watermarkText = watermarkSettings.text.trim() || 'Not set';

  return (
    <div className="space-y-10">
      <PageHeader
        title="Configure generator defaults"
        subtitle="Save your preferred watermark and output options. Settings persist locally and apply to every generation run."
      />

      <Panel
        title="Defaults overview"
        description="A quick summary of the preferences applied to every new generation."
        headerAction={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onResetWatermark}
              className={`${theme.subtleButton} rounded-xl px-4 py-2 text-sm font-semibold text-slate-200 transition-transform hover:scale-[1.01]`}
            >
              Reset watermark
            </button>
            <button
              type="button"
              onClick={onResetProcessing}
              className={`${theme.subtleButton} rounded-xl px-4 py-2 text-sm font-semibold text-slate-200 transition-transform hover:scale-[1.01]`}
            >
              Reset output
            </button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className={`${theme.panelInset} rounded-2xl border border-slate-800/70 bg-slate-950/40 p-5`}>
            <div className="flex items-center gap-3">
              <span className={watermarkBadgeClass}>{watermarkSettings.enabled ? 'Watermark on' : 'Watermark off'}</span>
              <span className={`${theme.subheading} text-xs`}>Position: {formattedPosition}</span>
            </div>
            <div className={`${theme.subheading} text-sm mt-4 space-y-1`}>
              <p><span className="text-slate-200">Text:</span> {watermarkText}</p>
              <p>Opacity: {Math.round(watermarkSettings.opacity * 100)}%</p>
              <p>Color: {watermarkSettings.color.toUpperCase()}</p>
            </div>
          </div>
          <div className={`${theme.panelInset} rounded-2xl border border-slate-800/70 bg-slate-950/40 p-5`}>
            <div className={`flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide ${theme.subheading}`}>
              <span className={`${theme.badge} rounded-full px-3 py-1`}>JPEG {Math.round(processingSettings.jpegQuality * 100)}%</span>
              <span className={`${theme.badgeAccent} rounded-full px-3 py-1`}>{processingSettings.defaultDpi} DPI</span>
              <span className={`${theme.badge} rounded-full px-3 py-1`}>{overrideCount} overrides</span>
            </div>
            <p className={`${theme.subheading} text-sm mt-4`}>Overrides replace the default DPI per size. Leave blank to inherit the default above.</p>
          </div>
        </div>
        <p className={`${theme.subheading} text-xs`}>Preferences are stored locally on this device. Clearing storage will reset them.</p>
      </Panel>

      <WatermarkSettingsForm settings={watermarkSettings} onChange={onWatermarkChange} />

      <OutputSettings settings={processingSettings} onChange={onProcessingChange} />
    </div>
  );
}

export type { SettingsPageProps };
