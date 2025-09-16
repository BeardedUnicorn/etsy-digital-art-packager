import React, { useCallback, useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  uploadedImage?: string | null;
  onRemove?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  disabled, 
  uploadedImage,
  onRemove 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => 
      file.type === 'image/png' || file.type === 'image/jpeg'
    );
    
    if (imageFile) {
      onFileSelect(imageFile);
    }
  }, [onFileSelect, disabled]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  }, [onRemove]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {uploadedImage ? (
        // Show uploaded image with remove option
        <div className="relative border-2 border-gray-300 rounded-xl p-4 bg-white">
          <div className="relative">
            <img
              src={uploadedImage}
              alt="Uploaded preview"
              className="w-full h-64 object-contain rounded-lg bg-gray-50"
            />
            
            {/* Remove button */}
            <button
              onClick={handleRemove}
              disabled={disabled}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Image info */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p className="font-medium">Image loaded successfully</p>
              <p className="text-xs mt-1">Click the remove button to upload a different image</p>
            </div>
            
            {/* Upload different button */}
            <label
              htmlFor="file-input-replace"
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm font-medium ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Replace Image
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleFileChange}
              className="hidden"
              id="file-input-replace"
              disabled={disabled}
            />
          </div>
        </div>
      ) : (
        // Show upload dropzone
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            disabled 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
              : isDragOver
                ? 'border-blue-400 bg-blue-50 scale-105'
                : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
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
          
          <label 
            htmlFor="file-input" 
            className={`block ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="space-y-4">
              {/* Upload Icon */}
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-blue-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                  />
                </svg>
              </div>
              
              <div>
                <p className="text-xl font-semibold text-gray-800 mb-2">
                  {isDragOver ? 'Drop your image here' : 'Upload your image'}
                </p>
                <p className="text-gray-600 mb-4">
                  Drag and drop your image or click to browse
                </p>
                <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Choose File
                </div>
              </div>
              
              <div className="text-sm text-gray-500 border-t pt-4">
                <p><strong>Supported formats:</strong> PNG, JPG</p>
                <p><strong>Recommended:</strong> High resolution images (600 DPI)</p>
              </div>
            </div>
          </label>
        </div>
      )}
    </div>
  );
};