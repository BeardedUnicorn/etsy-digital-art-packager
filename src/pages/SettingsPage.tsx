import { PageHeader } from '../components/common/PageHeader';
import { WatermarkSettings, ProcessingSettings } from '../types';
import { WatermarkSettingsForm } from '../components/WatermarkSettings';
import { OutputSettings } from '../components/OutputSettings';
import { Panel } from '../components/common/Panel';
import { theme } from '../theme';

interface SettingsPageProps {
  watermarkSettings: WatermarkSettings;
  onWatermarkChange: (settings: WatermarkSettings) => void;
  processingSettings: ProcessingSettings;
  onProcessingChange: (settings: ProcessingSettings) => void;
}

export function SettingsPage({
  watermarkSettings,
  onWatermarkChange,
  processingSettings,
  onProcessingChange,
}: SettingsPageProps) {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Configure generator defaults"
        subtitle="Save your preferred watermark and output options. Settings persist locally and apply to every generation run."
      />

      <Panel title="Storage" description="All preferences are saved locally in your browser using secure storage.">
        <div className={`${theme.subheading} text-sm`}>
          No data leaves your machine. Remove the app or clear storage to reset defaults.
        </div>
      </Panel>

      <WatermarkSettingsForm settings={watermarkSettings} onChange={onWatermarkChange} />

      <OutputSettings settings={processingSettings} onChange={onProcessingChange} />
    </div>
  );
}

export type { SettingsPageProps };
