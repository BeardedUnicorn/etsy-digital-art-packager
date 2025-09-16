import { CropRatio } from '../types';

export const CROP_RATIOS: CropRatio[] = [
  {
    name: '2:3 Portrait',
    ratio: 2/3,
    sizes: [
      { name: '4x6 in', width: 4, height: 6, unit: 'in' },
      { name: '12x18 in', width: 12, height: 18, unit: 'in' },
      { name: '20x30 in', width: 20, height: 30, unit: 'in' },
      { name: '24x36 in', width: 24, height: 36, unit: 'in' },
    ]
  },
  {
    name: '3:4 Portrait',
    ratio: 3/4,
    sizes: [
      { name: '9x12 in', width: 9, height: 12, unit: 'in' },
      { name: '18x24 in', width: 18, height: 24, unit: 'in' },
    ]
  },
  {
    name: '4:5 Portrait',
    ratio: 4/5,
    sizes: [
      { name: '8x10 in', width: 8, height: 10, unit: 'in' },
      { name: '16x20 in', width: 16, height: 20, unit: 'in' },
    ]
  },
  {
    name: '11x14 Standard',
    ratio: 11/14,
    sizes: [
      { name: '11x14 in', width: 11, height: 14, unit: 'in' },
    ]
  },
  {
    name: 'A-Series International',
    ratio: 210/297,
    sizes: [
      { name: 'A4', width: 210, height: 297, unit: 'mm' },
      { name: 'A3', width: 297, height: 420, unit: 'mm' },
    ]
  },
  {
    name: 'Special Fine Art',
    ratio: 13/19,
    sizes: [
      { name: '13x19 in (Super B)', width: 13, height: 19, unit: 'in' },
    ]
  }
];

export const DPI = 600;