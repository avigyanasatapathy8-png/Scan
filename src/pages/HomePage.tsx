import React, { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  CreditCard,
  Globe,
  Layers,
  MapPin,
  MessageCircle,
  Palette,
  QrCode,
  RefreshCw,
  Smartphone,
  Star,
  Store,
  Wifi,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QRStudio } from '../components/QRStudio';
import { DEMO_TESTIMONIALS, USE_CASES } from '../lib/qrPresets';
import type { LinkButtonStyle } from '../types/tapfx';

export function HomePage() {
  const { navigate, t, products, plans, siteConfig, demoReviewCode, demoLinkSlug } = useApp();
  const [heroMode, setHeroMode] = useState<'nfc' | 'qr'>('nfc');
  const [claimSlug, setClaimSlug] = useState('yourshop');
  const [buttonStyle, setButtonStyle] = useState<LinkButtonStyle>('solid-blue');
  const [openFaq, setOpenFaq] = useState<string>('faq-1');

  const multiLinkButtons = [
    { label: 'Review Us on Google', icon: Star, to: `/r/${demoReviewCode}` },
    { label: 'Order on WhatsApp', icon: MessageCircle, to: `/r/${demoReviewCode}` },
    { label: 'Browse Digital Menu', icon: Store, to: `/${demoLinkSlug}` },
    { label: 'Visit Official Website', icon: Globe, to: `/${demoLinkSlug}` },
    { label: 'Instagram @kalingaspice', icon: Smartphone, to: `/${demoLinkSlug}` },
    { label: 'Location & Directions', icon: MapPin, to: `/${demoLinkSlug}` },
  ];

  const getButtonStyleClass = (idx: number) => {
    if (buttonStyle === 'solid-blue') {
      return idx === 0
        ? 'bg-[#004CF6] text-white border-[#004CF6]'
        : 'bg-white text-[#0F172A] border-slate-200 hover:border-[#004CF6]';
    }
    if (buttonStyle === 'dark-slate') {
      return 'bg-[#0F172A] text-white border-[#0F172A]';
    }
    return 'bg-[#F4F7FB] text-[#0030C0] border-blue-200 hover:bg-blue-50';
  };

  return (
    <div className="bg-white text-[#0F172A]">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-[#F4F7FB] via-white to-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-12 pb-16 lg:pt-20 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-6">
              <p className="text-xs sm:text-sm font-semibold text-[#004CF6] tracking-wide">
                {t.hero.kicker}
              </p>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-[#0F172A] leading-[1.08] text-balance">
                {t.hero.headline}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                {t.hero.subheadline}
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <button
                  onClick={() => navigate('/generator')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#004CF6] hover:bg-[#0030C0] text-white text-sm font-semibold shadow-sm transition-colors whitespace-nowrap"
                >
                  {t.hero.primaryCta}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/cards')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 bg-white hover:border-[#004CF6] text-[#0F172A] text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  {t.hero.secondaryCta}
                </button>
              </div>

              {/* Claim Your Link Quick Box */}
              <div className="pt-2 max-w-md">
                <label className="block text-xs font-semibold text-slate-500 mb-2">
                  Claim your TapFX multi-link page
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm focus-within:border-[#004CF6]">
                  <span className="pl-3 pr-1 text-xs sm:text-sm font-mono text-slate-400">tapfx.com/</span>
                  <input
                    type="text"
                    value={claimSlug}
                    onChange={(e) => setClaimSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 min-w-0 text-xs sm:text-sm font-mono font-semibold text-[#0F172A] focus:outline-none"
                    aria-label="Claim your TapFX link slug"
                  />
                  <button
                    onClick={() => navigate(`/app/links?claim=${encodeURIComponent(claimSlug || 'yourshop')}`)}
                    className="px-3.5 py-2 rounded-lg bg-[#0F172A] hover:bg-[#004CF6] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    Claim Link
                  </button>
                </div>
              </div>

              {/* Instant Live Demo Switcher */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-600">
                <button
                  onClick={() => navigate(`/r/${demoReviewCode}`)}
                  className="font-semibold text-[#004CF6] hover:underline"
                >
                  Try Live Review Page (/r/{demoReviewCode})
                </button>
                <span aria-hidden="true">·</span>
                <button
                  onClick={() => navigate(`/${demoLinkSlug}`)}
                  className="font-semibold text-[#004CF6] hover:underline"
                >
                  View Multi-Link Profile (/{demoLinkSlug})
                </button>
              </div>
            </div>

            {/* Right Composition: Studio Image + Interactive Floating Mockup */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                {/* Mode Toggle Header */}
                <div className="flex items-center justify-between px-2 pb-3">
                  <span className="text-xs font-semibold text-slate-500">{t.hero.tapToPreview}</span>
                  <div className="inline-flex items-center gap-1 p-1 bg-[#F4F7FB] rounded-lg">
                    <button
                      type="button"
                      onClick={() => setHeroMode('nfc')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                        heroMode === 'nfc' ? 'bg-white text-[#004CF6] shadow-sm' : 'text-slate-600'
                      }`}
                    >
                      {t.hero.nfcMode}
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroMode('qr')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                        heroMode === 'qr' ? 'bg-white text-[#004CF6] shadow-sm' : 'text-slate-600'
                      }`}
                    >
                      {t.hero.qrMode}
                    </button>
                  </div>
                </div>

                {/* Generated Hardware Photography */}
                <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-[16/9]">
                  <img
                    src="/src/assets/images/hero_tapfx_ecosystem_1795502475957.jpg"
                    alt="TapFX NFC Smart Card, Smartphone Digital Profile and Acrylic QR Stand"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 text-white">
                    <div className="bg-slate-900/80 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2 text-xs">
                      <p className="font-semibold">
                        {heroMode === 'nfc' ? 'NFC Card Tapped · Instant Profile' : 'QR Scanned · Review Page Ready'}
                      </p>
                      <p className="text-sky-300 text-[11px]">{t.hero.liveScanToast}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/r/${demoReviewCode}?src=${heroMode}`)}
                      className="px-3.5 py-2 rounded-xl bg-[#004CF6] hover:bg-[#0030C0] text-white text-xs font-semibold transition-colors"
                    >
                      Open Live Demo
                    </button>
                  </div>
                </div>

                {/* Companion Floating Metrics Strip */}
                <div className="grid grid-cols-3 gap-3 pt-3">
                  <div className="rounded-xl bg-[#F4F7FB] border border-slate-100 p-3">
                    <p className="text-[11px] text-slate-500">Monthly Scans</p>
                    <p className="font-mono text-lg font-bold text-[#0F172A] tabular-nums">3,324</p>
                  </div>
                  <div className="rounded-xl bg-[#F4F7FB] border border-slate-100 p-3">
                    <p className="text-[11px] text-slate-500">NFC vs QR</p>
                    <p className="font-mono text-lg font-bold text-[#004CF6] tabular-nums">42% / 58%</p>
                  </div>
                  <div className="rounded-xl bg-[#F4F7FB] border border-slate-100 p-3">
                    <p className="text-[11px] text-slate-500">Avg. Rating</p>
                    <p className="font-mono text-lg font-bold text-[#0F172A] tabular-nums">4.8 ★</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURE SECTION */}
      <section className="py-16 lg:py-24 border-b border-slate-100">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-12">
          <div className="max-w-2xl space-y-3">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] text-balance">
              {t.sections.featuresTitle}
            </h2>
            <p className="text-base text-slate-600">{t.sections.featuresSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-[#F4F7FB] p-6 space-y-3">
              <QrCode className="w-6 h-6 text-[#004CF6]" />
              <h3 className="font-display text-lg font-bold">01. QR Code Generator</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Create styled QR codes for websites, Google Reviews, WhatsApp chats, WiFi, vCard contacts, UPI payments, and multi-link pages in seconds.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
              <RefreshCw className="w-6 h-6 text-[#004CF6]" />
              <h3 className="font-display text-lg font-bold">02. Dynamic QR Codes</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Update destinations anytime from your dashboard without reprinting stands or cards.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
              <Layers className="w-6 h-6 text-[#004CF6]" />
              <h3 className="font-display text-lg font-bold">03. Multi-Link Pages</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Publish one fast mobile page with all your business buttons, menu, maps, and social links.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
              <Palette className="w-6 h-6 text-[#004CF6]" />
              <h3 className="font-display text-lg font-bold">04. QR Customization</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                12 module patterns, 16 gradients, corner eyes, frames, logos, and automatic contrast checks.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
              <BarChart3 className="w-6 h-6 text-[#004CF6]" />
              <h3 className="font-display text-lg font-bold">05. Scan Analytics</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Track scans by day, device, OS, NFC vs QR source, and city without storing visitor IPs.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
              <Wifi className="w-6 h-6 text-[#004CF6]" />
              <h3 className="font-display text-lg font-bold">06. NFC Technology</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pair TapFX Common, Master, Magic, WiFi, and Acrylic Stands directly to your live destinations.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#F4F7FB] p-6 space-y-3">
              <CreditCard className="w-6 h-6 text-[#004CF6]" />
              <h3 className="font-display text-lg font-bold">07. Digital Business Cards</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Modern contactless digital identity with one-tap contact saving and Odia/Hindi support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EMBEDDED QR GENERATOR SHOWCASE */}
      <section id="qr-studio" className="py-16 lg:py-24 bg-[#F4F7FB] border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold text-[#004CF6]">Interactive Studio</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
                Design Your Custom QR Code Live
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Test any of the 16 QR formats, customize patterns and frames, verify camera scannability, and export PNG, SVG, or print-ready PDF.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
              <button
                onClick={() => navigate('/generator?type=multi-link')}
                className="px-4 py-2 rounded-xl bg-[#004CF6] hover:bg-[#0030C0] text-white text-xs font-semibold transition-colors whitespace-nowrap"
              >
                + Multi-Linked QR Builder
              </button>
              <button
                onClick={() => navigate('/generator')}
                className="text-sm font-semibold text-[#004CF6] hover:underline whitespace-nowrap"
              >
                Open Fullscreen Studio →
              </button>
            </div>
          </div>

          <QRStudio embedded />
        </div>
      </section>

      {/* 4. MULTI-LINK PAGE SHOWCASE */}
      <section className="py-16 lg:py-24 border-b border-slate-100">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs font-semibold text-[#004CF6]">Multi-Link Profiles</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] text-balance">
              {t.sections.multiLinkTitle}
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">{t.sections.multiLinkSubtitle}</p>

            {/* Button Style Preview Switcher */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-500">Try Customizable Button Styles</span>
              <div className="inline-flex items-center gap-1.5 p-1 bg-[#F4F7FB] rounded-xl border border-slate-200">
                {[
                  { id: 'solid-blue', label: 'Royal Accent' },
                  { id: 'soft-outline', label: 'Soft Tint' },
                  { id: 'dark-slate', label: 'Dark Navy' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setButtonStyle(st.id as LinkButtonStyle)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      buttonStyle === st.id ? 'bg-white text-[#004CF6] shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => navigate('/generator?type=multi-link')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#004CF6] hover:bg-[#0030C0] text-white text-sm font-semibold transition-colors"
              >
                Add Links &amp; Generate QR
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/app/links')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-slate-200 hover:border-[#004CF6] text-sm font-semibold text-[#0F172A] transition-colors"
              >
                {t.sections.multiLinkCta}
              </button>
              <button
                onClick={() => navigate(`/${demoLinkSlug}`)}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-slate-200 hover:border-[#004CF6] text-sm font-semibold text-[#0F172A] transition-colors"
              >
                Open Live Sample Page
              </button>
            </div>
          </div>

          {/* Realistic Mobile Phone Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[340px] rounded-[34px] border-[8px] border-[#0F172A] bg-[#F4F7FB] shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#004CF6] to-[#0098FD] px-5 pt-6 pb-8 text-white text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-white text-[#004CF6] font-display font-extrabold text-xl flex items-center justify-center shadow-sm">
                  K
                </div>
                <h3 className="font-display font-bold text-lg mt-3">Kalinga Spice Bistro</h3>
                <p className="text-xs text-blue-100 mt-1">Authentic Coastal Dining · Saheed Nagar</p>
              </div>
              <div className="p-4 -mt-4 bg-[#F4F7FB] rounded-t-2xl space-y-2.5">
                {multiLinkButtons.map((btn, idx) => {
                  const Icon = btn.icon;
                  return (
                    <button
                      key={btn.label}
                      onClick={() => navigate(btn.to)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-semibold transition-transform hover:-translate-y-0.5 ${getButtonStyleClass(
                        idx
                      )}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        {btn.label}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-70" />
                    </button>
                  );
                })}
                <p className="text-center text-[11px] text-slate-400 pt-2">tapfx.com/{demoLinkSlug}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TAPFX PRODUCTS STORE */}
      <section className="py-16 lg:py-24 bg-[#F4F7FB] border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold text-[#004CF6]">TapFX Hardware Store</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
                {t.sections.productsTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-600">{t.sections.productsSubtitle}</p>
            </div>
            <button
              onClick={() => navigate('/cards')}
              className="self-start md:self-auto text-sm font-semibold text-[#004CF6] hover:underline whitespace-nowrap"
            >
              Compare All 5 Products →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col transition-transform duration-150 hover:-translate-y-0.5"
              >
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span>{prod.badge || 'NFC + QR Hardware'}</span>
                      <span className="font-mono font-bold text-base text-[#0F172A] tabular-nums">
                        ₹{prod.priceInr}
                        {prod.bundlePriceInr ? ` · 10 for ₹${prod.bundlePriceInr}` : ''}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#0F172A]">{prod.name}</h3>
                    <p className="text-sm text-slate-600">{prod.tagline}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <button
                      onClick={() => navigate(`/cards/${prod.slug}`)}
                      className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-[#004CF6] text-xs font-semibold text-[#0F172A] transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => navigate(`/order?product=${prod.slug}`)}
                      className="py-2.5 px-3 rounded-xl bg-[#004CF6] hover:bg-[#0030C0] text-xs font-semibold text-white transition-colors"
                    >
                      Customize &amp; Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section className="py-16 lg:py-20 border-b border-slate-100">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
          <div className="max-w-xl space-y-2">
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#0F172A]">
              {t.sections.howItWorksTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Four straightforward steps to launch your QR and NFC customer experience.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: '01', title: 'Create QR or Profile', desc: 'Pick a QR type, review page, or multi-link profile and enter your destination.' },
              { n: '02', title: 'Customize Branding', desc: 'Match your business colours, add your logo, and verify camera scannability.' },
              { n: '03', title: 'Connect NFC or Print', desc: 'Export 300 DPI print files or pair with TapFX NFC cards and acrylic stands.' },
              { n: '04', title: 'Track & Grow', desc: 'Monitor taps, scans, device trends, and customer reviews from one dashboard.' },
            ].map((step) => (
              <div key={step.n} className="rounded-2xl border border-slate-200 p-6 space-y-3 bg-white">
                <span className="font-mono text-sm font-bold text-[#004CF6]">{step.n}</span>
                <h3 className="font-display text-lg font-bold text-[#0F172A]">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. ANALYTICS SHOWCASE */}
      <section className="py-16 lg:py-20 bg-[#F4F7FB] border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-semibold text-[#004CF6]">Real-Time Telemetry</p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-[#0F172A]">
                {t.sections.analyticsTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                See total scans, active QR codes, top-performing counters, device OS split, and daily trends at a glance.
              </p>
            </div>
            <button
              onClick={() => navigate('/app')}
              className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-[#004CF6] text-white text-xs font-semibold hover:bg-[#0030C0]"
            >
              Explore Live Dashboard
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Scans', value: '3,324', sub: 'Last 30 days' },
                { label: 'Active QR Codes', value: '4 / 4', sub: '100% online' },
                { label: 'Top-Performing QR', value: 'Counter Stand', sub: '1,482 scans' },
                { label: 'Link Clicks', value: '1,688', sub: '51% conversion' },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-xl border border-slate-200 p-4 space-y-1">
                  <p className="text-xs text-slate-500">{kpi.label}</p>
                  <p className="font-display text-2xl font-bold text-[#0F172A] tabular-nums">{kpi.value}</p>
                  <p className="text-xs text-[#004CF6] font-medium">{kpi.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#0F172A]">14-Day Scan &amp; NFC Tap Trend</span>
                  <span className="text-xs text-slate-500">Updated live</span>
                </div>
                <div className="h-36 flex items-end gap-2 pt-4">
                  {[38, 45, 52, 41, 68, 74, 61, 82, 95, 88, 104, 98, 115, 126].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-[#004CF6] to-[#0098FD]"
                        style={{ height: `${Math.round((val / 130) * 100)}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-5 space-y-4">
                <span className="text-sm font-bold text-[#0F172A] block">Device &amp; OS Split</span>
                {[
                  { label: 'Android Smartphones', pct: 64 },
                  { label: 'iPhone (iOS)', pct: 31 },
                  { label: 'Tablets & Desktop', pct: 5 },
                ].map((d) => (
                  <div key={d.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700">{d.label}</span>
                      <span className="font-mono tabular-nums text-[#0F172A]">{d.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-[#004CF6] rounded-full" style={{ width: `${d.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. PRICING SECTION */}
      <section className="py-16 lg:py-24 border-b border-slate-100">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
              {t.sections.pricingTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Start free with static and dynamic QR codes. Upgrade anytime as your outlets and review volume grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isPro = plan.id === 'pro';
              const rows = [
                {
                  label: `${plan.maxQrCodes === -1 ? 'Unlimited' : `Up to ${plan.maxQrCodes}`} QR codes`,
                  included: true,
                },
                {
                  label: `${plan.maxScansPerMonth.toLocaleString('en-IN')} monthly scans`,
                  included: true,
                },
                {
                  label: `${plan.maxLinkPages} Multi-Link page${plan.maxLinkPages > 1 ? 's' : ''}`,
                  included: true,
                },
                {
                  label: `${plan.analyticsRetentionDays}-day analytics retention`,
                  included: true,
                },
                {
                  label: `${plan.maxGoogleProfiles} Google Business Profile${plan.maxGoogleProfiles === 1 ? '' : 's'}`,
                  included: plan.maxGoogleProfiles > 0,
                },
                {
                  label: 'Remove TapFX branding',
                  included: plan.removeBranding,
                },
                {
                  label: 'Priority WhatsApp & print-ready support',
                  included: plan.prioritySupport,
                },
              ];

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border p-7 flex flex-col justify-between space-y-6 ${
                    isPro ? 'border-[#004CF6] bg-[#F4F7FB]' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xl font-bold text-[#0F172A]">{plan.name}</h3>
                      {isPro && <span className="text-xs font-semibold text-[#004CF6]">Recommended</span>}
                    </div>
                    <p className="text-xs text-slate-600">{plan.audience}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-4xl font-extrabold tabular-nums text-[#0F172A]">
                        ₹{plan.priceInrMonthly}
                      </span>
                      <span className="text-xs text-slate-500">/ month</span>
                    </div>

                    <ul className="space-y-2.5 pt-2 border-t border-slate-200/70">
                      {rows.map((r) => (
                        <li
                          key={r.label}
                          className={`flex items-center gap-2.5 text-sm ${
                            r.included ? 'text-slate-700' : 'text-slate-400 line-through'
                          }`}
                        >
                          {r.included ? (
                            <Check className="w-4 h-4 text-[#004CF6] shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-slate-300 shrink-0" />
                          )}
                          <span>{r.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => navigate('/signup')}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isPro
                        ? 'bg-[#004CF6] hover:bg-[#0030C0] text-white'
                        : 'bg-[#0F172A] hover:bg-[#004CF6] text-white'
                    }`}
                  >
                    {plan.ctaLabel}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. 12 CUSTOMER USE CASES */}
      <section className="py-16 lg:py-20 bg-[#F4F7FB] border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#0F172A]">
              {t.sections.useCasesTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Tailored QR and NFC setups across hospitality, healthcare, retail, and independent professionals.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {USE_CASES.map((uc) => (
              <div key={uc.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2.5">
                <h3 className="font-display text-base font-bold text-[#0F172A]">{uc.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{uc.summary}</p>
                <p className="text-[11px] font-medium text-[#004CF6] pt-1">{uc.tags.join(' · ')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. DEMONSTRATION TESTIMONIALS */}
      <section className="py-16 lg:py-20 border-b border-slate-100">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
          <div className="space-y-1.5">
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#0F172A]">
              {t.sections.testimonialsTitle}
            </h2>
            <p className="text-xs text-slate-500">{t.sections.testimonialsNote}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEMO_TESTIMONIALS.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: item.rating }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{item.quote}</p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-[#F4F7FB] border border-slate-200 flex items-center justify-center font-display font-bold text-sm text-[#004CF6]">
                    {item.name.slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      {item.business} · {item.city}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. FAQ SECTION */}
      <section className="py-16 lg:py-20 bg-[#F4F7FB]">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#0F172A]">
              {t.sections.faqTitle}
            </h2>
            <p className="text-sm text-slate-600">
              Everything you need to know about TapFX QR codes, NFC hardware, and subscription plans.
            </p>
          </div>

          <div className="space-y-2.5">
            {(siteConfig?.faqs ?? []).map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div key={faq.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? '' : faq.id)}
                    className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left font-display font-semibold text-sm sm:text-base text-[#0F172A]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-[#004CF6]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{faq.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
