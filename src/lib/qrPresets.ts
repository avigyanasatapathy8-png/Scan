import type {
  QRType,
  QRPattern,
  QRFrameStyle,
  QRCornerFrameStyle,
  QRCornerDotStyle,
  QRDesignConfig,
} from '../types/tapfx';

export const QR_TYPES_META: {
  id: QRType;
  label: string;
  hint: string;
  category: 'core' | 'social' | 'business';
}[] = [
  { id: 'website', label: 'Website', hint: 'Link to any webpage or storefront', category: 'core' },
  { id: 'multi-link', label: 'Multi-Linked QR', hint: 'Add multiple links into one scannable QR code', category: 'business' },
  { id: 'google-review', label: 'Google Review', hint: 'Open Google review form with Place ID', category: 'business' },
  { id: 'whatsapp', label: 'WhatsApp', hint: 'Start a prefilled WhatsApp chat', category: 'core' },
  { id: 'instagram', label: 'Instagram', hint: 'Direct link to Instagram profile', category: 'social' },
  { id: 'facebook', label: 'Facebook', hint: 'Direct link to Facebook page', category: 'social' },
  { id: 'youtube', label: 'YouTube', hint: 'Channel or video link', category: 'social' },
  { id: 'linkedin', label: 'LinkedIn', hint: 'Company or professional profile', category: 'social' },
  { id: 'telegram', label: 'Telegram', hint: 'Channel or direct username', category: 'social' },
  { id: 'wifi', label: 'WiFi', hint: 'Instant guest WiFi login', category: 'core' },
  { id: 'phone', label: 'Phone', hint: 'One-tap phone call', category: 'core' },
  { id: 'email', label: 'Email', hint: 'Pre-addressed email draft', category: 'core' },
  { id: 'text', label: 'Text', hint: 'Plain note, coupon or notice', category: 'core' },
  { id: 'location', label: 'Location', hint: 'Google Maps coordinates or link', category: 'business' },
  { id: 'vcard', label: 'Contact Card', hint: 'Save contact directly to phonebook', category: 'business' },
  { id: 'payment', label: 'Payment', hint: 'UPI ID or payment link', category: 'business' },
];

export const QR_PATTERNS_META: { id: QRPattern; label: string }[] = [
  { id: 'square', label: 'Square' },
  { id: 'gapped-square', label: 'Gapped Square' },
  { id: 'circle', label: 'Circle' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'vertical-bars', label: 'Vertical Bars' },
  { id: 'horizontal-bars', label: 'Horizontal Bars' },
  { id: 'rounded-h-bars', label: 'Rounded H-Bars' },
  { id: 'rounded-v-bars', label: 'Rounded V-Bars' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'hexagon', label: 'Hexagon' },
  { id: 'star', label: 'Star' },
  { id: 'heart', label: 'Heart' },
];

export const QR_GRADIENTS: { id: string; name: string; start: string; end: string }[] = [
  { id: 'royal-tapfx', name: 'Royal TapFX', start: '#004CF6', end: '#0098FD' },
  { id: 'deep-cobalt', name: 'Deep Cobalt', start: '#0030C0', end: '#004CF6' },
  { id: 'sky-horizon', name: 'Sky Horizon', start: '#0284C7', end: '#38BDF8' },
  { id: 'obsidian-ink', name: 'Obsidian Ink', start: '#0F172A', end: '#334155' },
  { id: 'indigo-pulse', name: 'Indigo Pulse', start: '#312E81', end: '#4F46E5' },
  { id: 'emerald-pine', name: 'Emerald Pine', start: '#065F46', end: '#10B981' },
  { id: 'teal-breeze', name: 'Teal Breeze', start: '#0F766E', end: '#06B6D4' },
  { id: 'sunset-coral', name: 'Sunset Coral', start: '#C2410C', end: '#F97316' },
  { id: 'crimson-velvet', name: 'Crimson Velvet', start: '#991B1B', end: '#E11D48' },
  { id: 'violet-mist', name: 'Violet Mist', start: '#5B21B6', end: '#9333EA' },
  { id: 'amber-dusk', name: 'Amber Dusk', start: '#92400E', end: '#D97706' },
  { id: 'copper-bronze', name: 'Copper Bronze', start: '#78350F', end: '#B45309' },
  { id: 'steel-slate', name: 'Steel Slate', start: '#1E293B', end: '#475569' },
  { id: 'arctic-navy', name: 'Arctic Navy', start: '#0C4A6E', end: '#004CF6' },
  { id: 'plum-berry', name: 'Plum Berry', start: '#701A75', end: '#C026D3' },
  { id: 'forest-moss', name: 'Forest Moss', start: '#14532D', end: '#16A34A' },
];

