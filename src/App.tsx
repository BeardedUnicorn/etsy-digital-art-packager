import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { FileUpload } from './components/FileUpload';
import { WatermarkSettingsComponent } from './components/WatermarkSettings';
import { WatermarkPreview } from './components/WatermarkPreview';
import { ImagePreview } from './components/ImagePreview';
import { ProgressBar } from './components/ProgressBar';
import { useLocalStorage } from './hooks/useLocalStorage';
import { CROP_RATIOS } from './constants/cropRatios';
import {
  loadImageFromFile,
  imageToCanvas,
  cropImageToRatio,
  resizeImageToTargetSize,
  convertToPixels
} from './utils/imageUtils';
import { addWatermarkToCanvas } from './utils/watermarkUtils';
import { WatermarkSettings, CroppedImage, ProcessingProgress, ProcessingSettings } from './types';
import { OutputSettings } from './components/OutputSettings';
import { getSizeKey } from './utils/imageUtils';

const defaultWatermarkSettings: WatermarkSettings = {
  text: '© Your Name',
  opacity: 0.5,
  fontSize: 48,
  color: '#ffffff',
  position: 'bottom-right',
  enabled: false,
  rotation: -45,
  marginX: 20,
  marginY: 20
};

function App() {
  const [originalImage, setOriginalImage] = useState<HTMLCanvasElement | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [croppedImages, setCroppedImages] = useState<CroppedImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress>({
    current: 0,
    total: 0,
    currentTask: '',
    isComplete: true
  });
  const [watermarkSettings, setWatermarkSettings] = useLocalStorage(
    'watermarkSettings',
    defaultWatermarkSettings
  );

  const [processingSettings, setProcessingSettings] = useLocalStorage<ProcessingSettings>('processingSettings', {
    jpegQuality: 0.9,
    defaultDpi: 600,
    dpiOverrides: {},
  });

  const processImages = useCallback(async (canvas: HTMLCanvasElement, settings: WatermarkSettings, proc: ProcessingSettings) => {
    const totalSizes = CROP_RATIOS.reduce((sum, ratio) => sum + ratio.sizes.length, 0);
    
    setProgress({
      current: 0,
      total: totalSizes,
      currentTask: 'Starting image processing...',
      isComplete: false
    });

    const images: CroppedImage[] = [];
    let currentIndex = 0;

    for (const ratio of CROP_RATIOS) {
      setProgress(prev => ({
        ...prev,
        currentTask: `Processing ${ratio.name} aspect ratio...`
      }));

      const croppedCanvas = cropImageToRatio(canvas, ratio.ratio);
     
      for (const size of ratio.sizes) {
        currentIndex++;
        
        setProgress(prev => ({
          ...prev,
          current: currentIndex,
          currentTask: `Creating ${size.name} (${size.width}×${size.height} ${size.unit})...`
        }));

        // Add a small delay to make progress visible
        await new Promise(resolve => setTimeout(resolve, 30));

        try {
          const sizeKey = getSizeKey(ratio.name, size.name);
          const overrideUsed = sizeKey in proc.dpiOverrides;
          const dpi = overrideUsed ? proc.dpiOverrides[sizeKey] : proc.defaultDpi;
          const targetWidth = convertToPixels(size.width, size.unit, dpi);
          const targetHeight = convertToPixels(size.height, size.unit, dpi);
          
          const resizedCanvas = resizeImageToTargetSize(croppedCanvas, targetWidth, targetHeight);
          const finalCanvas = addWatermarkToCanvas(resizedCanvas, settings);
          
          // Prefer toBlob, but fall back to toDataURL if it returns null on very large canvases
          const dataUrl = await new Promise<string>((resolve) => {
            finalCanvas.toBlob((blob) => {
              if (blob) {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              } else {
                // Fallback path
                try {
                  resolve(finalCanvas.toDataURL('image/jpeg', proc.jpegQuality));
                } catch (e) {
                  console.error('Both toBlob and toDataURL failed', e);
                  resolve('');
                }
              }
            }, 'image/jpeg', proc.jpegQuality);
          });
          
          if (!dataUrl) throw new Error('Failed to serialize canvas to image data');

          images.push({
            id: `${ratio.name}-${size.name}`,
            name: size.name,
            dataUrl: dataUrl,
            // Record actual output dimensions after safety scaling
            width: finalCanvas.width,
            height: finalCanvas.height,
            size: size.name,
            category: ratio.name,
            appliedDpi: dpi,
            dpiSource: overrideUsed ? 'override' : 'default',
          });
        } catch (error) {
          console.error(`Error processing ${size.name}:`, error);
        }
      }
    }

    setProgress(prev => ({
      ...prev,
      current: totalSizes,
      currentTask: 'Processing complete!',
      isComplete: true
    }));

    // Keep the completed message visible for a moment
    setTimeout(() => {
      setProgress({
        current: 0,
        total: 0,
        currentTask: '',
        isComplete: true
      });
    }, 1000);

    return images;
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      setProgress({
        current: 0,
        total: 1,
        currentTask: 'Loading image...',
        isComplete: false
      });

      const img = await loadImageFromFile(file);
      const canvas = imageToCanvas(img);
      
      // Create preview image (scaled down for display)
      const maxPreviewSize = 800;
      let previewWidth = canvas.width;
      let previewHeight = canvas.height;
      
      if (previewWidth > maxPreviewSize || previewHeight > maxPreviewSize) {
        const scale = Math.min(maxPreviewSize / previewWidth, maxPreviewSize / previewHeight);
        previewWidth = Math.round(previewWidth * scale);
        previewHeight = Math.round(previewHeight * scale);
      }
      
      const previewCanvas = document.createElement('canvas');
      const previewCtx = previewCanvas.getContext('2d')!;
      previewCanvas.width = previewWidth;
      previewCanvas.height = previewHeight;
      previewCtx.drawImage(canvas, 0, 0, previewWidth, previewHeight);
      
      setOriginalImage(canvas);
      setPreviewImage(previewCanvas.toDataURL('image/jpeg', 0.8));
      setCroppedImages([]); // Clear previous images
      
      setProgress({
        current: 0,
        total: 0,
        currentTask: '',
        isComplete: true
      });
    } catch (error) {
      console.error('Error loading image:', error);
      alert('Error loading image. Please try again.');
      setProgress({
        current: 0,
        total: 0,
        currentTask: '',
        isComplete: true
      });
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setOriginalImage(null);
    setPreviewImage(null);
    setCroppedImages([]);
  }, []);

  const generateImages = useCallback(async () => {
    if (!originalImage) return;
    
    setProcessing(true);
    try {
      const images = await processImages(originalImage, watermarkSettings, processingSettings);
      setCroppedImages(images);
    } catch (error) {
      console.error('Error generating images:', error);
      alert('Error generating images. Please try again.');
    } finally {
      setProcessing(false);
    }
  }, [originalImage, watermarkSettings, processingSettings, processImages]);

  const downloadImage = useCallback(async (image: CroppedImage) => {
    try {
      const result = await invoke<string>('save_image', {
        image_data: image.dataUrl,
        filename: image.name.replace(/\s+/g, '_'),
      });
      console.log('Image saved:', result);
    } catch (error) {
      console.error('Error saving image:', error);
      // Fallback to browser download
      const link = document.createElement('a');
      link.href = image.dataUrl;
      link.download = `${image.name.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);

  const downloadAll = useCallback(async () => {
    if (croppedImages.length === 0) return;
    
    try {
      const imageData = croppedImages.map(img => [
        img.name.replace(/\s+/g, '_'),
        img.dataUrl,
      ]);
      
      const result = await invoke<string>('save_multiple_images', {
        images: imageData
      });
      console.log('Images saved:', result);
    } catch (error) {
      console.error('Error saving images:', error);
      // Fallback to individual downloads
      croppedImages.forEach((image, index) => {
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = image.dataUrl;
          link.download = `${image.name.replace(/\s+/g, '_')}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, index * 300);
      });
    }
  }, [croppedImages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Image Cropper
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Automatically crop your high-resolution images to standard print sizes 
            while maintaining 600 DPI quality
          </p>
        </div>
        
        {/* File Upload */}
        <FileUpload 
          onFileSelect={handleFileSelect} 
          disabled={processing}
          uploadedImage={previewImage}
          onRemove={handleRemoveImage}
        />
        
        {/* Watermark Settings and Preview */}
        {originalImage && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <WatermarkSettingsComponent
                settings={watermarkSettings}
                onChange={setWatermarkSettings}
              />
              <OutputSettings
                settings={processingSettings}
                onChange={setProcessingSettings}
              />
            </div>
            <div className="lg:col-span-1">
              <WatermarkPreview
                originalCanvas={originalImage}
                settings={watermarkSettings}
              />
            </div>
          </div>
        )}
        
        {/* Generate Button */}
        {originalImage && (
          <div className="text-center">
            <button
              onClick={generateImages}
              disabled={processing}
              className={`inline-flex items-center px-8 py-4 text-lg font-medium rounded-lg transition-all duration-200 ${
                processing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transform hover:scale-105'
              } text-white shadow-lg`}
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Generate Images ({CROP_RATIOS.reduce((sum, ratio) => sum + ratio.sizes.length, 0)} sizes)
                </>
              )}
            </button>
          </div>
        )}
        
        {/* Progress Bar */}
        {processing && <ProgressBar progress={progress} />}
        
        {/* Image Preview */}
        <ImagePreview
          images={croppedImages}
          onDownload={downloadImage}
          onDownloadAll={downloadAll}
        />

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-8">
          <p>All images are processed at 600 DPI for professional printing quality</p>
          <p className="mt-2">Watermarks automatically scale with image resolution</p>
        </div>
      </div>
    </div>
  );
}

export default App;
