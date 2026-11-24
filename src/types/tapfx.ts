export type LanguageCode = 'en' | 'od' | 'hi';

export type UserRole = 'owner' | 'staff' | 'admin' | 'agent';

export type PlanTier = 'free' | 'basic' | 'pro';

export type QRType =
  | 'website'
  | 'google-review'
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'linkedin'
  | 'telegram'
  | 'wifi'
  | 'phone'
  | 'email'
  | 'text'
  | 'location'
  | 'vcard'
  | 'payment'
  | 'multi-link';

export type QRPattern =
  | 'square'
  | 'gapped-square'
  | 'circle'
  | 'rounded'
  | 'vertical-bars'
  | 'horizontal-bars'
  | 'rounded-h-bars'
  | 'rounded-v-bars'
  | 'diamond'
  | 'hexagon'
  | 'star'
  | 'heart';

export type QRCornerFrameStyle = 'square' | 'rounded' | 'extra-rounded' | 'circle' | 'leaf';
export type QRCornerDotStyle = 'square' | 'circle' | 'diamond' | 'rounded';

export type QRFrameStyle =
  | 'none'
  | 'classic-bottom'
  | 'classic-top'
  | 'rounded-card'
  | 'review-badge'
  | 'restaurant-menu'
  | 'cafe-table'
  | 'salon-mirror'
  | 'clinic-desk'
  | 'retail-tag'
  | 'hotel-concierge'
  | 'wifi-card';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QRDesignConfig {
  pattern: QRPattern;
  fgColor: string;
  bgColor: string;
  transparentBg: boolean;
  useGradient: boolean;
  gradientId: string;
  gradientStart: string;
  gradientEnd: string;
  cornerFrameStyle: QRCornerFrameStyle;
  cornerDotStyle: QRCornerDotStyle;
  cornerColor: string;
  frameStyle: QRFrameStyle;
  frameText: string;
  frameColor: string;
  logoPreset: string;
  logoDataUrl?: string;
  logoSizeRatio: number; // 0.14 to 0.28
  errorCorrection: ErrorCorrectionLevel;
}

export interface QRCodeRecord {
  id: string;
  businessId: string;
  name: string;
  type: QRType;
  isDynamic: boolean;
  shortCode: string;
  destinationUrl: string;
  contentFields: Record<string, string>;
  design: QRDesignConfig;
  status: 'active' | 'paused';
  folderId: string | null;
  passwordProtected: boolean;
  passwordHint?: string;
  outletTag?: string;
  scansCount: number;
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
}

export interface FolderRecord {
  id: string;
  businessId: string;
  name: string;
  createdAt: string;
}

export interface ScanRecord {
  id: string;
  qrId: string;
  businessId: string;
  scannedAt: string;
  source: 'qr' | 'nfc';
  device: 'Mobile' | 'Tablet' | 'Desktop';
  os: 'Android' | 'iOS' | 'Windows' | 'macOS';
  city: string;
  outletTag?: string;
}

export type LinkButtonStyle = 'solid-blue' | 'soft-outline' | 'dark-slate' | 'glass-white' | 'pill-accent';

export interface LinkBlock {
  id: string;
  network: string;
  label: string;
  url: string;
  enabled: boolean;
  clicks: number;
}

export interface LinkPageTheme {
  bgColor: string;
  cardBg: string;
  accentColor: string;
  textColor: string;
  fontId: 'sans' | 'manrope' | 'oria' | 'devanagari' | 'mono' | 'classic';
  buttonStyle: LinkButtonStyle;
}

export interface LinkPageRecord {
  id: string;
  businessId: string;
  slug: string;
  name: string;
  headline: string;
  description: string;
  logoUrl?: string;
  coverUrl?: string;
  language: LanguageCode;
  passwordProtected: boolean;
  blocks: LinkBlock[];
  theme: LinkPageTheme;
  viewsCount: number;
  published: boolean;
  updatedAt: string;
}

export interface NFCCardRecord {
  id: string;
  businessId: string;
  label: string;
  productType: 'common' | 'master' | 'magic' | 'wifi' | 'stand';
  serialCode: string;
  status: 'active' | 'pending' | 'paused';
  assignedQrId: string;
  assignedDestination: string;
  programmingUrl: string;
  tapsCount: number;
  lastTappedAt?: string;
  cardTheme: 'royal-blue' | 'obsidian' | 'pearl-white' | 'cobalt-metal';
}

