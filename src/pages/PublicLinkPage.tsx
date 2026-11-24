import React, { useEffect, useState } from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useApp } from '../context/AppContext';
import type { LinkPageRecord } from '../types/tapfx';

export function PublicLinkPage({ slug }: { slug: string }) {
  const { navigate } = useApp();
  const [page, setPage] = useState<LinkPageRecord | null>(null);
  const [removeBranding, setRemoveBranding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [passInput, setPassInput] = useState('');

  useEffect(() => {
    setLoading(true);
    apiFetch<{ page: LinkPageRecord; removeBranding: boolean }>(`/api/public/link-page/${encodeURIComponent(slug)}`)
      .then((res) => {
        setPage(res.page);
        setRemoveBranding(res.removeBranding);
        setUnlocked(!res.page.passwordProtected);
      })
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleLinkClick = (blockId: string, url: string) => {
    void apiFetch(`/api/public/link-page/${encodeURIComponent(slug)}/click`, {
      method: 'POST',
      body: JSON.stringify({ blockId }),
    }).catch(() => undefined);

    if (url.startsWith('/') && !url.startsWith('//')) {
      navigate(url);
    } else if (/^(https?:\/\/|tel:|mailto:)/i.test(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 border border-slate-200 animate-pulse space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100" />
          <div className="h-5 bg-slate-100 rounded w-1/2 mx-auto" />
          <div className="h-12 bg-slate-100 rounded-xl" />
          <div className="h-12 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4 text-center">
        <div className="max-w-md bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
          <h1 className="font-display text-xl font-bold">TapFX Link Page Not Found</h1>
          <p className="text-sm text-slate-500">tapfx.com/{slug} is available to claim.</p>
          <button
            onClick={() => navigate(`/app/links?claim=${encodeURIComponent(slug)}`)}
            className="px-5 py-2.5 rounded-xl bg-[#004CF6] text-white text-sm font-semibold"
          >
            Claim /{slug}
          </button>
        </div>
      </div>
    );
  }

  const fontClass = {
    sans: 'font-tapfx-sans',
    manrope: 'font-tapfx-manrope',
    oria: 'font-tapfx-oria',
    devanagari: 'font-tapfx-devanagari',
    mono: 'font-tapfx-mono',
    classic: 'font-tapfx-classic',
  }[page.theme.fontId];

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (passInput.trim().length > 0) setUnlocked(true);
          }}
          className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 p-6 space-y-4 text-center"
        >
          <Lock className="w-8 h-8 mx-auto text-[#004CF6]" />
          <h1 className="font-display text-lg font-bold text-[#0F172A]">{page.name}</h1>
          <p className="text-xs text-slate-500">Enter access passcode to view this page.</p>
          <input
            type="password"
            required
            value={passInput}
            onChange={(e) => setPassInput(e.target.value)}
            placeholder="Passcode"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
          />
          <button type="submit" className="w-full py-2.5 rounded-xl bg-[#004CF6] text-white text-sm font-semibold">
            Unlock Page
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-10 px-4 ${fontClass}`}
      style={{ backgroundColor: page.theme.bgColor, color: page.theme.textColor }}
    >
      <div className="max-w-[460px] mx-auto space-y-6">
        <div
          className="rounded-2xl border border-slate-200/80 p-6 text-center space-y-3 shadow-sm"
          style={{ backgroundColor: page.theme.cardBg }}
        >
          {page.logoUrl ? (
            <img src={page.logoUrl} alt={page.name} className="w-16 h-16 mx-auto rounded-2xl object-cover" />
          ) : (
            <div
              className="w-16 h-16 mx-auto rounded-2xl text-white font-display font-bold text-2xl flex items-center justify-center"
              style={{ backgroundColor: page.theme.accentColor }}
            >
              {page.name.slice(0, 1)}
            </div>
          )}
          <h1 className="font-display text-2xl font-bold">{page.name}</h1>
          <p className="text-xs font-semibold opacity-80">{page.headline}</p>
          <p className="text-sm opacity-75 leading-relaxed">{page.description}</p>
        </div>

        <div className="space-y-3">
          {page.blocks
            .filter((b) => b.enabled)
            .map((blk, i) => {
              const isPrimary = i === 0 && page.theme.buttonStyle === 'solid-blue';
              return (
                <button
                  key={blk.id}
                  onClick={() => handleLinkClick(blk.id, blk.url)}
                  className="w-full flex items-center justify-between px-5 py-4 rounded-xl border text-sm font-semibold transition-transform hover:-translate-y-0.5 shadow-sm"
                  style={{
                    backgroundColor: isPrimary
                      ? page.theme.accentColor
                      : page.theme.buttonStyle === 'dark-slate'
                        ? '#0F172A'
                        : '#FFFFFF',
                    color: isPrimary || page.theme.buttonStyle === 'dark-slate' ? '#FFFFFF' : page.theme.textColor,
                    borderColor: isPrimary ? page.theme.accentColor : '#E2E8F0',
                  }}
                >
                  <span>{blk.label}</span>
                  <ArrowRight className="w-4 h-4 opacity-75" />
                </button>
              );
            })}
        </div>

        {!removeBranding && (
          <div className="text-center pt-4">
            <button onClick={() => navigate('/')} className="text-xs text-slate-500 hover:text-[#004CF6]">
              Powered by TapFX
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
