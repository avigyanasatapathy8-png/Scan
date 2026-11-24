import React, { useEffect, useState } from 'react';
import { Check, MessageCircle, Search, Truck } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useApp } from '../context/AppContext';
import { CardProofPreview } from '../components/CardProofPreview';
import type { OrderRecord, OrderStage } from '../types/tapfx';

const ORDER_STAGES: OrderStage[] = [
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

export function OrderTrackingPage({ initialOrderNumber }: { initialOrderNumber?: string }) {
  const { showToast } = useApp();
  const [query, setQuery] = useState(initialOrderNumber || 'TFX-2026-1042');
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrder = async (orderNum: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch<{ order: OrderRecord }>(`/api/orders/track/${encodeURIComponent(orderNum)}`);
      setOrder(res.order);
    } catch (err) {
      setOrder(null);
      setError(err instanceof Error ? err.message : 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrder(query);
  }, []);

  const handleApproveProof = async () => {
    if (!order) return;
    try {
      const res = await apiFetch<{ order: OrderRecord }>(
        `/api/orders/track/${encodeURIComponent(order.orderNumber)}/approve-proof`,
        { method: 'POST' }
      );
      setOrder(res.order);
      showToast('Design proof approved! Moved to Printing.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not approve proof', 'error');
    }
  };

  const activeIndex = order ? ORDER_STAGES.indexOf(order.status) : -1;

  return (
    <div className="bg-[#F4F7FB] min-h-screen py-12">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#004CF6]">TapFX Fulfillment Tracker</p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#0F172A]">Order Tracking &amp; Proof Approval</h1>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void fetchOrder(query);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value.toUpperCase())}
                placeholder="TFX-2026-1042"
                className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-mono focus:border-[#004CF6] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#004CF6] text-white text-xs font-semibold hover:bg-[#0030C0]"
            >
              Track
            </button>
          </form>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span>Try sample orders:</span>
          {['TFX-2026-1042', 'TFX-2026-1039'].map((sample) => (
            <button
              key={sample}
              onClick={() => {
                setQuery(sample);
                void fetchOrder(sample);
              }}
              className="font-mono font-semibold text-[#004CF6] hover:underline"
            >
              {sample}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="h-6 bg-slate-100 rounded w-1/3" />
            <div className="h-32 bg-slate-100 rounded" />
          </div>
        ) : error || !order ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
            <p className="font-display font-bold text-lg text-[#0F172A]">Order Not Found</p>
            <p className="text-sm text-slate-500">{error || 'Check your order number and try again.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* 10-Stage Timeline */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-mono text-slate-500">{order.orderNumber}</p>
                  <h2 className="font-display text-xl font-bold text-[#0F172A]">
                    {order.quantity}× {order.productName}
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-lg bg-blue-50 text-[#004CF6] text-xs font-bold">
                  {order.status}
                </span>
              </div>

              {(order.status === 'Proof Ready' || order.status === 'Approval Required') && !order.proofApproved && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">Your Design Proof is Ready</p>
                    <p className="text-xs text-slate-600">Review the front &amp; back preview and approve to start printing.</p>
                  </div>
                  <button
                    onClick={handleApproveProof}
                    className="px-4 py-2 rounded-xl bg-[#004CF6] hover:bg-[#0030C0] text-white text-xs font-semibold shrink-0"
                  >
                    Approve Proof
                  </button>
                </div>
              )}

              <ol className="space-y-3">
                {ORDER_STAGES.map((stage, idx) => {
                  const done = idx <= activeIndex;
                  const current = idx === activeIndex;
                  return (
                    <li key={stage} className="flex items-center gap-3.5">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          done ? 'bg-[#004CF6] text-white' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </span>
                      <span
                        className={`text-sm ${
                          current ? 'font-bold text-[#004CF6]' : done ? 'font-semibold text-[#0F172A]' : 'text-slate-400'
                        }`}
                      >
                        {stage}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Right Proof & Shipping */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <CardProofPreview
                  productSlug={order.productSlug}
                  businessName={order.customization.businessName}
                  personName={order.customization.personName}
                  phone={order.customization.phone}
                  email={order.customization.email}
                  website={order.customization.website}
                  logoDataUrl={order.customization.logoDataUrl}
                  destinationUrl={order.customization.destinationValue}
                  cardTheme={order.customization.cardTheme}
                />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 text-sm">
                <h3 className="font-display font-bold text-[#0F172A] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#004CF6]" />
                  Shipping &amp; Courier
                </h3>
                <p className="text-slate-700 font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-xs text-slate-600">
                  {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                  {order.shippingAddress.pincode}
                </p>
                {order.trackingCode && (
                  <p className="text-xs font-mono text-[#004CF6]">
                    {order.courierName || 'Courier'} · {order.trackingCode}
                  </p>
                )}
                <a
                  href={`https://wa.me/919692299405?text=${encodeURIComponent(
                    `Hi TapFX support, checking on order ${order.orderNumber}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#16A34A] hover:underline pt-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact Order Support on WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
