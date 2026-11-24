import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiFetch, setAuthToken } from '../lib/api';
import { TRANSLATIONS, type TranslationBundle } from '../i18n/translations';
import type { BusinessRecord, LanguageCode, PlanConfig, ProductRecord, SiteConfig, UserProfile } from '../types/tapfx';

export interface ToastItem {
  id: string;
  message: string;
  tone: 'info' | 'success' | 'error';
}

interface AppContextValue {
  route: string;
  navigate: (to: string) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: TranslationBundle;
  user: UserProfile | null;
  business: BusinessRecord | null;
  products: ProductRecord[];
  plans: PlanConfig[];
  siteConfig: SiteConfig | null;
  demoReviewCode: string;
  demoLinkSlug: string;
  demoOrderNumber: string;
  loadingBootstrap: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  loginDemo: (role: 'owner' | 'admin') => Promise<UserProfile>;
  signup: (payload: { name: string; email: string; password: string; businessName: string }) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshBootstrap: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  showToast: (message: string, tone?: 'info' | 'success' | 'error') => void;
  toasts: ToastItem[];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<string>(() => window.location.pathname || '/');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [business, setBusiness] = useState<BusinessRecord | null>(null);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [demoReviewCode, setDemoReviewCode] = useState('kalinga-review');
  const [demoLinkSlug, setDemoLinkSlug] = useState('kalinga-bistro');
  const [demoOrderNumber, setDemoOrderNumber] = useState('TFX-2026-1042');
  const [loadingBootstrap, setLoadingBootstrap] = useState(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, tone: 'info' | 'success' | 'error' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3600);
  }, []);

  const navigate = useCallback((to: string) => {
    const normalized = to.startsWith('/') ? to : `/${to}`;
    window.history.pushState({}, '', normalized);
    setRoute(normalized);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handlePop = () => {
      setRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const refreshBootstrap = useCallback(async () => {
    try {
      const data = await apiFetch<{
        products: ProductRecord[];
        plans: PlanConfig[];
        siteConfig: SiteConfig;
        demoReviewCode: string;
        demoLinkSlug: string;
        demoOrderNumber: string;
      }>('/api/bootstrap');
      setProducts(data.products);
      setPlans(data.plans);
      setSiteConfig(data.siteConfig);
      setDemoReviewCode(data.demoReviewCode);
      setDemoLinkSlug(data.demoLinkSlug);
      setDemoOrderNumber(data.demoOrderNumber);
    } catch {
      // ignore initial network hiccup
    } finally {
      setLoadingBootstrap(false);
    }
  }, []);

  useEffect(() => {
    void refreshBootstrap();
  }, [refreshBootstrap]);

  const refreshAuth = useCallback(async () => {
    try {
      const res = await apiFetch<{ user: UserProfile; business: BusinessRecord | null }>('/api/auth/me');
      setUser(res.user);
      setBusiness(res.business);
    } catch {
      setUser(null);
      setBusiness(null);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiFetch<{ token: string; user: UserProfile }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(res.token);
      setUser(res.user);
      await refreshAuth();
      showToast(`Signed in as ${res.user.name}`, 'success');
      return res.user;
    },
    [refreshAuth, showToast]
  );

  const loginDemo = useCallback(
    async (role: 'owner' | 'admin') => {
      const res = await apiFetch<{ token: string; user: UserProfile }>('/api/auth/demo', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      setAuthToken(res.token);
      setUser(res.user);
      await refreshAuth();
      showToast(role === 'admin' ? 'Signed in to TapFX Admin Console' : 'Signed in as Kalinga Spice Bistro', 'success');
      return res.user;
    },
    [refreshAuth, showToast]
  );

  const signup = useCallback(
    async (payload: { name: string; email: string; password: string; businessName: string }) => {
      const res = await apiFetch<{ token: string; user: UserProfile }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setAuthToken(res.token);
      setUser(res.user);
      await refreshAuth();
      showToast('Account created! Welcome to TapFX.', 'success');
      return res.user;
    },
    [refreshAuth, showToast]
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setAuthToken(null);
    setUser(null);
    setBusiness(null);
    navigate('/');
    showToast('Signed out cleanly', 'info');
  }, [navigate, showToast]);

  return (
    <AppContext.Provider
      value={{
        route,
        navigate,
        language,
        setLanguage,
        t: TRANSLATIONS[language],
        user,
        business,
        products,
        plans,
        siteConfig,
        demoReviewCode,
        demoLinkSlug,
        demoOrderNumber,
        loadingBootstrap,
        login,
        loginDemo,
        signup,
        logout,
        refreshBootstrap,
        refreshAuth,
        showToast,
        toasts,
      }}
    >
      {children}
      {/* Global toast stack */}
      <div className="fixed bottom-20 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm font-medium shadow-lg transition-all ${
              toast.tone === 'error'
                ? 'bg-white border-red-200 text-red-700'
                : toast.tone === 'success'
                  ? 'bg-white border-blue-200 text-[#0F172A]'
                  : 'bg-white border-slate-200 text-[#0F172A]'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
