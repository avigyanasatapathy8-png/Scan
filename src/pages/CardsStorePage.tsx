import React from 'react';
import { ArrowRight, Check, ShieldCheck, Truck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function CardsStorePage({ productSlug }: { productSlug?: string }) {
  const { products, navigate } = useApp();

  if (productSlug) {
    const prod = products.find((p) => p.slug === productSlug) || products[0];
    if (!prod) {
      return <div className="py-20 text-center text-sm text-slate-500">Loading product...</div>;
    }

    return (
      <div className="bg-white min-h-screen py-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-12">
          <button
            onClick={() => navigate('/cards')}
            className="text-xs font-semibold text-[#004CF6] hover:underline"
          >
            ← Back to All TapFX Products
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-[#F4F7FB] overflow-hidden aspect-[4/3]">
                <img
                  src={prod.image}
                  alt={prod.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {prod.specs.map((sp) => (
                  <div key={sp.label} className="rounded-xl border border-slate-200 p-3 bg-[#F4F7FB]">
                    <p className="text-[11px] text-slate-500">{sp.label}</p>
                    <p className="text-xs font-semibold text-[#0F172A] mt-0.5">{sp.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                {prod.badge && <p className="text-xs font-semibold text-[#004CF6]">{prod.badge}</p>}
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
                  {prod.name}
                </h1>
                <p className="text-base text-slate-600 leading-relaxed">{prod.description}</p>
              </div>

              <div className="flex items-baseline gap-3 border-y border-slate-200 py-4">
                <span className="font-display text-3xl font-extrabold tabular-nums text-[#0F172A]">
                  ₹{prod.priceInr}
                </span>
                {prod.bundlePriceInr && (
                  <span className="text-sm font-semibold text-[#004CF6]">
                    or {prod.bundleLabel} for ₹{prod.bundlePriceInr}
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                <h3 className="text-sm font-bold text-[#0F172A]">What is included</h3>
                <ul className="space-y-2">
                  {prod.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm text-slate-700">
                      <Check className="w-4 h-4 text-[#004CF6] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => navigate(`/order?product=${prod.slug}`)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#004CF6] hover:bg-[#0030C0] text-white text-sm font-semibold transition-colors"
                >
                  Customize &amp; Order Now
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href={`https://wa.me/919692299405?text=${encodeURIComponent(
                    `Hi TapFX team, I want to order the ${prod.name}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-slate-300 text-sm font-semibold text-[#0F172A] hover:border-[#004CF6]"
                >
                  Ask on WhatsApp
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#004CF6]" />
                  Online front &amp; back proof before print
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#004CF6]" />
                  Tracked pan-India shipping
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F4F7FB] min-h-screen py-14">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-semibold text-[#004CF6]">TapFX Hardware Collection</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
              NFC Business Cards, WiFi Cards &amp; Acrylic Stands
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Every card pairs dual NFC tap and crisp QR scanning with live online design proofing and editable destinations.
            </p>
          </div>
          <button
            onClick={() => navigate('/track/TFX-2026-1042')}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[#0F172A] hover:border-[#004CF6]"
          >
            Track Existing Order
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => (
            <div key={prod.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
              <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                <img
                  src={prod.image}
                  alt={prod.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{prod.badge || 'NFC + QR'}</span>
                    <span className="font-mono font-bold text-base text-[#0F172A] tabular-nums">
                      ₹{prod.priceInr}
                    </span>
                  </div>
                  <h2 className="font-display text-lg font-bold text-[#0F172A]">{prod.name}</h2>
                  <p className="text-sm text-slate-600">{prod.tagline}</p>
                  <ul className="space-y-1.5 pt-2">
                    {prod.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-[#004CF6] shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => navigate(`/cards/${prod.slug}`)}
                    className="py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#0F172A] hover:border-[#004CF6]"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => navigate(`/order?product=${prod.slug}`)}
                    className="py-2.5 rounded-xl bg-[#004CF6] hover:bg-[#0030C0] text-xs font-semibold text-white"
                  >
                    Customize &amp; Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-display text-xl font-bold text-[#0F172A]">Hardware Comparison</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F4F7FB] text-xs font-semibold text-slate-600">
              <tr>
                <th className="py-3 px-5">Model</th>
                <th className="py-3 px-5">Price</th>
                <th className="py-3 px-5">NFC + QR</th>
                <th className="py-3 px-5">Multi-Link Page</th>
                <th className="py-3 px-5">Best For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3.5 px-5 font-semibold">TapFX Common Card</td>
                <td className="py-3.5 px-5 font-mono tabular-nums">₹799</td>
                <td className="py-3.5 px-5">Yes</td>
                <td className="py-3.5 px-5">Basic profile</td>
                <td className="py-3.5 px-5 text-slate-600">Solo professionals &amp; small shops</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold">TapFX Master Card</td>
                <td className="py-3.5 px-5 font-mono tabular-nums">₹999</td>
                <td className="py-3.5 px-5">Dual Antenna + QR</td>
                <td className="py-3.5 px-5">Full profile + portfolio</td>
                <td className="py-3.5 px-5 text-slate-600">Clinics, founders &amp; teams</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold">TapFX Magic Card</td>
                <td className="py-3.5 px-5 font-mono tabular-nums">₹1,499</td>
                <td className="py-3.5 px-5">Shielded NFC + Dynamic QR</td>
                <td className="py-3.5 px-5">Custom Multi-Link + Analytics</td>
                <td className="py-3.5 px-5 text-slate-600">Multi-outlet brands &amp; executives</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold">TapFX WiFi Card</td>
                <td className="py-3.5 px-5 font-mono tabular-nums">₹99 (10 for ₹499)</td>
                <td className="py-3.5 px-5">WiFi Tap + QR</td>
                <td className="py-3.5 px-5">SSID Auto-Join</td>
                <td className="py-3.5 px-5 text-slate-600">Cafes, lounges &amp; hotel rooms</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold">TapFX Acrylic QR Stand</td>
                <td className="py-3.5 px-5 font-mono tabular-nums">₹649</td>
                <td className="py-3.5 px-5">Tabletop QR + NFC</td>
                <td className="py-3.5 px-5">Google Review / Menu</td>
                <td className="py-3.5 px-5 text-slate-600">Billing counters &amp; tables</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
