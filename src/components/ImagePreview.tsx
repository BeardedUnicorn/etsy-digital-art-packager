import React from 'react';
import { CroppedImage } from '../types';

interface ImagePreviewProps {
  images: CroppedImage[];
  onDownload: (image: CroppedImage) => void;
  onDownloadAll: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  images,
  onDownload,
  onDownloadAll
}) => {
  if (images.length === 0) {
    return null;
  }

  // Group images by category
  const groupedImages = images.reduce((acc, image) => {
    if (!acc[image.category]) {
      acc[image.category] = [];
    }
    acc[image.category].push(image);
    return acc;
  }, {} as Record<string, CroppedImage[]>);

  return (
    <div className="w-full max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Image Preview
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {images.length} images ready for download
          </p>
        </div>
        <button
          onClick={onDownloadAll}
          className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download All
        </button>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedImages).map(([category, categoryImages]) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center">
              <h4 className="text-lg font-medium text-gray-800">{category}</h4>
              <div className="ml-3 bg-gray-100 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-gray-600">
                  {categoryImages.length} {categoryImages.length === 1 ? 'size' : 'sizes'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categoryImages.map((image) => (
                <div 
                  key={image.id} 
                  className="image-preview-card bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-lg"
                >
                  <div className="aspect-w-4 aspect-h-3 mb-4">
                    <img
                      src={image.dataUrl}
                      alt={image.name}
                      className="w-full h-32 object-contain bg-white rounded border"
                      loading="lazy"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-gray-800 truncate" title={image.name}>
                        {image.name}
                      </h5>
                      <p className="text-xs text-gray-500 mt-1">
                        {image.width.toLocaleString()} × {image.height.toLocaleString()} px
                      </p>
                    </div>
                    
                    <button
                      onClick={() => onDownload(image)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M7 20h10a2 2 0 002-2V8a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
    </div>
  );
};