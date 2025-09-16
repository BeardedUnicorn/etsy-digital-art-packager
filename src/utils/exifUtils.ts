import piexif from 'piexifjs';

export type ImageVariant = 'watermarked' | 'final';

export interface EmbedExifOptions {
  shopName?: string | null;
  artTitle?: string | null;
  dpi?: number | null;
  width?: number | null;
  height?: number | null;
  variant?: ImageVariant;
  licenseText?: string;
}

export const DEFAULT_LICENSE_TEXT = 'Personal Use Only / non-commercial';
const SOFTWARE_LABEL = 'Etsy Digital Art Packager';

const JPEG_DATA_URL_PREFIX = /^data:image\/jpe?g;base64,/i;

export function embedExifMetadata(dataUrl: string, options: EmbedExifOptions): string {
  if (!dataUrl || !JPEG_DATA_URL_PREFIX.test(dataUrl)) {
    return dataUrl;
  }

  const {
    shopName,
    artTitle,
    dpi,
    width,
    height,
    variant,
    licenseText = DEFAULT_LICENSE_TEXT,
  } = options;

  const trimmedShopName = (shopName ?? '').trim();
  const trimmedTitle = (artTitle ?? '').trim();
  const normalizedVariant = variant === 'watermarked' || variant === 'final' ? variant : undefined;

  const zeroth: Record<number, unknown> = {};
  const exif: Record<number, unknown> = {};

  if (trimmedShopName) {
    zeroth[piexif.ImageIFD.Artist] = trimmedShopName;
  }

  const copyrightSegments: string[] = [];
  if (trimmedShopName) {
    copyrightSegments.push(`© ${trimmedShopName}`);
  }
  copyrightSegments.push(`License: ${licenseText}`);
  zeroth[piexif.ImageIFD.Copyright] = copyrightSegments.join(' – ');

  const descriptionSegments: string[] = [];
  if (trimmedTitle) {
    descriptionSegments.push(trimmedTitle);
  }
  if (normalizedVariant) {
    descriptionSegments.push(normalizedVariant === 'watermarked' ? 'Watermarked export' : 'Final export');
  }
  descriptionSegments.push(`License: ${licenseText}`);
  zeroth[piexif.ImageIFD.ImageDescription] = descriptionSegments.join(' | ');

  zeroth[piexif.ImageIFD.Software] = SOFTWARE_LABEL;

  if (dpi && Number.isFinite(dpi) && dpi > 0) {
    const roundedDpi = Math.max(1, Math.round(dpi));
    zeroth[piexif.ImageIFD.XResolution] = [roundedDpi, 1];
    zeroth[piexif.ImageIFD.YResolution] = [roundedDpi, 1];
    zeroth[piexif.ImageIFD.ResolutionUnit] = 2; // Inches
  }

  if (width && Number.isFinite(width) && width > 0) {
    const roundedWidth = Math.max(1, Math.round(width));
    exif[piexif.ExifIFD.PixelXDimension] = roundedWidth;
    zeroth[piexif.ImageIFD.ImageWidth] = roundedWidth;
  }

  if (height && Number.isFinite(height) && height > 0) {
    const roundedHeight = Math.max(1, Math.round(height));
    exif[piexif.ExifIFD.PixelYDimension] = roundedHeight;
    zeroth[piexif.ImageIFD.ImageLength] = roundedHeight;
  }

  exif[piexif.ExifIFD.UserComment] = `License: ${licenseText}`;

  const exifPayload = {
    '0th': zeroth,
    Exif: exif,
    GPS: {},
    Interop: {},
    '1st': {},
    thumbnail: null,
  };

  try {
    const exifBytes = piexif.dump(exifPayload);
    return piexif.insert(exifBytes, dataUrl);
  } catch (error) {
    console.error('Failed to embed EXIF metadata', error);
    return dataUrl;
  }
}
