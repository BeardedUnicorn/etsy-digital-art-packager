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

function sanitizeExifAscii(value: string): string {
  return value
    .replace(/[–—]/g, '-')
    .replace(/©/g, '(c)')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]+/g, ' ')
    .trim();
}

function encodeUtf16Le(value: string | null | undefined): number[] | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const bytes: number[] = [];
  for (let i = 0; i < trimmed.length; i += 1) {
    const codeUnit = trimmed.charCodeAt(i);
    bytes.push(codeUnit & 0xff, codeUnit >> 8);
  }
  bytes.push(0, 0);
  return bytes;
}

function setUnicodeTag(target: Record<number, unknown>, tag: number, value: string | null | undefined) {
  const encoded = encodeUtf16Le(value);
  if (encoded) {
    target[tag] = encoded;
  }
}

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
  const normalizedLicense = (licenseText ?? DEFAULT_LICENSE_TEXT).trim() || DEFAULT_LICENSE_TEXT;

  const asciiShopName = sanitizeExifAscii(trimmedShopName);
  const asciiTitle = sanitizeExifAscii(trimmedTitle);
  const asciiLicense = sanitizeExifAscii(normalizedLicense);
  const licenseCommentAscii = `License: ${asciiLicense || normalizedLicense}`;
  const licenseCommentUnicode = `License: ${normalizedLicense}`;
  const variantLabel =
    normalizedVariant === 'watermarked'
      ? 'Watermarked export'
      : normalizedVariant === 'final'
        ? 'Final export'
        : undefined;

  const zeroth: Record<number, unknown> = {};
  const exif: Record<number, unknown> = {};

  if (trimmedShopName) {
    if (asciiShopName) {
      zeroth[piexif.ImageIFD.Artist] = asciiShopName;
    }
    setUnicodeTag(zeroth, piexif.ImageIFD.XPAuthor, trimmedShopName);
  }

  const copyrightSegments: string[] = [];
  const copyrightSegmentsAscii: string[] = [];
  if (trimmedShopName) {
    copyrightSegments.push(`© ${trimmedShopName}`);
    copyrightSegmentsAscii.push(`(c) ${asciiShopName || trimmedShopName}`);
  }
  copyrightSegments.push(licenseCommentUnicode);
  copyrightSegmentsAscii.push(licenseCommentAscii);
  zeroth[piexif.ImageIFD.Copyright] = copyrightSegmentsAscii.join(' - ');
  setUnicodeTag(zeroth, piexif.ImageIFD.XPCopyright, copyrightSegments.join(' – '));

  const descriptionSegmentsAscii: string[] = [];
  const descriptionSegmentsUnicode: string[] = [];
  if (asciiTitle) {
    descriptionSegmentsAscii.push(asciiTitle);
  }
  if (trimmedTitle) {
    descriptionSegmentsUnicode.push(trimmedTitle);
  }
  if (variantLabel) {
    descriptionSegmentsAscii.push(variantLabel);
    descriptionSegmentsUnicode.push(variantLabel);
  }
  descriptionSegmentsAscii.push(licenseCommentAscii);
  descriptionSegmentsUnicode.push(licenseCommentUnicode);

  zeroth[piexif.ImageIFD.ImageDescription] = descriptionSegmentsAscii.join(' | ');
  if (asciiTitle) {
    zeroth[piexif.ImageIFD.DocumentName] = asciiTitle;
  }
  setUnicodeTag(zeroth, piexif.ImageIFD.XPTitle, trimmedTitle);
  setUnicodeTag(zeroth, piexif.ImageIFD.XPSubject, variantLabel);
  setUnicodeTag(zeroth, piexif.ImageIFD.XPComment, descriptionSegmentsUnicode.join(' | '));

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

  exif[piexif.ExifIFD.UserComment] = licenseCommentAscii;

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
