import React from 'react';
import { Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function PricingPage() {
  const { plans, navigate, user } = useApp();

  return (
    <div className="bg-[#F4F7FB] min-h-screen py-14">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-xs font-semibold text-[#004CF6]">TapFX Care &amp; SaaS Plans</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] text-balance">
            Simple Pricing. Editable Limits.
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Start free with 10 QR codes and 5,000 monthly scans. Upgrade to Basic or Pro for unlimited QR creation, Google Business Profile review tools, and GST invoicing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isPro = plan.id === 'pro';
            const features = [
              { label: `${plan.maxQrCodes === -1 ? 'Unlimited' : plan.maxQrCodes} Website & Short-Link QR Codes`, ok: true },
              { label: `${plan.maxScansPerMonth.toLocaleString('en-IN')} Scans / Month`, ok: true },
              { label: `${plan.maxLinkPages} Multi-Link Page${plan.maxLinkPages > 1 ? 's' : ''}`, ok: true },
              { label: `${plan.maxImageUploads} Image Uploads`, ok: true },
              { label: `${plan.analyticsRetentionDays} Days Analytics Retention`, ok: true },
              { label: `${plan.maxGoogleProfiles} Google Business Profile${plan.maxGoogleProfiles === 1 ? '' : 's'}`, ok: plan.maxGoogleProfiles > 0 },
              { label: `${plan.maxAiDraftsPerMonth} AI Review & Reply Drafts / Mo`, ok: plan.maxAiDraftsPerMonth > 0 },
              { label: 'Remove "Powered by TapFX" Branding', ok: plan.removeBranding },
              { label: 'Custom Domain & API Access', ok: plan.customDomainApi },
              { label: 'Priority WhatsApp Support', ok: plan.prioritySupport },
            ];

            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-7 flex flex-col justify-between space-y-6 bg-white ${
                  isPro ? 'border-[#004CF6] ring-1 ring-[#004CF6]' : 'border-slate-200'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-2xl font-bold text-[#0F172A]">{plan.name}</h2>
                    {isPro && <span className="text-xs font-bold text-[#004CF6]">Most Popular</span>}
                  </div>
                  <p className="text-xs text-slate-600">{plan.audience}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl font-extrabold tabular-nums text-[#0F172A]">
                      ₹{plan.priceInrMonthly}
                    </span>
                    <span className="text-xs text-slate-500">/ month + GST</span>
                  </div>
                  <ul className="space-y-2.5 pt-3 border-t border-slate-100">
                    {features.map((f) => (
                      <li
                        key={f.label}
                        className={`flex items-center gap-2.5 text-sm ${
                          f.ok ? 'text-slate-700' : 'text-slate-400 line-through'
                        }`}
                      >
                        {f.ok ? (
                          <Check className="w-4 h-4 text-[#004CF6] shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                        <span>{f.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => navigate(user ? '/app/subscription' : '/signup')}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isPro
                      ? 'bg-[#004CF6] hover:bg-[#0030C0] text-white'
                      : 'bg-[#0F172A] hover:bg-[#004CF6] text-white'
                  }`}
                >
                  {user ? `Switch to ${plan.name}` : plan.ctaLabel}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
