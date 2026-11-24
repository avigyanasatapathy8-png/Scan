import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  QrCode,
  Settings,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useApp } from '../context/AppContext';
import { TapFXBrandLogo } from '../components/Navbar';
import type {
  AIUsageRecord,
  BusinessRecord,
  OrderRecord,
  OrderStage,
  PlanConfig,
  ProductRecord,
  QRCodeRecord,
  SiteConfig,
  UserProfile,
} from '../types/tapfx';

type AdminTab = 'overview' | 'orders' | 'users' | 'products' | 'pricing' | 'qrs' | 'ai' | 'settings';

const STAGES: OrderStage[] = [
  'Order Received',
  'Payment Confirmed',
  'Design Pending',
  'Proof Ready',
  'Approval Required',
  'Printing',
  'Manufacturing',
  'Packed',
  'Shipped',
  'Delivered',
];

interface AdminData {
  users: UserProfile[];
  businesses: BusinessRecord[];
  orders: OrderRecord[];
  products: ProductRecord[];
  plans: PlanConfig[];
  qrCodes: QRCodeRecord[];
  siteConfig: SiteConfig;
  aiUsage: AIUsageRecord[];
  metrics: {
    totalUsers: number;
    activeSubscriptions: number;
    totalOrders: number;
    totalRevenueInr: number;
    totalQrCodes: number;
    totalScans: number;
  };
}

