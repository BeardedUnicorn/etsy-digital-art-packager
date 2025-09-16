import {
  PDFArray,
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFString,
  StandardFonts,
  degrees,
  rgb,
} from 'pdf-lib';
import type { PDFFont, PDFImage } from 'pdf-lib';

export interface PdfRatioSummary {
  ratioName: string;
  sizes: string[];
}

interface GenerateInstructionsPdfOptions {
  shopName: string;
  shopLogoDataUrl?: string | null;
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
    shopLogoDataUrl,
    artTitle,
    downloadLink,
    ratios,
    previewImageDataUrl,
  } = options;

  const pdfDoc = await PDFDocument.create();

  const brandIdentity = 'Sacred Realms Studio';
  const displayShopName = shopName.trim() || brandIdentity;
  const artLabel = artTitle.trim();
  pdfDoc.setTitle(`${brandIdentity} – Art Download Guide`);

  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const normalizedLogoDataUrl = shopLogoDataUrl?.trim() || null;
  let shopLogoImage: PDFImage | null = null;
  let shopLogoDimensions: { width: number; height: number } | null = null;

  if (normalizedLogoDataUrl) {
    try {
      const logoBytes = dataUrlToUint8Array(normalizedLogoDataUrl);
      const logoIsPng = normalizedLogoDataUrl.startsWith('data:image/png');
      const embeddedLogo = logoIsPng ? await pdfDoc.embedPng(logoBytes) : await pdfDoc.embedJpg(logoBytes);
      const dimensions = embeddedLogo.scaleToFit(120, 40);
      shopLogoImage = embeddedLogo;
      shopLogoDimensions = dimensions;
    } catch (error) {
      console.warn('Failed to embed shop logo in PDF', error);
    }
  }

  const backgroundBase = rgb(0.97, 0.96, 0.94);
  const accentPrimary = rgb(0.36, 0.24, 0.53);
  const accentSecondary = rgb(0.89, 0.76, 0.55);
  const accentHighlight = rgb(0.6, 0.44, 0.7);
  const textPrimary = rgb(0.16, 0.15, 0.18);
  const textMuted = rgb(0.42, 0.41, 0.44);
  const textOnAccent = rgb(0.97, 0.96, 1);

  const HERO_HEIGHT = 160;
  const FOOTER_HEIGHT = 68;

  const createPageContext = (withHero: boolean) => {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

    page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: backgroundBase });

    page.drawRectangle({
      x: -40,
      y: PAGE_HEIGHT - 220,
      width: 320,
      height: 240,
      color: accentSecondary,
      opacity: 0.22,
      rotate: degrees(-8),
    });
    page.drawRectangle({
      x: PAGE_WIDTH - 240,
      y: PAGE_HEIGHT - 210,
      width: 300,
      height: 260,
      color: accentHighlight,
      opacity: 0.18,
      rotate: degrees(9),
    });
    page.drawRectangle({
      x: -50,
      y: -70,
      width: 280,
      height: 220,
      color: accentPrimary,
      opacity: 0.08,
      rotate: degrees(7),
    });

    const headerHeight = withHero ? HERO_HEIGHT : 110;
    page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - headerHeight,
      width: PAGE_WIDTH,
      height: headerHeight,
      color: accentPrimary,
      opacity: withHero ? 0.88 : 0.82,
    });
    page.drawRectangle({
      x: -10,
      y: PAGE_HEIGHT - headerHeight - 24,
      width: PAGE_WIDTH * 0.45,
      height: headerHeight + 48,
      color: accentSecondary,
      opacity: 0.18,
      rotate: degrees(-3),
    });

    const heroTitle = brandIdentity.toUpperCase();
    const heroSubtitle = artLabel ? `Artwork: ${artLabel}` : 'Printable Art Collection';
    const heroTagline = 'Curated digital art for mindful interiors';
    const headerBaseline = PAGE_HEIGHT - 62;

    if (withHero) {
      page.drawText(heroTitle, {
        x: PAGE_MARGIN,
        y: headerBaseline,
        size: 26,
        font: titleFont,
        color: textOnAccent,
      });
      page.drawText(heroSubtitle, {
        x: PAGE_MARGIN,
        y: headerBaseline - 28,
        size: 13,
        font: italicFont,
        color: rgb(0.93, 0.9, 0.99),
      });
      const preparedLabelBaseline = headerBaseline - 48;
      page.drawText('Prepared for', {
        x: PAGE_MARGIN,
        y: preparedLabelBaseline,
        size: 10,
        font: bodyFont,
        color: rgb(0.9, 0.86, 0.97),
      });
      const shopNameFontSize = 14;
      const shopRowBaseline = preparedLabelBaseline - 18;
      let shopRowX = PAGE_MARGIN;
      if (shopLogoImage && shopLogoDimensions) {
        const centerY = shopRowBaseline + shopNameFontSize / 2;
        const logoY = centerY - shopLogoDimensions.height / 2;
        page.drawImage(shopLogoImage, {
          x: shopRowX,
          y: logoY,
          width: shopLogoDimensions.width,
          height: shopLogoDimensions.height,
        });
        shopRowX += shopLogoDimensions.width + 12;
      }
      page.drawText(displayShopName, {
        x: shopRowX,
        y: shopRowBaseline,
        size: shopNameFontSize,
        font: titleFont,
        color: rgb(0.93, 0.9, 0.99),
      });
    } else {
      page.drawText(heroTitle, {
        x: PAGE_MARGIN,
        y: headerBaseline,
        size: 18,
        font: titleFont,
        color: textOnAccent,
      });
      page.drawText(heroTagline, {
        x: PAGE_MARGIN,
        y: headerBaseline - 22,
        size: 10,
        font: italicFont,
        color: rgb(0.92, 0.88, 0.97),
      });
    }

    page.drawRectangle({
      x: 0,
      y: 0,
      width: PAGE_WIDTH,
      height: FOOTER_HEIGHT,
      color: rgb(0.95, 0.93, 0.9),
      opacity: 0.92,
    });
    page.drawText(`${brandIdentity}  •  sacredrealms.studio`, {
      x: PAGE_MARGIN,
      y: 24,
      size: 10,
      font: bodyFont,
      color: textMuted,
    });

    const startY = PAGE_HEIGHT - headerHeight - 40;
    return { page, cursorY: startY };
  };

  let { page, cursorY } = createPageContext(true);
  const contentWidth = PAGE_WIDTH - PAGE_MARGIN * 2;

  const ensureSpace = (required: number) => {
    if (cursorY - required < FOOTER_HEIGHT + 24) {
      ({ page, cursorY } = createPageContext(false));
    }
  };

  const wrapText = (text: string, font: PDFFont, size: number, maxWidth: number) => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';
    words.forEach((word) => {
      const tentative = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(tentative, size);
      if (width <= maxWidth) {
        currentLine = tentative;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    });
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
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
      color = textPrimary,
      lineHeight,
    } = options;
    const resolvedLineHeight = lineHeight ?? size + 6;
    const lines = wrapText(text, font, size, contentWidth);
    lines.forEach((line) => {
      ensureSpace(resolvedLineHeight);
      const baseline = cursorY - size;
      page.drawText(line, {
        x: PAGE_MARGIN,
        y: baseline,
        size,
        font,
        color,
      });
      cursorY = baseline - (resolvedLineHeight - size);
    });
  };

  const drawDivider = (width = contentWidth, offset = 0) => {
    ensureSpace(20);
    const y = cursorY - 12;
    page.drawLine({
      start: { x: PAGE_MARGIN + offset, y },
      end: { x: PAGE_MARGIN + offset + width, y },
      thickness: 1,
      color: accentPrimary,
      opacity: 0.2,
    });
    cursorY = y - 12;
  };

  const drawSectionTitle = (text: string) => {
    ensureSpace(48);
    page.drawText(text, {
      x: PAGE_MARGIN,
      y: cursorY - 20,
      size: 16,
      font: titleFont,
      color: accentPrimary,
    });
    cursorY -= 24;
    drawDivider(contentWidth * 0.5);
  };

  const drawBadge = (label: string) => {
    const chipText = label.toUpperCase();
    const paddingX = 10;
    const height = 16;
    const textWidth = bodyFont.widthOfTextAtSize(chipText, 9);
    const width = Math.min(contentWidth, textWidth + paddingX * 2);
    ensureSpace(height + 10);
    const y = cursorY - height;
    page.drawRectangle({
      x: PAGE_MARGIN,
      y,
      width,
      height,
      color: accentPrimary,
      opacity: 0.14,
    });
    page.drawText(chipText, {
      x: PAGE_MARGIN + paddingX,
      y: y + 4,
      size: 9,
      font: bodyFont,
      color: accentPrimary,
    });
    cursorY = y - 10;
  };

  const drawLinkButton = (label: string, url: string) => {
    const buttonHeight = 34;
    const paddingX = 18;
    const fontSize = 12;
    const textWidth = bodyFont.widthOfTextAtSize(label, fontSize);
    const width = Math.min(contentWidth, textWidth + paddingX * 2);
    ensureSpace(buttonHeight + 24);
    const x = PAGE_MARGIN;
    const y = cursorY - buttonHeight;
    page.drawRectangle({
      x,
      y,
      width,
      height: buttonHeight,
      color: accentPrimary,
      opacity: 0.92,
    });
    page.drawRectangle({
      x,
      y,
      width,
      height: buttonHeight,
      borderColor: accentSecondary,
      borderWidth: 1,
      opacity: 0.35,
    });
    page.drawText(label, {
      x: x + paddingX,
      y: y + (buttonHeight - fontSize) / 2,
      size: fontSize,
      font: bodyFont,
      color: textOnAccent,
    });

    const rect = PDFArray.withContext(pdfDoc.context);
    rect.push(PDFNumber.of(x));
    rect.push(PDFNumber.of(y));
    rect.push(PDFNumber.of(x + width));
    rect.push(PDFNumber.of(y + buttonHeight));

    const border = PDFArray.withContext(pdfDoc.context);
    border.push(PDFNumber.of(0));
    border.push(PDFNumber.of(0));
    border.push(PDFNumber.of(0));

    const action = pdfDoc.context.obj({
      Type: PDFName.of('Action'),
      S: PDFName.of('URI'),
      URI: PDFString.of(url),
    });

    const annotation = pdfDoc.context.obj({
      Type: PDFName.of('Annot'),
      Subtype: PDFName.of('Link'),
      Rect: rect,
      Border: border,
      A: action,
    });
    const annotationRef = pdfDoc.context.register(annotation);
    page.node.addAnnot(annotationRef);

    cursorY = y - 16;
  };

  const drawCallout = (text: string) => {
    const font = bodyFont;
    const size = 12;
    const innerWidth = contentWidth - 24;
    const lines = wrapText(text, font, size, innerWidth);
    const lineHeight = size + 6;
    const calloutHeight = lines.length * lineHeight + 24;
    ensureSpace(calloutHeight + 20);
    const y = cursorY - calloutHeight;
    page.drawRectangle({
      x: PAGE_MARGIN,
      y,
      width: contentWidth,
      height: calloutHeight,
      color: rgb(1, 1, 1),
      opacity: 0.95,
      borderColor: accentSecondary,
      borderWidth: 1,
    });

    let textCursor = cursorY - 18;
    lines.forEach((line) => {
      const baseline = textCursor - size;
      page.drawText(line, {
        x: PAGE_MARGIN + 12,
        y: baseline,
        size,
        font,
        color: textPrimary,
      });
      textCursor = baseline - (lineHeight - size);
    });
    cursorY = y - 24;
  };

  drawSectionTitle('Artwork preview');

  if (previewImageDataUrl) {
    try {
      const bytes = dataUrlToUint8Array(previewImageDataUrl);
      const isPng = previewImageDataUrl.startsWith('data:image/png');
      const embeddedImage = isPng ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
      const dimensions = embeddedImage.scaleToFit(contentWidth - 48, 260);
      const framePadding = 16;
      const frameWidth = dimensions.width + framePadding * 2;
      const frameHeight = dimensions.height + framePadding * 2;
      ensureSpace(frameHeight + 32);
      const x = PAGE_MARGIN + (contentWidth - frameWidth) / 2;
      const y = cursorY - frameHeight;
      page.drawRectangle({
        x: x - 4,
        y: y - 4,
        width: frameWidth + 8,
        height: frameHeight + 8,
        color: accentPrimary,
        opacity: 0.08,
      });
      page.drawRectangle({
        x,
        y,
        width: frameWidth,
        height: frameHeight,
        color: rgb(1, 1, 1),
        opacity: 0.96,
        borderColor: accentPrimary,
        borderWidth: 1,
      });
      page.drawImage(embeddedImage, {
        x: x + framePadding,
        y: y + framePadding,
        width: dimensions.width,
        height: dimensions.height,
      });
      cursorY = y - 28;
    } catch (error) {
      console.warn('Failed to embed preview image in PDF', error);
    }
  } else {
    drawParagraph('Artwork preview will appear here when you include a generated image.', {
      font: italicFont,
      size: 12,
      color: textMuted,
    });
  }

  drawSectionTitle('Available ratios & sizes');

  if (ratios.length === 0) {
    drawParagraph('Ratios will appear here after you generate final images.', {
      font: italicFont,
      size: 12,
      color: textMuted,
    });
  } else {
    ratios.forEach((entry) => {
      const sizes = entry.sizes.length ? entry.sizes.join(', ') : 'No sizes recorded';
      drawBadge(entry.ratioName);
      drawParagraph(`Sizes: ${sizes}`, {
        size: 12,
        font: bodyFont,
        lineHeight: 18,
      });
      cursorY -= 4;
    });
  }

  cursorY -= 4;

  drawSectionTitle('Download instructions');

  const trimmedLink = downloadLink.trim();
  if (trimmedLink) {
    if (isHttpLink(trimmedLink)) {
      drawLinkButton('Download artwork package', trimmedLink);
      drawParagraph(trimmedLink, {
        font: bodyFont,
        size: 10,
        color: textMuted,
      });
      drawParagraph('Tip: save your files locally before sharing them with collectors or printing services.', {
        font: italicFont,
        size: 11,
        color: textMuted,
        lineHeight: 16,
      });
    } else {
      drawCallout(trimmedLink);
    }
  } else {
    drawParagraph('Add a download link in the generator to include customer instructions here.', {
      font: italicFont,
      size: 12,
      color: textMuted,
      lineHeight: 18,
    });
  }

  cursorY -= 6;
  drawDivider(contentWidth);
  drawParagraph('Thank you for supporting Sacred Realms Studio. We hope these printable works bring warmth and inspiration to your space.', {
    font: italicFont,
    size: 11,
    color: textMuted,
    lineHeight: 16,
  });
  drawParagraph('With gratitude, The Sacred Realms Studio team', {
    font: italicFont,
    size: 11,
    color: textMuted,
  });

  return pdfDoc.save();
}