export const QR_FRAMES_META: {
  id: QRFrameStyle;
  label: string;
  defaultText: string;
  industry: string;
}[] = [
  { id: 'none', label: 'No Frame', defaultText: '', industry: 'Minimal' },
  { id: 'classic-bottom', label: 'Classic Bottom', defaultText: 'SCAN ME', industry: 'Universal' },
  { id: 'classic-top', label: 'Classic Top', defaultText: 'SCAN HERE', industry: 'Universal' },
  { id: 'rounded-card', label: 'Studio Card', defaultText: 'TAP OR SCAN', industry: 'General' },
  { id: 'review-badge', label: 'Google Review', defaultText: 'REVIEW US ON GOOGLE', industry: 'Reviews' },
  { id: 'restaurant-menu', label: 'Restaurant Menu', defaultText: 'DIGITAL MENU', industry: 'Restaurant' },
  { id: 'cafe-table', label: 'Cafe Table', defaultText: 'ORDER AT TABLE', industry: 'Cafe' },
  { id: 'salon-mirror', label: 'Salon & Spa', defaultText: 'BOOK NEXT VISIT', industry: 'Salon' },
  { id: 'clinic-desk', label: 'Clinic & Pharmacy', defaultText: 'PHARMACY CARE', industry: 'Clinic' },
  { id: 'retail-tag', label: 'Retail Counter', defaultText: 'OFFERS & PAY', industry: 'Retail' },
  { id: 'hotel-concierge', label: 'Hotel Desk', defaultText: 'GUEST GUIDE', industry: 'Hotel' },
  { id: 'wifi-card', label: 'Guest WiFi', defaultText: 'FREE WIFI', industry: 'WiFi' },
];

export const CORNER_FRAME_STYLES: { id: QRCornerFrameStyle; label: string }[] = [
  { id: 'square', label: 'Square' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'extra-rounded', label: 'Smooth' },
  { id: 'circle', label: 'Circle' },
  { id: 'leaf', label: 'Leaf' },
];

export const CORNER_DOT_STYLES: { id: QRCornerDotStyle; label: string }[] = [
  { id: 'square', label: 'Square' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'circle', label: 'Dot' },
  { id: 'diamond', label: 'Diamond' },
];

export const LOGO_PRESETS: { id: string; label: string }[] = [
  { id: 'none', label: 'No Logo' },
  { id: 'tapfx', label: 'TapFX' },
  { id: 'google', label: 'Review Star' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'wifi', label: 'WiFi' },
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'cafe', label: 'Cafe' },
  { id: 'clinic', label: 'Clinic' },
  { id: 'salon', label: 'Salon' },
  { id: 'shop', label: 'Retail' },
  { id: 'hotel', label: 'Hotel' },
];

export const DEFAULT_QR_DESIGN: QRDesignConfig = {
  pattern: 'rounded',
  fgColor: '#0F172A',
  bgColor: '#FFFFFF',
  transparentBg: false,
  useGradient: true,
  gradientId: 'royal-tapfx',
  gradientStart: '#004CF6',
  gradientEnd: '#0098FD',
  cornerFrameStyle: 'rounded',
  cornerDotStyle: 'circle',
  cornerColor: '#0030C0',
  frameStyle: 'classic-bottom',
  frameText: 'SCAN ME',
  frameColor: '#004CF6',
  logoPreset: 'tapfx',
  logoSizeRatio: 0.2,
  errorCorrection: 'H',
};

