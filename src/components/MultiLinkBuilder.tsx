import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  Plus,
  QrCode,
  Save,
  Share2,
  Trash2,
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { NETWORK_LIBRARY } from '../lib/qrPresets';
import { useApp } from '../context/AppContext';
import type { LanguageCode, LinkBlock, LinkButtonStyle, LinkPageRecord, LinkPageTheme } from '../types/tapfx';

interface MultiLinkBuilderProps {
  initialPage?: LinkPageRecord | null;
  onSaved?: (page: LinkPageRecord) => void;
}

const DEFAULT_PAGE: LinkPageRecord = {
  id: '',
  businessId: '',
  slug: 'my-business',
  name: 'My TapFX Business',
  headline: 'One Link. All Services & Reviews.',
  description: 'Tap any button below to connect, order on WhatsApp, or share a Google review.',
  language: 'en',
  passwordProtected: false,
  blocks: [
    { id: 'b-1', network: 'google-review', label: 'Review Us on Google', url: '/r/kalinga-review', enabled: true, clicks: 0 },
    { id: 'b-2', network: 'whatsapp', label: 'Chat on WhatsApp', url: 'https://wa.me/919692299405', enabled: true, clicks: 0 },
    { id: 'b-3', network: 'website', label: 'Visit Website', url: 'https://tapfx.com', enabled: true, clicks: 0 },
  ],
  theme: {
    bgColor: '#F4F7FB',
    cardBg: '#FFFFFF',
    accentColor: '#004CF6',
    textColor: '#0F172A',
    fontId: 'sans',
    buttonStyle: 'solid-blue',
  },
  viewsCount: 0,
  published: true,
  updatedAt: new Date().toISOString(),
};