export function AdminDashboard() {
  const { user, navigate, logout, loginDemo, showToast, refreshBootstrap } = useApp();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');

  const loadAdmin = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<AdminData>('/api/admin/overview');
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      void loadAdmin();
    } else {
      setLoading(false);
    }
  }, [user, loadAdmin]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-5">
          <TapFXBrandLogo className="h-11 mx-auto" />
          <div className="space-y-1.5">
            <h1 className="font-display text-2xl font-bold text-[#0F172A]">TapFX Admin Console</h1>
            <p className="text-sm text-slate-600">
              Operations portal for order proofs, product pricing, plan limits, customer accounts, and AI kill switches.
            </p>
          </div>
          <button
            onClick={() => loginDemo('admin').then(() => loadAdmin())}
            className="w-full py-3 rounded-xl bg-[#0F172A] hover:bg-[#004CF6] text-white text-sm font-semibold transition-colors"
          >
            Sign In as TapFX Admin
          </button>
          <button onClick={() => navigate('/')} className="text-xs font-semibold text-slate-500 hover:underline">
            ← Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  const navItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders Queue', icon: Package },
    { id: 'users', label: 'Users & Plans', icon: Users },
    { id: 'products', label: 'Products & Prices', icon: CreditCard },
    { id: 'pricing', label: 'Plan Limits & Promo', icon: BarChart3 },
    { id: 'qrs', label: 'QR Moderation', icon: QrCode },
    { id: 'ai', label: 'AI Usage & Kill Switch', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex">
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col justify-between shrink-0">
        <div className="p-5 space-y-6">
          <button onClick={() => navigate('/')} className="space-y-1.5 text-left block">
            <TapFXBrandLogo darkSurface className="h-8" />
            <p className="text-[11px] text-slate-400 px-0.5">Admin · Operations Portal</p>
          </button>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    tab === item.id ? 'bg-[#004CF6] text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => navigate('/app')}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
          >
            Open Owner App View
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs text-slate-400 hover:text-white"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 sm:p-8 max-w-[1200px] space-y-6 overflow-x-auto">
        {loading || !data ? (
          <div className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        ) : (
          <>
            {tab === 'overview' && (
              <div className="space-y-6">
                <h1 className="font-display text-2xl font-bold text-[#0F172A]">TapFX Operations Overview</h1>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: data.metrics.totalUsers },
                    { label: 'Active Paid Plans', value: data.metrics.activeSubscriptions },
                    { label: 'Hardware Orders', value: data.metrics.totalOrders },
                    { label: 'Order Revenue', value: `₹${data.metrics.totalRevenueInr.toLocaleString('en-IN')}` },
                  ].map((m) => (
                    <div key={m.label} className="bg-white rounded-2xl border border-slate-200 p-5">
                      <p className="text-xs text-slate-500">{m.label}</p>
                      <p className="font-display text-2xl font-bold text-[#0F172A] tabular-nums mt-1">{m.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <h2 className="font-display text-base font-bold">Recent Orders Queue</h2>
                  <div className="space-y-2.5">
                    {data.orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 text-sm">
                        <div>
                          <span className="font-mono font-bold text-[#004CF6] mr-2">{o.orderNumber}</span>
                          <span className="font-semibold">{o.customization.businessName}</span>
                          <span className="text-xs text-slate-500 ml-2">({o.quantity}× {o.productName})</span>
                        </div>
                        <span className="text-xs font-bold text-[#0F172A]">{o.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'orders' && (
              <div className="space-y-4">
                <h1 className="font-display text-2xl font-bold">Orders &amp; Design Proof Queue</h1>
                <div className="space-y-4">
                  {data.orders.map((ord) => (
                    <div key={ord.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-mono text-xs font-bold text-[#004CF6]">{ord.orderNumber}</p>
                          <h3 className="font-display font-bold text-base">
                            {ord.customization.businessName} — {ord.quantity}× {ord.productName} (₹{ord.totalInr})
                          </h3>
                          <p className="text-xs text-slate-500">
                            Destination: {ord.customization.destinationValue} · Phone: {ord.customization.phone}
                          </p>
                        </div>

                        <select
                          value={ord.status}
                          onChange={async (e) => {
                            await apiFetch(`/api/admin/orders/${ord.id}`, {
                              method: 'PATCH',
                              body: JSON.stringify({ status: e.target.value }),
                            });
                            showToast(`Order ${ord.orderNumber} moved to ${e.target.value}.`, 'success');
                            void loadAdmin();
                          }}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold bg-[#F4F7FB]"
                        >
                          {STAGES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'users' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="font-display text-2xl font-bold">Customers &amp; Subscriptions</h1>
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Filter businesses..."
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm"
                  />
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F4F7FB] text-xs font-semibold text-slate-600">
                      <tr>
                        <th className="py-3 px-4">Business</th>
                        <th className="py-3 px-4">Plan</th>
                        <th className="py-3 px-4">AI Tools</th>
                        <th className="py-3 px-4">AI Drafts Used</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.businesses
                        .filter((b) => b.name.toLowerCase().includes(userSearch.toLowerCase()))
                        .map((biz) => (
                          <tr key={biz.id}>
                            <td className="py-3 px-4 font-semibold">{biz.name}</td>
                            <td className="py-3 px-4">
                              <select
                                value={biz.planId}
                                onChange={async (e) => {
                                  await apiFetch(`/api/admin/businesses/${biz.id}`, {
                                    method: 'PATCH',
                                    body: JSON.stringify({ planId: e.target.value }),
                                  });
                                  showToast('Customer plan updated.', 'success');
                                  void loadAdmin();
                                }}
                                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs"
                              >
                                <option value="free">Free</option>
                                <option value="basic">Basic</option>
                                <option value="pro">Pro</option>
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={async () => {
                                  await apiFetch(`/api/admin/businesses/${biz.id}`, {
                                    method: 'PATCH',
                                    body: JSON.stringify({ aiEnabled: !biz.aiEnabled }),
                                  });
                                  showToast('Per-shop AI flag updated.', 'info');
                                  void loadAdmin();
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                  biz.aiEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                }`}
                              >
                                {biz.aiEnabled ? 'Enabled' : 'Disabled'}
                              </button>
                            </td>
                            <td className="py-3 px-4 font-mono tabular-nums">{biz.aiDraftsUsedThisMonth}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'products' && (
              <div className="space-y-4">
                <h1 className="font-display text-2xl font-bold">Manage Hardware Prices (Live Storefront)</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.products.map((prod) => (
                    <div key={prod.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                      <h3 className="font-display font-bold text-base">{prod.name}</h3>
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-semibold text-slate-600">Price (₹):</label>
                        <input
                          type="number"
                          defaultValue={prod.priceInr}
                          onBlur={async (e) => {
                            const val = Number(e.target.value);
                            if (val >= 0 && val !== prod.priceInr) {
                              await apiFetch(`/api/admin/products/${prod.id}`, {
                                method: 'PATCH',
                                body: JSON.stringify({ priceInr: val }),
                              });
                              await refreshBootstrap();
                              showToast(`${prod.name} price updated to ₹${val}.`, 'success');
                            }
                          }}
                          className="w-28 rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-mono font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'pricing' && (
              <div className="space-y-6">
                <h1 className="font-display text-2xl font-bold">Editable Plan Limits &amp; Promo Banner</h1>

                {/* Promo Banner Editor */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <h2 className="font-display text-base font-bold">Homepage Promo Banner</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={data.siteConfig.promoBanner.text}
                      onChange={(e) =>
                        setData({
                          ...data,
                          siteConfig: {
                            ...data.siteConfig,
                            promoBanner: { ...data.siteConfig.promoBanner, text: e.target.value },
                          },
                        })
                      }
                      className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                    />
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 text-xs font-semibold">
                        <input
                          type="checkbox"
                          checked={data.siteConfig.promoBanner.enabled}
                          onChange={(e) =>
                            setData({
                              ...data,
                              siteConfig: {
                                ...data.siteConfig,
                                promoBanner: { ...data.siteConfig.promoBanner, enabled: e.target.checked },
                              },
                            })
                          }
                        />
                        Show Promo Banner
                      </label>
                      <button
                        onClick={async () => {
                          await apiFetch('/api/admin/config', {
                            method: 'PATCH',
                            body: JSON.stringify({ promoBanner: data.siteConfig.promoBanner }),
                          });
                          await refreshBootstrap();
                          showToast('Promo banner updated live.', 'success');
                        }}
                        className="px-4 py-2 rounded-xl bg-[#004CF6] text-white text-xs font-semibold"
                      >
                        Save Banner
                      </button>
                    </div>
                  </div>
                </div>

                {/* Plan Limits Editor */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.plans.map((pl) => (
                    <div key={pl.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                      <h3 className="font-display font-bold text-lg">{pl.name}</h3>
                      <div className="space-y-2 text-xs">
                        <label className="block">
                          Monthly Price (₹)
                          <input
                            type="number"
                            defaultValue={pl.priceInrMonthly}
                            onBlur={async (e) => {
                              await apiFetch(`/api/admin/plans/${pl.id}`, {
                                method: 'PATCH',
                                body: JSON.stringify({ priceInrMonthly: Number(e.target.value) }),
                              });
                              await refreshBootstrap();
                              showToast('Plan price updated.', 'success');
                            }}
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono"
                          />
                        </label>
                        <label className="block">
                          Max AI Drafts / Month
                          <input
                            type="number"
                            defaultValue={pl.maxAiDraftsPerMonth}
                            onBlur={async (e) => {
                              await apiFetch(`/api/admin/plans/${pl.id}`, {
                                method: 'PATCH',
                                body: JSON.stringify({ maxAiDraftsPerMonth: Number(e.target.value) }),
                              });
                              await refreshBootstrap();
                              showToast('Plan limit updated.', 'success');
                            }}
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'qrs' && (
              <div className="space-y-4">
                <h1 className="font-display text-2xl font-bold">QR Short-Link Moderation</h1>
                <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
                  {data.qrCodes.map((q) => (
                    <div key={q.id} className="p-4 flex items-center justify-between gap-4 text-sm">
                      <div>
                        <p className="font-semibold">{q.name}</p>
                        <p className="text-xs font-mono text-slate-500">/q/{q.shortCode} → {q.destinationUrl}</p>
                      </div>
                      <button
                        onClick={async () => {
                          await apiFetch(`/api/admin/qrs/${q.id}/toggle`, { method: 'PATCH' });
                          showToast('QR status toggled.', 'info');
                          void loadAdmin();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                          q.status === 'active' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {q.status === 'active' ? 'Disable Code' : 'Re-Enable'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(tab === 'ai' || tab === 'settings') && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="font-display text-lg font-bold flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-[#004CF6]" />
                      Global AI Kill Switch
                    </h2>
                    <p className="text-xs text-slate-600">
                      Immediately pauses all Review Assist, Reply Assist, and Insights endpoints across the platform.
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      const next = !data.siteConfig.globalAiKillSwitch;
                      await apiFetch('/api/admin/config', {
                        method: 'PATCH',
                        body: JSON.stringify({ globalAiKillSwitch: next }),
                      });
                      await refreshBootstrap();
                      showToast(next ? 'Global AI Kill Switch ACTIVATED.' : 'AI tools re-enabled.', next ? 'error' : 'success');
                      void loadAdmin();
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold ${
                      data.siteConfig.globalAiKillSwitch
                        ? 'bg-emerald-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {data.siteConfig.globalAiKillSwitch ? 'AI Paused — Click to Resume' : 'Activate Global Kill Switch'}
                  </button>
                </div>

                {data.siteConfig.globalAiKillSwitch && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    All customer and owner AI endpoints are currently disabled.
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="p-5 border-b border-slate-100">
                    <h3 className="font-display font-bold text-base">Recent AI Usage &amp; Cost Ledger</h3>
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F4F7FB] text-slate-600">
                      <tr>
                        <th className="py-3 px-4">Feature</th>
                        <th className="py-3 px-4">Tokens</th>
                        <th className="py-3 px-4">Est. Cost (₹)</th>
                        <th className="py-3 px-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.aiUsage.map((row) => (
                        <tr key={row.id}>
                          <td className="py-3 px-4 font-semibold">{row.feature}</td>
                          <td className="py-3 px-4 font-mono tabular-nums">{row.tokensApprox}</td>
                          <td className="py-3 px-4 font-mono tabular-nums">₹{row.costInr}</td>
                          <td className="py-3 px-4 text-slate-500">{new Date(row.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