export const NETWORK_LIBRARY: {
  id: string;
  label: string;
  category: string;
  placeholderUrl: string;
}[] = [
  { id: 'google-review', label: 'Google Reviews', category: 'Reviews', placeholderUrl: 'https://search.google.com/local/writereview?placeid=ChIJ...' },
  { id: 'whatsapp', label: 'WhatsApp', category: 'Messaging', placeholderUrl: 'https://wa.me/919692299405' },
  { id: 'website', label: 'Website', category: 'Web', placeholderUrl: 'https://tapfx.com' },
  { id: 'instagram', label: 'Instagram', category: 'Social', placeholderUrl: 'https://instagram.com/tap.fx' },
  { id: 'facebook', label: 'Facebook', category: 'Social', placeholderUrl: 'https://facebook.com/' },
  { id: 'youtube', label: 'YouTube', category: 'Video', placeholderUrl: 'https://youtube.com/@' },
  { id: 'maps', label: 'Google Maps', category: 'Location', placeholderUrl: 'https://maps.google.com/?q=' },
  { id: 'menu', label: 'Digital Menu', category: 'Hospitality', placeholderUrl: 'https://tapfx.com/menu' },
  { id: 'phone', label: 'Call Us', category: 'Contact', placeholderUrl: 'tel:+919692299405' },
  { id: 'email', label: 'Email', category: 'Contact', placeholderUrl: 'mailto:tapfxx@gmail.com' },
  { id: 'telegram', label: 'Telegram', category: 'Messaging', placeholderUrl: 'https://t.me/' },
  { id: 'linkedin', label: 'LinkedIn', category: 'Business', placeholderUrl: 'https://linkedin.com/in/' },
  { id: 'x', label: 'X / Twitter', category: 'Social', placeholderUrl: 'https://x.com/' },
  { id: 'upi', label: 'UPI Payment', category: 'Payments', placeholderUrl: 'upi://pay?pa=shop@upi' },
  { id: 'swiggy', label: 'Swiggy Order', category: 'Hospitality', placeholderUrl: 'https://swiggy.com' },
  { id: 'zomato', label: 'Zomato Order', category: 'Hospitality', placeholderUrl: 'https://zomato.com' },
  { id: 'booking', label: 'Book Appointment', category: 'Business', placeholderUrl: 'https://cal.com/' },
  { id: 'catalog', label: 'Product Catalog', category: 'Retail', placeholderUrl: 'https://tapfx.com/catalog' },
  { id: 'wifi', label: 'Guest WiFi Info', category: 'Hospitality', placeholderUrl: 'https://tapfx.com/wifi' },
  { id: 'spotify', label: 'Spotify', category: 'Media', placeholderUrl: 'https://open.spotify.com/' },
  { id: 'apple-music', label: 'Apple Music', category: 'Media', placeholderUrl: 'https://music.apple.com/' },
  { id: 'threads', label: 'Threads', category: 'Social', placeholderUrl: 'https://threads.net/@' },
  { id: 'snapchat', label: 'Snapchat', category: 'Social', placeholderUrl: 'https://snapchat.com/add/' },
  { id: 'pinterest', label: 'Pinterest', category: 'Social', placeholderUrl: 'https://pinterest.com/' },
  { id: 'github', label: 'GitHub', category: 'Tech', placeholderUrl: 'https://github.com/' },
  { id: 'behance', label: 'Behance', category: 'Portfolio', placeholderUrl: 'https://behance.net/' },
  { id: 'dribbble', label: 'Dribbble', category: 'Portfolio', placeholderUrl: 'https://dribbble.com/' },
  { id: 'calendly', label: 'Calendly', category: 'Business', placeholderUrl: 'https://calendly.com/' },
  { id: 'shopify', label: 'Online Store', category: 'Retail', placeholderUrl: 'https://myshop.myshopify.com' },
  { id: 'amazon', label: 'Amazon Store', category: 'Retail', placeholderUrl: 'https://amazon.in' },
  { id: 'flipkart', label: 'Flipkart Store', category: 'Retail', placeholderUrl: 'https://flipkart.com' },
  { id: 'playstore', label: 'Google Play App', category: 'Apps', placeholderUrl: 'https://play.google.com' },
  { id: 'appstore', label: 'App Store', category: 'Apps', placeholderUrl: 'https://apps.apple.com' },
  { id: 'brochure', label: 'PDF Brochure', category: 'Docs', placeholderUrl: 'https://tapfx.com/brochure.pdf' },
  { id: 'vcard', label: 'Save Contact', category: 'Contact', placeholderUrl: 'https://tapfx.com/contact' },
  { id: 'feedback', label: 'Private Feedback', category: 'Reviews', placeholderUrl: 'https://tapfx.com/r/demo' },
  { id: 'offer', label: 'Weekly Offers', category: 'Retail', placeholderUrl: 'https://tapfx.com/offers' },
  { id: 'custom', label: 'Custom Link', category: 'Other', placeholderUrl: 'https://' },
];