export function MultiLinkBuilder({ initialPage, onSaved }: MultiLinkBuilderProps) {
  const { user, navigate, showToast } = useApp();
  const [page, setPage] = useState<LinkPageRecord>(initialPage ?? DEFAULT_PAGE);
  const [slugStatus, setSlugStatus] = useState<{ available: boolean; reason: string } | null>(null);
  const [networkPickerOpen, setNetworkPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const claim = new URLSearchParams(window.location.search).get('claim');
    if (claim && !initialPage) {
      setPage((prev) => ({ ...prev, slug: claim }));
    } else if (initialPage) {
      setPage(initialPage);
    }
  }, [initialPage]);

  useEffect(() => {
    if (!page.slug) return;
    const timer = window.setTimeout(() => {
      apiFetch<{ available: boolean; reason: string }>(
        `/api/link-pages/check-slug?slug=${encodeURIComponent(page.slug)}&excludeId=${encodeURIComponent(page.id)}`
      )
        .then(setSlugStatus)
        .catch(() => undefined);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [page.slug, page.id]);

  const addBlockFromNetwork = (netId: string) => {
    const net = NETWORK_LIBRARY.find((n) => n.id === netId) || NETWORK_LIBRARY[0];
    const newBlock: LinkBlock = {
      id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      network: net.id,
      label: net.label,
      url: net.placeholderUrl,
      enabled: true,
      clicks: 0,
    };
    setPage((prev) => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
    setNetworkPickerOpen(false);
  };

  const moveBlock = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= page.blocks.length) return;
    const copy = [...page.blocks];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setPage((prev) => ({ ...prev, blocks: copy }));
  };

  const updateBlock = (id: string, patch: Partial<LinkBlock>) => {
    setPage((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  };

  const deleteBlock = (id: string) => {
    setPage((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.id !== id),
    }));
  };

  const handleSave = async (publishNow?: boolean) => {
    if (!user) {
      showToast('Please sign in to save and publish your Multi-Link page.', 'info');
      navigate('/login');
      return;
    }
    setSaving(true);
    try {
      const payload = publishNow !== undefined ? { ...page, published: publishNow } : page;
      const res = await apiFetch<{ page: LinkPageRecord }>('/api/link-pages', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setPage(res.page);
      onSaved?.(res.page);
      showToast(payload.published ? `Published at /${res.page.slug}` : 'Draft saved', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/${page.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast(`Copied ${url}`, 'success');
    } catch {
      showToast(url, 'info');
    }
  };

  const fontClass = {
    sans: 'font-tapfx-sans',
    manrope: 'font-tapfx-manrope',
    oria: 'font-tapfx-oria',
    devanagari: 'font-tapfx-devanagari',
    mono: 'font-tapfx-mono',
    classic: 'font-tapfx-classic',
  }[page.theme.fontId];

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200 p-4">
        <div>
          <h2 className="font-display text-lg font-bold text-[#0F172A]">Multi-Link Page Builder</h2>
          <p className="text-xs text-slate-500 font-mono">tapfx.com/{page.slug}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Link
          </button>
          <button
            type="button"
            onClick={() => navigate('/generator?type=multi-link')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <QrCode className="w-3.5 h-3.5" />
            QR Code
          </button>
          <button
            type="button"
            onClick={() => navigate(`/${page.slug}`)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Live
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004CF6] hover:bg-[#0030C0] text-white text-xs font-semibold"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save & Publish'}
          </button>
        </div>
      </div>

      {/* Main Split Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Editor Panel */}
        <div className="lg:col-span-7 space-y-6">
          {/* Profile & Slug */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
            <h3 className="font-display text-base font-bold text-[#0F172A]">Profile &amp; Claim Link</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Public Slug</label>
                <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden">
                  <span className="px-2.5 py-2 bg-[#F4F7FB] text-xs font-mono text-slate-500 border-r border-slate-200">
                    tapfx.com/
                  </span>
                  <input
                    type="text"
                    value={page.slug}
                    onChange={(e) =>
                      setPage((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))
                    }
                    className="flex-1 px-2.5 py-2 text-xs font-mono focus:outline-none"
                  />
                </div>
                {slugStatus && (
                  <p className={`text-[11px] mt-1 font-medium ${slugStatus.available ? 'text-emerald-700' : 'text-red-600'}`}>
                    {slugStatus.reason}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Page Language</label>
                <select
                  value={page.language}
                  onChange={(e) => setPage((p) => ({ ...p, language: e.target.value as LanguageCode }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
                >
                  <option value="en">English</option>
                  <option value="od">Odia (ଓଡ଼ିଆ)</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name</label>
                <input
                  type="text"
                  value={page.name}
                  onChange={(e) => setPage((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headline</label>
                <input
                  type="text"
                  value={page.headline}
                  onChange={(e) => setPage((p) => ({ ...p, headline: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={page.description}
                onChange={(e) => setPage((p) => ({ ...p, description: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
              />
            </div>

            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={page.passwordProtected}
                onChange={(e) => setPage((p) => ({ ...p, passwordProtected: e.target.checked }))}
                className="rounded border-slate-300 text-[#004CF6]"
              />
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Require passcode before viewing page
            </label>
          </div>

          {/* Link Blocks Manager */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#0F172A]">Link Buttons ({page.blocks.length})</h3>
              <button
                type="button"
                onClick={() => setNetworkPickerOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#004CF6] text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Link (38 Networks)
              </button>
            </div>

            {networkPickerOpen && (
              <div className="rounded-xl border border-blue-200 bg-[#F4F7FB] p-4 space-y-3">
                <p className="text-xs font-semibold text-[#0F172A]">Choose a network to add:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-1">
                  {NETWORK_LIBRARY.map((net) => (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() => addBlockFromNetwork(net.id)}
                      className="p-2 rounded-lg border border-slate-200 bg-white hover:border-[#004CF6] text-left text-xs font-semibold text-[#0F172A]"
                    >
                      {net.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {page.blocks.map((blk, idx) => (
                <div key={blk.id} className="rounded-xl border border-slate-200 p-3.5 space-y-2.5 bg-[#F4F7FB]/50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-semibold text-[#004CF6]">{blk.network}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveBlock(idx, -1)}
                        className="p-1.5 rounded-lg hover:bg-white text-slate-500"
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(idx, 1)}
                        className="p-1.5 rounded-lg hover:bg-white text-slate-500"
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateBlock(blk.id, { enabled: !blk.enabled })}
                        className="p-1.5 rounded-lg hover:bg-white text-slate-500"
                        title="Toggle visibility"
                      >
                        {blk.enabled ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteBlock(blk.id)}
                        className="p-1.5 rounded-lg hover:bg-white text-red-500"
                        title="Delete link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={blk.label}
                      onChange={(e) => updateBlock(blk.id, { label: e.target.value })}
                      placeholder="Button label"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold"
                    />
                    <input
                      type="text"
                      value={blk.url}
                      onChange={(e) => updateBlock(blk.id, { url: e.target.value })}
                      placeholder="https://..."
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Theme, Fonts & Button Style */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
            <h3 className="font-display text-base font-bold text-[#0F172A]">Theme, Fonts (Odia &amp; Hindi Ready) &amp; Buttons</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Typography (6 Fonts)</label>
                <select
                  value={page.theme.fontId}
                  onChange={(e) =>
                    setPage((p) => ({
                      ...p,
                      theme: { ...p.theme, fontId: e.target.value as LinkPageTheme['fontId'] },
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
                >
                  <option value="sans">Plus Jakarta Sans (Modern)</option>
                  <option value="manrope">Manrope (Clean UI)</option>
                  <option value="oria">Noto Sans Oriya (ଓଡ଼ିଆ)</option>
                  <option value="devanagari">Noto Sans Devanagari (हिन्दी)</option>
                  <option value="mono">JetBrains Mono (Technical)</option>
                  <option value="classic">Editorial Serif</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Button Style</label>
                <select
                  value={page.theme.buttonStyle}
                  onChange={(e) =>
                    setPage((p) => ({
                      ...p,
                      theme: { ...p.theme, buttonStyle: e.target.value as LinkButtonStyle },
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
                >
                  <option value="solid-blue">Solid Royal Blue Primary</option>
                  <option value="soft-outline">Clean White Cards</option>
                  <option value="dark-slate">Executive Dark Navy</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Background</label>
                <input
                  type="color"
                  value={page.theme.bgColor}
                  onChange={(e) => setPage((p) => ({ ...p, theme: { ...p.theme, bgColor: e.target.value } }))}
                  className="h-9 w-full rounded-lg border border-slate-200 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Accent</label>
                <input
                  type="color"
                  value={page.theme.accentColor}
                  onChange={(e) => setPage((p) => ({ ...p, theme: { ...p.theme, accentColor: e.target.value } }))}
                  className="h-9 w-full rounded-lg border border-slate-200 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Text</label>
                <input
                  type="color"
                  value={page.theme.textColor}
                  onChange={(e) => setPage((p) => ({ ...p, theme: { ...p.theme, textColor: e.target.value } }))}
                  className="h-9 w-full rounded-lg border border-slate-200 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Live Mobile Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 flex justify-center">
          <div
            className={`w-full max-w-[340px] rounded-[34px] border-[8px] border-[#0F172A] shadow-xl overflow-hidden ${fontClass}`}
            style={{ backgroundColor: page.theme.bgColor, color: page.theme.textColor }}
          >
            <div className="p-6 space-y-5 min-h-[540px]">
              <div
                className="rounded-2xl border border-slate-200/70 p-5 text-center space-y-2"
                style={{ backgroundColor: page.theme.cardBg }}
              >
                <div
                  className="w-14 h-14 mx-auto rounded-2xl text-white font-bold text-xl flex items-center justify-center"
                  style={{ backgroundColor: page.theme.accentColor }}
                >
                  {(page.name || 'T').slice(0, 1).toUpperCase()}
                </div>
                <h4 className="font-bold text-lg">{page.name}</h4>
                <p className="text-xs opacity-75">{page.headline}</p>
                <p className="text-xs opacity-70">{page.description}</p>
              </div>

              <div className="space-y-2.5">
                {page.blocks
                  .filter((b) => b.enabled)
                  .map((blk, i) => {
                    const isPrimary = i === 0 && page.theme.buttonStyle === 'solid-blue';
                    return (
                      <div
                        key={blk.id}
                        className="w-full px-4 py-3 rounded-xl border text-xs font-semibold flex items-center justify-between"
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
                        <span className="truncate">{blk.label}</span>
                        <Check className="w-3.5 h-3.5 opacity-60 shrink-0" />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
