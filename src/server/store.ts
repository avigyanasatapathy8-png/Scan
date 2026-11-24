import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type {
  AIUsageRecord,
  BusinessRecord,
  FolderRecord,
  LinkPageRecord,
  NFCCardRecord,
  OrderRecord,
  PlanConfig,
  PrivateFeedbackRecord,
  ProductRecord,
  QRCodeRecord,
  ReviewPageRecord,
  ReviewRecord,
  ScanRecord,
  SiteConfig,
  UserProfile,
} from '../types/tapfx';

export interface StoredUser extends UserProfile {
  passwordHash: string;
}

export interface SessionRecord {
  token: string;
  userId: string;
  createdAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

export interface TapFXDatabase {
  users: StoredUser[];
  sessions: SessionRecord[];
  businesses: BusinessRecord[];
  folders: FolderRecord[];
  qrCodes: QRCodeRecord[];
  scans: ScanRecord[];
  linkPages: LinkPageRecord[];
  nfcCards: NFCCardRecord[];
  reviewPages: ReviewPageRecord[];
  reviews: ReviewRecord[];
  privateFeedback: PrivateFeedbackRecord[];
  products: ProductRecord[];
  orders: OrderRecord[];
  plans: PlanConfig[];
  siteConfig: SiteConfig;
  aiUsage: AIUsageRecord[];
  contacts: ContactSubmission[];
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(key, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'tapfx-db.json');

function createSeedDatabase(): TapFXDatabase {
  const now = Date.now();
  const iso = (daysAgo: number) => new Date(now - daysAgo * 86400_000).toISOString();

  const ownerPasswordHash = hashPassword('tapfx2026');
  const adminPasswordHash = hashPassword('tapfx2026');

  const scans: ScanRecord[] = [];
  const cities = ['Bhubaneswar', 'Cuttack', 'Bengaluru', 'Mumbai', 'Hyderabad', 'Delhi'];
  const qrIds = ['qr-1', 'qr-2', 'qr-3', 'qr-4'];
  for (let i = 0; i < 64; i++) {
    const dayOffset = i % 14;
    const isNfc = i % 3 === 0;
    scans.push({
      id: `scan-${i + 1}`,
      qrId: qrIds[i % qrIds.length],
      businessId: 'biz-kalinga',
      scannedAt: new Date(now - dayOffset * 86400_000 - (i % 12) * 3600_000).toISOString(),
      source: isNfc ? 'nfc' : 'qr',
      device: i % 11 === 0 ? 'Tablet' : 'Mobile',
      os: i % 2 === 0 ? 'Android' : 'iOS',
      city: cities[i % cities.length],
      outletTag: i % 2 === 0 ? 'Main Counter' : 'Table 4',
    });
  }

  return {
    users: [
      {
        id: 'user-owner-1',
        name: 'Aarav Patnaik',
        email: 'owner@tapfx.com',
        phone: '+91 96922 99405',
        role: 'owner',
        language: 'en',
        businessId: 'biz-kalinga',
        planId: 'pro',
        passwordHash: ownerPasswordHash,
      },
      {
        id: 'user-admin-1',
        name: 'TapFX Operations',
        email: 'admin@tapfx.com',
        phone: '+91 96922 99405',
        role: 'admin',
        language: 'en',
        businessId: 'biz-kalinga',
        planId: 'pro',
        passwordHash: adminPasswordHash,
      },
    ],
    sessions: [],
    businesses: [
      {
        id: 'biz-kalinga',
        ownerId: 'user-owner-1',
        name: 'Kalinga Spice Bistro',
        type: 'Restaurant & Cafe',
        contactPhone: '+91 96922 99405',
        whatsapp: '919692299405',
        planId: 'pro',
        aiDraftsUsedThisMonth: 14,
        aiEnabled: true,
        replyTone: 'warm',
        replySignature: '— Team Kalinga Spice',
        autoPostPlainPositive: false,
        whatsappWeeklyDigest: true,
        gstin: '21AABCT1332L1Z5',
        defaultOutletId: 'outlet-main',
        googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
      },
    ],
    folders: [
      { id: 'fld-tables', businessId: 'biz-kalinga', name: 'Dining Tables', createdAt: iso(25) },
      { id: 'fld-reviews', businessId: 'biz-kalinga', name: 'Review Counters', createdAt: iso(20) },
      { id: 'fld-wifi', businessId: 'biz-kalinga', name: 'Guest WiFi', createdAt: iso(15) },
    ],
    qrCodes: [
      {
        id: 'qr-1',
        businessId: 'biz-kalinga',
        name: 'Counter Review Stand',
        type: 'google-review',
        isDynamic: true,
        shortCode: 'kalinga-review',
        destinationUrl: '/r/kalinga-review',
        contentFields: { placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4' },
        design: {
          pattern: 'rounded',
          fgColor: '#004CF6',
          bgColor: '#FFFFFF',
          transparentBg: false,
          useGradient: true,
          gradientId: 'royal-tapfx',
          gradientStart: '#004CF6',
          gradientEnd: '#0098FD',
          cornerFrameStyle: 'rounded',
          cornerDotStyle: 'circle',
          cornerColor: '#0030C0',
          frameStyle: 'review-badge',
          frameText: 'REVIEW US ON GOOGLE',
          frameColor: '#004CF6',
          logoPreset: 'google',
          logoSizeRatio: 0.2,
          errorCorrection: 'H',
        },
        status: 'active',
        folderId: 'fld-reviews',
        passwordProtected: false,
        outletTag: 'Main Counter',
        scansCount: 1482,
        createdAt: iso(28),
        updatedAt: iso(2),
      },
      {
        id: 'qr-2',
        businessId: 'biz-kalinga',
        name: 'Table 1–8 Digital Menu',
        type: 'multi-link',
        isDynamic: true,
        shortCode: 'kalinga-menu',
        destinationUrl: '/kalinga-bistro',
        contentFields: { slug: 'kalinga-bistro' },
        design: {
          pattern: 'circle',
          fgColor: '#0F172A',
          bgColor: '#FFFFFF',
          transparentBg: false,
          useGradient: true,
          gradientId: 'deep-cobalt',
          gradientStart: '#0030C0',
          gradientEnd: '#004CF6',
          cornerFrameStyle: 'extra-rounded',
          cornerDotStyle: 'circle',
          cornerColor: '#0030C0',
          frameStyle: 'restaurant-menu',
          frameText: 'DIGITAL MENU',
          frameColor: '#0F172A',
          logoPreset: 'restaurant',
          logoSizeRatio: 0.19,
          errorCorrection: 'H',
        },
        status: 'active',
        folderId: 'fld-tables',
        passwordProtected: false,
        outletTag: 'Table 4',
        scansCount: 940,
        createdAt: iso(21),
        updatedAt: iso(1),
      },
      {
        id: 'qr-3',
        businessId: 'biz-kalinga',
        name: 'WhatsApp Table Ordering',
        type: 'whatsapp',
        isDynamic: true,
        shortCode: 'kalinga-wa',
        destinationUrl: 'https://wa.me/919692299405?text=Hi%20Kalinga%20Spice%2C%20I%20would%20like%20to%20order',
        contentFields: { phone: '919692299405', message: 'Hi Kalinga Spice, I would like to order' },
        design: {
          pattern: 'gapped-square',
          fgColor: '#065F46',
          bgColor: '#FFFFFF',
          transparentBg: false,
          useGradient: true,
          gradientId: 'emerald-pine',
          gradientStart: '#065F46',
          gradientEnd: '#10B981',
          cornerFrameStyle: 'rounded',
          cornerDotStyle: 'rounded',
          cornerColor: '#065F46',
          frameStyle: 'classic-bottom',
          frameText: 'ORDER ON WHATSAPP',
          frameColor: '#065F46',
          logoPreset: 'whatsapp',
          logoSizeRatio: 0.2,
          errorCorrection: 'H',
        },
        status: 'active',
        folderId: 'fld-tables',
        passwordProtected: false,
        outletTag: 'Delivery Desk',
        scansCount: 518,
        createdAt: iso(14),
        updatedAt: iso(3),
      },
      {
        id: 'qr-4',
        businessId: 'biz-kalinga',
        name: 'Guest Dining WiFi',
        type: 'wifi',
        isDynamic: false,
        shortCode: 'kalinga-wifi',
        destinationUrl: 'WIFI:T:WPA;S:Kalinga_Guest_5G;P:Spice2026;;',
        contentFields: { ssid: 'Kalinga_Guest_5G', password: 'Spice2026', encryption: 'WPA' },
        design: {
          pattern: 'rounded-h-bars',
          fgColor: '#0284C7',
          bgColor: '#FFFFFF',
          transparentBg: false,
          useGradient: true,
          gradientId: 'sky-horizon',
          gradientStart: '#0284C7',
          gradientEnd: '#004CF6',
          cornerFrameStyle: 'leaf',
          cornerDotStyle: 'circle',
          cornerColor: '#004CF6',
          frameStyle: 'wifi-card',
          frameText: 'FREE GUEST WIFI',
          frameColor: '#0284C7',
          logoPreset: 'wifi',
          logoSizeRatio: 0.18,
          errorCorrection: 'H',
        },
        status: 'active',
        folderId: 'fld-wifi',
        passwordProtected: false,
        outletTag: 'Lounge',
        scansCount: 384,
        createdAt: iso(10),
        updatedAt: iso(5),
      },
    ],
    scans,
    linkPages: [
      {
        id: 'lp-1',
        businessId: 'biz-kalinga',
        slug: 'kalinga-bistro',
        name: 'Kalinga Spice Bistro',
        headline: 'Authentic Coastal & Odia Dining · Bhubaneswar',
        description:
          'Browse our live menu, order directly on WhatsApp, check today’s chef specials, or share your experience on Google.',
        language: 'en',
        passwordProtected: false,
        blocks: [
          { id: 'blk-1', network: 'google-review', label: 'Review Us on Google', url: '/r/kalinga-review', enabled: true, clicks: 412 },
          { id: 'blk-2', network: 'whatsapp', label: 'Order Directly on WhatsApp', url: 'https://wa.me/919692299405', enabled: true, clicks: 329 },
          { id: 'blk-3', network: 'menu', label: 'View Today’s Menu & Combos', url: 'https://tapfx.com', enabled: true, clicks: 518 },
          { id: 'blk-4', network: 'instagram', label: 'Follow @kalingaspice on Instagram', url: 'https://instagram.com/tap.fx', enabled: true, clicks: 194 },
          { id: 'blk-5', network: 'maps', label: 'Get Directions (Saheed Nagar)', url: 'https://maps.google.com/?q=20.2961,85.8245', enabled: true, clicks: 147 },
          { id: 'blk-6', network: 'phone', label: 'Reserve a Table (+91 96922 99405)', url: 'tel:+919692299405', enabled: true, clicks: 88 },
        ],
        theme: {
          bgColor: '#F4F7FB',
          cardBg: '#FFFFFF',
          accentColor: '#004CF6',
          textColor: '#0F172A',
          fontId: 'sans',
          buttonStyle: 'solid-blue',
        },
        viewsCount: 1688,
        published: true,
        updatedAt: iso(1),
      },
    ],
    nfcCards: [
      {
        id: 'nfc-1',
        businessId: 'biz-kalinga',
        label: 'Billing Counter Stand #1',
        productType: 'stand',
        serialCode: 'TFX-STD-8841',
        status: 'active',
        assignedQrId: 'qr-1',
        assignedDestination: '/r/kalinga-review',
        programmingUrl: '/q/kalinga-review?src=nfc',
        tapsCount: 642,
        lastTappedAt: iso(0),
        cardTheme: 'royal-blue',
      },
      {
        id: 'nfc-2',
        businessId: 'biz-kalinga',
        label: 'Founder Magic Card',
        productType: 'magic',
        serialCode: 'TFX-MAG-2049',
        status: 'active',
        assignedQrId: 'qr-2',
        assignedDestination: '/kalinga-bistro',
        programmingUrl: '/q/kalinga-menu?src=nfc',
        tapsCount: 319,
        lastTappedAt: iso(1),
        cardTheme: 'cobalt-metal',
      },
      {
        id: 'nfc-3',
        businessId: 'biz-kalinga',
        label: 'Lounge WiFi Tap Card',
        productType: 'wifi',
        serialCode: 'TFX-WIF-1092',
        status: 'active',
        assignedQrId: 'qr-4',
        assignedDestination: 'WIFI:T:WPA;S:Kalinga_Guest_5G',
        programmingUrl: '/q/kalinga-wifi?src=nfc',
        tapsCount: 204,
        lastTappedAt: iso(2),
        cardTheme: 'pearl-white',
      },
    ],
    reviewPages: [
      {
        id: 'rp-1',
        businessId: 'biz-kalinga',
        outletId: 'outlet-main',
        code: 'kalinga-review',
        shopName: 'Kalinga Spice Bistro',
        shopType: 'Restaurant',
        googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        mapsUrl: 'https://maps.google.com/?cid=10281119596374313554',
        instagramUrl: 'https://instagram.com/tap.fx',
        whatsappNumber: '919692299405',
        aiAssistEnabled: true,
        quickTags: ['Food quality', 'Service speed', 'Ambience', 'Value for money', 'Cleanliness', 'Staff politeness'],
        privateFeedbackTarget: 'tapfxx@gmail.com',
        removeBranding: false,
        viewsCount: 1482,
        googleClicksCount: 894,
        nfcViewsCount: 612,
        qrViewsCount: 870,
      },
    ],
    reviews: [
      {
        id: 'rev-1',
        businessId: 'biz-kalinga',
        outletId: 'outlet-main',
        reviewerName: 'Subham Panda',
        rating: 5,
        text: 'Loved the coastal thali and quick table service. Clean dining hall and easy menu QR on the table.',
        language: 'en',
        reviewDate: iso(1),
        replyStatus: 'pending',
      },
      {
        id: 'rev-2',
        businessId: 'biz-kalinga',
        outletId: 'outlet-main',
        reviewerName: 'Meera Kulkarni',
        rating: 3,
        text: 'Food taste was good, though weekend wait time for takeaway took around 25 minutes.',
        language: 'en',
        reviewDate: iso(3),
        replyStatus: 'drafted',
        aiDraft:
          'Thank you for sharing your feedback, Meera. We are glad you enjoyed the food and sincerely apologise for the 25-minute weekend takeaway wait. Please reach us at +91 96922 99405 so we can ensure faster service next time. — Team Kalinga Spice',
      },
      {
        id: 'rev-3',
        businessId: 'biz-kalinga',
        outletId: 'outlet-main',
        reviewerName: 'Ananya Swain',
        rating: 5,
        text: 'ବହୁତ ସୁନ୍ଦର ଖାଦ୍ୟ ଏବଂ ପରିବେଶ। ପରିବାର ସହ ଆସିବା ପାଇଁ ଉତ୍ତମ ସ୍ଥାନ।',
        language: 'od',
        reviewDate: iso(5),
        replyStatus: 'posted',
        finalReply:
          'ଆପଣଙ୍କ ସୁନ୍ଦର ମତାମତ ପାଇଁ ବହୁତ ଧନ୍ୟବାଦ ଅନନ୍ୟା! ପରିବାର ସହ ପୁଣିଥରେ ଆସିବାକୁ ଅନୁରୋଧ। — Team Kalinga Spice',
        approvedBy: 'Aarav Patnaik',
        postedAt: iso(4),
      },
      {
        id: 'rev-4',
        businessId: 'biz-kalinga',
        outletId: 'outlet-main',
        reviewerName: 'Vikram Joshi',
        rating: 4,
        text: 'खाना बहुत स्वादिष्ट था और सफाई का पूरा ध्यान रखा गया है।',
        language: 'hi',
        reviewDate: iso(6),
        replyStatus: 'pending',
      },
    ],
    privateFeedback: [
      {
        id: 'pf-1',
        reviewPageCode: 'kalinga-review',
        businessId: 'biz-kalinga',
        rating: 3,
        message: 'AC near the window corner felt slightly warm during lunch rush.',
        contactOptional: 'Guest at Table 6',
        createdAt: iso(2),
      },
    ],
    products: [
      {
        id: 'prod-1',
        slug: 'common-card',
        name: 'TapFX Common Card',
        tagline: 'Essential NFC + QR smart business card for daily sharing.',
        description:
          'Standard waterproof matte PVC NFC card with custom printed QR code, digital contact details, WhatsApp, social links, website, and Google Review shortcut.',
        priceInr: 799,
        image: '/src/assets/images/product_common_card_1795502477104.jpg',
        features: [
          'Instant NFC tap + high-contrast QR scan',
          'Digital contact details (one-tap vCard)',
          'WhatsApp, social media & website links',
          'Direct Google Review shortcut',
          'Personalized business branding & logo',
        ],
        specs: [
          { label: 'Material', value: 'Matte Waterproof PVC (85.6 × 54 mm)' },
          { label: 'Chipset', value: 'NTAG215 Universal iOS + Android' },
          { label: 'Turnaround', value: 'Proof in 24h · Ships in 3–5 days' },
        ],
      },
      {
        id: 'prod-2',
        slug: 'master-card',
        name: 'TapFX Master Card',
        tagline: 'Premium personalized NFC business card for teams & founders.',
        description:
          'Elevated two-tone precision PVC/composite finish built for professionals, clinics, and hospitality leaders who want multi-link profiles and review routing.',
        priceInr: 999,
        badge: 'Best Seller',
        image: '/src/assets/images/product_master_card_1795502476566.jpg',
        features: [
          'Premium personalized front & back layout',
          'Dual NFC tap + styled dynamic QR code',
          'Multiple digital links & portfolio showcase',
          'Google Review + WhatsApp instant actions',
          'Priority design proofing included',
        ],
        specs: [
          { label: 'Material', value: 'Heavyweight Satin Composite PVC' },
          { label: 'Chipset', value: 'High-Sensitivity NTAG215 Dual Antenna' },
          { label: 'Turnaround', value: 'Proof in 12h · Express Dispatch' },
        ],
      },
      {
        id: 'prod-3',
        slug: 'magic-card',
        name: 'TapFX Magic Card',
        tagline: 'Flagship anodized NFC + Dynamic QR multi-functional card.',
        description:
          'Executive dark cobalt finish paired with an editable dynamic QR destination, custom multi-link landing page, Google Reviews, location map, and full scan analytics.',
        priceInr: 1499,
        badge: 'Executive',
        image: '/src/assets/images/product_magic_card_1795502477838.jpg',
        features: [
          'NFC + Dynamic QR with editable destination',
          'Custom Multi-Link landing page included',
          'Google Reviews, WhatsApp & Location links',
          'Full device, OS & tap vs scan analytics',
          'Zero-reprint destination switching anytime',
        ],
        specs: [
          { label: 'Material', value: 'Anodized Brushed Alloy Hybrid Core' },
          { label: 'Chipset', value: 'Anti-Metal Shielded NTAG215' },
          { label: 'Turnaround', value: 'Dedicated Proof + Priority Courier' },
        ],
      },
      {
        id: 'prod-4',
        slug: 'wifi-card',
        name: 'TapFX WiFi Card',
        tagline: 'One-tap guest WiFi sharing card for cafes, hotels & clinics.',
        description:
          'Let guests join your WiFi instantly with one NFC tap or QR scan—no typing long passwords at the counter.',
        priceInr: 99,
        bundleLabel: 'Pack of 10 Cards',
        bundlePriceInr: 499,
        image: '/src/assets/images/product_acrylic_stand_1795502477859.jpg',
        features: [
          'NFC tap WiFi auto-connect (supported devices)',
          'Universal WiFi QR code on reverse',
          'Custom SSID & encrypted password',
          'Personalized with your shop logo',
          'Value 10-pack available for multi-table venues',
        ],
        specs: [
          { label: 'Material', value: 'Compact Gloss/Matte Tap Tag or Card' },
          { label: 'Pack Options', value: 'Single ₹99 · 10-Pack ₹499' },
          { label: 'Compatibility', value: 'WPA/WPA2/WPA3 & Open Networks' },
        ],
      },
      {
        id: 'prod-5',
        slug: 'acrylic-stand',
        name: 'TapFX Acrylic QR Stand',
        tagline: 'Countertop review, menu & payment display with built-in NFC.',
        description:
          'Crystal-clear heavy acrylic tabletop display engineered for billing counters, salon mirrors, clinic receptions, and restaurant tables.',
        priceInr: 649,
        badge: 'For Counters',
        image: '/src/assets/images/product_acrylic_stand_1795502477859.jpg',
        features: [
          'High-visibility styled QR + embedded NFC coil',
          'Custom business name, logo & brand palette',
          'Google Review, WhatsApp or Menu destination',
          'Heavy weighted royal-blue or clear base',
          'Scratch-resistant UV-printed graphics',
        ],
        specs: [
          { label: 'Material', value: '5mm Cast Acrylic + Weighted Base' },
          { label: 'Dimensions', value: 'A5 Tabletop (148 × 210 mm)' },
          { label: 'Customization', value: 'Full UV Branded Insert + NFC Tap Zone' },
        ],
      },
    ],
    orders: [
      {
        id: 'ord-1',
        orderNumber: 'TFX-2026-1042',
        businessId: 'biz-kalinga',
        productSlug: 'master-card',
        productName: 'TapFX Master Card',
        quantity: 2,
        unitPriceInr: 999,
        totalInr: 1998,
        paymentMethod: 'UPI',
        paymentStatus: 'paid',
        status: 'Approval Required',
        proofUrl: '/src/assets/images/product_master_card_1795502476566.jpg',
        proofApproved: false,
        trackingCode: 'DLV892041IN',
        courierName: 'Delhivery Surface',
        adminNotes: 'Front & back proof uploaded for Kalinga Spice Bistro.',
        customization: {
          personName: 'Aarav Patnaik',
          businessName: 'Kalinga Spice Bistro',
          phone: '+91 96922 99405',
          email: 'owner@tapfx.com',
          website: 'https://tapfx.com/kalinga-bistro',
          instagram: '@kalingaspice',
          whatsapp: '919692299405',
          googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
          address: 'Saheed Nagar, Bhubaneswar, Odisha 751007',
          destinationType: 'review',
          destinationValue: '/r/kalinga-review',
          cardTheme: 'royal-blue',
        },
        shippingAddress: {
          fullName: 'Aarav Patnaik',
          phone: '+91 96922 99405',
          line1: 'Plot 42, Janpath Road, Saheed Nagar',
          city: 'Bhubaneswar',
          state: 'Odisha',
          pincode: '751007',
        },
        createdAt: iso(2),
        updatedAt: iso(0),
      },
      {
        id: 'ord-2',
        orderNumber: 'TFX-2026-1039',
        businessId: 'biz-kalinga',
        productSlug: 'acrylic-stand',
        productName: 'TapFX Acrylic QR Stand',
        quantity: 3,
        unitPriceInr: 649,
        totalInr: 1947,
        paymentMethod: 'Card',
        paymentStatus: 'paid',
        status: 'Shipped',
        proofUrl: '/src/assets/images/product_acrylic_stand_1795502477859.jpg',
        proofApproved: true,
        trackingCode: 'BD7741290IN',
        courierName: 'BlueDart Express',
        customization: {
          personName: 'Reception Desk',
          businessName: 'Kalinga Spice Bistro',
          phone: '+91 96922 99405',
          email: 'owner@tapfx.com',
          website: 'https://tapfx.com/kalinga-bistro',
          whatsapp: '919692299405',
          googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
          address: 'Saheed Nagar, Bhubaneswar, Odisha 751007',
          destinationType: 'multi-link',
          destinationValue: '/kalinga-bistro',
          cardTheme: 'pearl-white',
        },
        shippingAddress: {
          fullName: 'Aarav Patnaik',
          phone: '+91 96922 99405',
          line1: 'Plot 42, Janpath Road, Saheed Nagar',
          city: 'Bhubaneswar',
          state: 'Odisha',
          pincode: '751007',
        },
        createdAt: iso(6),
        updatedAt: iso(1),
      },
    ],
    plans: [
      {
        id: 'free',
        name: 'Free',
        audience: 'For beginners testing QR & digital profiles',
        priceInrMonthly: 0,
        maxQrCodes: 10,
        maxLinkPages: 1,
        maxScansPerMonth: 5000,
        maxImageUploads: 10,
        maxGoogleProfiles: 0,
        maxAiDraftsPerMonth: 10,
        analyticsRetentionDays: 15,
        removeBranding: false,
        customDomainApi: false,
        prioritySupport: false,
        ctaLabel: 'Get Started Free',
      },
      {
        id: 'basic',
        name: 'Basic',
        audience: 'For growing local shops and cafes',
        priceInrMonthly: 299,
        maxQrCodes: -1,
        maxLinkPages: 3,
        maxScansPerMonth: 50000,
        maxImageUploads: 30,
        maxGoogleProfiles: 1,
        maxAiDraftsPerMonth: 150,
        analyticsRetentionDays: 365,
        removeBranding: false,
        customDomainApi: false,
        prioritySupport: true,
        ctaLabel: 'Choose Basic',
      },
      {
        id: 'pro',
        name: 'Pro',
        audience: 'For multi-outlet brands & professionals',
        priceInrMonthly: 499,
        maxQrCodes: -1,
        maxLinkPages: 10,
        maxScansPerMonth: 500000,
        maxImageUploads: 60,
        maxGoogleProfiles: 3,
        maxAiDraftsPerMonth: 1000,
        analyticsRetentionDays: 1095,
        removeBranding: true,
        customDomainApi: true,
        prioritySupport: true,
        ctaLabel: 'Choose Pro',
      },
    ],
    siteConfig: {
      promoBanner: {
        enabled: true,
        text: 'Launch Offer: Free custom front & back design proof on all TapFX Master & Magic Cards',
        ctaText: 'Order Cards',
        countdownIso: new Date(now + 4 * 86400_000).toISOString(),
      },
      globalAiKillSwitch: false,
      faqs: [
        {
          id: 'faq-1',
          q: 'What is TapFX?',
          a: 'TapFX is an all-in-one QR management SaaS, multi-link digital profile builder, physical NFC card store, and policy-safe Google Review platform for local businesses and professionals.',
        },
        {
          id: 'faq-2',
          q: 'How do dynamic QR codes work?',
          a: 'Dynamic QR codes encode a fast TapFX short link (/q/your-code). When scanned, TapFX logs anonymized device and city stats and redirects immediately to your destination URL.',
        },
        {
          id: 'faq-3',
          q: 'Can I change my QR destination later?',
          a: 'Yes. Any dynamic QR code or NFC card destination can be updated in seconds from your TapFX dashboard without reprinting cards, stands, or menus.',
        },
        {
          id: 'faq-4',
          q: 'What is an NFC card?',
          a: 'An NFC (Near Field Communication) smart card contains a tiny contactless chip. Holding it near the top or back of a smartphone opens your review page, menu, or digital profile instantly.',
        },
        {
          id: 'faq-5',
          q: 'Do NFC cards work on all smartphones?',
          a: 'Yes—virtually all modern iPhones (XS and newer) and NFC-enabled Android phones read TapFX cards automatically. Every TapFX card also prints a high-contrast QR code on the card for universal camera scanning.',
        },
        {
          id: 'faq-6',
          q: 'Can I create a multi-link page?',
          a: 'Yes. Use our drag-and-drop Multi-Link Builder with 38+ network icons, Odia and Hindi font support, custom colors, and optional password protection at your own tapfx.com/slug link.',
        },
        {
          id: 'faq-7',
          q: 'Can I track QR scans?',
          a: 'Yes. Track total scans, NFC vs QR split, 7/30/90-day trends, top-performing QR codes, device/OS breakdown, and approximate city without storing visitor IP addresses.',
        },
        {
          id: 'faq-8',
          q: 'Can I customize my QR code?',
          a: 'Yes. Choose from 16 QR types, 12 module patterns, 16 gradient palettes or custom colors, corner frame/dot styles, 12 original frames with custom text, and preset or uploaded logos with live scannability checks.',
        },
        {
          id: 'faq-9',
          q: 'How do I order TapFX cards?',
          a: 'Open the TapFX Products store, select your card or acrylic stand, customize your business details and live front/back proof, and pay via UPI/Card or send directly on WhatsApp.',
        },
        {
          id: 'faq-10',
          q: 'Can I download QR codes for printing?',
          a: 'Yes. Export transparent or solid PNGs, crisp vector SVGs, and print-ready 300 DPI PDFs sized for 5 cm stickers, 10 cm cards, or A5 tabletop stand inserts.',
        },
        {
          id: 'faq-11',
          q: 'What subscription plans are available?',
          a: 'Start on our Free plan (up to 10 QR codes and 5,000 monthly scans), or upgrade to Basic (₹299/mo) or Pro (₹499/mo) for unlimited QR codes, branding removal, extended analytics retention, and AI review tools.',
        },
      ],
    },
    aiUsage: [
      { id: 'aiu-1', businessId: 'biz-kalinga', feature: 'review-assist', tokensApprox: 165, costInr: 0.12, createdAt: iso(2) },
      { id: 'aiu-2', businessId: 'biz-kalinga', feature: 'reply-assist', tokensApprox: 190, costInr: 0.14, createdAt: iso(1) },
      { id: 'aiu-3', businessId: 'biz-kalinga', feature: 'insights', tokensApprox: 420, costInr: 0.31, createdAt: iso(0) },
    ],
    contacts: [],
  };
}

let memoryDb: TapFXDatabase | null = null;

export function getDb(): TapFXDatabase {
  if (memoryDb) return memoryDb;
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      memoryDb = JSON.parse(raw) as TapFXDatabase;
      return memoryDb;
    }
  } catch {
    // Fallback to seed on parse issue
  }
  memoryDb = createSeedDatabase();
  saveDb(memoryDb);
  return memoryDb;
}

export function saveDb(db: TapFXDatabase): void {
  memoryDb = db;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
}
