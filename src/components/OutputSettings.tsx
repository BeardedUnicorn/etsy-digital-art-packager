import React from 'react';
import { CROP_RATIOS } from '../constants/cropRatios';
import { ProcessingSettings } from '../types';
import { getSizeKey } from '../utils/imageUtils';

interface OutputSettingsProps {
  settings: ProcessingSettings;
  onChange: (settings: ProcessingSettings) => void;
}

export const OutputSettings: React.FC<OutputSettingsProps> = ({ settings, onChange }) => {
  const setJpegQuality = (value: number) => {
    const q = Math.max(0.1, Math.min(1, value));
    onChange({ ...settings, jpegQuality: q });
  };

  const setDefaultDpi = (value: number) => {
    const dpi = Math.max(72, Math.min(2400, Math.round(value) || 72));
    onChange({ ...settings, defaultDpi: dpi });
  };

  const setOverride = (key: string, value: number | '') => {
    const overrides = { ...settings.dpiOverrides };
    if (value === '' || isNaN(Number(value))) {
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
    <div className="w-full mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Output Settings</h3>
          <p className="text-sm text-gray-600 mt-1">Configure JPEG quality and DPI per size</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">JPEG Quality</label>
          <div className="space-y-2">
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={settings.jpegQuality}
              onChange={(e) => setJpegQuality(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="text-sm text-gray-700">
              <span className="inline-block bg-gray-100 px-3 py-1 rounded font-medium">
                {Math.round(settings.jpegQuality * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Default DPI</label>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              min={72}
              max={2400}
              value={settings.defaultDpi}
              onChange={(e) => setDefaultDpi(parseInt(e.target.value))}
              className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
            />
            <span className="text-sm text-gray-500">DPI used when no override is set</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Per-Size DPI Overrides</h4>
        <div className="space-y-6">
          {CROP_RATIOS.map((ratio) => (
            <div key={ratio.name} className="border border-gray-200 rounded-lg">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <span className="font-medium text-gray-800">{ratio.name}</span>
                <span className="text-sm text-gray-600">Target aspect: {ratio.ratio.toFixed(4)}</span>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ratio.sizes.map((size) => {
                  const key = getSizeKey(ratio.name, size.name);
                  const current = settings.dpiOverrides[key] ?? '';
                  return (
                    <div key={key} className="flex items-center justify-between space-x-3 border border-gray-200 rounded-md p-3">
                      <div>
                        <div className="font-medium text-gray-800">{size.name}</div>
                        <div className="text-xs text-gray-500">{size.width}×{size.height} {size.unit}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder={`${settings.defaultDpi}`}
                          value={current as number | ''}
                          min={72}
                          max={2400}
                          onChange={(e) => {
                            const v = e.target.value === '' ? '' : parseInt(e.target.value);
                            setOverride(key, v as number | '');
                          }}
                          className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                        />
                        {key in settings.dpiOverrides && (
                          <button
                            type="button"
                            onClick={() => clearOverride(key)}
                            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
                            title="Clear override"
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
    </div>
  );
};

