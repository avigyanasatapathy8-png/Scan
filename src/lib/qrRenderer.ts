import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import type { QRDesignConfig, QRType, QRCornerFrameStyle, QRCornerDotStyle } from '../types/tapfx';

export function buildQRPayload(type: QRType, fields: Record<string, string>): string {
  const clean = (k: string, fallback = '') => (fields[k] ?? fallback).trim();

  switch (type) {
    case 'website': {
      const url = clean('url', 'https://tapfx.com');
      return /^https?:\/\//i.test(url) ? url : `https://${url}`;
    }
    case 'google-review': {
      const placeId = clean('placeId');
      if (placeId) {
        return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
      }
      const raw = clean('url', 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4');
      return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    }
    case 'whatsapp': {
      const phone = clean('phone', '919692299405').replace(/[^\d]/g, '');
      const msg = clean('message', 'Hi, I scanned your TapFX QR code!');
      return `https://wa.me/${phone}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;
    }
    case 'instagram': {
      const handle = clean('handle', 'tap.fx').replace(/^@/, '');
      return handle.startsWith('http') ? handle : `https://instagram.com/${handle}`;
    }
    case 'facebook': {
      const handle = clean('handle', 'tapfxqr').replace(/^@/, '');
      return handle.startsWith('http') ? handle : `https://facebook.com/${handle}`;
    }
    case 'youtube': {
      const handle = clean('handle', '@tapfxqr');
      return handle.startsWith('http') ? handle : `https://youtube.com/${handle}`;
    }
    case 'linkedin': {
      const handle = clean('handle', 'company/tapfx');
      return handle.startsWith('http') ? handle : `https://linkedin.com/${handle}`;
    }
    case 'telegram': {
      const handle = clean('handle', 'tapfxqr').replace(/^@/, '');
      return handle.startsWith('http') ? handle : `https://t.me/${handle}`;
    }
    case 'wifi': {
      const ssid = clean('ssid', 'TapFX_Guest_WiFi');
      const pass = clean('password', 'Welcome2026');
      const enc = clean('encryption', 'WPA');
      return `WIFI:T:${enc};S:${ssid};P:${pass};;`;
    }
    case 'phone': {
      const phone = clean('phone', '+919692299405');
      return `tel:${phone}`;
    }
    case 'email': {
      const to = clean('email', 'tapfxx@gmail.com');
      const subject = clean('subject', 'Inquiry via TapFX');
      const body = clean('body', '');
      return `mailto:${to}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`;
    }
    case 'text': {
      return clean('text', 'Welcome to TapFX — One Tap. Endless Possibilities.');
    }
    case 'location': {
      const lat = clean('lat', '20.2961');
      const lng = clean('lng', '85.8245');
      const mapsUrl = clean('url');
      if (mapsUrl && /^https?:\/\//i.test(mapsUrl)) return mapsUrl;
      return `https://maps.google.com/?q=${encodeURIComponent(`${lat},${lng}`)}`;
    }
    case 'vcard': {
      const name = clean('fullName', 'TapFX Business');
      const org = clean('org', 'TapFX');
      const phone = clean('phone', '+91 96922 99405');
      const email = clean('email', 'tapfxx@gmail.com');
      const web = clean('url', 'https://tapfx.com');
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${name}`,
        `ORG:${org}`,
        `TEL:${phone}`,
        `EMAIL:${email}`,
        `URL:${web}`,
        'END:VCARD',
      ].join('\n');
    }
    case 'payment': {
      const upiId = clean('upiId', 'tapfx@upi');
      const payee = clean('payeeName', 'TapFX Merchant');
      const amount = clean('amount');
      return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payee)}${
        amount ? `&am=${encodeURIComponent(amount)}` : ''
      }&cu=INR`;
    }
    case 'multi-link': {
      const slug = clean('slug', 'kalinga-bistro').replace(/^\//, '');
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tapfx.com';
      return `${origin}/${slug}`;
    }
    default:
      return 'https://tapfx.com';
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    if ([r, g, b].some(Number.isNaN)) return null;
    return { r, g, b };
  }
  return null;
}

function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);
}

export interface ScannabilityReport {
  score: 'excellent' | 'caution' | 'warning';
  contrastRatio: number;
  warnings: string[];
}

export function evaluateScannability(design: QRDesignConfig): ScannabilityReport {
  const fg = design.useGradient ? design.gradientStart : design.fgColor;
  const bg = design.transparentBg ? '#FFFFFF' : design.bgColor;
  const lFg = relativeLuminance(fg);
  const lBg = relativeLuminance(bg);
  const contrastRatio = (Math.max(lFg, lBg) + 0.05) / (Math.min(lFg, lBg) + 0.05);

  const warnings: string[] = [];
  if (contrastRatio < 3.0) {
    warnings.push('Low foreground/background contrast. Dark modules on a light background scan fastest.');
  }
  if (lFg > lBg) {
    warnings.push('Light modules on a dark background can fail on older camera apps.');
  }
  if ((design.logoPreset !== 'none' || design.logoDataUrl) && design.logoSizeRatio > 0.25) {
    warnings.push('Center logo exceeds 25% coverage; reduce logo size for instant 4G camera lock.');
  }
  if ((design.logoPreset !== 'none' || design.logoDataUrl) && design.errorCorrection !== 'H') {
    warnings.push('Error correction automatically elevated to High (H) to keep center logo scannable.');
  }

  let score: 'excellent' | 'caution' | 'warning' = 'excellent';
  if (contrastRatio < 2.8 || (design.logoSizeRatio > 0.27 && (design.logoPreset !== 'none' || design.logoDataUrl))) {
    score = 'warning';
  } else if (warnings.length > 0) {
    score = 'caution';
  }

  return {
    score,
    contrastRatio: Number(contrastRatio.toFixed(1)),
    warnings,
  };
}

function isFinderZone(row: number, col: number, count: number): boolean {
  const inTopLeft = row < 7 && col < 7;
  const inTopRight = row < 7 && col >= count - 7;
  const inBottomLeft = row >= count - 7 && col < 7;
  return inTopLeft || inTopRight || inBottomLeft;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderLogoIconSvg(preset: string, cx: number, cy: number, size: number, accent: string): string {
  const r = size / 2;
  const s = size * 0.56;
  const x = cx - s / 2;
  const y = cy - s / 2;

  const badge = `<rect x="${cx - r}" y="${cy - r}" width="${size}" height="${size}" rx="${r * 0.42}" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>`;

  switch (preset) {
    case 'tapfx':
      return `${badge}
        <circle cx="${cx}" cy="${cy}" r="${s * 0.44}" fill="${accent}"/>
        <path d="M${cx - s * 0.14} ${cy - s * 0.16} h${s * 0.34} v${s * 0.11} h-${s * 0.11} v${s * 0.25} h-${s * 0.12} v-${s * 0.25} h-${s * 0.11} z" fill="#FFFFFF"/>`;
    case 'google':
      return `${badge}
        <polygon points="${cx},${cy - s * 0.4} ${cx + s * 0.12},${cy - s * 0.13} ${cx + s * 0.4},${cy - s * 0.1} ${cx + s * 0.18},${cy + s * 0.08} ${cx + s * 0.25},${cy + s * 0.36} ${cx},${cy + s * 0.2} ${cx - s * 0.25},${cy + s * 0.36} ${cx - s * 0.18},${cy + s * 0.08} ${cx - s * 0.4},${cy - s * 0.1} ${cx - s * 0.12},${cy - s * 0.13}" fill="#F59E0B"/>`;
    case 'whatsapp':
      return `${badge}
        <circle cx="${cx}" cy="${cy}" r="${s * 0.42}" fill="#16A34A"/>
        <path d="M${cx - s * 0.15} ${cy - s * 0.12} c0,0 ${s * 0.08},${s * 0.22} ${s * 0.28},${s * 0.25} l${s * 0.05},-${s * 0.06}" stroke="#FFFFFF" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    case 'wifi':
      return `${badge}
        <path d="M${cx - s * 0.36} ${cy - s * 0.05} a${s * 0.45},${s * 0.45} 0 0,1 ${s * 0.72},0" fill="none" stroke="${accent}" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M${cx - s * 0.22} ${cy + s * 0.1} a${s * 0.28},${s * 0.28} 0 0,1 ${s * 0.44},0" fill="none" stroke="${accent}" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="${cx}" cy="${cy + s * 0.26}" r="${s * 0.08}" fill="${accent}"/>`;
    case 'restaurant':
      return `${badge}
        <circle cx="${cx}" cy="${cy}" r="${s * 0.38}" fill="none" stroke="${accent}" stroke-width="2.4"/>
        <circle cx="${cx}" cy="${cy}" r="${s * 0.18}" fill="${accent}"/>`;
    case 'cafe':
      return `${badge}
        <rect x="${x + s * 0.2}" y="${y + s * 0.28}" width="${s * 0.5}" height="${s * 0.45}" rx="4" fill="${accent}"/>
        <path d="M${x + s * 0.7} ${y + s * 0.36} h${s * 0.12} a3,3 0 0,1 0,${s * 0.22} h-${s * 0.12}" fill="none" stroke="${accent}" stroke-width="2.2"/>`;
    case 'clinic':
      return `${badge}
        <rect x="${cx - s * 0.1}" y="${y + s * 0.15}" width="${s * 0.2}" height="${s * 0.7}" rx="2" fill="#DC2626"/>
        <rect x="${x + s * 0.15}" y="${cy - s * 0.1}" width="${s * 0.7}" height="${s * 0.2}" rx="2" fill="#DC2626"/>`;
    default:
      return `${badge}
        <rect x="${x + s * 0.18}" y="${y + s * 0.18}" width="${s * 0.64}" height="${s * 0.64}" rx="5" fill="${accent}"/>
        <circle cx="${cx}" cy="${cy}" r="${s * 0.14}" fill="#FFFFFF"/>`;
  }
}

function renderCornerFinder(
  ox: number,
  oy: number,
  cell: number,
  frameStyle: QRCornerFrameStyle,
  dotStyle: QRCornerDotStyle,
  color: string,
  bgColor: string
): string {
  const outer = cell * 7;
  const innerCut = cell * 5;
  const dotSize = cell * 3;
  const dotX = ox + cell * 2;
  const dotY = oy + cell * 2;

  let outerRx = 0;
  let innerRx = 0;
  if (frameStyle === 'rounded') {
    outerRx = cell * 1.3;
    innerRx = cell * 0.8;
  } else if (frameStyle === 'extra-rounded') {
    outerRx = cell * 2.2;
    innerRx = cell * 1.4;
  } else if (frameStyle === 'circle') {
    outerRx = outer / 2;
    innerRx = innerCut / 2;
  }

  let frameSvg = '';
  if (frameStyle === 'leaf') {
    const r = cell * 2.2;
    frameSvg = `
      <path d="M${ox + r},${oy} H${ox + outer} V${oy + outer - r} A${r},${r} 0 0 1 ${ox + outer - r},${oy + outer} H${ox} V${oy + r} A${r},${r} 0 0 1 ${ox + r},${oy} Z" fill="${color}"/>
      <rect x="${ox + cell}" y="${oy + cell}" width="${innerCut}" height="${innerCut}" rx="${cell}" fill="${bgColor}"/>
    `;
  } else {
    frameSvg = `
      <rect x="${ox}" y="${oy}" width="${outer}" height="${outer}" rx="${outerRx}" fill="${color}"/>
      <rect x="${ox + cell}" y="${oy + cell}" width="${innerCut}" height="${innerCut}" rx="${innerRx}" fill="${bgColor}"/>
    `;
  }

  let dotSvg = '';
  if (dotStyle === 'circle') {
    dotSvg = `<circle cx="${dotX + dotSize / 2}" cy="${dotY + dotSize / 2}" r="${dotSize / 2}" fill="${color}"/>`;
  } else if (dotStyle === 'rounded') {
    dotSvg = `<rect x="${dotX}" y="${dotY}" width="${dotSize}" height="${dotSize}" rx="${cell * 0.85}" fill="${color}"/>`;
  } else if (dotStyle === 'diamond') {
    const cx = dotX + dotSize / 2;
    const cy = dotY + dotSize / 2;
    const hr = dotSize / 2;
    dotSvg = `<polygon points="${cx},${cy - hr} ${cx + hr},${cy} ${cx},${cy + hr} ${cx - hr},${cy}" fill="${color}"/>`;
  } else {
    dotSvg = `<rect x="${dotX}" y="${dotY}" width="${dotSize}" height="${dotSize}" fill="${color}"/>`;
  }

  return frameSvg + dotSvg;
}

function renderModuleShape(
  x: number,
  y: number,
  size: number,
  pattern: QRDesignConfig['pattern'],
  fillAttr: string
): string {
  const cx = x + size / 2;
  const cy = y + size / 2;
  switch (pattern) {
    case 'gapped-square': {
      const s = size * 0.8;
      const off = (size - s) / 2;
      return `<rect x="${(x + off).toFixed(2)}" y="${(y + off).toFixed(2)}" width="${s.toFixed(2)}" height="${s.toFixed(2)}" fill="${fillAttr}"/>`;
    }
    case 'circle':
      return `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(size * 0.43).toFixed(2)}" fill="${fillAttr}"/>`;
    case 'rounded': {
      const s = size * 0.88;
      const off = (size - s) / 2;
      return `<rect x="${(x + off).toFixed(2)}" y="${(y + off).toFixed(2)}" width="${s.toFixed(2)}" height="${s.toFixed(2)}" rx="${(s * 0.35).toFixed(2)}" fill="${fillAttr}"/>`;
    }
    case 'vertical-bars':
      return `<rect x="${(x + size * 0.14).toFixed(2)}" y="${y.toFixed(2)}" width="${(size * 0.72).toFixed(2)}" height="${(size * 1.02).toFixed(2)}" fill="${fillAttr}"/>`;
    case 'horizontal-bars':
      return `<rect x="${x.toFixed(2)}" y="${(y + size * 0.14).toFixed(2)}" width="${(size * 1.02).toFixed(2)}" height="${(size * 0.72).toFixed(2)}" fill="${fillAttr}"/>`;
    case 'rounded-h-bars':
      return `<rect x="${x.toFixed(2)}" y="${(y + size * 0.14).toFixed(2)}" width="${(size * 1.02).toFixed(2)}" height="${(size * 0.72).toFixed(2)}" rx="${(size * 0.36).toFixed(2)}" fill="${fillAttr}"/>`;
    case 'rounded-v-bars':
      return `<rect x="${(x + size * 0.14).toFixed(2)}" y="${y.toFixed(2)}" width="${(size * 0.72).toFixed(2)}" height="${(size * 1.02).toFixed(2)}" rx="${(size * 0.36).toFixed(2)}" fill="${fillAttr}"/>`;
    case 'diamond': {
      const r = size * 0.47;
      return `<polygon points="${cx.toFixed(2)},${(cy - r).toFixed(2)} ${(cx + r).toFixed(2)},${cy.toFixed(2)} ${cx.toFixed(2)},${(cy + r).toFixed(2)} ${(cx - r).toFixed(2)},${cy.toFixed(2)}" fill="${fillAttr}"/>`;
    }
    case 'hexagon': {
      const r = size * 0.48;
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
      }).join(' ');
      return `<polygon points="${pts}" fill="${fillAttr}"/>`;
    }
    case 'star': {
      const rOut = size * 0.49;
      const rIn = size * 0.23;
      const pts = Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 === 0 ? rOut : rIn;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
      }).join(' ');
      return `<polygon points="${pts}" fill="${fillAttr}"/>`;
    }
    case 'heart': {
      const s = size * 0.85;
      const hx = cx;
      const hy = cy + s * 0.34;
      return `<path d="M${hx.toFixed(2)},${hy.toFixed(2)} C${(hx - s * 0.55).toFixed(2)},${(cy + s * 0.05).toFixed(2)} ${(hx - s * 0.52).toFixed(2)},${(cy - s * 0.42).toFixed(2)} ${hx.toFixed(2)},${(cy - s * 0.14).toFixed(2)} C${(hx + s * 0.52).toFixed(2)},${(cy - s * 0.42).toFixed(2)} ${(hx + s * 0.55).toFixed(2)},${(cy + s * 0.05).toFixed(2)} ${hx.toFixed(2)},${hy.toFixed(2)} Z" fill="${fillAttr}"/>`;
    }
    case 'square':
    default:
      return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(size + 0.25).toFixed(2)}" height="${(size + 0.25).toFixed(2)}" fill="${fillAttr}"/>`;
  }
}

