import { CropRatio, CropSize, DpiLevel } from '../types';

const DPI_LEVELS: readonly DpiLevel[] = [600, 1200];

const convertToInches = (value: number, unit: CropSize['unit']): number =>
  unit === 'in' ? value : value / 25.4;

const withReferencePixels = (size: Omit<CropSize, 'referencePixels'>): CropSize => {
  const widthInches = convertToInches(size.width, size.unit);
  const heightInches = convertToInches(size.height, size.unit);

  const referencePixels = {} as CropSize['referencePixels'];
  for (const level of DPI_LEVELS) {
    referencePixels[level] = {
      width: Math.round(widthInches * level),
      height: Math.round(heightInches * level),
    };
  }

  return {
    ...size,
    referencePixels,
  };
};

const inchSize = (name: string, width: number, height: number): CropSize =>
  withReferencePixels({ name, width, height, unit: 'in' });

export const CROP_RATIOS: CropRatio[] = [
  {
    name: '2:3',
    ratio: 2 / 3,
    sizes: [
      inchSize('4x6 in', 4, 6),
      inchSize('12x18 in', 12, 18),
      inchSize('20x30 in', 20, 30),
      inchSize('24x36 in', 24, 36),
    ],
  },
  {
    name: '3:4',
    ratio: 3 / 4,
    sizes: [
      inchSize('9x12 in', 9, 12),
      inchSize('18x24 in', 18, 24),
    ],
  },
  {
    name: '4:5',
    ratio: 4 / 5,
    sizes: [
      inchSize('8x10 in', 8, 10),
      inchSize('16x20 in', 16, 20),
    ],
  },
  {
    name: '11:14',
    ratio: 11 / 14,
    sizes: [inchSize('11x14 in', 11, 14)],
  },
  {
    name: 'A-Series',
    ratio: 8.3 / 11.7,
    sizes: [
      inchSize('A4 (8.3x11.7 in)', 8.3, 11.7),
      inchSize('A3 (11.7x16.5 in)', 11.7, 16.5),
    ],
  },
  {
    name: 'Special Fine Art',
    ratio: 13 / 19,
    sizes: [inchSize('13x19 in', 13, 19)],
  },
];

export const REFERENCE_DPI_LEVELS = DPI_LEVELS;
export const DPI: DpiLevel = DPI_LEVELS[0];
