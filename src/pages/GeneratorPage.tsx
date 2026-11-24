import React from 'react';
import { QRStudio } from '../components/QRStudio';
import { useApp } from '../context/AppContext';

export function GeneratorPage() {
  const { navigate } = useApp();

  return (
    <div className="bg-[#F4F7FB] min-h-screen py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-semibold text-[#004CF6] tracking-wide">TapFX Studio</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] text-balance">
              Create &amp; Customize Your QR Code
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Design styled QR codes with 16 formats, 12 patterns, custom gradients, frames, and logo contrast checks. Export immediately or save as an editable dynamic link.
            </p>
          </div>
          <button
            onClick={() => navigate('/cards')}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[#0F172A] hover:border-[#004CF6] transition-colors whitespace-nowrap"
          >
            Print on NFC Cards &amp; Stands
          </button>
        </div>

        <QRStudio />
      </div>
    </div>
  );
}
