import React, { useMemo, useState } from 'react';
import { CheckCircle2, CreditCard, MessageCircle, Smartphone, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';
import { CardProofPreview } from '../components/CardProofPreview';
import type { OrderRecord, ProductRecord } from '../types/tapfx';

export function ProductCustomizerPage() {
  const { products, navigate, showToast, t } = useApp();

  const initialProductSlug = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('product') as ProductRecord['slug'] | null;
    return slug && products.some((p) => p.slug === slug) ? slug : 'master-card';
  }, [products]);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [productSlug, setProductSlug] = useState<ProductRecord['slug']>(initialProductSlug);
  const [quantity, setQuantity] = useState<number>(1);

  const [personName, setPersonName] = useState('Aarav Patnaik');
  const [businessName, setBusinessName] = useState('Kalinga Spice Bistro');
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const [phone, setPhone] = useState('+91 96922 99405');
  const [email, setEmail] = useState('owner@tapfx.com');
  const [website, setWebsite] = useState('https://tapfx.com/kalinga-bistro');
  const [instagram, setInstagram] = useState('@kalingaspice');
  const [facebook, setFacebook] = useState('');
  const [whatsapp, setWhatsapp] = useState('919692299405');
  const [googleReviewUrl, setGoogleReviewUrl] = useState(
    'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4'
  );
  const [address, setAddress] = useState('Saheed Nagar, Bhubaneswar, Odisha');
  const [destinationType, setDestinationType] = useState<'review' | 'multi-link' | 'website' | 'wifi'>('review');
  const [destinationValue, setDestinationValue] = useState('https://tapfx.com/r/kalinga-review');
  const [cardTheme, setCardTheme] = useState<'royal-blue' | 'obsidian' | 'pearl-white' | 'cobalt-metal'>('royal-blue');
  const [proofConfirmed, setProofConfirmed] = useState(false);

  const [shipName, setShipName] = useState('Aarav Patnaik');
  const [shipPhone, setShipPhone] = useState('+91 96922 99405');
  const [shipLine1, setShipLine1] = useState('Plot 42, Janpath Road, Saheed Nagar');
  const [shipCity, setShipCity] = useState('Bhubaneswar');
  const [shipState, setShipState] = useState('Odisha');
  const [shipPincode, setShipPincode] = useState('751007');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'WhatsApp'>('UPI');

  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);

  const selectedProduct = products.find((p) => p.slug === productSlug) || products[0];
  const totalInr = useMemo(() => {
    if (!selectedProduct) return 0;
    if (selectedProduct.slug === 'wifi-card' && quantity === 10 && selectedProduct.bundlePriceInr) {
      return selectedProduct.bundlePriceInr;
    }
    return selectedProduct.priceInr * quantity;
  }, [selectedProduct, quantity]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Logo must be under 5 MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setLogoDataUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofConfirmed) {
      showToast('Please confirm your front & back card proof checkbox before placing the order.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch<{ order: OrderRecord }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          productSlug,
          quantity,
          paymentMethod,
          customization: {
            personName,
            businessName,
            logoDataUrl: logoDataUrl || undefined,
            phone,
            email,
            website,
            instagram,
            facebook,
            whatsapp,
            googleReviewUrl,
            address,
            destinationType,
            destinationValue,
            cardTheme,
          },
          shippingAddress: {
            fullName: shipName,
            phone: shipPhone,
            line1: shipLine1,
            city: shipCity,
            state: shipState,
            pincode: shipPincode,
          },
        }),
      });
      setCompletedOrder(res.order);
      showToast(`Order ${res.order.orderNumber} confirmed!`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Order failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (completedOrder) {
    const waText = encodeURIComponent(
      `Hi TapFX! I placed order ${completedOrder.orderNumber} for ${completedOrder.quantity}x ${completedOrder.productName} (₹${completedOrder.totalInr}) for ${completedOrder.customization.businessName}.`
    );

    return (
      <div className="bg-[#F4F7FB] min-h-screen py-14">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-mono font-bold text-[#004CF6]">{completedOrder.orderNumber}</p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A]">
                Order Received &amp; Proof Queued
              </h1>
              <p className="text-sm text-slate-600">
                Thank you, {completedOrder.shippingAddress.fullName}. Your {completedOrder.quantity}×{' '}
                <strong>{completedOrder.productName}</strong> order (₹{completedOrder.totalInr}) is now in our design studio queue.
              </p>
            </div>

            <div className="max-w-sm mx-auto text-left">
              <CardProofPreview
                productSlug={completedOrder.productSlug}
                businessName={completedOrder.customization.businessName}
                personName={completedOrder.customization.personName}
                phone={completedOrder.customization.phone}
                email={completedOrder.customization.email}
                website={completedOrder.customization.website}
                logoDataUrl={completedOrder.customization.logoDataUrl}
                destinationUrl={completedOrder.customization.destinationValue}
                cardTheme={completedOrder.customization.cardTheme}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate(`/track/${completedOrder.orderNumber}`)}
                className="px-6 py-3 rounded-xl bg-[#004CF6] hover:bg-[#0030C0] text-white text-sm font-semibold"
              >
                {t.orderFlow.trackOrder}
              </button>
              <a
                href={`https://wa.me/919692299405?text=${waText}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold"
              >
                <MessageCircle className="w-4 h-4" />
                Send Confirmation on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F4F7FB] min-h-screen py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-semibold text-[#004CF6]">TapFX Card Studio &amp; Checkout</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
            {t.orderFlow.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600">{t.orderFlow.subtitle}</p>
        </div>

        {/* Step Navigation */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 1, label: t.orderFlow.stepProduct },
            { id: 2, label: t.orderFlow.stepDetails },
            { id: 3, label: t.orderFlow.stepShipping },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStep(item.id as 1 | 2 | 3)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                step === item.id ? 'bg-[#004CF6] text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form Column */}
          <div className="lg:col-span-7 space-y-6">
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
                <h2 className="font-display text-lg font-bold text-[#0F172A]">Select Product &amp; Quantity</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => setProductSlug(prod.slug)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        productSlug === prod.slug
                          ? 'border-[#004CF6] bg-blue-50/50 ring-1 ring-[#004CF6]'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-bold text-sm text-[#0F172A]">{prod.name}</span>
                        <span className="font-mono text-sm font-bold text-[#004CF6] tabular-nums">₹{prod.priceInr}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{prod.tagline}</p>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Quantity</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-10 h-10 rounded-xl border border-slate-200 font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                        className="w-20 text-center rounded-xl border border-slate-200 py-2 font-mono font-bold text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-10 h-10 rounded-xl border border-slate-200 font-bold"
                      >
                        +
                      </button>
                      {productSlug === 'wifi-card' && (
                        <button
                          type="button"
                          onClick={() => setQuantity(10)}
                          className="px-3 py-2 rounded-xl bg-blue-50 text-[#004CF6] text-xs font-semibold"
                        >
                          10-Pack (₹499)
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Card Finish / Theme</label>
                    <select
                      value={cardTheme}
                      onChange={(e) => setCardTheme(e.target.value as typeof cardTheme)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white"
                    >
                      <option value="royal-blue">TapFX Royal Blue</option>
                      <option value="obsidian">Executive Obsidian</option>
                      <option value="pearl-white">Minimal Pearl White</option>
                      <option value="cobalt-metal">Anodized Cobalt</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-[#004CF6] text-white text-xs font-semibold"
                  >
                    Next: Business Details →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <h2 className="font-display text-lg font-bold text-[#0F172A]">Personalization &amp; Destination</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name / Role</label>
                    <input
                      type="text"
                      required
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Business / Shop Name</label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Instagram / Social Handle</label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Facebook (Optional)</label>
                    <input
                      type="text"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Google Maps / Review URL</label>
                  <input
                    type="text"
                    value={googleReviewUrl}
                    onChange={(e) => setGoogleReviewUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Business Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">QR / NFC Destination Mode</label>
                    <select
                      value={destinationType}
                      onChange={(e) => setDestinationType(e.target.value as typeof destinationType)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm bg-white"
                    >
                      <option value="review">Google Review Page (/r/code)</option>
                      <option value="multi-link">Multi-Link Business Profile</option>
                      <option value="website">Direct Website</option>
                      <option value="wifi">Guest WiFi Credentials</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Upload Business Logo (up to 5 MB)</label>
                    <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-[#004CF6] cursor-pointer">
                      <Upload className="w-4 h-4 text-[#004CF6]" />
                      {logoDataUrl ? 'Change Logo' : 'Upload Logo'}
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Linked Destination URL</label>
                  <input
                    type="text"
                    value={destinationValue}
                    onChange={(e) => setDestinationValue(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-[#004CF6] text-white text-xs font-semibold"
                  >
                    Next: Shipping &amp; Payment →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
                <h2 className="font-display text-lg font-bold text-[#0F172A]">Shipping Address &amp; Payment</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={shipName}
                      onChange={(e) => setShipName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Phone</label>
                    <input
                      type="text"
                      required
                      value={shipPhone}
                      onChange={(e) => setShipPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address / Shop Landmark</label>
                    <input
                      type="text"
                      required
                      value={shipLine1}
                      onChange={(e) => setShipLine1(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={shipCity}
                      onChange={(e) => setShipCity(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={shipState}
                        onChange={(e) => setShipState(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
                      <input
                        type="text"
                        required
                        value={shipPincode}
                        onChange={(e) => setShipPincode(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="space-y-2.5 pt-2">
                  <span className="block text-xs font-semibold text-slate-700">Payment Method</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'UPI', label: t.orderFlow.payUpi, icon: Smartphone },
                      { id: 'Card', label: t.orderFlow.payCard, icon: CreditCard },
                      { id: 'WhatsApp', label: t.orderFlow.orderWhatsapp, icon: MessageCircle },
                    ].map((pm) => {
                      const Icon = pm.icon;
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMethod(pm.id as typeof paymentMethod)}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold ${
                            paymentMethod === pm.id
                              ? 'border-[#004CF6] bg-blue-50/50 text-[#004CF6]'
                              : 'border-slate-200 text-slate-700'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{pm.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={proofConfirmed}
                    onChange={(e) => setProofConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#004CF6]"
                  />
                  <span>
                    I have reviewed the live front &amp; back design preview and confirm all business details and destination links are accurate.
                  </span>
                </label>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl bg-[#004CF6] hover:bg-[#0030C0] disabled:opacity-50 text-white text-sm font-semibold"
                  >
                    {submitting ? 'Submitting Order...' : `${t.orderFlow.placeOrder} (₹${totalInr})`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Live Proof & Summary Column */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <CardProofPreview
              productSlug={productSlug}
              businessName={businessName}
              personName={personName}
              phone={phone}
              email={email}
              website={website}
              logoDataUrl={logoDataUrl}
              destinationUrl={destinationValue}
              cardTheme={cardTheme}
            />

            <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Product</span>
                <span className="font-semibold text-[#0F172A]">{selectedProduct?.name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Quantity</span>
                <span className="font-mono tabular-nums font-semibold text-[#0F172A]">{quantity}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping (Pan-India)</span>
                <span className="font-semibold text-emerald-700">Free</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 text-base font-bold text-[#0F172A]">
                <span>Total Payable</span>
                <span className="font-mono tabular-nums text-[#004CF6]">₹{totalInr}</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
