import type { ChangeEvent } from 'react';
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
    theme.badgeAccent,
    'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
  );
  const positionLabel = watermarkSettings.position.replace('-', ' ');
  const formattedPosition = positionLabel.charAt(0).toUpperCase() + positionLabel.slice(1);
  const watermarkText = watermarkSettings.text.trim() || 'Not set';
  const shopName = processingSettings.shopName ?? '';
  const sanitizedShopName = shopName.replace(/\s+/g, '');
  const filenameExampleParts = [sanitizedShopName || 'shop', 'portrait', '8x10_wm'];
  const filenameExample = filenameExampleParts.filter(Boolean).join('_');
  const shopLogoDataUrl = processingSettings.shopLogoDataUrl ?? null;
  const footerTagline = processingSettings.instructionsFooterTagline ?? '';
  const thankYouMessage = processingSettings.instructionsThankYouMessage ?? '';

  const handleShopNameChange = (value: string) => {
    const sanitized = value.replace(/\s+/g, '');
    onProcessingChange({ ...processingSettings, shopName: sanitized });
  };

  const handleShopLogoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const isPng = file.type === 'image/png';
    const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg';
    if (!isPng && !isJpeg) {
      console.warn('Shop logo must be a PNG or JPEG image.');
      event.target.value = '';
      return;
    }

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Unexpected result while reading logo file.'));
          }
        };
        reader.onerror = () => {
          reject(reader.error ?? new Error('Failed to read logo file.'));
        };
        reader.readAsDataURL(file);
      });

      onProcessingChange({ ...processingSettings, shopLogoDataUrl: dataUrl });
    } catch (error) {
      console.error('Failed to process shop logo upload', error);
    } finally {
      event.target.value = '';
    }
  };

  const handleClearShopLogo = () => {
    onProcessingChange({ ...processingSettings, shopLogoDataUrl: null });
  };

  const handleFooterTaglineChange = (value: string) => {
    onProcessingChange({ ...processingSettings, instructionsFooterTagline: value });
  };

  const handleThankYouMessageChange = (value: string) => {
    onProcessingChange({ ...processingSettings, instructionsThankYouMessage: value });
  };

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
              <span className={watermarkBadgeClass}>Watermark on (locked)</span>
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
              <span className={`${theme.badge} rounded-full px-3 py-1`}>Prefix: {sanitizedShopName || '—'}</span>
            </div>
            <p className={`${theme.subheading} text-sm mt-4`}>Overrides replace the default DPI per size. Leave blank to inherit the default above.</p>
          </div>
        </div>
        <p className={`${theme.subheading} text-xs`}>Preferences are stored locally on this device. Clearing storage will reset them.</p>
      </Panel>

      <Panel
        title="Shop branding"
        description="Set a prefix for generated filenames and optionally upload a logo for your PDF instructions. Spaces are removed automatically."
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200" htmlFor="shop-name-input">
            Shop name prefix
          </label>
          <input
            id="shop-name-input"
            type="text"
            value={sanitizedShopName}
            onChange={(event) => handleShopNameChange(event.target.value)}
            className={`${theme.input} w-full rounded-xl px-4 py-2 transition-colors duration-200`}
            placeholder="MyBrand"
          />
          <p className={`${theme.subheading} text-xs`}>
            Example output: <span className="font-mono text-slate-300">{filenameExample}.jpg</span>
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <label className="block text-sm font-medium text-slate-200" htmlFor="shop-logo-input">
            Shop logo
          </label>
          <p className={`${theme.subheading} text-xs`}>
            Optional. Displayed in the instructions PDF next to your shop name. Upload a PNG or JPEG and we'll automatically scale it to fit the layout.
          </p>
          {shopLogoDataUrl ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-slate-800/70 bg-slate-950/40">
                  <img
                    src={shopLogoDataUrl}
                    alt="Shop logo preview"
                    className="max-h-16 max-w-16 object-contain"
                  />
                </div>
                <p className={`${theme.subheading} text-xs`}>Upload a new file to replace this logo.</p>
              </div>
              <button
                type="button"
                onClick={handleClearShopLogo}
                className={`${theme.subtleButton} rounded-xl px-4 py-2 text-sm font-semibold text-slate-200 transition-transform hover:scale-[1.01]`}
              >
                Remove logo
              </button>
            </div>
          ) : (
            <p className={`${theme.subheading} text-xs`}>No logo uploaded yet.</p>
          )}
          <input
            id="shop-logo-input"
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleShopLogoChange}
            className="block w-full text-sm text-slate-200 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-500/70 file:px-4 file:py-2 file:font-semibold file:text-slate-100 hover:file:bg-purple-500/60"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200" htmlFor="pdf-footer-tagline">
            PDF footer tagline
          </label>
          <input
            id="pdf-footer-tagline"
            type="text"
            value={footerTagline}
            onChange={(event) => handleFooterTaglineChange(event.target.value)}
            className={`${theme.input} w-full rounded-xl px-4 py-2 transition-colors duration-200`}
            placeholder="Optional. Example: Curated prints for calm spaces"
          />
          <p className={`${theme.subheading} text-xs`}>
            Leave blank to display only your shop name in the PDF footer.
          </p>
        </div>
      </Panel>

      <WatermarkSettingsForm settings={{ ...watermarkSettings, enabled: true }} onChange={onWatermarkChange} />

      <Panel
        title="PDF messaging"
        description="Customize the closing note that appears at the end of the instructions PDF."
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200" htmlFor="pdf-thank-you-message">
            Thank-you message
          </label>
          <textarea
            id="pdf-thank-you-message"
            rows={5}
            value={thankYouMessage}
            onChange={(event) => handleThankYouMessageChange(event.target.value)}
            className={`${theme.input} w-full rounded-xl px-4 py-3 transition-colors duration-200 min-h-[140px]`}
            placeholder="Share a personalized note of gratitude with your customers."
          />
          <p className={`${theme.subheading} text-xs`}>
            Use line breaks to create separate paragraphs. This text replaces the default gratitude copy in the PDF.
          </p>
        </div>
      </Panel>

      <OutputSettings settings={processingSettings} onChange={onProcessingChange} />
    </div>
  );
}

export type { SettingsPageProps };
