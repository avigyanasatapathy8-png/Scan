import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function FloatingWhatsApp() {
  const { route } = useApp();

  // Keep /r/ review pages ultra-lean without floating marketing widgets
  if (route.startsWith('/r/') || route.startsWith('/app') || route.startsWith('/admin')) {
    return null;
  }

  const pageLabel = route === '/' ? 'Home' : route.replace(/^\//, '');
  const message = encodeURIComponent(
    `Hi TapFX team, I am browsing tapfx.com (${pageLabel}) and would like help with QR codes / NFC cards.`
  );
  const href = `https://wa.me/919692299405?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with TapFX on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold shadow-lg transition-transform duration-150 hover:-translate-y-0.5 no-print"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
