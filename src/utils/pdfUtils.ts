import {
  PDFArray,
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFString,
  StandardFonts,
  rgb,
} from 'pdf-lib';
import type { PDFFont } from 'pdf-lib';

export interface PdfRatioSummary {
  ratioName: string;
  sizes: string[];
}

interface GenerateInstructionsPdfOptions {
  shopName: string;
  artTitle: string;
  downloadLink: string;
  ratios: PdfRatioSummary[];
  previewImageDataUrl?: string | null;
}

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const PAGE_MARGIN = 48;

const isHttpLink = (value: string) => /^https?:\/\//i.test(value.trim());

const dataUrlToUint8Array = (dataUrl: string) => {
  const [, base64Part = ''] = dataUrl.split(',');
  const binary = atob(base64Part);
  const output = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    output[i] = binary.charCodeAt(i);
  }
  return output;
};

export async function generateInstructionsPdf(options: GenerateInstructionsPdfOptions): Promise<Uint8Array> {
  const {
    shopName,
    artTitle,
    downloadLink,
    ratios,
    previewImageDataUrl,
  } = options;

  const pdfDoc = await PDFDocument.create();

  const titleText = shopName.trim() || 'Print Release';
  pdfDoc.setTitle(titleText);

  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const createPageContext = () => {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    return { page, cursorY: PAGE_HEIGHT - PAGE_MARGIN };
  };

  let { page, cursorY } = createPageContext();
  const contentWidth = PAGE_WIDTH - PAGE_MARGIN * 2;

  const ensureSpace = (required: number) => {
    if (cursorY - required < PAGE_MARGIN) {
      ({ page, cursorY } = createPageContext());
    }
  };

  const drawTextLine = (
    text: string,
    options: {
      font?: PDFFont;
      size?: number;
      color?: ReturnType<typeof rgb>;
      align?: 'left' | 'center';
      lineHeight?: number;
    } = {},
  ) => {
    const {
      font = bodyFont,
      size = 12,
      color = rgb(0.12, 0.14, 0.18),
      align = 'left',
      lineHeight,
    } = options;
    const resolvedLineHeight = lineHeight ?? size + 6;
    ensureSpace(resolvedLineHeight);
    const textWidth = font.widthOfTextAtSize(text, size);
    const xOffset =
      align === 'center'
        ? PAGE_MARGIN + (contentWidth - textWidth) / 2
        : PAGE_MARGIN;
    const baseline = cursorY - size;
    page.drawText(text, {
      x: xOffset,
      y: baseline,
      size,
      font,
      color,
    });
    cursorY = baseline - (resolvedLineHeight - size);
  };

  const drawParagraph = (
    text: string,
    options: {
      font?: PDFFont;
      size?: number;
      color?: ReturnType<typeof rgb>;
      lineHeight?: number;
    } = {},
  ) => {
    const {
      font = bodyFont,
      size = 12,
      color = rgb(0.12, 0.14, 0.18),
      lineHeight,
    } = options;
    const resolvedLineHeight = lineHeight ?? size + 6;
    const words = text.split(/\s+/);
    let currentLine = '';
    words.forEach((word) => {
      const tentative = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(tentative, size);
      if (width <= contentWidth) {
        currentLine = tentative;
        return;
      }
      if (currentLine) {
        drawTextLine(currentLine, {
          font,
          size,
          color,
          align: 'left',
          lineHeight: resolvedLineHeight,
        });
      }
      currentLine = word;
    });
    if (currentLine) {
      drawTextLine(currentLine, {
        font,
        size,
        color,
        align: 'left',
        lineHeight: resolvedLineHeight,
      });
    }
  };

  const drawLink = (label: string, url: string) => {
    const size = 12;
    const color = rgb(0.09, 0.32, 0.7);
    const resolvedLineHeight = size + 8;
    ensureSpace(resolvedLineHeight);
    const width = bodyFont.widthOfTextAtSize(label, size);
    const x = PAGE_MARGIN;
    const baseline = cursorY - size;
    page.drawText(label, { x, y: baseline, size, font: bodyFont, color });
    cursorY = baseline - (resolvedLineHeight - size);

    const rect = PDFArray.withContext(pdfDoc.context);
    rect.push(PDFNumber.of(x));
    rect.push(PDFNumber.of(baseline - 2));
    rect.push(PDFNumber.of(x + width));
    rect.push(PDFNumber.of(baseline + size + 2));

    const border = PDFArray.withContext(pdfDoc.context);
    border.push(PDFNumber.of(0));
    border.push(PDFNumber.of(0));
    border.push(PDFNumber.of(0));

    const action = pdfDoc.context.obj({
      Type: PDFName.of("Action"),
      S: PDFName.of("URI"),
      URI: PDFString.of(url),
    });

    const annotation = pdfDoc.context.obj({
      Type: PDFName.of("Annot"),
      Subtype: PDFName.of("Link"),
      Rect: rect,
      Border: border,
      A: action,
    });
    const annotationRef = pdfDoc.context.register(annotation);
    page.node.addAnnot(annotationRef);
  };

  drawTextLine(titleText, {
    font: titleFont,
    size: 24,
    align: 'center',
    lineHeight: 32,
  });

  const effectiveArtTitle = artTitle.trim() || 'Artwork Title';
  drawTextLine(effectiveArtTitle, {
    font: italicFont,
    size: 16,
    align: 'center',
    color: rgb(0.2, 0.22, 0.24),
    lineHeight: 24,
  });

  cursorY -= 12;

  if (previewImageDataUrl) {
    try {
      const bytes = dataUrlToUint8Array(previewImageDataUrl);
      const isPng = previewImageDataUrl.startsWith('data:image/png');
      const embeddedImage = isPng ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
      const dimensions = embeddedImage.scaleToFit(contentWidth, 280);
      ensureSpace(dimensions.height + 20);
      const x = PAGE_MARGIN + (contentWidth - dimensions.width) / 2;
      const y = cursorY - dimensions.height;
      page.drawImage(embeddedImage, {
        x,
        y,
        width: dimensions.width,
        height: dimensions.height,
      });
      cursorY = y - 20;
    } catch (error) {
      console.warn('Failed to embed preview image in PDF', error);
    }
  }

  drawTextLine('Available ratios & sizes', {
    font: titleFont,
    size: 14,
    color: rgb(0.18, 0.2, 0.25),
    lineHeight: 20,
  });

  if (ratios.length === 0) {
    drawParagraph('Ratios will appear here after you generate final images.', {
      font: italicFont,
      size: 12,
      color: rgb(0.32, 0.33, 0.36),
    });
  } else {
    ratios.forEach((entry) => {
      const sizes = entry.sizes.length ? entry.sizes.join(', ') : 'No sizes recorded';
      drawParagraph(`${entry.ratioName}: ${sizes}`, {
        size: 12,
        font: bodyFont,
        lineHeight: 18,
      });
    });
  }

  cursorY -= 8;

  drawTextLine('Download instructions', {
    font: titleFont,
    size: 14,
    color: rgb(0.18, 0.2, 0.25),
    lineHeight: 20,
  });

  const trimmedLink = downloadLink.trim();
  if (trimmedLink) {
    if (isHttpLink(trimmedLink)) {
      drawLink(trimmedLink, trimmedLink);
      drawParagraph('Click the link above to download your files. Save them to your device before printing.', {
        font: italicFont,
        size: 11,
        color: rgb(0.32, 0.33, 0.36),
        lineHeight: 16,
      });
    } else {
      drawParagraph(trimmedLink, {
        font: bodyFont,
        size: 12,
        lineHeight: 18,
      });
    }
  } else {
    drawParagraph('Add a download link in the generator to include customer instructions here.', {
      font: italicFont,
      size: 12,
      color: rgb(0.32, 0.33, 0.36),
      lineHeight: 18,
    });
  }

  return pdfDoc.save();
}
