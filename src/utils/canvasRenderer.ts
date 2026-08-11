import type { Mode, FrameTemplateId, IDCardStyleId, PhotoAdjustments, IDCardData, CornerStyle, StickerId } from '../types';
import { STICKER_LIST } from '../components/StickerSelector';

export interface RenderOptions {
  mode: Mode;
  image: HTMLImageElement | null;
  adjustments: PhotoAdjustments;
  frameTemplate: FrameTemplateId;
  cardStyle: IDCardStyleId;
  cardData: IDCardData;
  cornerStyle: CornerStyle;
  selectedStickers?: StickerId[];
}

export function drawCanvas(canvas: HTMLCanvasElement, options: RenderOptions) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (options.mode === 'pfp') {
    renderPfpFrame(canvas, ctx, options);
  } else {
    renderIdCard(canvas, ctx, options);
  }

  // Draw Interactive Stickers if selected
  if (options.selectedStickers && options.selectedStickers.length > 0) {
    drawStickers(canvas, ctx, options);
  }

  // Draw CRT Scanlines texture overlay if enabled
  if (options.adjustments.scanlinesEnabled) {
    drawScanlinesOverlay(canvas, ctx);
  }
}

// ----------------------------------------------------
// PFP FRAME RENDERER (2000 x 2000 HD Resolution)
// ----------------------------------------------------
function renderPfpFrame(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  opts: RenderOptions
) {
  const size = 2000;
  canvas.width = size;
  canvas.height = size;

  ctx.clearRect(0, 0, size, size);

  // Deep Emerald Background
  ctx.fillStyle = '#043e24';
  ctx.fillRect(0, 0, size, size);

  // Draw user photo with adjustments & filters
  if (opts.image) {
    ctx.save();

    if (opts.cornerStyle === 'rounded') {
      const radius = 240;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(size - radius, 0);
      ctx.quadraticCurveTo(size, 0, size, radius);
      ctx.lineTo(size, size - radius);
      ctx.quadraticCurveTo(size, size, size - radius, size);
      ctx.lineTo(radius, size);
      ctx.quadraticCurveTo(0, size, 0, size - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.clip();
    }

    applyFilters(ctx, opts.adjustments);

    const cx = size / 2 + opts.adjustments.panX * 2;
    const cy = size / 2 + opts.adjustments.panY * 2;

    ctx.translate(cx, cy);
    ctx.rotate((opts.adjustments.rotation * Math.PI) / 180);
    ctx.scale(opts.adjustments.zoom, opts.adjustments.zoom);

    const imgWidth = opts.image.naturalWidth || opts.image.width;
    const imgHeight = opts.image.naturalHeight || opts.image.height;
    const aspect = imgWidth / imgHeight;

    let drawW = size;
    let drawH = size;

    if (aspect > 1) {
      drawW = size * aspect;
      drawH = size;
    } else {
      drawW = size;
      drawH = size / aspect;
    }

    ctx.drawImage(opts.image, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  } else {
    drawPlaceholderBackground(ctx, size, size);
  }

  drawFrameOverlay(ctx, size, opts.frameTemplate, opts.cornerStyle, opts.adjustments.customColor);
}

function applyFilters(ctx: CanvasRenderingContext2D, adj: PhotoAdjustments) {
  let filterStr = `brightness(${adj.brightness}%) contrast(${adj.contrast}%) saturate(${adj.saturation}%)`;
  
  switch (adj.filter) {
    case 'cyber':
      filterStr += ' hue-rotate(180deg) contrast(125%)';
      break;
    case 'sunset':
      filterStr += ' sepia(35%) hue-rotate(330deg) saturate(140%)';
      break;
    case 'crisp':
      filterStr += ' contrast(130%) saturate(110%)';
      break;
    case 'vintage':
      filterStr += ' sepia(50%) contrast(90%)';
      break;
    case 'mono':
      filterStr += ' grayscale(100%) contrast(120%)';
      break;
    case 'dramatic':
      filterStr += ' contrast(150%) brightness(90%)';
      break;
  }

  ctx.filter = filterStr;
}

function drawFrameOverlay(
  ctx: CanvasRenderingContext2D,
  size: number,
  template: FrameTemplateId,
  cornerStyle: CornerStyle,
  customColor?: string
) {
  ctx.save();
  ctx.filter = 'none';

  const isSquare = cornerStyle === 'square';
  const isEmeraldStudio = template === 'studio-emerald';

  if (isEmeraldStudio) {
    drawEmeraldStudioFrame(ctx, size, isSquare, customColor);
    ctx.restore();
    return;
  }

  let primary = customColor || '#ffe500';
  let secondary = '#ff007f';

  if (template === 'hacker-cyber') {
    primary = customColor || '#00f0ff';
    secondary = '#00ff66';
  } else if (template === 'coastal-wave') {
    primary = customColor || '#38bdf8';
    secondary = '#0284c7';
  } else if (template === 'retro-synth') {
    primary = customColor || '#ff9100';
    secondary = '#ff2a85';
  } else if (template === 'gold-builder') {
    primary = customColor || '#ffd700';
    secondary = '#f59e0b';
  } else if (template === 'minimal-tech') {
    primary = customColor || '#ffffff';
    secondary = '#94a3b8';
  }

  const borderWidth = 60;
  ctx.strokeStyle = primary;
  ctx.lineWidth = borderWidth;
  
  if (isSquare) {
    ctx.strokeRect(borderWidth / 2, borderWidth / 2, size - borderWidth, size - borderWidth);
  } else {
    const r = 160;
    ctx.beginPath();
    ctx.roundRect(borderWidth / 2, borderWidth / 2, size - borderWidth, size - borderWidth, r);
    ctx.stroke();
  }

  ctx.strokeStyle = secondary;
  ctx.lineWidth = 10;
  ctx.strokeRect(12, 12, size - 24, size - 24);

  const bannerH = 260;
  const bannerY = size - bannerH - 40;
  const bannerW = size - 120;
  const bannerX = 60;

  ctx.fillStyle = 'rgba(4, 62, 36, 0.95)';
  ctx.strokeStyle = primary;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(bannerX, bannerY, bannerW, bannerH, isSquare ? 0 : 20);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = primary;
  ctx.font = '900 68px "Bodoni Moda", "Space Grotesk", serif';
  ctx.textAlign = 'center';
  ctx.fillText('HACKER HOUSE GOA', size / 2, bannerY + 100);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 38px "JetBrains Mono", monospace';
  ctx.fillText('GOA, INDIA  •  28 - 31 OCT 2026', size / 2, bannerY + 180);

  ctx.restore();
}

function drawEmeraldStudioFrame(ctx: CanvasRenderingContext2D, size: number, _isSquare: boolean, customColor?: string) {
  const yellow = customColor || '#ffe500';
  const pink = '#ff007f';

  const borderWidth = 50;
  ctx.strokeStyle = yellow;
  ctx.lineWidth = borderWidth;
  ctx.strokeRect(borderWidth / 2, borderWidth / 2, size - borderWidth, size - borderWidth);

  const brandX = 80;
  const brandY = 90;
  ctx.fillStyle = yellow;
  ctx.font = '900 48px "VT323", "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('2:47PM', brandX, brandY);
  ctx.fillText('STUDIO', brandX, brandY + 45);

  const btnW = 260;
  const btnH = 80;
  const btnX = size - 80 - btnW;
  const btnY = 70;

  drawRibbonPattern(ctx, btnX, btnY - 8, btnW, 8);
  drawRibbonPattern(ctx, btnX, btnY + btnH, btnW, 8);

  ctx.fillStyle = yellow;
  ctx.fillRect(btnX, btnY, btnW, btnH);

  ctx.fillStyle = '#043e24';
  ctx.font = '900 42px "Bodoni Moda", "Space Grotesk", serif';
  ctx.textAlign = 'center';
  ctx.fillText('APPLY', btnX + btnW / 2, btnY + 54);

  drawSunburstRays(ctx, size / 2, size - 60, size * 0.4, yellow, 0.15);

  const bannerY = size - 360;
  const bannerH = 280;

  ctx.fillStyle = 'rgba(4, 62, 36, 0.95)';
  ctx.fillRect(60, bannerY, size - 120, bannerH);
  ctx.strokeStyle = yellow;
  ctx.lineWidth = 6;
  ctx.strokeRect(60, bannerY, size - 120, bannerH);

  ctx.fillStyle = yellow;
  ctx.font = '900 110px "Bodoni Moda", "Playfair Display", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HACKER         HOUSE', size / 2, bannerY + 110);

  ctx.save();
  const badgeW = 240;
  const badgeH = 115;
  const badgeX = size / 2 - badgeW / 2;
  const badgeY = bannerY + 110 - badgeH / 2;

  ctx.fillStyle = pink;
  ctx.strokeStyle = yellow;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = yellow;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 6;
  ctx.font = '900 78px "Outfit", "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeText('गोवा', size / 2, bannerY + 110);
  ctx.fillText('गोवा', size / 2, bannerY + 110);
  ctx.restore();

  ctx.fillStyle = yellow;
  ctx.font = 'bold 36px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('GOA, INDIA  •  28 - 31 OCT 2026', 100, bannerY + 230);

  ctx.textAlign = 'right';
  ctx.fillText('2:47 PM STUDIO', size - 100, bannerY + 230);
}

function drawSunburstRays(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  alpha = 0.15
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.globalAlpha = alpha;

  const numRays = 18;
  for (let i = 0; i < numRays; i++) {
    const angle = (Math.PI / (numRays - 1)) * i - Math.PI;
    const rx = cx + Math.cos(angle) * radius;
    const ry = cy + Math.sin(angle) * radius;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(rx, ry);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRibbonPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();
  ctx.fillStyle = '#ff007f';
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = '#ffe500';
  const stripeW = 12;
  for (let i = 0; i < w; i += stripeW * 2) {
    ctx.fillRect(x + i, y, stripeW, h);
  }
  ctx.restore();
}

// ----------------------------------------------------
// BUILDER ID CARD RENDERER (1200 x 1800 HD Resolution)
// ----------------------------------------------------
function renderIdCard(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  opts: RenderOptions
) {
  const W = 1200;
  const H = 1800;
  canvas.width = W;
  canvas.height = H;

  ctx.clearRect(0, 0, W, H);
  ctx.save();

  const yellow = opts.adjustments.customColor || '#ffe500';
  const pink = '#ff007f';
  const emerald = '#055a36';

  ctx.fillStyle = '#022917';
  ctx.fillRect(0, 0, W, H);

  const margin = 40;
  const cW = W - margin * 2;
  const cH = H - margin * 2;

  const isSquare = opts.cornerStyle === 'square';
  const cardRadius = isSquare ? 0 : 28;

  ctx.beginPath();
  ctx.roundRect(margin, margin, cW, cH, cardRadius);
  ctx.clip();

  const bgGrad = ctx.createLinearGradient(margin, margin, W - margin, H - margin);
  bgGrad.addColorStop(0, '#043e24');
  bgGrad.addColorStop(0.6, emerald);
  bgGrad.addColorStop(1, '#022917');

  ctx.fillStyle = bgGrad;
  ctx.fillRect(margin, margin, cW, cH);

  drawSunburstRays(ctx, W / 2, H - margin - 80, 700, yellow, 0.12);

  ctx.strokeStyle = yellow;
  ctx.lineWidth = 10;
  ctx.strokeRect(margin, margin, cW, cH);

  drawRibbonPattern(ctx, margin, margin, cW, 14);

  const headerY = margin + 50;

  ctx.fillStyle = yellow;
  ctx.font = '900 36px "VT323", "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('2:47PM STUDIO', margin + 60, headerY + 30);

  ctx.fillStyle = yellow;
  ctx.font = '900 44px "Bodoni Moda", serif';
  ctx.fillText('HACKER HOUSE GOA', margin + 60, headerY + 80);

  ctx.fillStyle = pink;
  ctx.strokeStyle = yellow;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(margin + 490, headerY + 42, 90, 46, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = yellow;
  ctx.font = '900 30px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('गोवा', margin + 535, headerY + 74);

  const statusText = opts.cardData.statusBadge || 'SHORTLISTED';
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  const statusWidth = ctx.measureText(statusText).width + 50;
  const statusX = W - margin - 60 - statusWidth;

  ctx.fillStyle = 'rgba(2, 38, 22, 0.95)';
  ctx.strokeStyle = yellow;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(statusX, headerY + 35, statusWidth, 55, isSquare ? 0 : 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = yellow;
  ctx.textAlign = 'center';
  ctx.fillText(statusText, statusX + statusWidth / 2, headerY + 70);

  ctx.strokeStyle = yellow;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(margin + 60, headerY + 115);
  ctx.lineTo(W - margin - 60, headerY + 115);
  ctx.stroke();

  const photoSize = 480;
  const photoX = (W - photoSize) / 2;
  const photoY = headerY + 145;

  ctx.fillStyle = '#022314';
  ctx.fillRect(photoX - 12, photoY - 12, photoSize + 24, photoSize + 24);

  ctx.strokeStyle = yellow;
  ctx.lineWidth = 6;
  ctx.strokeRect(photoX - 12, photoY - 12, photoSize + 24, photoSize + 24);

  ctx.save();
  ctx.beginPath();
  ctx.rect(photoX, photoY, photoSize, photoSize);
  ctx.clip();

  if (opts.image) {
    applyFilters(ctx, opts.adjustments);

    const cx = photoX + photoSize / 2 + opts.adjustments.panX * 0.7;
    const cy = photoY + photoSize / 2 + opts.adjustments.panY * 0.7;

    ctx.translate(cx, cy);
    ctx.rotate((opts.adjustments.rotation * Math.PI) / 180);
    ctx.scale(opts.adjustments.zoom, opts.adjustments.zoom);

    const imgW = opts.image.naturalWidth || opts.image.width;
    const imgH = opts.image.naturalHeight || opts.image.height;
    const aspect = imgW / imgH;

    let dW = photoSize;
    let dH = photoSize;
    if (aspect > 1) {
      dW = photoSize * aspect;
      dH = photoSize;
    } else {
      dW = photoSize;
      dH = photoSize / aspect;
    }

    ctx.drawImage(opts.image, -dW / 2, -dH / 2, dW, dH);
  } else {
    drawPlaceholderBackground(ctx, photoSize, photoSize, photoX, photoY);
  }
  ctx.restore();

  drawCornerBrackets(ctx, photoX - 18, photoY - 18, photoSize + 36, photoSize + 36, yellow);

  const infoY = photoY + photoSize + 55;

  const nameCardW = W - margin * 2 - 120;
  const nameCardX = (W - nameCardW) / 2;
  
  ctx.fillStyle = 'rgba(2, 28, 16, 0.92)';
  ctx.strokeStyle = 'rgba(255, 229, 0, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(nameCardX, infoY - 45, nameCardW, 115, isSquare ? 0 : 12);
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = yellow;
  ctx.font = '900 58px "Bodoni Moda", "Outfit", serif';
  ctx.textAlign = 'center';
  ctx.fillText(opts.cardData.fullName || 'YOUR NAME HERE', W / 2, infoY + 5);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "JetBrains Mono", monospace';
  ctx.fillText(
    opts.cardData.handle
      ? (opts.cardData.handle.startsWith('@') ? opts.cardData.handle : `@${opts.cardData.handle}`)
      : '@builder_goa',
    W / 2,
    infoY + 50
  );
  ctx.shadowBlur = 0;

  const titleBoxY = infoY + 95;
  const titleBoxW = nameCardW;
  const titleBoxX = nameCardX;
  const titleBoxH = 65;

  ctx.fillStyle = yellow;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(titleBoxX, titleBoxY, titleBoxW, titleBoxH, isSquare ? 0 : 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#043e24';
  ctx.font = '900 28px "Space Grotesk", sans-serif';
  ctx.fillText(`⚡ ${opts.cardData.builderTitle || 'SOLANA SHIFT DRIFTER'}`, W / 2, titleBoxY + titleBoxH / 2 + 8);

  const metaY = titleBoxY + titleBoxH + 40;

  const roleBoxW = (nameCardW - 20) / 2;
  ctx.fillStyle = 'rgba(2, 28, 16, 0.92)';
  ctx.strokeStyle = 'rgba(255, 229, 0, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(titleBoxX, metaY, roleBoxW, 90, isSquare ? 0 : 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = yellow;
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('ROLE / SPECIALTY', titleBoxX + 25, metaY + 30);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px "Outfit", sans-serif';
  ctx.fillText(opts.cardData.role || 'Full-Stack Hacker', titleBoxX + 25, metaY + 65);

  ctx.fillStyle = 'rgba(2, 28, 16, 0.92)';
  ctx.beginPath();
  ctx.roundRect(titleBoxX + roleBoxW + 20, metaY, roleBoxW, 90, isSquare ? 0 : 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = yellow;
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('PRIMARY STACK', titleBoxX + roleBoxW + 45, metaY + 30);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px "Outfit", sans-serif';
  ctx.fillText(opts.cardData.stack || 'Rust • TS • Solana', titleBoxX + roleBoxW + 45, metaY + 65);

  const footerY = H - margin - 145;

  ctx.strokeStyle = yellow;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin + 60, footerY);
  ctx.lineTo(W - margin - 60, footerY);
  ctx.stroke();

  const barcodeX = margin + 80;
  const barcodeY = footerY + 20;
  const barcodeH = 45;

  ctx.fillStyle = yellow;
  const bars = [4, 8, 3, 12, 5, 8, 4, 16, 6, 4, 10, 5, 14, 4, 8, 3, 12, 6, 8, 4];
  let curX = barcodeX;
  bars.forEach((w) => {
    ctx.fillRect(curX, barcodeY, w, barcodeH);
    curX += w + 6;
  });

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(opts.cardData.hackerId || 'ID: HH-GOA-2026-8890', barcodeX, barcodeY + barcodeH + 26);

  ctx.fillStyle = yellow;
  ctx.font = 'bold 26px "Space Grotesk", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('GOA, INDIA 🌴', W - margin - 80, barcodeY + 25);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.fillText('28 - 31 OCT 2026', W - margin - 80, barcodeY + 58);

  ctx.restore();
}

function drawStickers(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  opts: RenderOptions
) {
  if (!opts.selectedStickers || opts.selectedStickers.length === 0) return;

  ctx.save();
  const W = canvas.width;

  opts.selectedStickers.forEach((stkId, index) => {
    const stkDef = STICKER_LIST.find((s) => s.id === stkId);
    if (!stkDef) return;

    let sx = W - 280;
    let sy = 220 + index * 90;
    let rot = index % 2 === 0 ? -0.1 : 0.1;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(rot);

    ctx.fillStyle = stkDef.bg;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;

    const padX = 24;
    const padY = 16;
    ctx.font = '900 28px "Space Grotesk", "Outfit", sans-serif';
    const textW = ctx.measureText(stkDef.label).width;

    ctx.beginPath();
    ctx.roundRect(-textW / 2 - padX, -padY, textW + padX * 2, 55, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = stkDef.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stkDef.label, 0, 14);

    ctx.restore();
  });

  ctx.restore();
}

function drawScanlinesOverlay(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  const step = 8;
  for (let y = 0; y < canvas.height; y += step) {
    ctx.fillRect(0, y, canvas.width, 3);
  }
  ctx.restore();
}

function drawCornerBrackets(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  const len = 35;
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;

  ctx.beginPath();
  ctx.moveTo(x, y + len);
  ctx.lineTo(x, y);
  ctx.lineTo(x + len, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + w - len, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + len);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y + h - len);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + len, y + h);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + w - len, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + h - len);
  ctx.stroke();
}

function drawPlaceholderBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  offsetX = 0,
  offsetY = 0
) {
  ctx.save();
  ctx.translate(offsetX, offsetY);

  ctx.fillStyle = '#032918';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = '#ffe500';
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 12]);
  ctx.strokeRect(30, 30, w - 60, h - 60);
  ctx.setLineDash([]);

  ctx.fillStyle = '#ffe500';
  ctx.font = '900 46px "Space Grotesk", "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📸 UPLOAD YOUR PHOTO', w / 2, h / 2 - 20);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px "JetBrains Mono", monospace';
  ctx.fillText('Click "Step 1: Upload Photo" or pick a sample photo', w / 2, h / 2 + 35);

  ctx.restore();
}
