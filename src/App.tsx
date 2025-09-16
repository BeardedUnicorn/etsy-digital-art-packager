import { useCallback, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { SidebarLayout, NavigationItem } from './components/layout/SidebarLayout';
import { GeneratorPage } from './pages/GeneratorPage';
import { SettingsPage } from './pages/SettingsPage';
import { GeneratedPreviewModal } from './components/GeneratedPreviewModal';
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
import { WatermarkSettings, CroppedImage, ProcessingProgress, ProcessingSettings, SourceImageInfo } from './types';

const defaultWatermarkSettings: WatermarkSettings = {
  text: '© Your Name',
  opacity: 0.5,
  fontSize: 48,
  color: '#ffffff',
  position: 'bottom-right',
  enabled: true,
  rotation: -45,
  marginX: 20,
  marginY: 20,
};

const defaultProcessingSettings: ProcessingSettings = {
  jpegQuality: 0.9,
  defaultDpi: 600,
  dpiOverrides: {},
  shopName: '',
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
  const [sourceInfo, setSourceInfo] = useState<SourceImageInfo | null>(null);
  const [artTitle, setArtTitle] = useLocalStorage('artTitle', '');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
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
    defaultProcessingSettings,
  );

  const resetWatermarkSettings = useCallback(() => {
    setWatermarkSettings({ ...defaultWatermarkSettings });
  }, [setWatermarkSettings]);

  const resetProcessingSettings = useCallback(() => {
    setProcessingSettings({ ...defaultProcessingSettings, dpiOverrides: {} });
  }, [setProcessingSettings]);

  const createThumbnailDataUrl = useCallback((sourceCanvas: HTMLCanvasElement) => {
    const maxDimension = 512;
    const scale = Math.min(maxDimension / sourceCanvas.width, maxDimension / sourceCanvas.height, 1);
    const targetWidth = Math.max(1, Math.round(sourceCanvas.width * scale));
    const targetHeight = Math.max(1, Math.round(sourceCanvas.height * scale));

    if (scale === 1) {
      return sourceCanvas.toDataURL('image/jpeg', 0.7);
    }

    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = targetWidth;
    thumbCanvas.height = targetHeight;
    const ctx = thumbCanvas.getContext('2d');
    if (!ctx) {
      return sourceCanvas.toDataURL('image/jpeg', 0.7);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
    return thumbCanvas.toDataURL('image/jpeg', 0.7);
  }, []);


  useEffect(() => {
    if (processingSettings.shopName === undefined) {
      setProcessingSettings((prev) => ({ ...prev, shopName: '' }));
    }
  }, [processingSettings.shopName, setProcessingSettings]);

  useEffect(() => {
    if (!watermarkSettings.enabled) {
      setWatermarkSettings((prev) => ({ ...prev, enabled: true }));
    }
  }, [watermarkSettings.enabled, setWatermarkSettings]);


  useEffect(() => {
    if (croppedImages.length === 0) {
      setIsPreviewOpen(false);
      setPreviewIndex(0);
      return;
    }
    setPreviewIndex((prev) => Math.min(prev, croppedImages.length - 1));
  }, [croppedImages.length]);

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
            currentTask: `Creating ${size.name} (${size.width}×${size.height} ${size.unit}) – watermarked + final...`,
          }));

          await new Promise((resolve) => setTimeout(resolve, 30));

          try {
            const sizeKey = getSizeKey(ratio.name, size.name);
            const overrideUsed = sizeKey in proc.dpiOverrides;
            const dpi = overrideUsed ? proc.dpiOverrides[sizeKey] : proc.defaultDpi;
            const targetWidth = convertToPixels(size.width, size.unit, dpi);
            const targetHeight = convertToPixels(size.height, size.unit, dpi);

            const resizedCanvas = resizeImageToTargetSize(croppedCanvas, targetWidth, targetHeight);

            const sanitizeSegment = (value: string) =>
              value
                .replace(/×/g, 'x')
                .normalize('NFKD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-zA-Z0-9]+/g, '')
                .toLowerCase();

            const buildFileBase = () => {
              const segments: string[] = [];
              if (proc.shopName) {
                segments.push(proc.shopName.replace(/\s+/g, ''));
              }
              const artSegment = sanitizeSegment(artTitle || '');
              const ratioSegment = sanitizeSegment(ratio.name);
              const sizeSegment = sanitizeSegment(size.name);
              if (artSegment) {
                segments.push(artSegment);
              } else {
                segments.push('untitled');
              }
              if (ratioSegment) segments.push(ratioSegment);
              if (sizeSegment) segments.push(sizeSegment);
              if (segments.length === 0) return 'output';
              return segments.join('_');
            };

            const baseFileName = buildFileBase();
            const displayBaseName = artTitle ? `${artTitle} – ${size.name}` : size.name;

            const canvasToDataUrl = async (canvas: HTMLCanvasElement) =>
              await new Promise<string>((resolve) => {
                canvas.toBlob(
                  (blob) => {
                    if (blob) {
                      const reader = new FileReader();
                      reader.onloadend = () => resolve(reader.result as string);
                      reader.readAsDataURL(blob);
                    } else {
                      try {
                        resolve(canvas.toDataURL('image/jpeg', proc.jpegQuality));
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

            const watermarkedCanvas = addWatermarkToCanvas(resizedCanvas, { ...settings, enabled: true });
            const [watermarkedDataUrl, cleanDataUrl] = await Promise.all([
              canvasToDataUrl(watermarkedCanvas),
              canvasToDataUrl(resizedCanvas),
            ]);

            if (!watermarkedDataUrl || !cleanDataUrl) {
              throw new Error('Failed to serialize canvas to image data');
            }

                        const watermarkedId = `${ratio.name}-${size.name}-wm`;
            const finalId = `${ratio.name}-${size.name}-final`;
            const watermarkedFileName = `${baseFileName}_wm`;
            const finalFileName = `${baseFileName}_final`;
            const dpiSource = overrideUsed ? 'override' : 'default';
            const watermarkedThumbnail = createThumbnailDataUrl(watermarkedCanvas);
            const finalThumbnail = createThumbnailDataUrl(resizedCanvas);

            images.push({
              id: watermarkedId,
              name: `${displayBaseName} (Watermarked)`,
              fileName: watermarkedFileName,
              dataUrl: watermarkedDataUrl,
              width: watermarkedCanvas.width,
              height: watermarkedCanvas.height,
              size: size.name,
              category: ratio.name,
              appliedDpi: dpi,
              dpiSource,
              variant: 'watermarked',
              isWatermarked: true,
              thumbnailUrl: watermarkedThumbnail,
            });

            images.push({
              id: finalId,
              name: `${displayBaseName} (Final)`,
              fileName: finalFileName,
              dataUrl: cleanDataUrl,
              width: resizedCanvas.width,
              height: resizedCanvas.height,
              size: size.name,
              category: ratio.name,
              appliedDpi: dpi,
              dpiSource,
              variant: 'final',
              isWatermarked: false,
              thumbnailUrl: finalThumbnail,
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
    [createThumbnailDataUrl, artTitle],
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
      setSourceInfo({
        name: file.name,
        size: file.size,
        type: file.type,
        width: canvas.width,
        height: canvas.height,
      });

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
    setSourceInfo(null);
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
        filename: image.fileName,
        subdir: image.isWatermarked ? 'watermarked' : 'final',
      });
      console.log('Image saved:', result);
    } catch (error) {
      console.error('Error saving image:', error);
      const link = document.createElement('a');
      link.href = image.dataUrl;
      link.download = `${(image.isWatermarked ? 'watermarked_' : 'final_') + image.fileName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);

  const downloadAll = useCallback(async () => {
    if (croppedImages.length === 0) return;

    try {
      const imageData = croppedImages.map((img) => ({
        filename: img.fileName,
        data: img.dataUrl,
        subdir: img.isWatermarked ? 'watermarked' : 'final',
      }));

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
          link.download = `${(image.isWatermarked ? 'watermarked_' : 'final_') + image.fileName}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, index * 300);
      });
    }
  }, [croppedImages]);

  const openPreviewAt = useCallback((index: number) => {
    if (croppedImages.length === 0) return;
    const normalized = Math.max(0, Math.min(index, croppedImages.length - 1));
    setPreviewIndex(normalized);
    setIsPreviewOpen(true);
  }, [croppedImages.length]);

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  const goToPreviewIndex = useCallback((index: number) => {
    if (croppedImages.length === 0) return;
    const normalized = ((index % croppedImages.length) + croppedImages.length) % croppedImages.length;
    setPreviewIndex(normalized);
  }, [croppedImages.length]);

  const stepPreview = useCallback((direction: number) => {
    if (croppedImages.length === 0) return;
    setPreviewIndex((prev) => {
      const length = croppedImages.length;
      return (prev + direction + length) % length;
    });
  }, [croppedImages.length]);

  return (
    <>
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
            onPreviewImage={openPreviewAt}
            onPreviewAll={() => openPreviewAt(0)}
            watermarkSettings={watermarkSettings}
            sourceInfo={sourceInfo}
            shopName={processingSettings.shopName}
            artTitle={artTitle}
            onArtTitleChange={setArtTitle}
            onOpenSettings={() => setActivePage('settings')}
          />
        ) : (
          <SettingsPage
            watermarkSettings={watermarkSettings}
            onWatermarkChange={setWatermarkSettings}
            processingSettings={processingSettings}
            onProcessingChange={setProcessingSettings}
            onResetWatermark={resetWatermarkSettings}
            onResetProcessing={resetProcessingSettings}
          />
        )}
      </SidebarLayout>
      <GeneratedPreviewModal
        images={croppedImages}
        open={isPreviewOpen}
        currentIndex={previewIndex}
        onClose={closePreview}
        onNavigate={goToPreviewIndex}
        onStep={stepPreview}
        onDownload={downloadImage}
      />
    </>
  );
}

export default App;