export function buildStyledQRSvg(payload: string, design: QRDesignConfig, totalWidth = 320): string {
  const hasLogo = design.logoPreset !== 'none' || Boolean(design.logoDataUrl);
  const ecl = hasLogo ? 'H' : design.errorCorrection || 'M';
  const qr = QRCode.create(payload || 'https://tapfx.com', { errorCorrectionLevel: ecl });
  const count = qr.modules.size;
  const data = qr.modules.data;

  const hasFrame = design.frameStyle !== 'none';
  const isTopFrame = design.frameStyle === 'classic-top';
  const outerPad = hasFrame ? 16 : 0;
  const headerBand = isTopFrame ? 46 : 0;
  const footerBand = hasFrame && !isTopFrame ? 52 : 0;

  const qrArea = totalWidth - outerPad * 2;
  const quietZone = 16;
  const matrixArea = qrArea - quietZone * 2;
  const cell = matrixArea / count;
  const totalHeight = totalWidth + headerBand + footerBand;

  const bgFill = design.transparentBg ? 'none' : design.bgColor || '#FFFFFF';
  const finderBg = design.transparentBg ? '#FFFFFF' : design.bgColor || '#FFFFFF';
  const fillId = 'tapfxQrGrad';
  const fillAttr = design.useGradient ? `url(#${fillId})` : design.fgColor;
  const cornerColor = design.cornerColor || (design.useGradient ? design.gradientStart : design.fgColor);

  const qrOriginX = outerPad + quietZone;
  const qrOriginY = outerPad + headerBand + quietZone;

  const modulesSvg: string[] = [];
  const logoClearHalf = hasLogo ? (matrixArea * Math.min(0.26, design.logoSizeRatio)) / 2 + cell * 0.6 : 0;
  const matrixCenterX = qrOriginX + matrixArea / 2;
  const matrixCenterY = qrOriginY + matrixArea / 2;

  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (isFinderZone(r, c, count)) continue;
      if (!data[r * count + c]) continue;
      const mx = qrOriginX + c * cell;
      const my = qrOriginY + r * cell;
      if (
        hasLogo &&
        Math.abs(mx + cell / 2 - matrixCenterX) < logoClearHalf &&
        Math.abs(my + cell / 2 - matrixCenterY) < logoClearHalf
      ) {
        continue;
      }
      modulesSvg.push(renderModuleShape(mx, my, cell, design.pattern, fillAttr));
    }
  }

  const findersSvg = [
    renderCornerFinder(qrOriginX, qrOriginY, cell, design.cornerFrameStyle, design.cornerDotStyle, cornerColor, finderBg),
    renderCornerFinder(
      qrOriginX + (count - 7) * cell,
      qrOriginY,
      cell,
      design.cornerFrameStyle,
      design.cornerDotStyle,
      cornerColor,
      finderBg
    ),
    renderCornerFinder(
      qrOriginX,
      qrOriginY + (count - 7) * cell,
      cell,
      design.cornerFrameStyle,
      design.cornerDotStyle,
      cornerColor,
      finderBg
    ),
  ].join('');

  let logoSvg = '';
  if (hasLogo) {
    const logoSize = matrixArea * Math.min(0.26, design.logoSizeRatio);
    if (design.logoDataUrl) {
      logoSvg = `
        <rect x="${(matrixCenterX - logoSize / 2 - 4).toFixed(1)}" y="${(matrixCenterY - logoSize / 2 - 4).toFixed(1)}" width="${(logoSize + 8).toFixed(1)}" height="${(logoSize + 8).toFixed(1)}" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
        <image href="${escapeXml(design.logoDataUrl)}" x="${(matrixCenterX - logoSize / 2).toFixed(1)}" y="${(matrixCenterY - logoSize / 2).toFixed(1)}" width="${logoSize.toFixed(1)}" height="${logoSize.toFixed(1)}" preserveAspectRatio="xMidYMid meet"/>
      `;
    } else if (design.logoPreset !== 'none') {
      logoSvg = renderLogoIconSvg(design.logoPreset, matrixCenterX, matrixCenterY, logoSize, design.frameColor || '#004CF6');
    }
  }

  let frameWrapper = '';
  const frameText = escapeXml((design.frameText || 'SCAN ME').slice(0, 26));
  const fColor = design.frameColor || '#004CF6';

  if (hasFrame) {
    const bandY = isTopFrame ? 10 : totalHeight - footerBand + 6;
    const bandH = isTopFrame ? 36 : 40;
    frameWrapper = `
      <rect x="2" y="2" width="${totalWidth - 4}" height="${totalHeight - 4}" rx="20" fill="${bgFill === 'none' ? '#FFFFFF' : bgFill}" stroke="${fColor}" stroke-width="3"/>
      <rect x="14" y="${bandY}" width="${totalWidth - 28}" height="${bandH}" rx="12" fill="${fColor}"/>
      <text x="${totalWidth / 2}" y="${bandY + bandH / 2 + 5}" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, Manrope, sans-serif" font-size="14" font-weight="700" letter-spacing="1.2">${frameText}</text>
    `;
  } else if (bgFill !== 'none') {
    frameWrapper = `<rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" rx="16" fill="${bgFill}"/>`;
  }

  const qrInnerBg =
    hasFrame && bgFill !== 'none'
      ? `<rect x="${outerPad}" y="${outerPad + headerBand}" width="${qrArea}" height="${qrArea}" rx="12" fill="${bgFill}"/>`
      : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}">
    <defs>
      <linearGradient id="${fillId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${design.gradientStart}"/>
        <stop offset="100%" stop-color="${design.gradientEnd}"/>
      </linearGradient>
    </defs>
    ${frameWrapper}
    ${qrInnerBg}
    ${modulesSvg.join('')}
    ${findersSvg}
    ${logoSvg}
  </svg>`;
}

export function downloadSvgFile(svgMarkup: string, filename: string) {
  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.svg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function svgToPngDataUrl(svgMarkup: string, scale = 4): Promise<{ dataUrl: string; width: number; height: number }> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgMarkup, 'image/svg+xml');
  const svgEl = doc.documentElement;
  const w = Number(svgEl.getAttribute('width') || 320);
  const h = Number(svgEl.getAttribute('height') || 320);

  const canvas = document.createElement('canvas');
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve();
      };
      img.onerror = () => reject(new Error('Failed to rasterize SVG'));
      img.src = url;
    });
    return { dataUrl: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function downloadPngFile(svgMarkup: string, filename: string, scale = 4) {
  const { dataUrl } = await svgToPngDataUrl(svgMarkup, scale);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${filename}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function downloadPdfFile(
  svgMarkup: string,
  filename: string,
  sizePreset: '5cm' | '10cm' | 'a5',
  title = 'TapFX'
) {
  const { dataUrl, width, height } = await svgToPngDataUrl(svgMarkup, 5);
  const ratio = height / width;

  if (sizePreset === 'a5') {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
    pdf.setFillColor(244, 247, 251);
    pdf.rect(0, 0, 148, 210, 'F');
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(14, 18, 120, 174, 6, 6, 'F');
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text(title, 74, 38, { align: 'center' });
    const imgW = 86;
    const imgH = imgW * ratio;
    pdf.addImage(dataUrl, 'PNG', 74 - imgW / 2, 52, imgW, imgH);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(71, 85, 105);
    pdf.text('Powered by TapFX · tapfx.com', 74, 178, { align: 'center' });
    pdf.save(`${filename}-A5-stand.pdf`);
    return;
  }

  const mm = sizePreset === '5cm' ? 50 : 100;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [mm + 16, mm * ratio + 20] });
  pdf.addImage(dataUrl, 'PNG', 8, 8, mm, mm * ratio);
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`${title} (${sizePreset.toUpperCase()} @ 300 DPI)`, (mm + 16) / 2, mm * ratio + 14, { align: 'center' });
  pdf.save(`${filename}-${sizePreset}.pdf`);
}
