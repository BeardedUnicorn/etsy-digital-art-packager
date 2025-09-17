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
import type { PDFFont } from 'pdf-lib';

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
  footerTagline?: string;
  thankYouMessage?: string;
}

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const PAGE_MARGIN = 48;

const palette = {
  background: {
    base: rgb(0.05, 0.06, 0.1),
    panel: rgb(0.08, 0.09, 0.14),
    mist: rgb(0.13, 0.14, 0.21),
  },
  accent: {
    primary: rgb(0.56, 0.42, 0.98),
    secondary: rgb(0.37, 0.63, 0.89),
    highlight: rgb(0.83, 0.56, 0.98),
    glow: rgb(0.2, 0.28, 0.56),
  },
  text: {
    primary: rgb(0.94, 0.96, 1),
    muted: rgb(0.68, 0.72, 0.88),
    subtle: rgb(0.52, 0.57, 0.78),
    onAccent: rgb(0.99, 0.99, 1),
    accent: rgb(0.79, 0.86, 1),
  },
  border: {
    subtle: rgb(0.26, 0.3, 0.48),
    strong: rgb(0.36, 0.4, 0.62),
  },
};

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
    footerTagline,
    thankYouMessage,
  } = options;

  const pdfDoc = await PDFDocument.create();

  const brandIdentity = 'Sacred Realms Studio';
  const brandTagline = 'Ethereal print experiences for tranquil homes';
  const displayShopName = shopName.trim() || brandIdentity;
  const artLabel = artTitle.trim();
  pdfDoc.setTitle(`${brandIdentity} – Digital Download Guide`);

  const normalizedFooterTagline = footerTagline?.trim() ?? '';
  const gratitudeLines = (thankYouMessage ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const HERO_HEIGHT = 188;
  const FOOTER_HEIGHT = 72;

  const createPageContext = (withHero: boolean) => {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const pageNumber = pdfDoc.getPageCount();

    page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: palette.background.base });

    const glowShapes = [
      { x: PAGE_MARGIN + 40, y: PAGE_HEIGHT - 80, size: 120, color: palette.accent.highlight, opacity: 0.16 },
      { x: PAGE_WIDTH - 70, y: PAGE_HEIGHT - 160, size: 140, color: palette.accent.secondary, opacity: 0.14 },
      { x: PAGE_WIDTH - 120, y: 180, size: 120, color: palette.accent.primary, opacity: 0.1 },
      { x: PAGE_MARGIN + 30, y: 140, size: 90, color: palette.accent.glow, opacity: 0.14 },
    ];

    glowShapes.forEach((shape) => {
      page.drawCircle({
        x: shape.x,
        y: shape.y,
        size: shape.size,
        color: shape.color,
        opacity: shape.opacity,
      });
    });

    page.drawRectangle({
      x: PAGE_MARGIN - 36,
      y: -60,
      width: 16,
      height: PAGE_HEIGHT + 120,
      color: palette.accent.secondary,
      opacity: 0.4,
      rotate: degrees(-4),
    });
    page.drawRectangle({
      x: PAGE_MARGIN - 20,
      y: -40,
      width: 8,
      height: PAGE_HEIGHT + 80,
      color: palette.accent.primary,
      opacity: 0.32,
      rotate: degrees(-5),
    });

    const headerHeight = withHero ? HERO_HEIGHT : 132;
    const headerBottom = PAGE_HEIGHT - headerHeight;

    page.drawRectangle({
      x: 0,
      y: headerBottom,
      width: PAGE_WIDTH,
      height: headerHeight,
      color: palette.background.panel,
      opacity: withHero ? 0.94 : 0.9,
    });

    page.drawRectangle({
      x: -24,
      y: headerBottom - 36,
      width: PAGE_WIDTH * 0.6,
      height: headerHeight + 72,
      color: palette.accent.primary,
      opacity: 0.2,
      rotate: degrees(-7),
    });
    page.drawRectangle({
      x: PAGE_WIDTH * 0.45,
      y: headerBottom - 28,
      width: PAGE_WIDTH * 0.55,
      height: headerHeight + 60,
      color: palette.accent.secondary,
      opacity: 0.18,
      rotate: degrees(9),
    });

    page.drawCircle({
      x: PAGE_WIDTH - 110,
      y: PAGE_HEIGHT - headerHeight / 2,
      size: headerHeight / 1.6,
      color: palette.accent.highlight,
      opacity: 0.14,
    });

    const label = 'Digital download guide'.toUpperCase();
    const labelWidth = bodyFont.widthOfTextAtSize(label, 9);
    page.drawText(label, {
      x: PAGE_WIDTH - PAGE_MARGIN - labelWidth,
      y: PAGE_HEIGHT - 28,
      size: 9,
      font: bodyFont,
      color: palette.text.accent,
    });

    let headerCursor = PAGE_HEIGHT - 60;
    const brandSize = withHero ? 27 : 20;
    page.drawText(brandIdentity.toUpperCase(), {
      x: PAGE_MARGIN,
      y: headerCursor,
      size: brandSize,
      font: titleFont,
      color: palette.text.onAccent,
    });
    headerCursor -= brandSize + 6;

    if (withHero) {
      const heroSubtitle = artLabel ? `Artwork: ${artLabel}` : 'Digital art download set';
      page.drawText(heroSubtitle, {
        x: PAGE_MARGIN,
        y: headerCursor,
        size: 13,
        font: italicFont,
        color: palette.text.accent,
      });
      headerCursor -= 18;

      page.drawText(brandTagline, {
        x: PAGE_MARGIN,
        y: headerCursor,
        size: 11,
        font: bodyFont,
        color: palette.text.muted,
      });
      headerCursor -= 16;
    } else {
      const compactSubtitle = artLabel || 'Download guide overview';
      page.drawText(compactSubtitle, {
        x: PAGE_MARGIN,
        y: headerCursor,
        size: 12,
        font: italicFont,
        color: palette.text.muted,
      });
      headerCursor -= 18;
    }

    page.drawRectangle({
      x: 0,
      y: 0,
      width: PAGE_WIDTH,
      height: FOOTER_HEIGHT,
      color: palette.background.panel,
      opacity: 0.92,
    });
    page.drawRectangle({
      x: 0,
      y: FOOTER_HEIGHT - 2,
      width: PAGE_WIDTH,
      height: 2,
      color: palette.accent.secondary,
      opacity: 0.35,
    });

    const footerPrimary = displayShopName;
    page.drawText(footerPrimary, {
      x: PAGE_MARGIN,
      y: 26,
      size: 10,
      font: bodyFont,
      color: palette.text.muted,
    });
    if (normalizedFooterTagline) {
      page.drawText(normalizedFooterTagline, {
        x: PAGE_MARGIN,
        y: 12,
        size: 8,
        font: italicFont,
        color: palette.text.muted,
      });
    }
    const pageNumberLabel = `Page ${pageNumber}`;
    const pageNumberWidth = bodyFont.widthOfTextAtSize(pageNumberLabel, 9);
    page.drawText(pageNumberLabel, {
      x: PAGE_WIDTH - PAGE_MARGIN - pageNumberWidth,
      y: 26,
      size: 9,
      font: bodyFont,
      color: palette.text.muted,
    });

    const startY = PAGE_HEIGHT - headerHeight - 64;
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
      xOffset?: number;
      maxWidth?: number;
      spacingAfter?: number;
    } = {},
  ) => {
    const {
      font = bodyFont,
      size = 12,
      color = palette.text.primary,
      lineHeight,
      xOffset = 0,
      maxWidth = contentWidth,
      spacingAfter = 10,
    } = options;
    const resolvedLineHeight = lineHeight ?? size + 5;
    const lines = wrapText(text, font, size, maxWidth);
    lines.forEach((line) => {
      ensureSpace(resolvedLineHeight);
      const baseline = cursorY - size;
      page.drawText(line, {
        x: PAGE_MARGIN + xOffset,
        y: baseline,
        size,
        font,
        color,
      });
      cursorY = baseline - (resolvedLineHeight - size);
    });
    cursorY -= spacingAfter;
  };

  const drawDivider = (width = contentWidth, offset = 0) => {
    ensureSpace(32);
    const x = PAGE_MARGIN + offset;
    const y = cursorY - 16;
    page.drawRectangle({
      x,
      y,
      width,
      height: 1.2,
      color: palette.border.subtle,
      opacity: 0.7,
    });
    page.drawRectangle({
      x,
      y: y + 2,
      width: Math.min(120, width * 0.4),
      height: 2,
      color: palette.accent.secondary,
      opacity: 0.45,
    });
    cursorY = y - 18;
  };

  const drawSectionTitle = (title: string, eyebrow?: string) => {
    ensureSpace(90);
    const accentY = cursorY - 16;
    page.drawRectangle({
      x: PAGE_MARGIN,
      y: accentY,
      width: 52,
      height: 3,
      color: palette.accent.secondary,
      opacity: 0.85,
    });

    let baseline = accentY - 14;
    if (eyebrow) {
      page.drawText(eyebrow.toUpperCase(), {
        x: PAGE_MARGIN,
        y: baseline,
        size: 9,
        font: bodyFont,
        color: palette.text.accent,
      });
      baseline -= 16;
    } else {
      baseline -= 6;
    }

    page.drawText(title, {
      x: PAGE_MARGIN,
      y: baseline,
      size: 18,
      font: titleFont,
      color: palette.text.primary,
    });
    cursorY = baseline - 28;
  };

  const drawRatioCard = (heading: string, sizesDescription: string) => {
    const labelHeight = 9;
    const headingSize = 13;
    const infoSize = 11;
    const paddingX = 20;
    const paddingY = 18;
    const infoLineHeight = infoSize + 4;
    const lines = wrapText(`Sizes: ${sizesDescription}`, bodyFont, infoSize, contentWidth - paddingX * 2);
    const cardHeight =
      paddingY * 2 +
      labelHeight +
      6 +
      headingSize +
      8 +
      lines.length * infoLineHeight;

    ensureSpace(cardHeight + 28);

    const cardX = PAGE_MARGIN;
    const cardY = cursorY - cardHeight;

    page.drawRectangle({
      x: cardX - 6,
      y: cardY - 8,
      width: contentWidth + 12,
      height: cardHeight + 16,
      color: palette.accent.glow,
      opacity: 0.18,
    });
    page.drawRectangle({
      x: cardX,
      y: cardY,
      width: contentWidth,
      height: cardHeight,
      color: palette.background.panel,
      opacity: 0.97,
      borderColor: palette.border.subtle,
      borderWidth: 1,
    });
    page.drawRectangle({
      x: cardX - 3,
      y: cardY + 12,
      width: 6,
      height: cardHeight - 24,
      color: palette.accent.primary,
      opacity: 0.78,
    });

    const textX = cardX + paddingX;
    let textBaseline = cardY + cardHeight - paddingY;

    textBaseline -= labelHeight;
    page.drawText(`${heading} ratio`.toUpperCase(), {
      x: textX,
      y: textBaseline,
      size: labelHeight,
      font: bodyFont,
      color: palette.text.accent,
    });

    textBaseline -= 6 + headingSize;
    page.drawText(heading, {
      x: textX,
      y: textBaseline,
      size: headingSize,
      font: titleFont,
      color: palette.text.primary,
    });

    textBaseline -= 8;
    lines.forEach((line) => {
      textBaseline -= infoSize;
      page.drawText(line, {
        x: textX,
        y: textBaseline,
        size: infoSize,
        font: bodyFont,
        color: palette.text.muted,
      });
      textBaseline -= infoLineHeight - infoSize;
    });

    cursorY = cardY - 22;
  };

  const drawLinkButton = (label: string, url: string) => {
    const buttonHeight = 38;
    const paddingX = 22;
    const fontSize = 12;
    const textWidth = bodyFont.widthOfTextAtSize(label, fontSize);
    const width = Math.min(contentWidth, textWidth + paddingX * 2);

    ensureSpace(buttonHeight + 32);

    const x = PAGE_MARGIN;
    const y = cursorY - buttonHeight;

    page.drawRectangle({
      x: x - 2,
      y: y - 4,
      width: width + 4,
      height: buttonHeight + 8,
      color: palette.accent.glow,
      opacity: 0.25,
      rotate: degrees(-1.5),
    });
    page.drawRectangle({
      x,
      y,
      width,
      height: buttonHeight,
      color: palette.accent.primary,
      opacity: 0.95,
    });
    page.drawRectangle({
      x,
      y,
      width,
      height: buttonHeight,
      color: palette.accent.secondary,
      opacity: 0.4,
      rotate: degrees(2),
    });
    page.drawRectangle({
      x,
      y,
      width,
      height: buttonHeight,
      borderColor: palette.border.strong,
      borderWidth: 1,
      opacity: 0.6,
    });

    const textY = y + (buttonHeight - fontSize) / 2;
    page.drawText(label, {
      x: x + paddingX,
      y: textY,
      size: fontSize,
      font: bodyFont,
      color: palette.text.onAccent,
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

    cursorY = y - 20;
  };

  const drawCallout = (text: string) => {
    const font = bodyFont;
    const size = 12;
    const paddingX = 20;
    const paddingY = 18;
    const innerWidth = contentWidth - paddingX * 2;
    const lineHeight = size + 6;
    const lines = wrapText(text, font, size, innerWidth);
    const calloutHeight = paddingY * 2 + lines.length * lineHeight;

    ensureSpace(calloutHeight + 28);

    const x = PAGE_MARGIN;
    const y = cursorY - calloutHeight;

    page.drawRectangle({
      x: x - 4,
      y: y - 6,
      width: contentWidth + 8,
      height: calloutHeight + 12,
      color: palette.accent.glow,
      opacity: 0.2,
    });
    page.drawRectangle({
      x,
      y,
      width: contentWidth,
      height: calloutHeight,
      color: palette.background.panel,
      opacity: 0.97,
      borderColor: palette.border.strong,
      borderWidth: 1,
    });
    page.drawRectangle({
      x: x - 2,
      y: y + 12,
      width: 4,
      height: calloutHeight - 24,
      color: palette.accent.primary,
      opacity: 0.8,
    });

    let textBaseline = y + calloutHeight - paddingY;
    lines.forEach((line) => {
      textBaseline -= size;
      page.drawText(line, {
        x: x + paddingX,
        y: textBaseline,
        size,
        font,
        color: palette.text.primary,
      });
      textBaseline -= lineHeight - size;
    });

    cursorY = y - 24;
  };

  drawSectionTitle('Artwork preview', 'Visual reference');

  if (previewImageDataUrl) {
    try {
      const bytes = dataUrlToUint8Array(previewImageDataUrl);
      const isPng = previewImageDataUrl.startsWith('data:image/png');
      const embeddedImage = isPng ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
      const dimensions = embeddedImage.scaleToFit(contentWidth - 80, 280);
      const framePaddingX = 22;
      const framePaddingY = 18;
      const frameWidth = dimensions.width + framePaddingX * 2;
      const frameHeight = dimensions.height + framePaddingY * 2;

      ensureSpace(frameHeight + 40);

      const x = PAGE_MARGIN + (contentWidth - frameWidth) / 2;
      const y = cursorY - frameHeight;

      page.drawRectangle({
        x: x - 10,
        y: y - 12,
        width: frameWidth + 20,
        height: frameHeight + 24,
        color: palette.accent.glow,
        opacity: 0.2,
        rotate: degrees(-1.8),
      });
      page.drawRectangle({
        x,
        y,
        width: frameWidth,
        height: frameHeight,
        color: palette.background.panel,
        opacity: 0.98,
        borderColor: palette.border.strong,
        borderWidth: 1,
      });
      page.drawImage(embeddedImage, {
        x: x + framePaddingX,
        y: y + framePaddingY,
        width: dimensions.width,
        height: dimensions.height,
      });
      cursorY = y - 28;
    } catch (error) {
      console.warn('Failed to embed preview image in PDF', error);
      drawParagraph('Preview image could not be displayed in the PDF layout.', {
        font: italicFont,
        size: 12,
        color: palette.text.muted,
        lineHeight: 16,
        spacingAfter: 14,
      });
    }
  } else {
    drawParagraph('Artwork preview will appear here once you include an image export in the generator.', {
      font: italicFont,
      size: 12,
      color: palette.text.muted,
      lineHeight: 16,
      spacingAfter: 14,
    });
  }

  drawSectionTitle('Available ratios & sizes', 'Print-ready formats');

  if (ratios.length === 0) {
    drawParagraph('Ratios will populate after you generate your final image set.', {
      font: italicFont,
      size: 12,
      color: palette.text.muted,
      lineHeight: 16,
      spacingAfter: 14,
    });
  } else {
    ratios.forEach((entry) => {
      const sizes = entry.sizes.length ? entry.sizes.join(', ') : 'No sizes recorded';
      drawRatioCard(entry.ratioName, sizes);
    });
  }

  drawSectionTitle('Download instructions', 'Accessing your files');

  const trimmedLink = downloadLink.trim();
  if (trimmedLink) {
    if (isHttpLink(trimmedLink)) {
      drawLinkButton('Download artwork package', trimmedLink);
      drawParagraph(trimmedLink, {
        font: bodyFont,
        size: 10,
        color: palette.text.muted,
        spacingAfter: 6,
      });
      cursorY -= 12;
    } else {
      drawCallout(trimmedLink);
    }
  } else {
    drawParagraph('Add a download link in the generator to include tailored customer instructions here.', {
      font: italicFont,
      size: 12,
      color: palette.text.muted,
      lineHeight: 18,
      spacingAfter: 14,
    });
  }

  if (gratitudeLines.length > 0) {
    drawDivider(contentWidth);
    gratitudeLines.forEach((line, index) => {
      drawParagraph(line, {
        font: italicFont,
        size: 11,
        color: palette.text.muted,
        lineHeight: 16,
        spacingAfter: index === gratitudeLines.length - 1 ? 0 : 6,
      });
    });
  }

  return pdfDoc.save();
}
