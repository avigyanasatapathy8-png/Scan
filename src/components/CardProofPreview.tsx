import React, { useMemo, useState } from 'react';
import { Wifi, Star, RotateCw } from 'lucide-react';
import { buildStyledQRSvg } from '../lib/qrRenderer';
import { DEFAULT_QR_DESIGN } from '../lib/qrPresets';
import type { ProductRecord } from '../types/tapfx';

interface CardProofPreviewProps {
  productSlug: ProductRecord['slug'];
  businessName: string;
  personName?: string;
  tagline?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoDataUrl?: string;
  destinationUrl?: string;
  cardTheme: 'royal-blue' | 'obsidian' | 'pearl-white' | 'cobalt-metal';
}

export function CardProofPreview({
  productSlug,
  businessName,
  personName,
  tagline,
  phone,
  email,
  website,
  logoDataUrl,
  destinationUrl = 'https://tapfx.com/r/demo',
  cardTheme,
}: CardProofPreviewProps) {
  const [side, setSide] = useState<'front' | 'back'>('front');

  const qrSvg = useMemo(() => {
    const fg = cardTheme === 'pearl-white' ? '#0F172A' : '#FFFFFF';
    const bg = cardTheme === 'pearl-white' ? '#FFFFFF' : '#0F172A';
    return buildStyledQRSvg(
      destinationUrl || 'https://tapfx.com',
      {
        ...DEFAULT_QR_DESIGN,
        useGradient: false,
        fgColor: fg,
        bgColor: bg,
        cornerColor: fg,
        frameStyle: 'none',
        logoPreset: 'none',
      },
      140
    );
  }, [destinationUrl, cardTheme]);

  const themeClasses = {
    'royal-blue': 'bg-gradient-to-br from-[#004CF6] to-[#0030C0] text-white border-[#0030C0]',
    obsidian: 'bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white border-slate-700',
    'pearl-white': 'bg-white text-[#0F172A] border-slate-200',
    'cobalt-metal': 'bg-gradient-to-br from-[#0C4A6E] via-[#0030C0] to-[#0F172A] text-white border-blue-900',
  }[cardTheme];

  const isStand = productSlug === 'acrylic-stand';
  const isWifi = productSlug === 'wifi-card';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">Live Print Proof ({side === 'front' ? 'Front' : 'Back'})</span>
        {!isStand && (
          <button
            type="button"
            onClick={() => setSide((s) => (s === 'front' ? 'back' : 'front'))}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#004CF6] hover:text-[#0030C0]"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Flip to {side === 'front' ? 'Back' : 'Front'}
          </button>
        )}
      </div>

      {isStand ? (
        <div className="mx-auto max-w-[260px] rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            {logoDataUrl ? (
              <img src={logoDataUrl} alt={businessName} className="w-8 h-8 rounded-lg object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[#004CF6] text-white flex items-center justify-center font-bold text-sm">
                {(businessName || 'T').slice(0, 1).toUpperCase()}
              </div>
            )}
            <span className="font-display font-bold text-sm text-[#0F172A] truncate">{businessName || 'Your Business'}</span>
          </div>
          <p className="text-xs font-semibold text-[#004CF6]">Review Us &amp; Connect</p>
          <div
            className="mx-auto w-32 h-32 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center bg-white"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <div className="flex items-center justify-center gap-1 text-amber-500">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
            ))}
          </div>
          <div className="h-3 rounded-b-xl bg-[#004CF6] -mx-5 -mb-5 mt-2" />
        </div>
      ) : (
        <div
          className={`relative w-full aspect-[1.586/1] rounded-2xl border p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-all ${themeClasses}`}
        >
          {side === 'front' ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {logoDataUrl ? (
                    <img src={logoDataUrl} alt={businessName} className="w-10 h-10 rounded-lg object-contain bg-white/90 p-1 shrink-0" />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-base shrink-0 ${
                        cardTheme === 'pearl-white' ? 'bg-[#004CF6] text-white' : 'bg-white/15 text-white'
                      }`}
                    >
                      {(businessName || 'T').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-display font-bold text-base truncate">{businessName || 'Your Business Name'}</p>
                    <p className={`text-xs truncate ${cardTheme === 'pearl-white' ? 'text-slate-500' : 'text-white/75'}`}>
                      {isWifi ? 'Tap or Scan for Instant WiFi' : tagline || 'TapFX Smart Card'}
                    </p>
                  </div>
                </div>
                <Wifi className="w-5 h-5 rotate-90 opacity-80 shrink-0" />
              </div>

              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0 space-y-0.5">
                  {personName && <p className="text-sm font-semibold truncate">{personName}</p>}
                  {phone && <p className="text-xs opacity-80 truncate">{phone}</p>}
                  {website && <p className="text-xs opacity-75 truncate">{website}</p>}
                </div>
                <span className="text-[11px] font-mono opacity-70 uppercase tracking-wider shrink-0">
                  {productSlug.replace('-card', '')} · NFC
                </span>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-between gap-4">
              <div className="space-y-1.5 min-w-0 flex-1">
                <p className="font-display font-bold text-sm truncate">{businessName || 'Your Business'}</p>
                {email && <p className="text-xs opacity-80 truncate">{email}</p>}
                {phone && <p className="text-xs opacity-80 truncate">{phone}</p>}
                <p className="text-[11px] opacity-70 pt-2">Scan QR or tap phone to open</p>
              </div>
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-white p-1.5 shrink-0 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
