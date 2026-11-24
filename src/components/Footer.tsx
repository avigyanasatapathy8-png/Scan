import React from 'react';
import { useApp } from '../context/AppContext';
import { TapFXBrandLogo } from './Navbar';
import type { LanguageCode } from '../types/tapfx';

export function Footer() {
  const { navigate, language, setLanguage, t, demoReviewCode, demoLinkSlug, demoOrderNumber } = useApp();

  const langs: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'od', label: 'ଓଡ଼ିଆ' },
    { code: 'hi', label: 'हिन्दी' },
  ];

  return (
    <footer className="bg-[#F4F7FB] border-t border-slate-200 text-[#0F172A]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center">
              <TapFXBrandLogo className="h-10" darkSurface />
            </div>
            <p className="text-sm text-slate-600 max-w-xs leading-relaxed">
              {t.footer.tagline} Dynamic QR infrastructure, multi-link business pages, and NFC smart cards built for real-world commerce.
            </p>
            <p className="text-xs text-slate-500">{t.footer.contactLine}</p>

            {/* Language switcher */}
            <div className="pt-2">
              <span className="block text-xs font-medium text-slate-500 mb-2">Interface Language</span>
              <div className="inline-flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl">
                {langs.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      language === l.code
                        ? 'bg-[#004CF6] text-white'
                        : 'text-slate-600 hover:text-[#0F172A]'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#0F172A]">{t.footer.platform}</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <button onClick={() => navigate('/generator')} className="hover:text-[#004CF6] transition-colors">
                  QR Generator
                </button>
              </li>
              <li>
                <button onClick={() => navigate(`/${demoLinkSlug}`)} className="hover:text-[#004CF6] transition-colors">
                  Multi-Link Demo
                </button>
              </li>
              <li>
                <button onClick={() => navigate(`/r/${demoReviewCode}`)} className="hover:text-[#004CF6] transition-colors">
                  Review Page Demo
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/app')} className="hover:text-[#004CF6] transition-colors">
                  Analytics Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/admin')} className="hover:text-[#004CF6] transition-colors">
                  Admin Console
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#0F172A]">{t.footer.products}</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <button onClick={() => navigate('/cards/common-card')} className="hover:text-[#004CF6] transition-colors">
                  Common Card
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/cards/master-card')} className="hover:text-[#004CF6] transition-colors">
                  Master Card
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/cards/magic-card')} className="hover:text-[#004CF6] transition-colors">
                  Magic Card
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/cards/wifi-card')} className="hover:text-[#004CF6] transition-colors">
                  WiFi Card
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/cards/acrylic-stand')} className="hover:text-[#004CF6] transition-colors">
                  Acrylic QR Stand
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#0F172A]">{t.footer.company}</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <button onClick={() => navigate('/how-it-works')} className="hover:text-[#004CF6] transition-colors">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/pricing')} className="hover:text-[#004CF6] transition-colors">
                  Pricing Plans
                </button>
              </li>
              <li>
                <button onClick={() => navigate(`/track/${demoOrderNumber}`)} className="hover:text-[#004CF6] transition-colors">
                  Track Order
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/faq')} className="hover:text-[#004CF6] transition-colors">
                  FAQs
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-[#004CF6] transition-colors">
                  Contact &amp; Support
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#0F172A]">{t.footer.legal}</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <button onClick={() => navigate('/privacy')} className="hover:text-[#004CF6] transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/terms')} className="hover:text-[#004CF6] transition-colors">
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/replacement-policy')} className="hover:text-[#004CF6] transition-colors">
                  Replacement &amp; Refund
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/real-reviews')} className="hover:text-[#004CF6] transition-colors">
                  Real Reviews &amp; AI Note
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{t.footer.copyright}</p>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/tap.fx"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#004CF6] transition-colors"
            >
              Instagram @tap.fx
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="mailto:tapfxx@gmail.com"
              className="hover:text-[#004CF6] transition-colors"
            >
              tapfxx@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
