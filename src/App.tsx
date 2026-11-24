import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { HomePage } from './pages/HomePage';
import { GeneratorPage } from './pages/GeneratorPage';
import { PricingPage } from './pages/PricingPage';
import { CardsStorePage } from './pages/CardsStorePage';
import { ProductCustomizerPage } from './pages/ProductCustomizerPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { PublicReviewPage } from './pages/PublicReviewPage';
import { PublicLinkPage } from './pages/PublicLinkPage';
import { AuthPage } from './pages/AuthPage';
import { InfoPages } from './pages/InfoPages';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

function PasswordGatePage({ code }: { code: string }) {
  const [pass, setPass] = useState('');
  const { navigate } = useApp();
  return (
    <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (pass.trim()) navigate(`/r/${code}`);
        }}
        className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 p-6 space-y-4 text-center"
      >
        <Lock className="w-8 h-8 mx-auto text-[#004CF6]" />
        <h1 className="font-display text-lg font-bold text-[#0F172A]">Protected QR Destination</h1>
        <p className="text-xs text-slate-500">Enter the QR passcode to continue.</p>
        <input
          type="password"
          required
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Passcode"
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
        />
        <button type="submit" className="w-full py-2.5 rounded-xl bg-[#004CF6] text-white text-sm font-semibold">
          Continue
        </button>
      </form>
    </div>
  );
}

function AppRouter() {
  const { route } = useApp();
  const cleanPath = route.split('?')[0].replace(/\/+$/, '') || '/';

  // Standalone dashboard / public mobile views without marketing header/footer
  if (cleanPath.startsWith('/r/')) {
    const code = cleanPath.slice(3);
    return <PublicReviewPage code={code} />;
  }

  if (cleanPath.startsWith('/p-gate/')) {
    const code = cleanPath.slice(8);
    return <PasswordGatePage code={code} />;
  }

  if (cleanPath === '/admin' || cleanPath.startsWith('/admin/')) {
    return <AdminDashboard />;
  }

  if (cleanPath === '/app' || cleanPath.startsWith('/app/')) {
    const sub = cleanPath.replace(/^\/app\/?/, '');
    const tabMap: Record<string, Parameters<typeof UserDashboard>[0]['initialTab']> = {
      '': 'overview',
      qrs: 'qrs',
      create: 'create',
      links: 'links',
      nfc: 'nfc',
      orders: 'orders',
      reviews: 'reviews',
      analytics: 'analytics',
      folders: 'folders',
      settings: 'settings',
      subscription: 'subscription',
    };
    return <UserDashboard initialTab={tabMap[sub] || 'overview'} />;
  }

  if (cleanPath === '/login') {
    return <AuthPage mode="login" />;
  }

  if (cleanPath === '/signup') {
    return <AuthPage mode="signup" />;
  }

  // Standard Marketing / Storefront / Studio views with Navbar & Footer
  let content: React.ReactNode;

  if (cleanPath === '/') {
    content = <HomePage />;
  } else if (cleanPath === '/generator') {
    content = <GeneratorPage />;
  } else if (cleanPath === '/pricing') {
    content = <PricingPage />;
  } else if (cleanPath === '/cards') {
    content = <CardsStorePage />;
  } else if (cleanPath.startsWith('/cards/')) {
    content = <CardsStorePage productSlug={cleanPath.slice(7)} />;
  } else if (cleanPath === '/order' || cleanPath === '/order/done') {
    content = <ProductCustomizerPage />;
  } else if (cleanPath.startsWith('/track/')) {
    content = <OrderTrackingPage initialOrderNumber={cleanPath.slice(7)} />;
  } else if (cleanPath === '/track') {
    content = <OrderTrackingPage />;
  } else if (
    ['/how-it-works', '/faq', '/contact', '/privacy', '/terms', '/replacement-policy', '/real-reviews'].includes(
      cleanPath
    )
  ) {
    content = <InfoPages page={cleanPath} />;
  } else {
    // Public Multi-Link slug (e.g. /kalinga-bistro)
    const slug = cleanPath.replace(/^\//, '');
    return <PublicLinkPage slug={slug} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{content}</main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
