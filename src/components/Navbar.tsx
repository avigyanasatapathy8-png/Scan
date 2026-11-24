import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BRAND_LOGO_URL = '/assets/aistudio/retouch_2026111610040952_eb8ca937.jpg';

export function TapFXBrandLogo({
  className = 'h-10',
  darkSurface = false,
}: {
  className?: string;
  darkSurface?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center shrink-0 ${
        darkSurface ? 'bg-white rounded-xl px-2.5 py-1 shadow-sm' : ''
      }`}
    >
      <img
        src={BRAND_LOGO_URL}
        alt="TapFX — One Tap. Endless Possibilities."
        className={`${className} w-auto object-contain select-none`}
      />
    </span>
  );
}

export function TapFXLogoMark({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="#FFFFFF" stroke="#E2E8F0" />
      <path d="M9 14c4-2 11-2 15-1-1 2.2-2.5 3-5 3l-3 12c-2 1-3.5 1.5-5 1.8L14 16c-2 0-3.8.5-5 1.5V14z" fill="#0F172A" />
      <path
        d="M8 21.5c5 3.5 15 1 18.5-4.5"
        stroke="#004CF6"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M25.5 11.5a4.5 4.5 0 0 1 3 3M27.5 8.5a8 8 0 0 1 5 5"
        stroke="#007BFF"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatCountdown(targetIso: string): string {
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) return 'Limited time';
  const days = Math.floor(diff / 86400_000);
  const hours = Math.floor((diff % 86400_000) / 3600_000);
  const mins = Math.floor((diff % 3600_000) / 60_000);
  return `${days}d ${hours}h ${mins}m left`;
}

export function Navbar() {
  const { route, navigate, siteConfig, user, t } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!siteConfig?.promoBanner?.countdownIso) return;
    const update = () => setCountdown(formatCountdown(siteConfig.promoBanner.countdownIso));
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, [siteConfig?.promoBanner?.countdownIso]);

  const navItems = [
    { label: t.nav.generator, to: '/generator' },
    { label: t.nav.multiLink, to: '/app/links' },
    { label: t.nav.nfcCards, to: '/cards' },
    { label: t.nav.products, to: '/order' },
    { label: t.nav.pricing, to: '/pricing' },
  ];

  const handleNav = (to: string) => {
    setMobileOpen(false);
    navigate(to);
  };

  return (
    <div className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      {siteConfig?.promoBanner?.enabled && !bannerDismissed && (
        <div className="bg-[#0F172A] text-white px-4 h-9 flex items-center justify-center gap-4 text-xs">
          <p className="truncate font-medium">
            {siteConfig.promoBanner.text}
            {countdown ? <span className="ml-2 text-sky-300 font-mono tabular-nums">({countdown})</span> : null}
          </p>
          <button
            onClick={() => handleNav('/order')}
            className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#004CF6] hover:bg-[#0030C0] text-white font-semibold whitespace-nowrap shrink-0 transition-colors"
          >
            {siteConfig.promoBanner.ctaText}
          </button>
          <button
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss announcement"
            className="text-slate-400 hover:text-white shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <header className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single clean element) */}
        <button
          onClick={() => handleNav('/')}
          className="flex items-center text-left whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#004CF6] rounded-lg"
        >
          <TapFXBrandLogo className="h-10 sm:h-11" />
          <span className="sr-only">TapFX</span>
        </button>

        {/* Zone 2: 5 concise single-line text links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          {navItems.map((item) => {
            const active = route === item.to;
            return (
              <button
                key={item.to}
                onClick={() => handleNav(item.to)}
                className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                  active
                    ? 'text-[#004CF6] border-[#004CF6]'
                    : 'border-transparent hover:text-[#0F172A] hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action + clean login link */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          {user ? (
            <button
              onClick={() => handleNav(user.role === 'admin' ? '/admin' : '/app')}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#004CF6] hover:bg-[#0030C0] rounded-xl transition-colors whitespace-nowrap shrink-0"
            >
              {user.role === 'admin' ? 'Admin Console' : t.nav.dashboard}
            </button>
          ) : (
            <>
              <button
                onClick={() => handleNav('/login')}
                className="text-sm font-medium text-slate-700 hover:text-[#004CF6] transition-colors whitespace-nowrap shrink-0"
              >
                {t.nav.login}
              </button>
              <button
                onClick={() => handleNav('/signup')}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#004CF6] hover:bg-[#0030C0] rounded-xl transition-colors whitespace-nowrap shrink-0"
              >
                {t.nav.getStarted}
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          <button
            onClick={() => handleNav('/')}
            className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {t.nav.home}
          </button>
          {navItems.map((item) => (
            <button
              key={item.to}
              onClick={() => handleNav(item.to)}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => handleNav('/track/TFX-2026-1042')}
            className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Track Order
          </button>
          <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
            {user ? (
              <button
                onClick={() => handleNav(user.role === 'admin' ? '/admin' : '/app')}
                className="w-full py-2.5 text-sm font-semibold text-white bg-[#004CF6] rounded-xl"
              >
                {user.role === 'admin' ? 'Admin Console' : t.nav.dashboard}
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleNav('/login')}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl"
                >
                  {t.nav.login}
                </button>
                <button
                  onClick={() => handleNav('/signup')}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#004CF6] rounded-xl"
                >
                  {t.nav.getStarted}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
