import React, { useState } from 'react';
import { CheckCircle2, Mail, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';

export function InfoPages({ page }: { page: string }) {
  const { siteConfig, navigate, showToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, message }),
      });
      setSent(true);
      showToast('Message sent to the TapFX team.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to submit', 'error');
    }
  };

  if (page === '/contact') {
    return (
      <div className="bg-[#F4F7FB] min-h-screen py-14">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 space-y-4">
            <p className="text-xs font-semibold text-[#004CF6]">Contact TapFX</p>
            <h1 className="font-display text-3xl font-bold text-[#0F172A]">Talk to Our Team</h1>
            <p className="text-sm text-slate-600">
              Questions about bulk NFC card orders, custom acrylic stands, or multi-outlet pricing? Reach us directly.
            </p>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-sm">
              <p className="flex items-center gap-2.5 text-slate-700">
                <Phone className="w-4 h-4 text-[#004CF6]" />
                WhatsApp: +91 96922 99405
              </p>
              <p className="flex items-center gap-2.5 text-slate-700">
                <Mail className="w-4 h-4 text-[#004CF6]" />
                Email: tapfxx@gmail.com
              </p>
              <a
                href="https://wa.me/919692299405"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16A34A] text-white text-xs font-semibold"
              >
                <MessageCircle className="w-4 h-4" />
                Open WhatsApp Chat
              </a>
            </div>
          </div>

          <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
            {sent ? (
              <div className="py-10 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h2 className="font-display text-xl font-bold">Inquiry Received</h2>
                <p className="text-sm text-slate-600">Our team will reply on email or WhatsApp shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                  />
                </div>
                <button type="submit" className="px-6 py-3 rounded-xl bg-[#004CF6] text-white text-sm font-semibold">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (page === '/faq') {
    return (
      <div className="bg-[#F4F7FB] min-h-screen py-14">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 space-y-6">
          <h1 className="font-display text-3xl font-bold text-[#0F172A]">Frequently Asked Questions</h1>
          <div className="space-y-3">
            {(siteConfig?.faqs ?? []).map((f) => (
              <div key={f.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1.5">
                <h2 className="font-display font-bold text-base text-[#0F172A]">{f.q}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (page === '/how-it-works') {
    return (
      <div className="bg-white min-h-screen py-14">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 space-y-10">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-semibold text-[#004CF6]">How TapFX Works</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0F172A]">
              Connect Physical Touchpoints to Live Digital Experiences
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { n: 'Step 01', t: 'Create Your QR or Profile', d: 'Use our 16-type QR Studio or drag-and-drop Multi-Link Builder to create your digital destination.' },
              { n: 'Step 02', t: 'Customize & Verify Scannability', d: 'Choose from 12 patterns, 16 gradients, custom frames, and logos with automatic contrast checks.' },
              { n: 'Step 03', t: 'Pair NFC Cards or Print Stands', d: 'Order Common, Master, Magic, WiFi cards or Acrylic Stands with online front & back proof approval.' },
              { n: 'Step 04', t: 'Collect Real Reviews & Analytics', d: 'Track every scan and tap, invite genuine Google reviews, and reply quickly with owner-approved AI drafts.' },
            ].map((item) => (
              <div key={item.n} className="rounded-2xl border border-slate-200 bg-[#F4F7FB] p-6 space-y-2">
                <span className="font-mono text-xs font-bold text-[#004CF6]">{item.n}</span>
                <h2 className="font-display text-xl font-bold text-[#0F172A]">{item.t}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/generator')}
            className="px-6 py-3 rounded-xl bg-[#004CF6] text-white text-sm font-semibold"
          >
            Launch QR Studio
          </button>
        </div>
      </div>
    );
  }

  const legalTitle =
    page === '/privacy'
      ? 'Privacy Policy & Data Protection'
      : page === '/terms'
        ? 'Terms & Conditions'
        : page === '/replacement-policy'
          ? 'Replacement & Refund Policy'
          : 'Real Reviews Only & How We Use AI';

  return (
    <div className="bg-white min-h-screen py-14">
      <div className="max-w-[820px] mx-auto px-4 sm:px-6 space-y-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#004CF6]">
          <ShieldCheck className="w-4 h-4" />
          TapFX Trust &amp; Compliance
        </div>
        <h1 className="font-display text-3xl font-bold text-[#0F172A]">{legalTitle}</h1>

        {page === '/real-reviews' ? (
          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <p>
              <strong>Real Experiences Only:</strong> TapFX never fabricates reviews, never offers incentives or rewards for reviews, and never gates or hides the Google review button based on star ratings.
            </p>
            <p>
              <strong>Customer-Led AI Wording Help:</strong> When enabled by a shop, optional Review Assist helps customers express only the tags and notes they personally chose. Customers review, edit, and post the text themselves on Google.
            </p>
            <p>
              <strong>Private Feedback Without Gating:</strong> Every visitor sees the primary &ldquo;Review us on Google&rdquo; button alongside an optional &ldquo;Tell the shop privately&rdquo; link.
            </p>
            <p>
              <strong>Privacy &amp; Disclosure:</strong> AI drafts include the clear notice &ldquo;AI helped word this. Write only what you experienced.&rdquo; TapFX strips email addresses and phone numbers before AI processing and stores zero visitor IP addresses in scan logs.
            </p>
          </div>
        ) : page === '/replacement-policy' ? (
          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <p>Every personalized NFC card and Acrylic QR Stand undergoes an online design proof approval before printing.</p>
            <p>If your delivered hardware arrives damaged, misprinted relative to your approved proof, or with an unreadable NFC chip, TapFX provides a free replacement within 7 days of delivery.</p>
            <p>Contact +91 96922 99405 or tapfxx@gmail.com with your order number and a photo of the item.</p>
          </div>
        ) : page === '/privacy' ? (
          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <p>TapFX collects only the minimum business and order details needed to deliver QR management, physical card printing, and analytics.</p>
            <p>Public QR scan logs record device type, operating system, source (QR or NFC), and approximate city without storing visitor IP addresses or personal identifiers.</p>
            <p>Account owners may request deletion of business records or review drafts at any time via tapfxx@gmail.com.</p>
          </div>
        ) : (
          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <p>By using TapFX, businesses agree to link QR codes and NFC cards only to lawful destinations and to comply with applicable platform guidelines.</p>
            <p>TapFX reserves the right to pause short-links or pages found directing to malicious or deceptive websites.</p>
          </div>
        )}
      </div>
    </div>
  );
}