export const USE_CASES: {
  id: string;
  title: string;
  summary: string;
  tags: string[];
}[] = [
  { id: 'restaurants', title: 'Restaurants', summary: 'Tabletop menu QR, Google Review stands, WhatsApp delivery orders, location & specials.', tags: ['Menu QR', 'Google Review', 'Table Tags'] },
  { id: 'cafes', title: 'Cafes & Bakeries', summary: 'Counter NFC tap for instant WiFi sharing, Instagram follow, and quick customer feedback.', tags: ['WiFi NFC', 'Instagram', 'Reviews'] },
  { id: 'pharmacies', title: 'Pharmacies', summary: 'WhatsApp prescription ordering, clinic directions, emergency contact & delivery hours.', tags: ['WhatsApp Order', 'Directions', 'Hours'] },
  { id: 'retail', title: 'Retail Shops', summary: 'Checkout counter review cards, UPI payment QR, loyalty catalog and festive offers.', tags: ['UPI Pay', 'Catalog', 'Review Stand'] },
  { id: 'hotels', title: 'Hotels & Stays', summary: 'Room-desk concierge QR for WiFi, room service, local guide & check-out reviews.', tags: ['Concierge', 'WiFi Card', 'Check-out'] },
  { id: 'salons', title: 'Salons & Spas', summary: 'Mirror-corner QR stands for appointment rebooking, rate cards, and stylist reviews.', tags: ['Booking', 'Rate Card', 'Reviews'] },
  { id: 'clinics', title: 'Clinics & Doctors', summary: 'Digital doctor cards with appointment booking, Google Maps, and patient care guides.', tags: ['Appointments', 'Directions', 'Digital Card'] },
  { id: 'realestate', title: 'Real Estate', summary: 'Brochure & hoarding QR codes linking to floor plans, site tour videos & agent NFC cards.', tags: ['Floor Plans', 'Agent NFC', 'Site Map'] },
  { id: 'professionals', title: 'Professionals', summary: 'Master & Magic NFC business cards sharing portfolio, LinkedIn, vCard & WhatsApp.', tags: ['vCard', 'Portfolio', 'NFC Card'] },
  { id: 'events', title: 'Events & Expos', summary: 'Instant networking NFC badges, event schedules, speaker multi-links & lead capture.', tags: ['Schedule', 'Networking', 'Multi-Link'] },
  { id: 'education', title: 'Education & Coaching', summary: 'Campus notice QR codes, admission inquiry forms, syllabus links & parent WhatsApp.', tags: ['Admissions', 'Syllabus', 'Inquiry'] },
  { id: 'fitness', title: 'Fitness & Studios', summary: 'Class schedule links, membership renewals, trainer profiles & member check-in reviews.', tags: ['Schedules', 'Trainer Card', 'Reviews'] },
];

export const DEMO_TESTIMONIALS = [
  {
    id: 'demo-1',
    name: 'Arun Mohanty',
    business: 'Sample Café & Roastery (Demo)',
    city: 'Bhubaneswar',
    rating: 5,
    quote:
      'Demonstration scenario: Placing an Acrylic QR Stand at the billing counter helped guests open our menu, join WiFi, and leave honest Google feedback in seconds.',
  },
  {
    id: 'demo-2',
    name: 'Dr. Priya Nair',
    business: 'Sample Dental & Wellness Clinic (Demo)',
    city: 'Cuttack',
    rating: 5,
    quote:
      'Demonstration scenario: Patients tap the reception Master Card to save our WhatsApp desk number and find Google Maps directions without typing.',
  },
  {
    id: 'demo-3',
    name: 'Rohan Deshmukh',
    business: 'Sample Real Estate Advisory (Demo)',
    city: 'Pune',
    rating: 5,
    quote:
      'Demonstration scenario: Updating our Magic Card destination between property launches takes one click in the TapFX dashboard without reprinting cards.',
  },
];
