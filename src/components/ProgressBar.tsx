import React from 'react';
import { ProcessingProgress } from '../types';

interface ProgressBarProps {
  progress: ProcessingProgress;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  if (!progress.total || progress.isComplete) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Processing Images
          </span>
          <span className="text-sm text-gray-500">
            {progress.current} of {progress.total}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-600">{progress.currentTask}</p>
          <p className="text-xs text-gray-500 mt-1">{percentage}% complete</p>
        </div>
      </div>
      
      <div className="flex items-center justify-center space-x-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Please wait...</span>
      </div>
    </div>
  );
};