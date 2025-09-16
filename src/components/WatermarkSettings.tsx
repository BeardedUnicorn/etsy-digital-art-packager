import React from 'react';
import { WatermarkSettings } from '../types';

interface WatermarkSettingsProps {
  settings: WatermarkSettings;
  onChange: (settings: WatermarkSettings) => void;
}

export const WatermarkSettingsComponent: React.FC<WatermarkSettingsProps> = ({
  settings,
  onChange
}) => {
  const toggleEnabled = () => {
    onChange({ ...settings, enabled: !settings.enabled });
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Watermark Settings</h3>
          <p className="text-sm text-gray-600 mt-1">Customize your watermark appearance - preview updates in real-time</p>
        </div>
        <label className="flex items-center space-x-3 cursor-pointer">
          <span className="text-sm font-medium text-gray-700">Enable Watermark</span>
          <button
            type="button"
            onClick={toggleEnabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              settings.enabled ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                settings.enabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </label>
      </div>

      {settings.enabled && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Watermark Text</label>
            <input
              type="text"
              value={settings.text}
              onChange={(e) => onChange({ ...settings, text: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
              placeholder="Enter watermark text"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opacity
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.opacity}
                  onChange={(e) => onChange({ ...settings, opacity: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="text-center">
                  <span className="inline-block bg-gray-100 px-3 py-1 rounded text-sm font-medium text-gray-700">
                    {Math.round(settings.opacity * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Base Font Size</label>
              <div className="relative">
                <input
                  type="number"
                  min="12"
                  max="200"
                  value={settings.fontSize}
                  onChange={(e) => onChange({ ...settings, fontSize: parseInt(e.target.value) || 12 })}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
                />
                <span className="absolute right-3 top-2.5 text-sm text-gray-500">px</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Auto-scales with image size</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <select
                value={settings.position}
                onChange={(e) => onChange({ ...settings, position: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
              >
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="center">Center</option>
                <option value="repeat">Repeat Pattern</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="flex space-x-3">
                <input
                  type="color"
                  value={settings.color}
                  onChange={(e) => onChange({ ...settings, color: e.target.value })}
                  className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.color}
                  onChange={(e) => onChange({ ...settings, color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm bg-white text-gray-900"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {settings.position === 'repeat' ? 'Rotation Angle' : 'Margin Settings'}
              </label>
              {settings.position === 'repeat' ? (
                <div className="space-y-2">
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    step="5"
                    value={settings.rotation || 0}
                    onChange={(e) => onChange({ ...settings, rotation: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="text-center">
                    <span className="inline-block bg-gray-100 px-3 py-1 rounded text-sm font-medium text-gray-700">
                      {settings.rotation || 0}°
                    </span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Horizontal</label>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      value={settings.marginX}
                      onChange={(e) => onChange({ ...settings, marginX: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                      placeholder="20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Vertical</label>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      value={settings.marginY}
                      onChange={(e) => onChange({ ...settings, marginY: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                      placeholder="20"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {settings.position === 'repeat' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horizontal Spacing
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={settings.marginX}
                    onChange={(e) => onChange({ ...settings, marginX: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
                  />
                  <span className="absolute right-3 top-2.5 text-sm text-gray-500">px</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Space between text horizontally</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vertical Spacing
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={settings.marginY}
                    onChange={(e) => onChange({ ...settings, marginY: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
                  />
                  <span className="absolute right-3 top-2.5 text-sm text-gray-500">px</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Space between text vertically</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};