import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  Printer,
  Save,
  ShieldCheck,
  Upload,
  Eye,
  ArrowLeft,
  ArrowRight,
  Lock,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Layers,
  Link2,
} from 'lucide-react';
import {
  CORNER_DOT_STYLES,
  CORNER_FRAME_STYLES,
  DEFAULT_QR_DESIGN,
  LOGO_PRESETS,
  NETWORK_LIBRARY,
  QR_FRAMES_META,
  QR_GRADIENTS,
  QR_PATTERNS_META,
  QR_TYPES_META,
} from '../lib/qrPresets';
import {
  buildQRPayload,
  buildStyledQRSvg,
  downloadPdfFile,
  downloadPngFile,
  downloadSvgFile,
  evaluateScannability,
} from '../lib/qrRenderer';
import { apiFetch } from '../lib/api';
import { useApp } from '../context/AppContext';
import type { FolderRecord, LinkPageRecord, QRCodeRecord, QRDesignConfig, QRType } from '../types/tapfx';

interface MultiLinkDraftItem {
  id: string;
  network: string;
  label: string;
  url: string;
}

interface QRStudioProps {
  embedded?: boolean;
  folders?: FolderRecord[];
  initialQr?: QRCodeRecord | null;
  initialType?: QRType;
  onSaved?: (qr: QRCodeRecord) => void;
}

const DEFAULT_FIELDS: Record<QRType, Record<string, string>> = {
  website: { url: 'https://tapfx.com' },
  'google-review': { placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4', url: '' },
  whatsapp: { phone: '919692299405', message: 'Hi! I would like to place an order.' },
  instagram: { handle: 'tap.fx' },
  facebook: { handle: 'tapfxqr' },
  youtube: { handle: '@tapfxqr' },
  linkedin: { handle: 'company/tapfx' },
  telegram: { handle: 'tapfxqr' },
  wifi: { ssid: 'TapFX_Guest_5G', password: 'Welcome2026', encryption: 'WPA' },
  phone: { phone: '+919692299405' },
  email: { email: 'tapfxx@gmail.com', subject: 'Hello TapFX', body: '' },
  text: { text: 'Welcome to our store! Ask at the counter for today’s specials.' },
  location: { lat: '20.2961', lng: '85.8245', url: '' },
  vcard: { fullName: 'Aarav Patnaik', org: 'Kalinga Spice Bistro', phone: '+91 96922 99405', email: 'owner@tapfx.com', url: 'https://tapfx.com' },
  payment: { upiId: 'tapfx@upi', payeeName: 'TapFX Merchant', amount: '' },
  'multi-link': { slug: 'kalinga-bistro' },
};

const DEFAULT_MULTI_LINKS: MultiLinkDraftItem[] = [
  { id: 'ml-1', network: 'website', label: 'Visit Official Website', url: 'https://tapfx.com' },
  { id: 'ml-2', network: 'whatsapp', label: 'Chat on WhatsApp', url: 'https://wa.me/919692299405' },
  {
    id: 'ml-3',
    network: 'google-review',
    label: 'Review Us on Google',
    url: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
  },
];

const QUICK_MULTI_NETS = [
  'website',
  'google-review',
  'whatsapp',
  'instagram',
  'youtube',
  'menu',
  'maps',
  'phone',
  'custom',
];

function parseInitialMultiLinks(initialQr: QRCodeRecord | null): MultiLinkDraftItem[] {
  const raw = initialQr?.contentFields?.linksJson;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as MultiLinkDraftItem[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // fallback to defaults
    }
  }
  return DEFAULT_MULTI_LINKS;
}

