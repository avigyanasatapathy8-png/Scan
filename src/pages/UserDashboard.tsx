import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Copy,
  CreditCard,
  Download,
  FolderPlus,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Plus,
  QrCode,
  Search,
  Settings,
  Sparkles,
  Star,
  Trash2,
  Wifi,
  X,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { apiFetch } from '../lib/api';
import { useApp } from '../context/AppContext';
import { QRStudio } from '../components/QRStudio';
import { MultiLinkBuilder } from '../components/MultiLinkBuilder';
import { CardProofPreview } from '../components/CardProofPreview';
import { TapFXBrandLogo } from '../components/Navbar';
import { DEFAULT_QR_DESIGN } from '../lib/qrPresets';
import { buildStyledQRSvg } from '../lib/qrRenderer';
import type {
  BusinessRecord,
  FolderRecord,
  LanguageCode,
  LinkPageRecord,
  NFCCardRecord,
  OrderRecord,
  PlanConfig,
  PrivateFeedbackRecord,
  QRCodeRecord,
  ReviewPageRecord,
  ReviewRecord,
  ScanRecord,
} from '../types/tapfx';

type OwnerTab =
  | 'overview'
  | 'qrs'
  | 'create'
  | 'links'
  | 'nfc'
  | 'orders'
  | 'reviews'
  | 'analytics'
  | 'folders'
  | 'settings'
  | 'subscription';

interface OwnerData {
  business: BusinessRecord;
  plan: PlanConfig;
  allPlans: PlanConfig[];
  globalAiKillSwitch: boolean;
  qrCodes: QRCodeRecord[];
  folders: FolderRecord[];
  scans: ScanRecord[];
  linkPages: LinkPageRecord[];
  nfcCards: NFCCardRecord[];
  reviewPages: ReviewPageRecord[];
  reviews: ReviewRecord[];
  privateFeedback: PrivateFeedbackRecord[];
  orders: OrderRecord[];
}

