import { useCallback, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { SidebarLayout, NavigationItem } from './components/layout/SidebarLayout';
import { GeneratorPage } from './pages/GeneratorPage';
import { SettingsPage } from './pages/SettingsPage';
import { useLocalStorage } from './hooks/useLocalStorage';
import { CROP_RATIOS } from './constants/cropRatios';
import {
  loadImageFromFile,
  imageToCanvas,
  cropImageToRatio,
  resizeImageToTargetSize,
  convertToPixels,
  getSizeKey,
} from './utils/imageUtils';
import { addWatermarkToCanvas } from './utils/watermarkUtils';
import { WatermarkSettings, CroppedImage, ProcessingProgress, ProcessingSettings } from './types';

const defaultWatermarkSettings: WatermarkSettings = {
  text: '© Your Name',
  opacity: 0.5,
  fontSize: 48,
  color: '#ffffff',
  position: 'bottom-right',
  enabled: false,
  rotation: -45,
  marginX: 20,
  marginY: 20,
};

const navigationConfig: NavigationItem[] = [
  {
    id: 'generator',
    label: 'Generator',
    description: 'Upload source imagery and batch export print-ready crops.',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
          d="M12 6.253v11.494m7.548-7.548L12 17.747 4.452 10.2"
        />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Control watermark appearance and output quality defaults.',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
          d="M10.325 4.317a1 1 0 011.35-.937 9.042 9.042 0 015.217 5.217 1 1 0 01-.936 1.35 1 1 0 00-.757.958 1 1 0 00.757.958 1 1 0 01.936 1.35 9.042 9.042 0 01-5.217 5.217 1 1 0 01-1.35-.936 1 1 0 00-.958-.757 1 1 0 00-.958.757 1 1 0 01-1.35.936 9.042 9.042 0 01-5.217-5.217 1 1 0 01.936-1.35 1 1 0 00.757-.958 1 1 0 00-.757-.958 1 1 0 01-.936-1.35 9.042 9.042 0 015.217-5.217 1 1 0 011.35.936 1 1 0 00.958.757 1 1 0 00.958-.757z"
        />
      </svg>
    ),
  },
];

type PageKey = 'generator' | 'settings';

function App() {
  const [activePage, setActivePage] = useState<PageKey>('generator');
  const [originalImage, setOriginalImage] = useState<HTMLCanvasElement | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [croppedImages, setCroppedImages] = useState<CroppedImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress>({
    current: 0,
    total: 0,
    currentTask: '',
    isComplete: true,
  });
  const [watermarkSettings, setWatermarkSettings] = useLocalStorage(
    'watermarkSettings',
    defaultWatermarkSettings,
  );

  const [processingSettings, setProcessingSettings] = useLocalStorage<ProcessingSettings>(
    'processingSettings',
    {
      jpegQuality: 0.9,
      defaultDpi: 600,
      dpiOverrides: {},
    },
  );

  const processImages = useCallback(
    async (
      canvas: HTMLCanvasElement,
      settings: WatermarkSettings,
      proc: ProcessingSettings,
    ) => {
      const totalSizes = CROP_RATIOS.reduce((sum, ratio) => sum + ratio.sizes.length, 0);

      setProgress({
        current: 0,
        total: totalSizes,
        currentTask: 'Starting image processing...',
        isComplete: false,
      });

      const images: CroppedImage[] = [];
      let currentIndex = 0;

      for (const ratio of CROP_RATIOS) {
        setProgress((prev) => ({
          ...prev,
          currentTask: `Processing ${ratio.name} aspect ratio...`,
        }));

        const croppedCanvas = cropImageToRatio(canvas, ratio.ratio);

        for (const size of ratio.sizes) {
          currentIndex++;

          setProgress((prev) => ({
            ...prev,
            current: currentIndex,
            currentTask: `Creating ${size.name} (${size.width}×${size.height} ${size.unit})...`,
          }));

          await new Promise((resolve) => setTimeout(resolve, 30));

          try {
            const sizeKey = getSizeKey(ratio.name, size.name);
            const overrideUsed = sizeKey in proc.dpiOverrides;
            const dpi = overrideUsed ? proc.dpiOverrides[sizeKey] : proc.defaultDpi;
            const targetWidth = convertToPixels(size.width, size.unit, dpi);
            const targetHeight = convertToPixels(size.height, size.unit, dpi);

            const resizedCanvas = resizeImageToTargetSize(croppedCanvas, targetWidth, targetHeight);
            const finalCanvas = addWatermarkToCanvas(resizedCanvas, settings);

            const dataUrl = await new Promise<string>((resolve) => {
              finalCanvas.toBlob(
                (blob) => {
                  if (blob) {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                  } else {
                    try {
                      resolve(finalCanvas.toDataURL('image/jpeg', proc.jpegQuality));
                    } catch (error) {
                      console.error('Both toBlob and toDataURL failed', error);
                      resolve('');
                    }
                  }
                },
                'image/jpeg',
                proc.jpegQuality,
              );
            });

            if (!dataUrl) throw new Error('Failed to serialize canvas to image data');

            images.push({
              id: `${ratio.name}-${size.name}`,
              name: size.name,
              dataUrl,
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

      setProgress((prev) => ({
        ...prev,
        current: totalSizes,
        currentTask: 'Processing complete!',
        isComplete: true,
      }));

      setTimeout(() => {
        setProgress({ current: 0, total: 0, currentTask: '', isComplete: true });
      }, 1000);

      return images;
    },
    [],
  );

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      setProgress({ current: 0, total: 1, currentTask: 'Loading image...', isComplete: false });

      const img = await loadImageFromFile(file);
      const canvas = imageToCanvas(img);

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
      setCroppedImages([]);

      setProgress({ current: 0, total: 0, currentTask: '', isComplete: true });
    } catch (error) {
      console.error('Error loading image:', error);
      alert('Error loading image. Please try again.');
      setProgress({ current: 0, total: 0, currentTask: '', isComplete: true });
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
      const imageData = croppedImages.map((img) => [img.name.replace(/\s+/g, '_'), img.dataUrl]);

      const result = await invoke<string>('save_multiple_images', {
        images: imageData,
      });
      console.log('Images saved:', result);
    } catch (error) {
      console.error('Error saving images:', error);
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
    <SidebarLayout
      navigation={navigationConfig}
      activeId={activePage}
      onNavigate={(id) => setActivePage(id as PageKey)}
      footer={<p>All processing happens locally on your device.</p>}
    >
      {activePage === 'generator' ? (
        <GeneratorPage
          previewImage={previewImage}
          originalImage={originalImage}
          croppedImages={croppedImages}
          processing={processing}
          progress={progress}
          onFileSelect={handleFileSelect}
          onRemoveImage={handleRemoveImage}
          onGenerate={generateImages}
          onDownload={downloadImage}
          onDownloadAll={downloadAll}
          watermarkSettings={watermarkSettings}
        />
      ) : (
        <SettingsPage
          watermarkSettings={watermarkSettings}
          onWatermarkChange={setWatermarkSettings}
          processingSettings={processingSettings}
          onProcessingChange={setProcessingSettings}
        />
      )}
    </SidebarLayout>
  );
}

export default App;