export function QRStudio({
  embedded = false,
  folders = [],
  initialQr = null,
  initialType,
  onSaved,
}: QRStudioProps) {
  const { user, route, navigate, showToast } = useApp();
  const queryType = useMemo(() => {
    const qIndex = route.indexOf('?');
    if (qIndex === -1) return null;
    const t = new URLSearchParams(route.slice(qIndex + 1)).get('type');
    return QR_TYPES_META.some((m) => m.id === t) ? (t as QRType) : null;
  }, [route]);

  const resolvedStartType: QRType = initialQr?.type ?? initialType ?? queryType ?? 'website';
  const [step, setStep] = useState<1 | 2 | 3>(initialQr || initialType || queryType ? 2 : 1);
  const [designTab, setDesignTab] = useState<'frame' | 'pattern' | 'colours' | 'corners' | 'logo'>('pattern');

  const [qrName, setQrName] = useState(
    initialQr?.name ?? (resolvedStartType === 'multi-link' ? 'My Multi-Linked QR' : 'My TapFX QR')
  );
  const [qrType, setQrType] = useState<QRType>(resolvedStartType);
  const [isDynamic, setIsDynamic] = useState<boolean>(initialQr?.isDynamic ?? true);
  const [fields, setFields] = useState<Record<string, string>>(
    initialQr?.contentFields && Object.keys(initialQr.contentFields).length > 0
      ? initialQr.contentFields
      : DEFAULT_FIELDS[resolvedStartType]
  );

  // Multi-Linked QR specific builder state
  const [multiTitle, setMultiTitle] = useState(initialQr?.contentFields?.pageTitle ?? 'My Business Links');
  const [multiLinks, setMultiLinks] = useState<MultiLinkDraftItem[]>(() => parseInitialMultiLinks(initialQr));
  const [multiGenerating, setMultiGenerating] = useState(false);
  const [multiPublishedSlug, setMultiPublishedSlug] = useState<string | null>(null);

  const [design, setDesign] = useState<QRDesignConfig>(initialQr?.design ?? DEFAULT_QR_DESIGN);
  const [folderId, setFolderId] = useState<string>(initialQr?.folderId ?? '');
  const [outletTag, setOutletTag] = useState<string>(initialQr?.outletTag ?? '');
  const [passwordProtected, setPasswordProtected] = useState<boolean>(initialQr?.passwordProtected ?? false);
  const [pdfSize, setPdfSize] = useState<'5cm' | '10cm' | 'a5'>('10cm');
  const [saving, setSaving] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  useEffect(() => {
    if (!initialQr && queryType && queryType !== qrType) {
      setQrType(queryType);
      setFields(DEFAULT_FIELDS[queryType]);
      setIsDynamic(queryType !== 'text' && queryType !== 'wifi');
      if (queryType === 'multi-link') {
        setQrName('My Multi-Linked QR');
      }
      setStep(2);
    }
  }, [queryType, initialQr, qrType]);

  const handleSelectType = (nextType: QRType) => {
    setQrType(nextType);
    setFields(DEFAULT_FIELDS[nextType]);
    setMultiPublishedSlug(null);
    if (nextType === 'multi-link' && qrName === 'My TapFX QR') {
      setQrName('My Multi-Linked QR');
    }
    if (nextType === 'text' || nextType === 'wifi') {
      setIsDynamic(false);
    } else {
      setIsDynamic(true);
    }
    setStep(2);
  };

  const updateField = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const addMultiLinkRow = (networkId = 'custom') => {
    const net = NETWORK_LIBRARY.find((n) => n.id === networkId);
    setMultiLinks((prev) => [
      ...prev,
      {
        id: `ml-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        network: net ? net.id : 'custom',
        label: net ? net.label : 'Custom Link',
        url: net ? net.placeholderUrl : 'https://',
      },
    ]);
    setMultiPublishedSlug(null);
  };

  const updateMultiLinkRow = (id: string, patch: Partial<MultiLinkDraftItem>) => {
    setMultiLinks((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    setMultiPublishedSlug(null);
  };

  const moveMultiLinkRow = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= multiLinks.length) return;
    const copy = [...multiLinks];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    setMultiLinks(copy);
    setMultiPublishedSlug(null);
  };

  const removeMultiLinkRow = (id: string) => {
    setMultiLinks((prev) => prev.filter((item) => item.id !== id));
    setMultiPublishedSlug(null);
  };

  const publishMultiLinkPage = async (): Promise<string | null> => {
    const validLinks = multiLinks.filter((l) => l.label.trim() && l.url.trim());
    if (validLinks.length === 0) {
      showToast('Please add at least one link with a label and URL.', 'error');
      return null;
    }
    setMultiGenerating(true);
    try {
      const requestedSlug = (fields.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      const res = await apiFetch<{ page: LinkPageRecord }>('/api/public/multi-link-qr', {
        method: 'POST',
        body: JSON.stringify({
          title: multiTitle.trim() || qrName.trim() || 'My TapFX Links',
          headline: `${validLinks.length} connected links`,
          slug: requestedSlug === 'kalinga-bistro' ? '' : requestedSlug,
          blocks: validLinks,
        }),
      });
      setFields((prev) => ({
        ...prev,
        slug: res.page.slug,
        pageTitle: res.page.name,
        linksJson: JSON.stringify(validLinks),
      }));
      setMultiPublishedSlug(res.page.slug);
      showToast(`Multi-Linked QR ready at /${res.page.slug} (${validLinks.length} links)!`, 'success');
      return res.page.slug;
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to generate multi-link page', 'error');
      return null;
    } finally {
      setMultiGenerating(false);
    }
  };

  const hasValidInput = useMemo(() => {
    if (qrType === 'website') return Boolean(fields.url?.trim());
    if (qrType === 'google-review') return Boolean(fields.placeId?.trim() || fields.url?.trim());
    if (qrType === 'whatsapp' || qrType === 'phone') return Boolean(fields.phone?.trim());
    if (qrType === 'wifi') return Boolean(fields.ssid?.trim());
    if (qrType === 'email') return Boolean(fields.email?.trim());
    if (qrType === 'text') return Boolean(fields.text?.trim());
    if (qrType === 'payment') return Boolean(fields.upiId?.trim());
    if (qrType === 'multi-link') return multiLinks.some((l) => l.label.trim() && l.url.trim());
    if (qrType === 'vcard') return Boolean(fields.fullName?.trim());
    if (qrType === 'location') return Boolean((fields.lat?.trim() && fields.lng?.trim()) || fields.url?.trim());
    return Boolean(fields.handle?.trim());
  }, [qrType, fields, multiLinks]);

  const payload = useMemo(() => buildQRPayload(qrType, fields), [qrType, fields]);

  const svgMarkup = useMemo(() => buildStyledQRSvg(payload, design, 320), [payload, design]);
  const scannability = useMemo(() => evaluateScannability(design), [design]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      showToast('Logo image must be 1 MB or smaller.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDesign((prev) => ({
          ...prev,
          logoDataUrl: reader.result as string,
          logoPreset: 'none',
          errorCorrection: 'H',
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) {
      showToast('Sign in to save dynamic QR codes and view scan analytics.', 'info');
      navigate('/login');
      return;
    }
    if (!hasValidInput) {
      showToast('Please enter valid content for your QR code first.', 'error');
      return;
    }
    setSaving(true);
    try {
      let finalPayload = payload;
      let finalFields = fields;

      if (qrType === 'multi-link') {
        const syncedSlug = multiPublishedSlug ?? (await publishMultiLinkPage());
        if (!syncedSlug) {
          setSaving(false);
          return;
        }
        finalFields = {
          ...fields,
          slug: syncedSlug,
          pageTitle: multiTitle,
          linksJson: JSON.stringify(multiLinks),
        };
        finalPayload = buildQRPayload('multi-link', finalFields);
      }

      if (initialQr?.id) {
        const res = await apiFetch<{ qr: QRCodeRecord }>(`/api/qrs/${initialQr.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: qrName,
            destinationUrl: finalPayload,
            folderId: folderId || null,
            outletTag: outletTag || undefined,
            passwordProtected,
            design,
          }),
        });
        showToast('QR code updated.', 'success');
        onSaved?.(res.qr);
      } else {
        const res = await apiFetch<{ qr: QRCodeRecord }>('/api/qrs', {
          method: 'POST',
          body: JSON.stringify({
            name: qrName,
            type: qrType,
            isDynamic,
            destinationUrl: finalPayload,
            contentFields: finalFields,
            design,
            folderId: folderId || null,
            outletTag: outletTag || undefined,
            passwordProtected,
          }),
        });
        showToast('QR code saved to My QR Codes.', 'success');
        onSaved?.(res.qr);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save QR code', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=540,height=640');
    if (!win) {
      window.print();
      return;
    }
    win.document.write(
      `<!doctype html><html><head><title>${qrName}</title><style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;margin:0;padding:24px;}h2{margin:0 0 16px;font-size:18px;}</style></head><body><h2>${qrName}</h2>${svgMarkup}<p style="color:#64748b;font-size:12px;margin-top:16px;">TapFX · tapfx.com</p><script>window.onload=function(){window.print();}</script></body></html>`
    );
    win.document.close();
  };

  return (
    <div className="w-full">
      {/* Top Wizard Action Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          {[
            { num: 1, label: '1. Select Type' },
            { num: 2, label: '2. Content' },
            { num: 3, label: '3. Design & Export' },
          ].map((item) => (
            <button
              key={item.num}
              type="button"
              onClick={() => setStep(item.num as 1 | 2 | 3)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                step === item.num
                  ? 'bg-[#004CF6] text-white'
                  : 'bg-[#F4F7FB] text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          )}
          <button
            type="button"
            onClick={() => setPreviewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasValidInput}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004CF6] hover:bg-[#0030C0] disabled:opacity-50 text-xs font-semibold text-white transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : user ? 'Save QR' : 'Save (Login)'}
          </button>
        </div>
      </div>

      {/* Main Split Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Config Panel */}
        <div className="lg:col-span-7 space-y-6">
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#0F172A]">Choose QR Code Type</h3>
                  <p className="text-sm text-slate-500">All 16 formats supported — dynamic short-links or static.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F4F7FB] text-[#004CF6] text-xs font-semibold hover:bg-blue-50"
                >
                  Next: Content
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {QR_TYPES_META.map((item) => {
                  const active = qrType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectType(item.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        active
                          ? 'border-[#004CF6] bg-blue-50/60 ring-1 ring-[#004CF6]'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <p className={`text-xs font-bold ${active ? 'text-[#004CF6]' : 'text-[#0F172A]'}`}>{item.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{item.hint}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#0F172A]">
                    Enter {QR_TYPES_META.find((t) => t.id === qrType)?.label} Details
                  </h3>
                  <p className="text-sm text-slate-500">Live preview updates automatically as you type.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#004CF6] text-white text-xs font-semibold hover:bg-[#0030C0]"
                >
                  Customize Design
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">QR Code Name</label>
                  <input
                    type="text"
                    value={qrName}
                    onChange={(e) => setQrName(e.target.value)}
                    placeholder="e.g. Main Counter Review Stand"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004CF6] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Table / Outlet Tag (Optional)</label>
                  <input
                    type="text"
                    value={outletTag}
                    onChange={(e) => setOutletTag(e.target.value)}
                    placeholder="e.g. Table 4 or Main Branch"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004CF6] focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Content Form by Type */}
              {qrType === 'website' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Destination URL</label>
                  <input
                    type="url"
                    value={fields.url || ''}
                    onChange={(e) => updateField('url', e.target.value)}
                    placeholder="https://yourbusiness.com"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004CF6] focus:outline-none"
                  />
                </div>
              )}

              {qrType === 'google-review' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Google Place ID</label>
                    <input
                      type="text"
                      value={fields.placeId || ''}
                      onChange={(e) => updateField('placeId', e.target.value)}
                      placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono focus:border-[#004CF6] focus:outline-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Generates direct link: <span className="font-mono">search.google.com/local/writereview?placeid=...</span>
                    </p>
                  </div>
                </div>
              )}

              {qrType === 'whatsapp' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">WhatsApp Number (with country code)</label>
                    <input
                      type="text"
                      value={fields.phone || ''}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="919692299405"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004CF6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Prefilled Message</label>
                    <input
                      type="text"
                      value={fields.message || ''}
                      onChange={(e) => updateField('message', e.target.value)}
                      placeholder="Hi! I scanned your QR code."
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004CF6] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {['instagram', 'facebook', 'youtube', 'linkedin', 'telegram'].includes(qrType) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Profile Username or Full URL</label>
                  <input
                    type="text"
                    value={fields.handle || ''}
                    onChange={(e) => updateField('handle', e.target.value)}
                    placeholder="@yourhandle or https://..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004CF6] focus:outline-none"
                  />
                </div>
              )}

              {qrType === 'wifi' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Network Name (SSID)</label>
                    <input
                      type="text"
                      value={fields.ssid || ''}
                      onChange={(e) => updateField('ssid', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004CF6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">WiFi Password</label>
                    <input
                      type="text"
                      value={fields.password || ''}
                      onChange={(e) => updateField('password', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004CF6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Security</label>
                    <select
                      value={fields.encryption || 'WPA'}
                      onChange={(e) => updateField('encryption', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white focus:border-[#004CF6] focus:outline-none"
                    >
                      <option value="WPA">WPA / WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">Open Network</option>
                    </select>
                  </div>
                </div>
              )}

              {qrType === 'phone' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={fields.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+91 96922 99405"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004CF6] focus:outline-none"
                  />
                </div>
              )}

              {qrType === 'email' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Recipient Email</label>
                    <input
                      type="email"
                      value={fields.email || ''}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004CF6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subject Line</label>
                    <input
                      type="text"
                      value={fields.subject || ''}
                      onChange={(e) => updateField('subject', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004CF6] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {qrType === 'text' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Text Content</label>
                  <textarea
                    rows={3}
                    value={fields.text || ''}
                    onChange={(e) => updateField('text', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004CF6] focus:outline-none"
                  />
                </div>
              )}

              {qrType === 'location' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Latitude</label>
                    <input
                      type="text"
                      value={fields.lat || ''}
                      onChange={(e) => updateField('lat', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono focus:border-[#004CF6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Longitude</label>
                    <input
                      type="text"
                      value={fields.lng || ''}
                      onChange={(e) => updateField('lng', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono focus:border-[#004CF6] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {qrType === 'vcard' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={fields.fullName || ''}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004CF6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Business / Role</label>
                    <input
                      type="text"
                      value={fields.org || ''}
                      onChange={(e) => updateField('org', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004CF6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone</label>
                    <input
                      type="text"
                      value={fields.phone || ''}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004CF6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={fields.email || ''}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004CF6] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {qrType === 'payment' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">UPI ID (VPA)</label>
                    <input
                      type="text"
                      value={fields.upiId || ''}
                      onChange={(e) => updateField('upiId', e.target.value)}
                      placeholder="merchant@upi"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004CF6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Payee Name</label>
                    <input
                      type="text"
                      value={fields.payeeName || ''}
                      onChange={(e) => updateField('payeeName', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004CF6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fixed Amount ₹ (Optional)</label>
                    <input
                      type="number"
                      value={fields.amount || ''}
                      onChange={(e) => updateField('amount', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004CF6] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {qrType === 'multi-link' && (
                <div className="space-y-4 rounded-2xl border border-blue-200 bg-[#F4F7FB]/70 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#004CF6]" />
                      <h4 className="font-display text-sm font-bold text-[#0F172A]">
                        Multi-Linked QR Code Builder ({multiLinks.length} links)
                      </h4>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">
                      One QR code opens all your added links
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Page Title / Business Name</label>
                      <input
                        type="text"
                        value={multiTitle}
                        onChange={(e) => {
                          setMultiTitle(e.target.value);
                          setMultiPublishedSlug(null);
                        }}
                        placeholder="e.g. Kalinga Spice Bistro"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#004CF6] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Custom Link Slug (Optional)
                      </label>
                      <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden">
                        <span className="px-2.5 py-2 bg-[#F4F7FB] text-xs font-mono text-slate-500 border-r border-slate-200">
                          tapfx.com/
                        </span>
                        <input
                          type="text"
                          value={fields.slug || ''}
                          onChange={(e) => {
                            updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                            setMultiPublishedSlug(null);
                          }}
                          placeholder="auto-generated"
                          className="flex-1 min-w-0 px-2.5 py-2 text-xs font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick-Add Platform Chips */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-slate-600">Quick-Add a Link:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_MULTI_NETS.map((netId) => {
                        const meta = NETWORK_LIBRARY.find((n) => n.id === netId);
                        return (
                          <button
                            key={netId}
                            type="button"
                            onClick={() => addMultiLinkRow(netId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:border-[#004CF6] hover:text-[#004CF6] text-[11px] font-semibold text-slate-700 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            {meta ? meta.label : 'Custom URL'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Editable Links List */}
                  <div className="space-y-2.5">
                    {multiLinks.map((item, idx) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[11px] font-mono font-bold text-slate-400">#{idx + 1}</span>
                            <select
                              value={item.network}
                              onChange={(e) => {
                                const net = NETWORK_LIBRARY.find((n) => n.id === e.target.value);
                                updateMultiLinkRow(item.id, {
                                  network: e.target.value,
                                  label: item.label || net?.label || 'Link',
                                });
                              }}
                              className="rounded-lg border border-slate-200 bg-[#F4F7FB] px-2 py-1 text-xs font-semibold text-[#0F172A] focus:outline-none"
                            >
                              {NETWORK_LIBRARY.map((net) => (
                                <option key={net.id} value={net.id}>
                                  {net.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveMultiLinkRow(idx, -1)}
                              disabled={idx === 0}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30"
                              title="Move up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveMultiLinkRow(idx, 1)}
                              disabled={idx === multiLinks.length - 1}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30"
                              title="Move down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeMultiLinkRow(item.id)}
                              disabled={multiLinks.length <= 1}
                              className="p-1 rounded-lg hover:bg-red-50 text-red-500 disabled:opacity-30"
                              title="Remove link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => updateMultiLinkRow(item.id, { label: e.target.value })}
                            placeholder="Button Label (e.g. Our Menu)"
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold focus:border-[#004CF6] focus:outline-none"
                          />
                          <input
                            type="text"
                            value={item.url}
                            onChange={(e) => updateMultiLinkRow(item.id, { url: e.target.value })}
                            placeholder="https://..."
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono focus:border-[#004CF6] focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add + Generate Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => addMultiLinkRow('custom')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:border-[#004CF6] text-xs font-semibold text-[#0F172A] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#004CF6]" />
                      Add Another Link
                    </button>

                    <button
                      type="button"
                      disabled={multiGenerating || !hasValidInput}
                      onClick={() => void publishMultiLinkPage()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004CF6] hover:bg-[#0030C0] disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      {multiGenerating ? 'Generating QR...' : 'Generate Multi-Linked QR'}
                    </button>
                  </div>

                  {multiPublishedSlug && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900">
                      <span className="font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        Live Multi-Link QR created: <span className="font-mono">/{multiPublishedSlug}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/${multiPublishedSlug}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 font-semibold hover:bg-emerald-100/50"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Test Page
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="px-2.5 py-1 rounded-lg bg-[#004CF6] text-white font-semibold"
                        >
                          Style &amp; Download →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dynamic, Folder & Password Options */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDynamic}
                    onChange={(e) => setIsDynamic(e.target.checked)}
                    className="rounded border-slate-300 text-[#004CF6] focus:ring-[#004CF6]"
                  />
                  Dynamic Short-Link (/q/code)
                </label>

                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={passwordProtected}
                    onChange={(e) => setPasswordProtected(e.target.checked)}
                    className="rounded border-slate-300 text-[#004CF6] focus:ring-[#004CF6]"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Password Protection
                </label>

                {folders.length > 0 && (
                  <select
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-[#004CF6] focus:outline-none"
                  >
                    <option value="">No Folder</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        Folder: {f.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
              {/* 5 Design Sub-Tabs: Frame, Pattern, Colours, Corners, Logo */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F4F7FB] rounded-xl">
                {[
                  { id: 'frame', label: 'Frames' },
                  { id: 'pattern', label: 'QR Style' },
                  { id: 'colours', label: 'Colours' },
                  { id: 'corners', label: 'Corners' },
                  { id: 'logo', label: 'Logo & Error Level' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDesignTab(tab.id as typeof designTab)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      designTab === tab.id ? 'bg-white text-[#004CF6] shadow-sm' : 'text-slate-600 hover:text-[#0F172A]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {designTab === 'frame' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {QR_FRAMES_META.map((fr) => (
                      <button
                        key={fr.id}
                        type="button"
                        onClick={() =>
                          setDesign((prev) => ({
                            ...prev,
                            frameStyle: fr.id,
                            frameText: fr.defaultText || prev.frameText,
                          }))
                        }
                        className={`p-3 rounded-xl border text-left transition-all ${
                          design.frameStyle === fr.id
                            ? 'border-[#004CF6] bg-blue-50/50 ring-1 ring-[#004CF6]'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <p className="text-xs font-bold text-[#0F172A]">{fr.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{fr.industry}</p>
                      </button>
                    ))}
                  </div>

                  {design.frameStyle !== 'none' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Frame Call-to-Action Text</label>
                        <input
                          type="text"
                          value={design.frameText}
                          onChange={(e) => setDesign((prev) => ({ ...prev, frameText: e.target.value }))}
                          maxLength={26}
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-[#004CF6] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Frame Accent Colour</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={design.frameColor}
                            onChange={(e) => setDesign((prev) => ({ ...prev, frameColor: e.target.value }))}
                            className="h-9 w-12 rounded-lg border border-slate-200 cursor-pointer"
                          />
                          <span className="text-xs font-mono text-slate-600">{design.frameColor}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {designTab === 'pattern' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {QR_PATTERNS_META.map((pat) => (
                    <button
                      key={pat.id}
                      type="button"
                      onClick={() => setDesign((prev) => ({ ...prev, pattern: pat.id }))}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        design.pattern === pat.id
                          ? 'border-[#004CF6] bg-blue-50/50 ring-1 ring-[#004CF6]'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-xs font-bold text-[#0F172A]">{pat.label}</p>
                    </button>
                  ))}
                </div>
              )}

              {designTab === 'colours' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={design.useGradient}
                        onChange={(e) => setDesign((prev) => ({ ...prev, useGradient: e.target.checked }))}
                        className="rounded border-slate-300 text-[#004CF6]"
                      />
                      Use Gradient Fill
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={design.transparentBg}
                        onChange={(e) => setDesign((prev) => ({ ...prev, transparentBg: e.target.checked }))}
                        className="rounded border-slate-300 text-[#004CF6]"
                      />
                      Transparent Background (PNG/SVG)
                    </label>
                  </div>

                  {design.useGradient ? (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-slate-600">16 Curated TapFX Gradients</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {QR_GRADIENTS.map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() =>
                              setDesign((prev) => ({
                                ...prev,
                                gradientId: g.id,
                                gradientStart: g.start,
                                gradientEnd: g.end,
                                cornerColor: g.start,
                              }))
                            }
                            className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                              design.gradientId === g.id ? 'border-[#004CF6] ring-1 ring-[#004CF6]' : 'border-slate-200'
                            }`}
                          >
                            <span
                              className="w-5 h-5 rounded-md shrink-0"
                              style={{ background: `linear-gradient(135deg, ${g.start}, ${g.end})` }}
                            />
                            <span className="text-[11px] font-semibold text-slate-700 truncate">{g.name}</span>
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Custom Gradient Start</label>
                          <input
                            type="color"
                            value={design.gradientStart}
                            onChange={(e) => setDesign((prev) => ({ ...prev, gradientId: 'custom', gradientStart: e.target.value }))}
                            className="h-9 w-full rounded-lg border border-slate-200 cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Custom Gradient End</label>
                          <input
                            type="color"
                            value={design.gradientEnd}
                            onChange={(e) => setDesign((prev) => ({ ...prev, gradientId: 'custom', gradientEnd: e.target.value }))}
                            className="h-9 w-full rounded-lg border border-slate-200 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Foreground Colour</label>
                        <input
                          type="color"
                          value={design.fgColor}
                          onChange={(e) => setDesign((prev) => ({ ...prev, fgColor: e.target.value }))}
                          className="h-10 w-full rounded-xl border border-slate-200 cursor-pointer"
                        />
                      </div>
                      {!design.transparentBg && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Background Colour</label>
                          <input
                            type="color"
                            value={design.bgColor}
                            onChange={(e) => setDesign((prev) => ({ ...prev, bgColor: e.target.value }))}
                            className="h-10 w-full rounded-xl border border-slate-200 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {designTab === 'corners' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-2">Corner Frame Style</p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {CORNER_FRAME_STYLES.map((cf) => (
                        <button
                          key={cf.id}
                          type="button"
                          onClick={() => setDesign((prev) => ({ ...prev, cornerFrameStyle: cf.id }))}
                          className={`px-3 py-2 rounded-xl border text-xs font-semibold ${
                            design.cornerFrameStyle === cf.id
                              ? 'border-[#004CF6] bg-blue-50 text-[#004CF6]'
                              : 'border-slate-200 text-slate-700'
                          }`}
                        >
                          {cf.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-2">Corner Dot Style</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CORNER_DOT_STYLES.map((cd) => (
                        <button
                          key={cd.id}
                          type="button"
                          onClick={() => setDesign((prev) => ({ ...prev, cornerDotStyle: cd.id }))}
                          className={`px-3 py-2 rounded-xl border text-xs font-semibold ${
                            design.cornerDotStyle === cd.id
                              ? 'border-[#004CF6] bg-blue-50 text-[#004CF6]'
                              : 'border-slate-200 text-slate-700'
                          }`}
                        >
                          {cd.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Corner Eye Colour</label>
                    <input
                      type="color"
                      value={design.cornerColor}
                      onChange={(e) => setDesign((prev) => ({ ...prev, cornerColor: e.target.value }))}
                      className="h-9 w-24 rounded-lg border border-slate-200 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {designTab === 'logo' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-2">Preset Industry Icons</p>
                    <div className="flex flex-wrap gap-2">
                      {LOGO_PRESETS.map((lp) => (
                        <button
                          key={lp.id}
                          type="button"
                          onClick={() =>
                            setDesign((prev) => ({
                              ...prev,
                              logoPreset: lp.id,
                              logoDataUrl: undefined,
                              errorCorrection: lp.id === 'none' ? prev.errorCorrection : 'H',
                            }))
                          }
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                            design.logoPreset === lp.id && !design.logoDataUrl
                              ? 'border-[#004CF6] bg-blue-50 text-[#004CF6]'
                              : 'border-slate-200 text-slate-700'
                          }`}
                        >
                          {lp.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Upload Custom Logo (max 1 MB)</label>
                      <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:border-[#004CF6] cursor-pointer">
                        <Upload className="w-4 h-4 text-[#004CF6]" />
                        {design.logoDataUrl ? 'Replace Uploaded Logo' : 'Choose PNG / JPG / SVG'}
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Error Correction Level</label>
                      <select
                        value={design.errorCorrection}
                        onChange={(e) =>
                          setDesign((prev) => ({ ...prev, errorCorrection: e.target.value as QRDesignConfig['errorCorrection'] }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm bg-white focus:border-[#004CF6] focus:outline-none"
                      >
                        <option value="L">L — Low (7%)</option>
                        <option value="M">M — Medium (15%)</option>
                        <option value="Q">Q — Quartile (25%)</option>
                        <option value="H">H — High (30%, Best with Logo)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Center Logo Size</span>
                      <span className="font-mono">{Math.round(design.logoSizeRatio * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.14}
                      max={0.28}
                      step={0.01}
                      value={design.logoSizeRatio}
                      onChange={(e) => setDesign((prev) => ({ ...prev, logoSizeRatio: Number(e.target.value) }))}
                      className="w-full accent-[#004CF6]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sticky Live QR Preview & Export Panel */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-display text-base font-bold text-[#0F172A]">Live QR Preview</h4>
              <p className="text-xs text-slate-500 font-mono truncate max-w-[230px]">{payload}</p>
            </div>
            <span className="text-xs font-mono font-semibold text-[#004CF6]">
              {isDynamic ? 'Dynamic' : 'Static'}
            </span>
          </div>

          <div
            className="mx-auto rounded-2xl border border-slate-100 p-5 flex items-center justify-center min-h-[280px]"
            style={{
              backgroundImage: design.transparentBg
                ? 'radial-gradient(#cbd5e1 1px, transparent 1px)'
                : undefined,
              backgroundSize: design.transparentBg ? '12px 12px' : undefined,
              backgroundColor: design.transparentBg ? '#F8FAFC' : '#F4F7FB',
            }}
          >
            <div className="max-w-[260px] w-full" dangerouslySetInnerHTML={{ __html: svgMarkup }} />
          </div>

          {qrType === 'multi-link' && (
            <div className="rounded-xl border border-blue-100 bg-[#F4F7FB] p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#0F172A]">
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#004CF6]" />
                  Bundled Links ({multiLinks.filter((l) => l.label.trim() && l.url.trim()).length})
                </span>
                <span className="text-[11px] font-mono text-[#004CF6]">
                  /{multiPublishedSlug || fields.slug || 'draft'}
                </span>
              </div>
              <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                {multiLinks
                  .filter((l) => l.label.trim())
                  .map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-1.5 border border-slate-200/80 text-[11px]"
                    >
                      <span className="font-semibold text-[#0F172A] truncate">{l.label}</span>
                      <span className="font-mono text-slate-400 truncate max-w-[140px]">{l.url}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Scannability & Contrast Validator */}
          <div
            className={`rounded-xl border p-3.5 text-xs space-y-1.5 ${
              scannability.score === 'excellent'
                ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                : 'border-amber-200 bg-amber-50/60 text-amber-900'
            }`}
          >
            <div className="flex items-center justify-between font-semibold">
              <span className="inline-flex items-center gap-1.5">
                {scannability.score === 'excellent' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                )}
                Scannability: {scannability.score === 'excellent' ? 'High Contrast Ready' : 'Review Notice'}
              </span>
              <span className="font-mono tabular-nums">{scannability.contrastRatio}:1</span>
            </div>
            {scannability.warnings.length > 0 ? (
              <ul className="space-y-0.5 text-[11px] pl-5 list-disc">
                {scannability.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] opacity-85">
                Tip: Always test with your phone camera before bulk printing.
              </p>
            )}
          </div>

          {/* Print Size & Download Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600">PDF Print Format</span>
              <div className="flex items-center gap-1 p-1 bg-[#F4F7FB] rounded-lg">
                {(['5cm', '10cm', 'a5'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setPdfSize(sz)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md ${
                      pdfSize === sz ? 'bg-white text-[#004CF6] shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    {sz === 'a5' ? 'A5 Stand' : sz}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={!hasValidInput}
                onClick={() => downloadPngFile(svgMarkup, qrName.toLowerCase().replace(/\s+/g, '-') || 'tapfx-qr')}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#004CF6] hover:bg-[#0030C0] disabled:opacity-40 text-xs font-semibold text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download PNG
              </button>
              <button
                type="button"
                disabled={!hasValidInput}
                onClick={() => downloadSvgFile(svgMarkup, qrName.toLowerCase().replace(/\s+/g, '-') || 'tapfx-qr')}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-xs font-semibold text-[#0F172A] transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#004CF6]" />
                Download SVG
              </button>
              <button
                type="button"
                disabled={!hasValidInput}
                onClick={() =>
                  downloadPdfFile(svgMarkup, qrName.toLowerCase().replace(/\s+/g, '-') || 'tapfx-qr', pdfSize, qrName)
                }
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-xs font-semibold text-[#0F172A] transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-[#004CF6]" />
                Download PDF
              </button>
              <button
                type="button"
                disabled={!hasValidInput}
                onClick={handlePrint}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-xs font-semibold text-[#0F172A] transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-[#004CF6]" />
                Print QR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {previewModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-bold text-[#0F172A]">{qrName}</h3>
            <p className="text-xs text-slate-500">Point your iPhone or Android camera below to test scan accuracy.</p>
            <div className="mx-auto max-w-[280px]" dangerouslySetInnerHTML={{ __html: svgMarkup }} />
            <button
              type="button"
              onClick={() => setPreviewModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#004CF6] text-white text-sm font-semibold"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