export interface ReviewPageRecord {
  id: string;
  businessId: string;
  outletId: string;
  code: string;
  shopName: string;
  shopType: string;
  logoUrl?: string;
  googlePlaceId: string;
  mapsUrl: string;
  instagramUrl?: string;
  whatsappNumber?: string;
  aiAssistEnabled: boolean;
  quickTags: string[];
  privateFeedbackTarget: string;
  removeBranding: boolean;
  viewsCount: number;
  googleClicksCount: number;
  nfcViewsCount: number;
  qrViewsCount: number;
}

export interface ReviewRecord {
  id: string;
  businessId: string;
  outletId: string;
  reviewerName: string;
  rating: number;
  text: string;
  language: LanguageCode;
  reviewDate: string;
  replyStatus: 'pending' | 'drafted' | 'posted';
  aiDraft?: string;
  finalReply?: string;
  approvedBy?: string;
  postedAt?: string;
}

export interface PrivateFeedbackRecord {
  id: string;
  reviewPageCode: string;
  businessId: string;
  rating: number;
  message: string;
  contactOptional?: string;
  createdAt: string;
}

export interface ProductRecord {
  id: string;
  slug: 'common-card' | 'master-card' | 'magic-card' | 'wifi-card' | 'acrylic-stand';
  name: string;
  tagline: string;
  description: string;
  priceInr: number;
  bundleLabel?: string;
  bundlePriceInr?: number;
  image: string;
  badge?: string;
  features: string[];
  specs: { label: string; value: string }[];
}

export type OrderStage =
  | 'Order Received'
  | 'Payment Confirmed'
  | 'Design Pending'
  | 'Proof Ready'
  | 'Approval Required'
  | 'Printing'
  | 'Manufacturing'
  | 'Packed'
  | 'Shipped'
  | 'Delivered';

export interface OrderRecord {
  id: string;
  orderNumber: string;
  businessId: string;
  productSlug: ProductRecord['slug'];
  productName: string;
  quantity: number;
  unitPriceInr: number;
  totalInr: number;
  paymentMethod: 'UPI' | 'Card' | 'WhatsApp';
  paymentStatus: 'paid' | 'pending-whatsapp';
  status: OrderStage;
  proofUrl?: string;
  proofApproved: boolean;
  trackingCode?: string;
  courierName?: string;
  adminNotes?: string;
  customization: {
    personName: string;
    businessName: string;
    logoDataUrl?: string;
    phone: string;
    email: string;
    website: string;
    instagram?: string;
    facebook?: string;
    whatsapp: string;
    googleReviewUrl: string;
    address: string;
    destinationType: 'review' | 'multi-link' | 'website' | 'wifi';
    destinationValue: string;
    cardTheme: 'royal-blue' | 'obsidian' | 'pearl-white' | 'cobalt-metal';
  };
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PlanConfig {
  id: PlanTier;
  name: string;
  audience: string;
  priceInrMonthly: number;
  maxQrCodes: number; // -1 for unlimited
  maxLinkPages: number;
  maxScansPerMonth: number;
  maxImageUploads: number;
  maxGoogleProfiles: number;
  maxAiDraftsPerMonth: number;
  analyticsRetentionDays: number;
  removeBranding: boolean;
  customDomainApi: boolean;
  prioritySupport: boolean;
  ctaLabel: string;
}

export interface SiteConfig {
  promoBanner: {
    enabled: boolean;
    text: string;
    ctaText: string;
    countdownIso: string;
  };
  globalAiKillSwitch: boolean;
  faqs: { id: string; q: string; a: string }[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  language: LanguageCode;
  businessId: string;
  planId: PlanTier;
}

export interface BusinessRecord {
  id: string;
  ownerId: string;
  name: string;
  type: string;
  contactPhone: string;
  whatsapp: string;
  planId: PlanTier;
  aiDraftsUsedThisMonth: number;
  aiEnabled: boolean;
  replyTone: 'warm' | 'formal' | 'short';
  replySignature: string;
  autoPostPlainPositive: boolean;
  whatsappWeeklyDigest: boolean;
  gstin?: string;
  defaultOutletId: string;
  googlePlaceId: string;
}

export interface AIUsageRecord {
  id: string;
  businessId: string;
  feature: 'review-assist' | 'reply-assist' | 'insights';
  tokensApprox: number;
  costInr: number;
  createdAt: string;
}
