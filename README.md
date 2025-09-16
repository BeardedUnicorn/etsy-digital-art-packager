# Image Cropper

Desktop app for quickly generating print‑ready crops from a single high‑resolution image, with optional watermarks. Built with Tauri (Rust) + React + TypeScript.

## What It Does
- Auto‑crops and exports multiple standard print sizes at professional quality (600 DPI).
- Supports common aspect ratios and sizes, including 2:3 (4x6, 12x18, 20x30, 24x36), 3:4 (9x12, 18x24), 4:5 (8x10, 16x20), 11x14, A‑series (A4, A3), and 13x19.
- Adds a customizable watermark: text, opacity, color, font size, margins, rotation, and position (corners, center, or tiled repeat). Watermark scales automatically with image resolution.
- Provides live preview and a progress indicator during batch generation.
- Saves a single image or an entire set using native OS dialogs (with a browser download fallback in web preview).

## How It Works
1. You upload one image (PNG or JPEG).
2. The app crops to the target aspect ratio, resizes to pixel dimensions derived from 600 DPI, applies your watermark, and encodes to JPEG.
3. You download each file or choose Download All to save a set.

## Run Locally
Prerequisites: Node 18+, Rust (stable), and Tauri system dependencies.

- Install deps: `npm install`
- Desktop (recommended): `npm run tauri dev`
- Web preview (limited saving): `npm run dev`
- Build desktop binaries: `npm run tauri build`
- Build/preview web bundle: `npm run build` then `npm run preview`

## Usage
1. Click Upload and select a high‑resolution image.
2. Adjust watermark settings and preview the result.
3. Click Generate Images to create all sizes.
4. Download individual images or use Download All to choose a folder and save them at once.

All processing happens locally on your machine; images are not uploaded.

## License
MIT — see `LICENSE`.
