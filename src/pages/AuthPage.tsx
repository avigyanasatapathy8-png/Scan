import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Smartphone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TapFXBrandLogo } from '../components/Navbar';

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const { navigate, login, loginDemo, signup, showToast } = useApp();
  const [authTab, setAuthTab] = useState<'email' | 'otp'>('email');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const user = await login(email, password);
        navigate(user.role === 'admin' ? '/admin' : '/app');
      } else {
        if (password !== confirmPassword) {
          showToast('Passwords do not match.', 'error');
          setLoading(false);
          return;
        }
        if (!agreed) {
          showToast('Please agree to the Terms & Privacy Notice.', 'error');
          setLoading(false);
          return;
        }
        await signup({ name, email, password, businessName });
        navigate('/app');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'owner' | 'admin') => {
    setLoading(true);
    try {
      await loginDemo(role);
      navigate(role === 'admin' ? '/admin' : '/app');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Demo login unavailable', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] grid grid-cols-1 lg:grid-cols-12">
      {/* Left Brand Showcase */}
      <div className="lg:col-span-5 bg-[#0F172A] text-white p-8 sm:p-12 flex flex-col justify-between space-y-8">
        <button onClick={() => navigate('/')} className="flex items-center text-left w-fit">
          <TapFXBrandLogo darkSurface className="h-10" />
        </button>

        <div className="space-y-4 max-w-md">
          <p className="text-xs font-semibold text-sky-300">One Tap. Endless Possibilities.</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
            Manage Dynamic QR Codes, NFC Cards &amp; Customer Reviews.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Access real-time scan analytics, customize multi-link profiles in English, Odia, or Hindi, approve card print proofs, and reply to Google reviews with AI assistance.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4 space-y-2 text-xs text-slate-300">
          <p className="font-semibold text-white">Instant Evaluation Access</p>
          <p>Use one-click demo access on the right to explore the Shop Owner SaaS workspace or TapFX Admin Console immediately.</p>
        </div>
      </div>

      {/* Right Auth Form */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-7 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-bold text-[#0F172A]">
              {mode === 'login' ? 'Sign in to TapFX' : 'Create your TapFX account'}
            </h2>
            <p className="text-xs text-slate-500">
              {mode === 'login'
                ? 'Welcome back. Enter your credentials or use instant workspace access.'
                : 'Start free with 10 QR codes, multi-link builder, and scan analytics.'}
            </p>
          </div>

          {/* Instant Demo Access Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('owner')}
              className="py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-50 text-xs font-semibold text-[#004CF6] transition-colors"
            >
              Demo Owner Login
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('admin')}
              className="py-2.5 px-3 rounded-xl border border-slate-200 bg-[#F4F7FB] hover:bg-slate-100 text-xs font-semibold text-[#0F172A] transition-colors"
            >
              Demo Admin Console
            </button>
          </div>

          {mode === 'login' && (
            <div className="flex gap-1 p-1 bg-[#F4F7FB] rounded-xl">
              <button
                type="button"
                onClick={() => setAuthTab('email')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                  authTab === 'email' ? 'bg-white text-[#004CF6] shadow-sm' : 'text-slate-600'
                }`}
              >
                Email &amp; Password
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('otp')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                  authTab === 'otp' ? 'bg-white text-[#004CF6] shadow-sm' : 'text-slate-600'
                }`}
              >
                Phone OTP
              </button>
            </div>
          )}

          {authTab === 'otp' && mode === 'login' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                />
              </div>
              {otpSent && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">6-Digit OTP (use 123456 for preview)</label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono"
                  />
                </div>
              )}
              {!otpSent ? (
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(true);
                    showToast('Preview OTP ready — enter 123456 to continue.', 'info');
                  }}
                  className="w-full py-3 rounded-xl bg-[#004CF6] text-white text-sm font-semibold inline-flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  Send OTP
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleDemoLogin('owner')}
                  className="w-full py-3 rounded-xl bg-[#004CF6] text-white text-sm font-semibold"
                >
                  Verify OTP &amp; Continue
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Aarav Patnaik"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Business / Shop Name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Kalinga Spice Bistro"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@tapfx.com"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => showToast('Contact tapfxx@gmail.com or use Demo Owner Login.', 'info')}
                      className="text-xs text-[#004CF6] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                />
              </div>

              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="rounded border-slate-300 text-[#004CF6]"
                    />
                    <span>I agree to the TapFX Terms and Privacy Policy</span>
                  </label>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#004CF6] hover:bg-[#0030C0] disabled:opacity-50 text-white text-sm font-semibold inline-flex items-center justify-center gap-2"
              >
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Free Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => handleDemoLogin('owner')}
            className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#004CF6]" />
            Continue with Google (Demo Profile)
          </button>

          <p className="text-center text-xs text-slate-500">
            {mode === 'login' ? (
              <>
                New to TapFX?{' '}
                <button onClick={() => navigate('/signup')} className="font-semibold text-[#004CF6] hover:underline">
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => navigate('/login')} className="font-semibold text-[#004CF6] hover:underline">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
