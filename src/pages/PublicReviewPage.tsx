import React, { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, MessageCircle, Mic, Star, X } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { TRANSLATIONS } from '../i18n/translations';
import { useApp } from '../context/AppContext';
import type { LanguageCode, ReviewPageRecord } from '../types/tapfx';

export function PublicReviewPage({ code }: { code: string }) {
  const { showToast, navigate } = useApp();
  const [rp, setRp] = useState<ReviewPageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<LanguageCode>('en');

  // AI Customer Review Assist state
  const [aiOpen, setAiOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [drafts, setDrafts] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Private feedback state
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [fbRating, setFbRating] = useState(4);
  const [fbMessage, setFbMessage] = useState('');
  const [fbContact, setFbContact] = useState('');
  const [fbSent, setFbSent] = useState(false);

  const tr = TRANSLATIONS[lang].reviewPage;

  useEffect(() => {
    const src = new URLSearchParams(window.location.search).get('src') === 'nfc' ? 'nfc' : 'qr';
    setLoading(true);
    apiFetch<{ reviewPage: ReviewPageRecord }>(`/api/public/review-page/${encodeURIComponent(code)}?src=${src}`)
      .then((res) => setRp(res.reviewPage))
      .catch(() => setRp(null))
      .finally(() => setLoading(false));
  }, [code]);

  const googleReviewUrl = rp
    ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(rp.googlePlaceId)}`
    : 'https://search.google.com/local/writereview';

  const handleGoogleClick = () => {
    void apiFetch(`/api/public/review-page/${encodeURIComponent(code)}/event`, {
      method: 'POST',
      body: JSON.stringify({ type: 'google_click' }),
    }).catch(() => undefined);
    window.open(googleReviewUrl, '_blank', 'noopener,noreferrer');
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleVoiceNote = () => {
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;

    if (!SpeechRec) {
      showToast('Voice typing is not supported in this browser; please type a short note.', 'info');
      return;
    }
    const rec = new SpeechRec() as {
      lang: string;
      onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
      start: () => void;
    };
    rec.lang = lang === 'hi' ? 'hi-IN' : lang === 'od' ? 'or-IN' : 'en-IN';
    rec.onresult = (e) => {
      const transcript = e.results?.[0]?.[0]?.transcript || '';
      if (transcript) setNote((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    rec.start();
  };

  const handleGenerateDrafts = async () => {
    if (selectedTags.length === 0 && note.trim().length < 6) {
      setAiError(tr.needMoreDetails);
      return;
    }
    setAiLoading(true);
    setAiError('');
    setDrafts([]);
    try {
      const res = await apiFetch<{ variants: string[]; reason?: string }>('/api/ai/review-assist', {
        method: 'POST',
        body: JSON.stringify({
          code,
          rating,
          tags: selectedTags,
          note,
          language: lang,
        }),
      });
      if (res.variants.length === 0) {
        setAiError(tr.needMoreDetails);
      } else {
        setDrafts(res.variants);
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Unable to suggest wording right now.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyAndOpen = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore clipboard restrictions
    }
    setCopiedIdx(idx);
    showToast(tr.copiedNotice, 'success');
    window.setTimeout(() => {
      handleGoogleClick();
    }, 350);
  };

  const handleSubmitPrivateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch(`/api/public/review-page/${encodeURIComponent(code)}/feedback`, {
        method: 'POST',
        body: JSON.stringify({
          rating: fbRating,
          message: fbMessage,
          contactOptional: fbContact,
        }),
      });
      setFbSent(true);
      setFbMessage('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not send note', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-8 animate-pulse space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100" />
          <div className="h-5 bg-slate-100 rounded w-1/2 mx-auto" />
          <div className="h-12 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!rp) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4 text-center">
        <div className="max-w-md bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
          <h1 className="font-display text-xl font-bold">Review Page Not Found</h1>
          <button onClick={() => navigate('/')} className="px-4 py-2 rounded-xl bg-[#004CF6] text-white text-sm font-semibold">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] py-8 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
        {/* Language Switcher */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="text-xs font-semibold text-slate-400 hover:text-[#004CF6]">
            tapfx.com
          </button>
          <div className="inline-flex items-center gap-1 p-0.5 bg-[#F4F7FB] rounded-lg border border-slate-200">
            {(['en', 'od', 'hi'] as const).map((codeLang) => (
              <button
                key={codeLang}
                type="button"
                onClick={() => setLang(codeLang)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${
                  lang === codeLang ? 'bg-white text-[#004CF6] shadow-sm' : 'text-slate-600'
                }`}
              >
                {codeLang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Shop Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#004CF6] text-white font-display font-extrabold text-2xl flex items-center justify-center">
            {rp.shopName.slice(0, 1)}
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">{rp.shopName}</h1>
          <p className="text-xs text-slate-500">{rp.shopType}</p>
        </div>

        {/* Primary Google Review CTA (Always prominent, never gated) */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleClick}
            className="w-full py-4 px-5 rounded-xl bg-[#004CF6] hover:bg-[#0030C0] text-white font-display font-bold text-base flex items-center justify-center gap-2.5 shadow-sm transition-colors"
          >
            <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
            {tr.reviewButton}
            <ExternalLink className="w-4 h-4 opacity-80" />
          </button>

          {rp.aiAssistEnabled && (
            <button
              type="button"
              onClick={() => setAiOpen((v) => !v)}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-[#004CF6] text-xs font-semibold text-[#004CF6] transition-colors"
            >
              {tr.needHelp}
            </button>
          )}
        </div>

        {/* Optional Customer-Led AI Review Assist */}
        {aiOpen && rp.aiAssistEnabled && (
          <div className="rounded-xl border border-blue-200 bg-[#F4F7FB] p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F172A]">{tr.pickRating}</span>
              <button type="button" onClick={() => setAiOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1.5 rounded-lg bg-white border border-slate-200"
                >
                  <Star className={`w-5 h-5 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-semibold text-slate-700">{tr.pickTags}</span>
              <div className="flex flex-wrap gap-1.5">
                {rp.quickTags.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
                        active ? 'bg-[#004CF6] text-white border-[#004CF6]' : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">{tr.optionalNote}</label>
                <button
                  type="button"
                  onClick={handleVoiceNote}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#004CF6]"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Voice
                </button>
              </div>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Quick billing and fresh food"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-[#004CF6] focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerateDrafts}
              disabled={aiLoading}
              className="w-full py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#004CF6] disabled:opacity-50 text-white text-xs font-semibold"
            >
              {aiLoading ? 'Drafting options...' : tr.generateDrafts}
            </button>

            {aiError && <p className="text-xs text-red-600 font-medium">{aiError}</p>}

            {drafts.length > 0 && (
              <div className="space-y-2.5 pt-1">
                <p className="text-[11px] text-slate-500">{tr.aiDisclosure}</p>
                {drafts.map((d, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                    <textarea
                      rows={3}
                      value={d}
                      onChange={(e) => {
                        const copy = [...drafts];
                        copy[i] = e.target.value;
                        setDrafts(copy);
                      }}
                      className="w-full text-xs text-slate-800 leading-relaxed focus:outline-none resize-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyAndOpen(d, i)}
                      className="w-full py-2 rounded-lg bg-[#004CF6] hover:bg-[#0030C0] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                    >
                      {copiedIdx === i ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {tr.copyAndOpen}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Secondary Private Feedback Link (Shown to EVERY visitor) */}
        <div className="text-center border-t border-slate-100 pt-4 space-y-3">
          <button
            type="button"
            onClick={() => {
              setFeedbackOpen((v) => !v);
              setFbSent(false);
            }}
            className="text-xs font-semibold text-slate-600 hover:text-[#004CF6] underline"
          >
            {tr.tellPrivately}
          </button>

          {feedbackOpen && (
            <form onSubmit={handleSubmitPrivateFeedback} className="text-left rounded-xl border border-slate-200 bg-[#F4F7FB] p-4 space-y-3">
              {fbSent ? (
                <p className="text-xs font-semibold text-emerald-700">{tr.feedbackSent}</p>
              ) : (
                <>
                  <p className="text-xs font-bold text-[#0F172A]">{tr.privateFeedbackTitle}</p>
                  <p className="text-[11px] text-slate-500">{tr.privateFeedbackHint}</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} type="button" onClick={() => setFbRating(s)} className="p-1">
                        <Star className={`w-4 h-4 ${s <= fbRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={fbMessage}
                    onChange={(e) => setFbMessage(e.target.value)}
                    placeholder="Share a note with the shop..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    value={fbContact}
                    onChange={(e) => setFbContact(e.target.value)}
                    placeholder="Optional contact or table number"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                  />
                  <button type="submit" className="w-full py-2 rounded-xl bg-[#0F172A] text-white text-xs font-semibold">
                    {tr.sendFeedback}
                  </button>
                </>
              )}
            </form>
          )}
        </div>

        {/* Optional Social Links */}
        {(rp.instagramUrl || rp.whatsappNumber) && (
          <div className="flex items-center justify-center gap-3 pt-1">
            {rp.whatsappNumber && (
              <a
                href={`https://wa.me/${rp.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:border-[#16A34A]"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                WhatsApp
              </a>
            )}
            {rp.instagramUrl && (
              <a
                href={rp.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:border-[#004CF6]"
              >
                Instagram
              </a>
            )}
          </div>
        )}

        {!rp.removeBranding && (
          <p className="text-center text-[11px] text-slate-400">{tr.poweredBy}</p>
        )}
      </div>
    </div>
  );
}