export function UserDashboard({ initialTab = 'overview' }: { initialTab?: OwnerTab }) {
  const { user, navigate, logout, showToast, loginDemo, setLanguage } = useApp();
  const [tab, setTab] = useState<OwnerTab>(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState<OwnerData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Edit States
  const [qrSearch, setQrSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [editingQr, setEditingQr] = useState<QRCodeRecord | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkCsv, setBulkCsv] = useState('Table 1,https://tapfx.com/kalinga-bistro\nTable 2,https://tapfx.com/kalinga-bistro');

  // NFC creation state
  const [newNfcLabel, setNewNfcLabel] = useState('');
  const [newNfcQrId, setNewNfcQrId] = useState('');

  // Reviews & Insights state
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [aiBusyId, setAiBusyId] = useState<string | null>(null);
  const [insightsBusy, setInsightsBusy] = useState(false);
  const [insightsResult, setInsightsResult] = useState<{
    computedStats: {
      totalReviews: number;
      averageRating: number;
      responseRatePct: number;
      positivePct: number;
      neutralPct: number;
      negativePct: number;
      topics: { topic: string; count: number }[];
    };
    aiSummary: { summary: string; likes: string[]; fixes: string[]; actions: string[] };
  } | null>(null);

  const [analyticsRange, setAnalyticsRange] = useState<7 | 30 | 90>(30);
  const [gstInvoice, setGstInvoice] = useState<{ invoiceNumber: string; totalInr: number; gstInr: number } | null>(null);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<OwnerData>('/api/owner/overview');
      setData(res);
      if (res.qrCodes[0] && !newNfcQrId) setNewNfcQrId(res.qrCodes[0].id);
      const draftMap: Record<string, string> = {};
      res.reviews.forEach((r) => {
        draftMap[r.id] = r.finalReply || r.aiDraft || '';
      });
      setReplyDrafts(draftMap);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [newNfcQrId]);

  useEffect(() => {
    if (user) {
      void loadOverview();
    } else {
      setLoading(false);
    }
  }, [user, loadOverview]);

  const filteredQrs = useMemo(() => {
    if (!data) return [];
    return data.qrCodes.filter((q) => {
      const matchesFolder = selectedFolder === 'all' || q.folderId === selectedFolder;
      const matchesSearch =
        !qrSearch.trim() ||
        q.name.toLowerCase().includes(qrSearch.toLowerCase()) ||
        q.shortCode.toLowerCase().includes(qrSearch.toLowerCase());
      return matchesFolder && matchesSearch;
    });
  }, [data, qrSearch, selectedFolder]);

  const totalScans = useMemo(() => (data ? data.qrCodes.reduce((s, q) => s + q.scansCount, 0) : 0), [data]);
  const activeQrs = useMemo(() => (data ? data.qrCodes.filter((q) => q.status === 'active').length : 0), [data]);
  const totalClicks = useMemo(
    () => (data ? data.linkPages.reduce((s, lp) => s + lp.blocks.reduce((a, b) => a + b.clicks, 0), 0) : 0),
    [data]
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-5">
          <TapFXBrandLogo className="h-11 mx-auto" />
          <div className="space-y-1.5">
            <h1 className="font-display text-2xl font-bold text-[#0F172A]">Sign in to Your TapFX Workspace</h1>
            <p className="text-sm text-slate-600">
              Access your dynamic QR codes, multi-link builder, NFC hardware, and Google Review analytics.
            </p>
          </div>
          <div className="space-y-2.5">
            <button
              onClick={() => loginDemo('owner').then(() => loadOverview())}
              className="w-full py-3 rounded-xl bg-[#004CF6] hover:bg-[#0030C0] text-white text-sm font-semibold"
            >
              Enter Demo Shop Workspace (Kalinga Spice)
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 rounded-xl border border-slate-200 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
            >
              Sign In with Email or Phone
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sidebarItems: { id: OwnerTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'qrs', label: 'My QR Codes', icon: QrCode },
    { id: 'create', label: 'Create QR', icon: Plus },
    { id: 'links', label: 'Multi-Link Pages', icon: Layers },
    { id: 'nfc', label: 'NFC Management', icon: Wifi },
    { id: 'orders', label: 'Products & Orders', icon: Package },
    { id: 'reviews', label: 'Reviews & AI', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'folders', label: 'Folders', icon: FolderPlus },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
  ];

  const handleToggleQrStatus = async (qr: QRCodeRecord) => {
    const nextStatus = qr.status === 'active' ? 'paused' : 'active';
    await apiFetch(`/api/qrs/${qr.id}`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) });
    showToast(`QR code ${nextStatus}.`, 'info');
    void loadOverview();
  };

  const handleDuplicateQr = async (qr: QRCodeRecord) => {
    await apiFetch(`/api/qrs/${qr.id}/duplicate`, { method: 'POST' });
    showToast('QR code duplicated.', 'success');
    void loadOverview();
  };

  const handleDeleteQr = async (qr: QRCodeRecord) => {
    await apiFetch(`/api/qrs/${qr.id}`, { method: 'DELETE' });
    showToast('QR code moved to trash.', 'info');
    void loadOverview();
  };

  const handleBulkCreate = async () => {
    const lines = bulkCsv
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    for (const line of lines) {
      const [name, url] = line.split(',').map((s) => s.trim());
      if (!name || !url) continue;
      await apiFetch('/api/qrs', {
        method: 'POST',
        body: JSON.stringify({
          name,
          type: 'website',
          isDynamic: true,
          destinationUrl: url,
          contentFields: { url },
          design: DEFAULT_QR_DESIGN,
          outletTag: name,
        }),
      });
    }
    setBulkOpen(false);
    showToast(`Created ${lines.length} QR codes from CSV.`, 'success');
    void loadOverview();
  };

  const handleGenerateAiReply = async (reviewId: string) => {
    setAiBusyId(reviewId);
    try {
      const res = await apiFetch<{ reply: string }>('/api/ai/reply-assist', {
        method: 'POST',
        body: JSON.stringify({ reviewId }),
      });
      setReplyDrafts((prev) => ({ ...prev, [reviewId]: res.reply }));
      showToast('AI draft ready — review and approve to post.', 'success');
      void loadOverview();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'AI draft unavailable', 'error');
    } finally {
      setAiBusyId(null);
    }
  };

  const handleApproveReply = async (reviewId: string) => {
    const text = replyDrafts[reviewId] || '';
    if (!text.trim()) return;
    await apiFetch(`/api/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ finalReply: text }),
    });
    showToast('Reply approved and logged.', 'success');
    void loadOverview();
  };

  const handleGenerateInsights = async () => {
    setInsightsBusy(true);
    try {
      const res = await apiFetch<NonNullable<typeof insightsResult>>('/api/ai/insights', { method: 'POST' });
      setInsightsResult(res);
      showToast('Monthly Review Insights generated.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Insights unavailable', 'error');
    } finally {
      setInsightsBusy(false);
    }
  };

  const handleDownloadMonthlyPdf = () => {
    if (!data || !insightsResult) return;
    const pdf = new jsPDF();
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text(`${data.business.name} — Monthly Review Insights`, 16, 22);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text(
      `Total Reviews: ${insightsResult.computedStats.totalReviews} | Avg Rating: ${insightsResult.computedStats.averageRating} | Response Rate: ${insightsResult.computedStats.responseRatePct}%`,
      16,
      34
    );
    pdf.text(pdf.splitTextToSize(insightsResult.aiSummary.summary, 178), 16, 46);
    let y = 74;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recommended Actions:', 16, y);
    y += 8;
    pdf.setFont('helvetica', 'normal');
    insightsResult.aiSummary.actions.forEach((act, idx) => {
      pdf.text(`${idx + 1}. ${act}`, 16, y);
      y += 8;
    });
    pdf.save(`${data.business.name.toLowerCase().replace(/\s+/g, '-')}-insights.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between px-2">
            <button onClick={() => navigate('/')} className="flex items-center text-left">
              <TapFXBrandLogo className="h-9" />
            </button>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setTab(item.id);
                    setSidebarOpen(false);
                    if (item.id !== 'create') setEditingQr(null);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    active ? 'bg-[#004CF6] text-white' : 'text-slate-600 hover:bg-[#F4F7FB] hover:text-[#0F172A]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-2">
          {user.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="w-full py-2 px-3 rounded-xl bg-[#0F172A] text-white text-xs font-semibold"
            >
              Switch to Admin Console
            </button>
          )}
          <div className="flex items-center justify-between px-2 py-1">
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#0F172A] truncate">{user.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{data?.plan.name || 'Free'} Plan</p>
            </div>
            <button onClick={logout} title="Sign Out" className="p-1.5 text-slate-500 hover:text-red-600">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm font-semibold text-[#0F172A]">
              {data?.business.name || 'Workspace'} <span className="text-slate-400 mx-1">/</span>{' '}
              <span className="text-[#004CF6]">{sidebarItems.find((i) => i.id === tab)?.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingQr(null);
                setTab('create');
              }}
              className="px-3.5 py-2 rounded-xl bg-[#004CF6] hover:bg-[#0030C0] text-white text-xs font-semibold whitespace-nowrap"
            >
              + Create QR
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-8 max-w-[1200px] w-full mx-auto space-y-6">
          {loading || !data ? (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200" />
              ))}
            </div>
          ) : (
            <>
              {/* OVERVIEW */}
              {tab === 'overview' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A]">
                        Welcome back to TapFX
                      </h1>
                      <p className="text-sm text-slate-600">
                        {data.business.name} · {data.plan.name} Plan ({data.qrCodes.length} QR codes active)
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setTab('links')}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                      >
                        Create Multi-Link Page
                      </button>
                      <button
                        onClick={() => navigate('/order')}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                      >
                        Order NFC Card
                      </button>
                    </div>
                  </div>

                  {/* 4 KPI Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total QR Codes', value: data.qrCodes.length, sub: `${data.plan.maxQrCodes === -1 ? 'Unlimited' : data.plan.maxQrCodes} limit` },
                      { label: 'Active QR Codes', value: activeQrs, sub: 'Ready to scan' },
                      { label: 'Total Scans', value: totalScans.toLocaleString('en-IN'), sub: 'QR + NFC combined' },
                      { label: 'Total Link Clicks', value: totalClicks.toLocaleString('en-IN'), sub: 'Multi-link buttons' },
                    ].map((kpi) => (
                      <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1">
                        <p className="text-xs text-slate-500">{kpi.label}</p>
                        <p className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A] tabular-nums">
                          {kpi.value}
                        </p>
                        <p className="text-xs font-medium text-[#004CF6]">{kpi.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Scan Graph + Recent QRs */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="font-display text-base font-bold text-[#0F172A]">Scan Activity (Last 14 Days)</h2>
                        <button onClick={() => setTab('analytics')} className="text-xs font-semibold text-[#004CF6]">
                          Full Analytics →
                        </button>
                      </div>
                      <div className="h-44 flex items-end gap-2 pt-2">
                        {[42, 55, 48, 63, 70, 62, 85, 92, 78, 101, 114, 108, 125, 134].map((v, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full rounded-t-md bg-gradient-to-t from-[#004CF6] to-[#0098FD]"
                              style={{ height: `${Math.round((v / 140) * 100)}%` }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                      <h2 className="font-display text-base font-bold text-[#0F172A]">Top-Performing QR Codes</h2>
                      <div className="space-y-3">
                        {data.qrCodes.slice(0, 4).map((qr) => (
                          <div key={qr.id} className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#0F172A] truncate">{qr.name}</p>
                              <p className="text-xs font-mono text-slate-500">/q/{qr.shortCode}</p>
                            </div>
                            <span className="font-mono text-sm font-bold text-[#004CF6] tabular-nums">
                              {qr.scansCount}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MY QR CODES */}
              {tab === 'qrs' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={qrSearch}
                          onChange={(e) => setQrSearch(e.target.value)}
                          placeholder="Search QR codes..."
                          className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
                        />
                      </div>
                      <select
                        value={selectedFolder}
                        onChange={(e) => setSelectedFolder(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="all">All Folders</option>
                        {data.folders.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => setBulkOpen((v) => !v)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                    >
                      Bulk Create (CSV)
                    </button>
                  </div>

                  {bulkOpen && (
                    <div className="bg-white rounded-2xl border border-blue-200 p-5 space-y-3">
                      <h3 className="font-display font-bold text-sm">Bulk Create QR Codes from CSV (Name,URL per line)</h3>
                      <textarea
                        rows={4}
                        value={bulkCsv}
                        onChange={(e) => setBulkCsv(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-3 text-xs font-mono"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setBulkOpen(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-600">
                          Cancel
                        </button>
                        <button onClick={handleBulkCreate} className="px-4 py-1.5 rounded-xl bg-[#004CF6] text-white text-xs font-semibold">
                          Create All
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredQrs.map((qr) => {
                      const thumbSvg = buildStyledQRSvg(qr.destinationUrl, qr.design, 120);
                      return (
                        <div key={qr.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex gap-4 items-center">
                          <div
                            className="w-24 h-24 shrink-0 rounded-xl border border-slate-100 overflow-hidden flex items-center justify-center bg-white"
                            dangerouslySetInnerHTML={{ __html: thumbSvg }}
                          />
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-display font-bold text-sm text-[#0F172A] truncate">{qr.name}</h3>
                              <span
                                className={`text-[11px] font-bold ${
                                  qr.status === 'active' ? 'text-emerald-700' : 'text-amber-700'
                                }`}
                              >
                                {qr.status === 'active' ? 'Active' : 'Paused'}
                              </span>
                            </div>
                            <p className="text-xs font-mono text-slate-500 truncate">/q/{qr.shortCode} → {qr.destinationUrl}</p>
                            <p className="text-xs text-slate-500 tabular-nums">
                              {qr.type} · {qr.scansCount} scans {qr.outletTag ? `· ${qr.outletTag}` : ''}
                            </p>
                            <div className="flex flex-wrap gap-2 pt-1">
                              <button
                                onClick={() => {
                                  setEditingQr(qr);
                                  setTab('create');
                                }}
                                className="text-xs font-semibold text-[#004CF6] hover:underline"
                              >
                                Edit / Redirect
                              </button>
                              <button
                                onClick={() => handleToggleQrStatus(qr)}
                                className="text-xs font-semibold text-slate-600 hover:underline"
                              >
                                {qr.status === 'active' ? 'Pause' : 'Resume'}
                              </button>
                              <button
                                onClick={() => handleDuplicateQr(qr)}
                                className="text-xs font-semibold text-slate-600 hover:underline"
                              >
                                Duplicate
                              </button>
                              <button
                                onClick={() => handleDeleteQr(qr)}
                                className="text-xs font-semibold text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CREATE OR EDIT QR */}
              {tab === 'create' && (
                <QRStudio
                  folders={data.folders}
                  initialQr={editingQr}
                  onSaved={() => {
                    setEditingQr(null);
                    setTab('qrs');
                    void loadOverview();
                  }}
                />
              )}

              {/* MULTI-LINK BUILDER */}
              {tab === 'links' && (
                <MultiLinkBuilder
                  initialPage={data.linkPages[0] ?? null}
                  onSaved={() => void loadOverview()}
                />
              )}

              {/* NFC MANAGEMENT */}
              {tab === 'nfc' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Connect New NFC Card Label</label>
                        <input
                          type="text"
                          value={newNfcLabel}
                          onChange={(e) => setNewNfcLabel(e.target.value)}
                          placeholder="e.g. Reception Master Card"
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Assign QR / Destination</label>
                        <select
                          value={newNfcQrId}
                          onChange={(e) => setNewNfcQrId(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
                        >
                          {data.qrCodes.map((q) => (
                            <option key={q.id} value={q.id}>
                              {q.name} (/q/{q.shortCode})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        await apiFetch('/api/nfc-cards', {
                          method: 'POST',
                          body: JSON.stringify({ label: newNfcLabel || 'New NFC Card', assignedQrId: newNfcQrId }),
                        });
                        setNewNfcLabel('');
                        showToast('NFC card paired and ready.', 'success');
                        void loadOverview();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#004CF6] text-white text-xs font-semibold whitespace-nowrap"
                    >
                      + Connect NFC Card
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {data.nfcCards.map((card) => (
                      <div key={card.id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
                        <CardProofPreview
                          productSlug={
                            card.productType === 'stand'
                              ? 'acrylic-stand'
                              : card.productType === 'wifi'
                                ? 'wifi-card'
                                : card.productType === 'magic'
                                  ? 'magic-card'
                                  : 'master-card'
                          }
                          businessName={data.business.name}
                          personName={card.label}
                          destinationUrl={`${window.location.origin}${card.programmingUrl}`}
                          cardTheme={card.cardTheme}
                        />
                        <div className="space-y-3 pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-slate-500">{card.serialCode}</span>
                            <span className="font-mono font-bold text-[#004CF6] tabular-nums">{card.tapsCount} NFC taps</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={`${window.location.origin}${card.programmingUrl}`}
                              className="flex-1 rounded-xl border border-slate-200 bg-[#F4F7FB] px-3 py-2 text-xs font-mono"
                            />
                            <button
                              onClick={() => {
                                void navigator.clipboard.writeText(`${window.location.origin}${card.programmingUrl}`);
                                showToast('NFC programming URL copied.', 'success');
                              }}
                              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold inline-flex items-center gap-1"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </button>
                          </div>
                          <select
                            value={card.assignedQrId}
                            onChange={async (e) => {
                              await apiFetch(`/api/nfc-cards/${card.id}`, {
                                method: 'PATCH',
                                body: JSON.stringify({ assignedQrId: e.target.value }),
                              });
                              showToast('NFC destination updated instantly.', 'success');
                              void loadOverview();
                            }}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white"
                          >
                            {data.qrCodes.map((q) => (
                              <option key={q.id} value={q.id}>
                                Assigned: {q.name} ({q.destinationUrl})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ORDERS */}
              {tab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold">Hardware Orders &amp; Proofs</h2>
                    <button onClick={() => navigate('/order')} className="px-4 py-2 rounded-xl bg-[#004CF6] text-white text-xs font-semibold">
                      Order New Cards
                    </button>
                  </div>
                  <div className="space-y-3">
                    {data.orders.map((ord) => (
                      <div key={ord.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-mono font-bold text-[#004CF6]">{ord.orderNumber}</p>
                          <h3 className="font-display font-bold text-base">
                            {ord.quantity}× {ord.productName}
                          </h3>
                          <p className="text-xs text-slate-500">
                            Status: <strong>{ord.status}</strong> · ₹{ord.totalInr} ({ord.paymentMethod})
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/track/${ord.orderNumber}`)}
                          className="px-4 py-2 rounded-xl border border-slate-200 hover:border-[#004CF6] text-xs font-semibold"
                        >
                          View Proof &amp; Track →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REVIEWS & AI INSIGHTS */}
              {tab === 'reviews' && (
                <div className="space-y-6">
                  {data.globalAiKillSwitch && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-900">
                      Notice: Global AI tools are currently paused by TapFX Admin.
                    </div>
                  )}

                  {/* AI Review Insights Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="font-display text-lg font-bold text-[#0F172A]">AI Review Insights</h2>
                        <p className="text-xs text-slate-500">
                          Numbers calculated directly from synced reviews; Gemini summarizes themes &amp; 3 plain actions.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {insightsResult && (
                          <button
                            onClick={handleDownloadMonthlyPdf}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Monthly PDF
                          </button>
                        )}
                        <button
                          onClick={handleGenerateInsights}
                          disabled={insightsBusy}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004CF6] text-white text-xs font-semibold disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {insightsBusy ? 'Analyzing...' : 'Generate Monthly Insights'}
                        </button>
                      </div>
                    </div>

                    {insightsResult && (
                      <div className="rounded-xl bg-[#F4F7FB] border border-slate-200 p-5 space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                          <div className="bg-white rounded-xl p-3 border border-slate-200">
                            <p className="text-[11px] text-slate-500">Total Reviews</p>
                            <p className="font-mono text-lg font-bold">{insightsResult.computedStats.totalReviews}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-slate-200">
                            <p className="text-[11px] text-slate-500">Avg Rating</p>
                            <p className="font-mono text-lg font-bold">{insightsResult.computedStats.averageRating} ★</p>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-slate-200">
                            <p className="text-[11px] text-slate-500">Positive Split</p>
                            <p className="font-mono text-lg font-bold text-emerald-700">
                              {insightsResult.computedStats.positivePct}%
                            </p>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-slate-200">
                            <p className="text-[11px] text-slate-500">Response Rate</p>
                            <p className="font-mono text-lg font-bold text-[#004CF6]">
                              {insightsResult.computedStats.responseRatePct}%
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{insightsResult.aiSummary.summary}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-1.5">
                            <p className="font-bold text-emerald-700">What Customers Like</p>
                            <ul className="list-disc pl-4 space-y-1 text-slate-600">
                              {insightsResult.aiSummary.likes.map((l, i) => (
                                <li key={i}>{l}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-1.5">
                            <p className="font-bold text-amber-700">What to Fix</p>
                            <ul className="list-disc pl-4 space-y-1 text-slate-600">
                              {insightsResult.aiSummary.fixes.map((l, i) => (
                                <li key={i}>{l}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-1.5">
                            <p className="font-bold text-[#004CF6]">3 Suggested Actions</p>
                            <ul className="list-disc pl-4 space-y-1 text-slate-600">
                              {insightsResult.aiSummary.actions.map((l, i) => (
                                <li key={i}>{l}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reviews Inbox with Owner Reply Assist */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-lg font-bold text-[#0F172A]">Google Reviews Inbox &amp; Reply Assist</h2>
                      <button
                        onClick={() => navigate(`/r/${data.reviewPages[0]?.code || 'kalinga-review'}`)}
                        className="text-xs font-semibold text-[#004CF6] hover:underline"
                      >
                        Open Public Review Page (/r/{data.reviewPages[0]?.code}) →
                      </button>
                    </div>
                    {data.reviews.map((rev) => (
                      <div key={rev.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-sm">{rev.reviewerName}</span>
                            <span className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              {rev.rating}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">{rev.language.toUpperCase()}</span>
                          </div>
                          <span
                            className={`text-xs font-bold ${
                              rev.replyStatus === 'posted' ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {rev.replyStatus === 'posted' ? 'Approved & Posted' : 'Awaiting Approval'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{rev.text}</p>

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <textarea
                            rows={2}
                            value={replyDrafts[rev.id] ?? ''}
                            onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [rev.id]: e.target.value }))}
                            placeholder="Write a reply or click Draft AI Reply..."
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs"
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={aiBusyId === rev.id}
                              onClick={() => handleGenerateAiReply(rev.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#F4F7FB] border border-slate-200 text-xs font-semibold text-[#004CF6] hover:border-[#004CF6]"
                            >
                              {aiBusyId === rev.id ? 'Drafting...' : 'Draft AI Reply'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApproveReply(rev.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#004CF6] text-white text-xs font-semibold"
                            >
                              Approve &amp; Post Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Private Feedback Inbox */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                    <h3 className="font-display text-base font-bold text-[#0F172A]">
                      Private Shop Feedback ({data.privateFeedback.length})
                    </h3>
                    {data.privateFeedback.map((pf) => (
                      <div key={pf.id} className="rounded-xl bg-[#F4F7FB] border border-slate-200 p-4 text-xs space-y-1">
                        <div className="flex justify-between text-slate-500">
                          <span>Rating: {pf.rating} ★</span>
                          <span>{pf.contactOptional || 'Anonymous'}</span>
                        </div>
                        <p className="text-sm text-[#0F172A]">{pf.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ANALYTICS */}
              {tab === 'analytics' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold">Detailed Scan &amp; Outlet Analytics</h2>
                    <div className="flex gap-1 p-1 bg-white border border-slate-200 rounded-xl">
                      {([7, 30, 90] as const).map((days) => (
                        <button
                          key={days}
                          onClick={() => setAnalyticsRange(days)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            analyticsRange === days ? 'bg-[#004CF6] text-white' : 'text-slate-600'
                          }`}
                        >
                          {days}d
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                      <h3 className="font-display font-bold text-sm">Source Split (NFC vs QR)</h3>
                      {(['qr', 'nfc'] as const).map((src) => {
                        const count = data.scans.filter((s) => s.source === src).length;
                        const pct = data.scans.length ? Math.round((count / data.scans.length) * 100) : 0;
                        return (
                          <div key={src} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span>{src.toUpperCase()}</span>
                              <span className="font-mono tabular-nums">{pct}% ({count})</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#004CF6]" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                      <h3 className="font-display font-bold text-sm">Operating Systems</h3>
                      {(['Android', 'iOS'] as const).map((os) => {
                        const count = data.scans.filter((s) => s.os === os).length;
                        const pct = data.scans.length ? Math.round((count / data.scans.length) * 100) : 0;
                        return (
                          <div key={os} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span>{os}</span>
                              <span className="font-mono tabular-nums">{pct}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#0098FD]" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
                      <h3 className="font-display font-bold text-sm">Top Cities (IP-Free)</h3>
                      {['Bhubaneswar', 'Cuttack', 'Bengaluru', 'Mumbai'].map((city) => {
                        const c = data.scans.filter((s) => s.city === city).length;
                        return (
                          <div key={city} className="flex justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                            <span>{city}</span>
                            <span className="font-mono font-bold tabular-nums">{c}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* FOLDERS */}
              {tab === 'folders' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
                  <div className="flex gap-2 max-w-md">
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="New folder name (e.g. Dining Tables)"
                      className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                    />
                    <button
                      onClick={async () => {
                        if (!newFolderName.trim()) return;
                        await apiFetch('/api/folders', { method: 'POST', body: JSON.stringify({ name: newFolderName }) });
                        setNewFolderName('');
                        showToast('Folder created.', 'success');
                        void loadOverview();
                      }}
                      className="px-4 py-2 rounded-xl bg-[#004CF6] text-white text-xs font-semibold"
                    >
                      Create
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {data.folders.map((f) => (
                      <div key={f.id} className="rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                        <div>
                          <p className="font-display font-bold text-sm">{f.name}</p>
                          <p className="text-xs text-slate-500">
                            {data.qrCodes.filter((q) => q.folderId === f.id).length} QR codes
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedFolder(f.id);
                            setTab('qrs');
                          }}
                          className="text-xs font-semibold text-[#004CF6]"
                        >
                          Open
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SETTINGS */}
              {tab === 'settings' && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await apiFetch('/api/business/settings', {
                      method: 'PATCH',
                      body: JSON.stringify({
                        name: data.business.name,
                        contactPhone: data.business.contactPhone,
                        googlePlaceId: data.business.googlePlaceId,
                        aiEnabled: data.business.aiEnabled,
                        replyTone: data.business.replyTone,
                        replySignature: data.business.replySignature,
                        whatsappWeeklyDigest: data.business.whatsappWeeklyDigest,
                        language: user.language,
                      }),
                    });
                    setLanguage(user.language);
                    showToast('Workspace settings saved.', 'success');
                    void loadOverview();
                  }}
                  className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 max-w-2xl"
                >
                  <h2 className="font-display text-xl font-bold">Business, Google Place ID &amp; AI Settings</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name</label>
                      <input
                        type="text"
                        value={data.business.name}
                        onChange={(e) => setData({ ...data, business: { ...data.business, name: e.target.value } })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={data.business.contactPhone}
                        onChange={(e) => setData({ ...data, business: { ...data.business, contactPhone: e.target.value } })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Google Place ID</label>
                      <input
                        type="text"
                        value={data.business.googlePlaceId}
                        onChange={(e) => setData({ ...data, business: { ...data.business, googlePlaceId: e.target.value } })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">AI Reply Tone</label>
                      <select
                        value={data.business.replyTone}
                        onChange={(e) =>
                          setData({
                            ...data,
                            business: { ...data.business, replyTone: e.target.value as BusinessRecord['replyTone'] },
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm bg-white"
                      >
                        <option value="warm">Warm &amp; Friendly</option>
                        <option value="formal">Formal</option>
                        <option value="short">Short &amp; Direct</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2.5 pt-2">
                    <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.business.aiEnabled}
                        onChange={(e) => setData({ ...data, business: { ...data.business, aiEnabled: e.target.checked } })}
                        className="rounded border-slate-300 text-[#004CF6]"
                      />
                      Enable AI Review Assist &amp; Reply Assist for this shop
                    </label>
                    <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.business.whatsappWeeklyDigest}
                        onChange={(e) =>
                          setData({ ...data, business: { ...data.business, whatsappWeeklyDigest: e.target.checked } })
                        }
                        className="rounded border-slate-300 text-[#004CF6]"
                      />
                      Send weekly WhatsApp digest of scans &amp; new reviews (consent granted)
                    </label>
                  </div>
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#004CF6] text-white text-xs font-semibold">
                    Save Settings
                  </button>
                </form>
              )}

              {/* SUBSCRIPTION */}
              {tab === 'subscription' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-[#004CF6]">Active Plan</p>
                      <h2 className="font-display text-2xl font-bold">{data.plan.name} (₹{data.plan.priceInrMonthly}/mo)</h2>
                      <p className="text-xs text-slate-500">
                        AI Drafts Used: {data.business.aiDraftsUsedThisMonth} / {data.plan.maxAiDraftsPerMonth} this month
                      </p>
                    </div>
                    {gstInvoice && (
                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs text-emerald-900">
                        GST Invoice <strong>{gstInvoice.invoiceNumber}</strong> issued · Total ₹{gstInvoice.totalInr} (incl. ₹{gstInvoice.gstInr} GST)
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {data.allPlans.map((pl) => {
                      const isCurrent = pl.id === data.plan.id;
                      return (
                        <div key={pl.id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                          <h3 className="font-display text-lg font-bold">{pl.name}</h3>
                          <p className="font-mono text-2xl font-bold">₹{pl.priceInrMonthly}/mo</p>
                          <p className="text-xs text-slate-600">{pl.audience}</p>
                          <button
                            disabled={isCurrent}
                            onClick={async () => {
                              const res = await apiFetch<{
                                invoice: { invoiceNumber: string; totalInr: number; gstInr: number };
                              }>('/api/subscription/upgrade', {
                                method: 'POST',
                                body: JSON.stringify({ planId: pl.id }),
                              });
                              setGstInvoice(res.invoice);
                              showToast(`Switched to ${pl.name} plan!`, 'success');
                              void loadOverview();
                            }}
                            className={`w-full py-2.5 rounded-xl text-xs font-semibold ${
                              isCurrent ? 'bg-slate-100 text-slate-400' : 'bg-[#004CF6] text-white'
                            }`}
                          >
                            {isCurrent ? 'Current Plan' : `Switch to ${pl.name}`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
