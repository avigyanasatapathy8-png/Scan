import crypto from 'crypto';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { getDb, saveDb, hashPassword, verifyPassword, type StoredUser } from './src/server/store';
import {
  generateCustomerReviewAssist,
  generateOwnerReplyDraft,
  generateReviewInsightsSummary,
} from './src/server/gemini';
import type {
  BusinessRecord,
  FolderRecord,
  LanguageCode,
  LinkPageRecord,
  NFCCardRecord,
  OrderRecord,
  OrderStage,
  PlanTier,
  ProductRecord,
  QRCodeRecord,
  QRDesignConfig,
  QRType,
  ReviewRecord,
  SiteConfig,
} from './src/types/tapfx';

dotenv.config();

const RESERVED_SLUGS = new Set([
  'admin',
  'app',
  'api',
  'cards',
  'order',
  'track',
  'generator',
  'pricing',
  'login',
  'signup',
  'auth',
  'how-it-works',
  'faq',
  'contact',
  'privacy',
  'terms',
  'replacement-policy',
  'real-reviews',
  'stories',
  'q',
  'r',
  'assets',
]);

const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254']);

function isSafeRedirectTarget(rawUrl: string): boolean {
  if (!rawUrl) return false;
  if (rawUrl.startsWith('/')) return !rawUrl.startsWith('//');
  if (/^(upi:|tel:|mailto:|WIFI:)/i.test(rawUrl)) return true;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    if (BLOCKED_HOSTS.has(host)) return false;
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) return false;
    return true;
  } catch {
    return false;
  }
}

function sanitizeUser(user: StoredUser) {
  const { passwordHash: _ignored, ...safe } = user;
  return safe;
}

function parseDeviceOs(ua: string): { device: 'Mobile' | 'Tablet' | 'Desktop'; os: 'Android' | 'iOS' | 'Windows' | 'macOS' } {
  const lower = ua.toLowerCase();
  const os: 'Android' | 'iOS' | 'Windows' | 'macOS' = lower.includes('android')
    ? 'Android'
    : lower.includes('iphone') || lower.includes('ipad') || lower.includes('ios')
      ? 'iOS'
      : lower.includes('mac')
        ? 'macOS'
        : 'Windows';
  const device: 'Mobile' | 'Tablet' | 'Desktop' = lower.includes('ipad') || lower.includes('tablet')
    ? 'Tablet'
    : lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')
      ? 'Mobile'
      : 'Desktop';
  return { device, os };
}

interface AuthedRequest extends Request {
  currentUser?: StoredUser;
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const db = getDb();
  const session = db.sessions.find((s) => s.token === token);
  if (!session) {
    res.status(401).json({ error: 'Invalid or expired session' });
    return;
  }
  const user = db.users.find((u) => u.id === session.userId);
  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return;
  }
  req.currentUser = user;
  next();
}

function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.currentUser?.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }
    next();
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '8mb' }));

  // Simple in-memory rate limiter for AI and order endpoints
  const rateMap = new Map<string, { count: number; resetAt: number }>();
  function checkRateLimit(key: string, max = 30, windowMs = 60_000): boolean {
    const now = Date.now();
    const cur = rateMap.get(key);
    if (!cur || cur.resetAt < now) {
      rateMap.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (cur.count >= max) return false;
    cur.count += 1;
    return true;
  }

  // --- AUTH ENDPOINTS ---
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    const db = getDb();
    const user = db.users.find((u) => u.email.toLowerCase() === String(email ?? '').trim().toLowerCase());
    if (!user || !verifyPassword(String(password ?? ''), user.passwordHash)) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    const token = crypto.randomBytes(32).toString('hex');
    db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
    saveDb(db);
    res.json({ token, user: sanitizeUser(user) });
  });

  app.post('/api/auth/demo', (req, res) => {
    const { role } = req.body as { role?: 'owner' | 'admin' };
    const db = getDb();
    const targetEmail = role === 'admin' ? 'admin@tapfx.com' : 'owner@tapfx.com';
    const user = db.users.find((u) => u.email === targetEmail);
    if (!user) {
      res.status(404).json({ error: 'Demo account unavailable' });
      return;
    }
    const token = crypto.randomBytes(32).toString('hex');
    db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
    saveDb(db);
    res.json({ token, user: sanitizeUser(user) });
  });

  app.post('/api/auth/signup', (req, res) => {
    const { name, email, password, businessName } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      businessName?: string;
    };
    const cleanEmail = String(email ?? '').trim().toLowerCase();
    const cleanName = String(name ?? '').trim();
    if (!cleanName || !cleanEmail || !password || password.length < 6) {
      res.status(400).json({ error: 'Please provide name, valid email, and a password of at least 6 characters.' });
      return;
    }
    const db = getDb();
    if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }
    const userId = `user-${crypto.randomUUID().slice(0, 8)}`;
    const bizId = `biz-${crypto.randomUUID().slice(0, 8)}`;
    const newUser: StoredUser = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      role: 'owner',
      language: 'en',
      businessId: bizId,
      planId: 'free',
      passwordHash: hashPassword(password),
    };
    db.businesses.push({
      id: bizId,
      ownerId: userId,
      name: (businessName || `${cleanName}'s Business`).trim(),
      type: 'Local Business',
      contactPhone: '+91 96922 99405',
      whatsapp: '919692299405',
      planId: 'free',
      aiDraftsUsedThisMonth: 0,
      aiEnabled: true,
      replyTone: 'warm',
      replySignature: `— ${cleanName}`,
      autoPostPlainPositive: false,
      whatsappWeeklyDigest: false,
      defaultOutletId: `outlet-${bizId}`,
      googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    });
    db.users.push(newUser);
    const token = crypto.randomBytes(32).toString('hex');
    db.sessions.push({ token, userId, createdAt: new Date().toISOString() });
    saveDb(db);
    res.json({ token, user: sanitizeUser(newUser) });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const biz = db.businesses.find((b) => b.id === req.currentUser!.businessId);
    res.json({ user: sanitizeUser(req.currentUser!), business: biz ?? null });
  });

  app.post('/api/auth/logout', requireAuth, (req: AuthedRequest, res) => {
    const token = req.headers.authorization?.slice(7).trim();
    const db = getDb();
    db.sessions = db.sessions.filter((s) => s.token !== token);
    saveDb(db);
    res.json({ ok: true });
  });

  // --- PUBLIC BOOTSTRAP & STOREFRONT ---
  app.get('/api/bootstrap', (_req, res) => {
    const db = getDb();
    res.json({
      products: db.products,
      plans: db.plans,
      siteConfig: db.siteConfig,
      demoReviewCode: db.reviewPages[0]?.code ?? 'kalinga-review',
      demoLinkSlug: db.linkPages[0]?.slug ?? 'kalinga-bistro',
      demoOrderNumber: db.orders[0]?.orderNumber ?? 'TFX-2026-1042',
    });
  });

  app.post('/api/contact', (req, res) => {
    const { name, email, phone, message } = req.body as Record<string, string>;
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      res.status(400).json({ error: 'Name, email, and message are required.' });
      return;
    }
    const db = getDb();
    db.contacts.push({
      id: `cnt-${crypto.randomUUID().slice(0, 8)}`,
      name: name.trim(),
      email: email.trim(),
      phone: (phone ?? '').trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    });
    saveDb(db);
    res.json({ ok: true });
  });

  // --- SHORT-LINK REDIRECT & SCAN TELEMETRY (/q/:code) ---
  app.get('/q/:code', (req, res) => {
    const code = String(req.params.code || '').trim();
    const src = req.query.src === 'nfc' ? 'nfc' : 'qr';
    const db = getDb();
    const qr = db.qrCodes.find((q) => q.shortCode === code && !q.deleted);
    if (!qr) {
      res.redirect('/?notice=qr-not-found');
      return;
    }
    if (qr.status === 'paused') {
      res.redirect('/?notice=qr-paused');
      return;
    }
    if (!isSafeRedirectTarget(qr.destinationUrl)) {
      res.status(400).send('Destination URL blocked for safety.');
      return;
    }

    const { device, os } = parseDeviceOs(String(req.headers['user-agent'] || ''));
    const cities = ['Bhubaneswar', 'Cuttack', 'Bengaluru', 'Mumbai', 'Hyderabad'];
    db.scans.unshift({
      id: `scan-${crypto.randomUUID().slice(0, 8)}`,
      qrId: qr.id,
      businessId: qr.businessId,
      scannedAt: new Date().toISOString(),
      source: src,
      device,
      os,
      city: cities[Math.floor(Math.random() * cities.length)],
      outletTag: qr.outletTag,
    });
    qr.scansCount += 1;
    saveDb(db);

    if (qr.passwordProtected) {
      res.redirect(`/p-gate/${encodeURIComponent(qr.shortCode)}`);
      return;
    }
    res.redirect(qr.destinationUrl);
  });

  // --- PUBLIC LINK PAGES ---
  app.get('/api/public/link-page/:slug', (req, res) => {
    const slug = String(req.params.slug || '').trim().toLowerCase();
    const db = getDb();
    const page = db.linkPages.find((p) => p.slug === slug && p.published);
    if (!page) {
      res.status(404).json({ error: 'Link page not found' });
      return;
    }
    page.viewsCount += 1;
    saveDb(db);
    const biz = db.businesses.find((b) => b.id === page.businessId);
    const plan = db.plans.find((pl) => pl.id === (biz?.planId ?? 'free'));
    res.json({
      page,
      removeBranding: Boolean(plan?.removeBranding),
    });
  });

  app.post('/api/public/link-page/:slug/click', (req, res) => {
    const slug = String(req.params.slug || '').trim().toLowerCase();
    const { blockId } = req.body as { blockId?: string };
    const db = getDb();
    const page = db.linkPages.find((p) => p.slug === slug);
    const block = page?.blocks.find((b) => b.id === blockId);
    if (block) {
      block.clicks += 1;
      saveDb(db);
    }
    res.json({ ok: true });
  });

  // --- INSTANT PUBLIC MULTI-LINKED QR PAGE ---
  app.post('/api/public/multi-link-qr', (req, res) => {
    if (!checkRateLimit(`multilink:${req.ip}`, 25, 60_000)) {
      res.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' });
      return;
    }

    const db = getDb();
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7).trim() : '';
    const session = token ? db.sessions.find((s) => s.token === token) : undefined;
    const currentUser = session ? db.users.find((u) => u.id === session.userId) : undefined;
    const bizId = currentUser?.businessId ?? 'biz-public';

    const { title, headline, slug: rawSlug, blocks } = req.body as {
      title?: string;
      headline?: string;
      slug?: string;
      blocks?: Array<{ id?: string; network?: string; label?: string; url?: string }>;
    };

    if (!Array.isArray(blocks) || blocks.length === 0 || blocks.length > 25) {
      res.status(400).json({ error: 'Please add between 1 and 25 links to generate a Multi-Linked QR.' });
      return;
    }

    const sanitizedBlocks = blocks.map((b, idx) => {
      const label = String(b.label || '').trim().slice(0, 60);
      let url = String(b.url || '').trim();
      if (url && !url.startsWith('/') && !/^[a-z]+:/i.test(url)) {
        url = `https://${url}`;
      }
      return {
        id: b.id && typeof b.id === 'string' ? b.id.slice(0, 32) : `blk-${Date.now()}-${idx}`,
        network: String(b.network || 'custom').trim().slice(0, 32) || 'custom',
        label: label || `Link ${idx + 1}`,
        url,
        enabled: true,
        clicks: 0,
      };
    });

    const invalidLink = sanitizedBlocks.find((b) => !b.url || !isSafeRedirectTarget(b.url));
    if (invalidLink) {
      res.status(400).json({ error: `Invalid or unsafe URL for "${invalidLink.label}". Use https:// or http:// links.` });
      return;
    }

    const cleanedTitle = String(title || 'My TapFX Links').trim().slice(0, 80) || 'My TapFX Links';
    const cleanedHeadline = String(headline || 'All my important links in one scan').trim().slice(0, 120);

    const requestedSlug = String(rawSlug || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');

    let finalSlug = '';
    const existingOwned =
      requestedSlug && currentUser
        ? db.linkPages.find((p) => p.slug === requestedSlug && p.businessId === bizId)
        : undefined;

    if (existingOwned) {
      existingOwned.name = cleanedTitle;
      existingOwned.headline = cleanedHeadline;
      existingOwned.blocks = sanitizedBlocks;
      existingOwned.published = true;
      existingOwned.updatedAt = new Date().toISOString();
      saveDb(db);
      res.json({ page: existingOwned });
      return;
    }

    const slugValid =
      requestedSlug.length >= 3 && requestedSlug.length <= 30 && !RESERVED_SLUGS.has(requestedSlug);
    const slugTaken = slugValid ? db.linkPages.some((p) => p.slug === requestedSlug) : true;

    if (slugValid && !slugTaken) {
      finalSlug = requestedSlug;
    } else {
      finalSlug = `qr-${crypto.randomBytes(3).toString('hex')}`;
      while (db.linkPages.some((p) => p.slug === finalSlug) || RESERVED_SLUGS.has(finalSlug)) {
        finalSlug = `qr-${crypto.randomBytes(3).toString('hex')}`;
      }
    }

    const created: LinkPageRecord = {
      id: `lp-${crypto.randomUUID().slice(0, 8)}`,
      businessId: bizId,
      slug: finalSlug,
      name: cleanedTitle,
      headline: cleanedHeadline,
      description: 'Scan or tap any button below to connect.',
      language: 'en',
      passwordProtected: false,
      blocks: sanitizedBlocks,
      theme: {
        bgColor: '#F4F7FB',
        cardBg: '#FFFFFF',
        accentColor: '#004CF6',
        textColor: '#0F172A',
        fontId: 'sans',
        buttonStyle: 'solid-blue',
      },
      viewsCount: 0,
      published: true,
      updatedAt: new Date().toISOString(),
    };
    db.linkPages.push(created);
    saveDb(db);
    res.json({ page: created });
  });

  // --- PUBLIC REVIEW PAGES (/r/:code) ---
  app.get('/api/public/review-page/:code', (req, res) => {
    const code = String(req.params.code || '').trim();
    const src = req.query.src === 'nfc' ? 'nfc' : 'qr';
    const db = getDb();
    const rp = db.reviewPages.find((r) => r.code === code);
    if (!rp) {
      res.status(404).json({ error: 'Review page not found' });
      return;
    }
    rp.viewsCount += 1;
    if (src === 'nfc') rp.nfcViewsCount += 1;
    else rp.qrViewsCount += 1;
    saveDb(db);
    const biz = db.businesses.find((b) => b.id === rp.businessId);
    const plan = db.plans.find((pl) => pl.id === (biz?.planId ?? 'free'));
    res.json({
      reviewPage: {
        ...rp,
        aiAssistEnabled: rp.aiAssistEnabled && Boolean(biz?.aiEnabled) && !db.siteConfig.globalAiKillSwitch,
        removeBranding: Boolean(plan?.removeBranding) || rp.removeBranding,
      },
    });
  });

  app.post('/api/public/review-page/:code/event', (req, res) => {
    const code = String(req.params.code || '').trim();
    const { type } = req.body as { type?: 'google_click' };
    const db = getDb();
    const rp = db.reviewPages.find((r) => r.code === code);
    if (rp && type === 'google_click') {
      rp.googleClicksCount += 1;
      saveDb(db);
    }
    res.json({ ok: true });
  });

  app.post('/api/public/review-page/:code/feedback', (req, res) => {
    const code = String(req.params.code || '').trim();
    const { rating, message, contactOptional } = req.body as {
      rating?: number;
      message?: string;
      contactOptional?: string;
    };
    if (!message?.trim()) {
      res.status(400).json({ error: 'Please write a short message.' });
      return;
    }
    const db = getDb();
    const rp = db.reviewPages.find((r) => r.code === code);
    if (!rp) {
      res.status(404).json({ error: 'Review page not found' });
      return;
    }
    db.privateFeedback.unshift({
      id: `pf-${crypto.randomUUID().slice(0, 8)}`,
      reviewPageCode: code,
      businessId: rp.businessId,
      rating: Number(rating || 5),
      message: message.trim().slice(0, 800),
      contactOptional: contactOptional?.trim().slice(0, 120),
      createdAt: new Date().toISOString(),
    });
    saveDb(db);
    res.json({ ok: true });
  });

  // --- ORDERS & ORDER TRACKING ---
  app.post('/api/orders', (req, res) => {
    if (!checkRateLimit(`order:${req.ip}`, 20, 60_000)) {
      res.status(429).json({ error: 'Too many order attempts. Please wait a minute.' });
      return;
    }
    const body = req.body as Partial<OrderRecord>;
    const db = getDb();
    const product = db.products.find((p) => p.slug === body.productSlug);
    if (!product || !body.customization?.businessName || !body.shippingAddress?.fullName) {
      res.status(400).json({ error: 'Product, business details, and shipping address are required.' });
      return;
    }
    const qty = Math.max(1, Math.min(100, Number(body.quantity || 1)));
    const unitPrice =
      product.slug === 'wifi-card' && qty >= 10 && product.bundlePriceInr
        ? Math.round(product.bundlePriceInr / 10)
        : product.priceInr;
    const totalInr = product.slug === 'wifi-card' && qty === 10 && product.bundlePriceInr ? product.bundlePriceInr : unitPrice * qty;
    const orderNumber = `TFX-2026-${Math.floor(1100 + Math.random() * 8800)}`;

    const order: OrderRecord = {
      id: `ord-${crypto.randomUUID().slice(0, 8)}`,
      orderNumber,
      businessId: body.businessId || 'biz-kalinga',
      productSlug: product.slug,
      productName: product.name,
      quantity: qty,
      unitPriceInr: unitPrice,
      totalInr,
      paymentMethod: body.paymentMethod || 'UPI',
      paymentStatus: body.paymentMethod === 'WhatsApp' ? 'pending-whatsapp' : 'paid',
      status: body.paymentMethod === 'WhatsApp' ? 'Order Received' : 'Payment Confirmed',
      proofUrl: product.image,
      proofApproved: false,
      customization: body.customization,
      shippingAddress: body.shippingAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.orders.unshift(order);
    saveDb(db);
    res.json({ order });
  });

  app.get('/api/orders/track/:orderNumber', (req, res) => {
    const orderNumber = String(req.params.orderNumber || '').trim().toUpperCase();
    const db = getDb();
    const order = db.orders.find((o) => o.orderNumber.toUpperCase() === orderNumber);
    if (!order) {
      res.status(404).json({ error: 'Order number not found' });
      return;
    }
    res.json({ order });
  });

  app.post('/api/orders/track/:orderNumber/approve-proof', (req, res) => {
    const orderNumber = String(req.params.orderNumber || '').trim().toUpperCase();
    const db = getDb();
    const order = db.orders.find((o) => o.orderNumber.toUpperCase() === orderNumber);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    order.proofApproved = true;
    if (order.status === 'Proof Ready' || order.status === 'Approval Required') {
      order.status = 'Printing';
    }
    order.updatedAt = new Date().toISOString();
    saveDb(db);
    res.json({ order });
  });

  // --- OWNER DASHBOARD APIs ---
  app.get('/api/owner/overview', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const bizId = req.currentUser!.businessId;
    const business = db.businesses.find((b) => b.id === bizId) ?? db.businesses[0];
    const plan = db.plans.find((p) => p.id === business.planId) ?? db.plans[0];
    const qrCodes = db.qrCodes.filter((q) => q.businessId === bizId && !q.deleted);
    const folders = db.folders.filter((f) => f.businessId === bizId);
    const scans = db.scans.filter((s) => s.businessId === bizId);
    const linkPages = db.linkPages.filter((l) => l.businessId === bizId);
    const nfcCards = db.nfcCards.filter((n) => n.businessId === bizId);
    const reviewPages = db.reviewPages.filter((r) => r.businessId === bizId);
    const reviews = db.reviews.filter((r) => r.businessId === bizId);
    const privateFeedback = db.privateFeedback.filter((p) => p.businessId === bizId);
    const orders = db.orders.filter((o) => o.businessId === bizId);

    res.json({
      business,
      plan,
      allPlans: db.plans,
      globalAiKillSwitch: db.siteConfig.globalAiKillSwitch,
      qrCodes,
      folders,
      scans,
      linkPages,
      nfcCards,
      reviewPages,
      reviews,
      privateFeedback,
      orders,
    });
  });

  app.post('/api/qrs', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const bizId = req.currentUser!.businessId;
    const biz = db.businesses.find((b) => b.id === bizId)!;
    const plan = db.plans.find((p) => p.id === biz.planId)!;
    const existingCount = db.qrCodes.filter((q) => q.businessId === bizId && !q.deleted).length;

    if (plan.maxQrCodes !== -1 && existingCount >= plan.maxQrCodes) {
      res.status(403).json({
        error: `Your ${plan.name} plan allows up to ${plan.maxQrCodes} QR codes. Upgrade to Basic or Pro for unlimited QR codes.`,
        upgradeRequired: true,
      });
      return;
    }

    const { name, type, isDynamic, destinationUrl, contentFields, design, folderId, passwordProtected, outletTag } =
      req.body as {
        name?: string;
        type?: QRType;
        isDynamic?: boolean;
        destinationUrl?: string;
        contentFields?: Record<string, string>;
        design?: QRDesignConfig;
        folderId?: string | null;
        passwordProtected?: boolean;
        outletTag?: string;
      };

    if (!destinationUrl || !isSafeRedirectTarget(destinationUrl)) {
      res.status(400).json({ error: 'Please enter a valid destination URL or QR payload.' });
      return;
    }

    const shortCode = `tfx-${crypto.randomBytes(3).toString('hex')}`;
    const qr: QRCodeRecord = {
      id: `qr-${crypto.randomUUID().slice(0, 8)}`,
      businessId: bizId,
      name: (name || 'Untitled QR Code').trim(),
      type: type || 'website',
      isDynamic: isDynamic ?? true,
      shortCode,
      destinationUrl,
      contentFields: contentFields ?? {},
      design: design!,
      status: 'active',
      folderId: folderId ?? null,
      passwordProtected: Boolean(passwordProtected),
      outletTag: outletTag?.trim() || undefined,
      scansCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.qrCodes.unshift(qr);
    saveDb(db);
    res.json({ qr });
  });

  app.patch('/api/qrs/:id', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const qr = db.qrCodes.find((q) => q.id === req.params.id && q.businessId === req.currentUser!.businessId);
    if (!qr) {
      res.status(404).json({ error: 'QR code not found' });
      return;
    }
    const { name, destinationUrl, status, folderId, design, outletTag, passwordProtected } = req.body as Partial<QRCodeRecord>;
    if (destinationUrl !== undefined) {
      if (!isSafeRedirectTarget(destinationUrl)) {
        res.status(400).json({ error: 'Destination URL failed safety check.' });
        return;
      }
      qr.destinationUrl = destinationUrl;
    }
    if (name !== undefined) qr.name = name.trim();
    if (status === 'active' || status === 'paused') qr.status = status;
    if (folderId !== undefined) qr.folderId = folderId;
    if (design !== undefined) qr.design = design;
    if (outletTag !== undefined) qr.outletTag = outletTag;
    if (passwordProtected !== undefined) qr.passwordProtected = passwordProtected;
    qr.updatedAt = new Date().toISOString();
    saveDb(db);
    res.json({ qr });
  });

  app.post('/api/qrs/:id/duplicate', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const src = db.qrCodes.find((q) => q.id === req.params.id && q.businessId === req.currentUser!.businessId);
    if (!src) {
      res.status(404).json({ error: 'QR code not found' });
      return;
    }
    const copy: QRCodeRecord = {
      ...src,
      id: `qr-${crypto.randomUUID().slice(0, 8)}`,
      name: `${src.name} (Copy)`,
      shortCode: `tfx-${crypto.randomBytes(3).toString('hex')}`,
      scansCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.qrCodes.unshift(copy);
    saveDb(db);
    res.json({ qr: copy });
  });

  app.delete('/api/qrs/:id', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const qr = db.qrCodes.find((q) => q.id === req.params.id && q.businessId === req.currentUser!.businessId);
    if (!qr) {
      res.status(404).json({ error: 'QR code not found' });
      return;
    }
    qr.deleted = true;
    saveDb(db);
    res.json({ ok: true });
  });

  app.post('/api/folders', requireAuth, (req: AuthedRequest, res) => {
    const { name } = req.body as { name?: string };
    if (!name?.trim()) {
      res.status(400).json({ error: 'Folder name required' });
      return;
    }
    const db = getDb();
    const folder: FolderRecord = {
      id: `fld-${crypto.randomUUID().slice(0, 8)}`,
      businessId: req.currentUser!.businessId,
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    db.folders.push(folder);
    saveDb(db);
    res.json({ folder });
  });

  app.get('/api/link-pages/check-slug', (req, res) => {
    const slug = String(req.query.slug || '').trim().toLowerCase();
    const excludeId = String(req.query.excludeId || '');
    if (slug.length < 3 || slug.length > 30 || !/^[a-z0-9-]+$/.test(slug)) {
      res.json({ available: false, reason: 'Use 3–30 lowercase letters, numbers, or hyphens.' });
      return;
    }
    if (RESERVED_SLUGS.has(slug)) {
      res.json({ available: false, reason: 'This link name is reserved by TapFX.' });
      return;
    }
    const db = getDb();
    const taken = db.linkPages.some((p) => p.slug === slug && p.id !== excludeId);
    res.json({ available: !taken, reason: taken ? 'Already claimed by another business.' : 'Available!' });
  });

  app.post('/api/link-pages', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const bizId = req.currentUser!.businessId;
    const payload = req.body as LinkPageRecord;
    const slug = String(payload.slug || '').trim().toLowerCase();
    if (slug.length < 3 || slug.length > 30 || !/^[a-z0-9-]+$/.test(slug) || RESERVED_SLUGS.has(slug)) {
      res.status(400).json({ error: 'Invalid or reserved link slug.' });
      return;
    }
    if (Array.isArray(payload.blocks)) {
      const badBlock = payload.blocks.find((b) => b.url && !isSafeRedirectTarget(String(b.url)));
      if (badBlock) {
        res.status(400).json({ error: `Invalid destination URL for "${badBlock.label}".` });
        return;
      }
    }
    const existing = db.linkPages.find((p) => p.id === payload.id && p.businessId === bizId);
    if (existing) {
      if (db.linkPages.some((p) => p.slug === slug && p.id !== existing.id)) {
        res.status(409).json({ error: 'Slug already taken.' });
        return;
      }
      Object.assign(existing, {
        ...payload,
        slug,
        updatedAt: new Date().toISOString(),
      });
      saveDb(db);
      res.json({ page: existing });
      return;
    }

    const biz = db.businesses.find((b) => b.id === bizId)!;
    const plan = db.plans.find((p) => p.id === biz.planId)!;
    const currentPages = db.linkPages.filter((p) => p.businessId === bizId).length;
    if (currentPages >= plan.maxLinkPages) {
      res.status(403).json({
        error: `Your ${plan.name} plan includes ${plan.maxLinkPages} Multi-Link page(s). Upgrade to add more.`,
        upgradeRequired: true,
      });
      return;
    }
    const created: LinkPageRecord = {
      ...payload,
      id: `lp-${crypto.randomUUID().slice(0, 8)}`,
      businessId: bizId,
      slug,
      viewsCount: 0,
      updatedAt: new Date().toISOString(),
    };
    db.linkPages.push(created);
    saveDb(db);
    res.json({ page: created });
  });

  app.post('/api/nfc-cards', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const bizId = req.currentUser!.businessId;
    const { label, productType, assignedQrId, cardTheme } = req.body as Partial<NFCCardRecord>;
    const qr = db.qrCodes.find((q) => q.id === assignedQrId && q.businessId === bizId) ?? db.qrCodes[0];
    const card: NFCCardRecord = {
      id: `nfc-${crypto.randomUUID().slice(0, 8)}`,
      businessId: bizId,
      label: (label || 'New NFC Card').trim(),
      productType: productType || 'master',
      serialCode: `TFX-${crypto.randomBytes(2).toString('hex').toUpperCase()}-${Math.floor(1000 + Math.random() * 8999)}`,
      status: 'active',
      assignedQrId: qr?.id ?? 'qr-1',
      assignedDestination: qr?.destinationUrl ?? '/r/kalinga-review',
      programmingUrl: `/q/${qr?.shortCode ?? 'kalinga-review'}?src=nfc`,
      tapsCount: 0,
      cardTheme: cardTheme || 'royal-blue',
    };
    db.nfcCards.unshift(card);
    saveDb(db);
    res.json({ card });
  });

  app.patch('/api/nfc-cards/:id', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const card = db.nfcCards.find((c) => c.id === req.params.id && c.businessId === req.currentUser!.businessId);
    if (!card) {
      res.status(404).json({ error: 'NFC card not found' });
      return;
    }
    const { assignedQrId, status, label } = req.body as Partial<NFCCardRecord>;
    if (assignedQrId) {
      const qr = db.qrCodes.find((q) => q.id === assignedQrId && q.businessId === req.currentUser!.businessId);
      if (qr) {
        card.assignedQrId = qr.id;
        card.assignedDestination = qr.destinationUrl;
        card.programmingUrl = `/q/${qr.shortCode}?src=nfc`;
      }
    }
    if (status) card.status = status;
    if (label) card.label = label.trim();
    saveDb(db);
    res.json({ card });
  });

  app.post('/api/reviews', requireAuth, (req: AuthedRequest, res) => {
    const { reviewerName, rating, text, language } = req.body as {
      reviewerName?: string;
      rating?: number;
      text?: string;
      language?: LanguageCode;
    };
    if (!text?.trim()) {
      res.status(400).json({ error: 'Review text is required.' });
      return;
    }
    const db = getDb();
    const biz = db.businesses.find((b) => b.id === req.currentUser!.businessId)!;
    const review: ReviewRecord = {
      id: `rev-${crypto.randomUUID().slice(0, 8)}`,
      businessId: biz.id,
      outletId: biz.defaultOutletId,
      reviewerName: (reviewerName || 'Customer').trim(),
      rating: Math.max(1, Math.min(5, Number(rating || 5))),
      text: text.trim(),
      language: language || 'en',
      reviewDate: new Date().toISOString(),
      replyStatus: 'pending',
    };
    db.reviews.unshift(review);
    saveDb(db);
    res.json({ review });
  });

  app.post('/api/reviews/:id/reply', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const review = db.reviews.find((r) => r.id === req.params.id && r.businessId === req.currentUser!.businessId);
    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }
    const { finalReply } = req.body as { finalReply?: string };
    if (!finalReply?.trim()) {
      res.status(400).json({ error: 'Reply text cannot be empty.' });
      return;
    }
    review.finalReply = finalReply.trim();
    review.replyStatus = 'posted';
    review.approvedBy = req.currentUser!.name;
    review.postedAt = new Date().toISOString();
    saveDb(db);
    res.json({ review });
  });

  app.patch('/api/business/settings', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const biz = db.businesses.find((b) => b.id === req.currentUser!.businessId);
    if (!biz) {
      res.status(404).json({ error: 'Business not found' });
      return;
    }
    const updates = req.body as Partial<BusinessRecord> & { quickTags?: string[]; language?: LanguageCode };
    if (updates.name) biz.name = updates.name.trim();
    if (updates.type) biz.type = updates.type.trim();
    if (updates.contactPhone) biz.contactPhone = updates.contactPhone.trim();
    if (updates.whatsapp) biz.whatsapp = updates.whatsapp.trim();
    if (updates.googlePlaceId) biz.googlePlaceId = updates.googlePlaceId.trim();
    if (updates.replyTone) biz.replyTone = updates.replyTone;
    if (updates.replySignature !== undefined) biz.replySignature = updates.replySignature;
    if (typeof updates.aiEnabled === 'boolean') biz.aiEnabled = updates.aiEnabled;
    if (typeof updates.autoPostPlainPositive === 'boolean') biz.autoPostPlainPositive = updates.autoPostPlainPositive;
    if (typeof updates.whatsappWeeklyDigest === 'boolean') biz.whatsappWeeklyDigest = updates.whatsappWeeklyDigest;
    if (updates.gstin !== undefined) biz.gstin = updates.gstin;
    if (updates.language) req.currentUser!.language = updates.language;

    const rp = db.reviewPages.find((r) => r.businessId === biz.id);
    if (rp) {
      if (updates.name) rp.shopName = biz.name;
      if (updates.googlePlaceId) rp.googlePlaceId = biz.googlePlaceId;
      if (updates.whatsapp) rp.whatsappNumber = biz.whatsapp;
      if (typeof updates.aiEnabled === 'boolean') rp.aiAssistEnabled = updates.aiEnabled;
      if (Array.isArray(updates.quickTags)) rp.quickTags = updates.quickTags;
    }
    saveDb(db);
    res.json({ business: biz, user: sanitizeUser(req.currentUser!) });
  });

  app.post('/api/subscription/upgrade', requireAuth, (req: AuthedRequest, res) => {
    const { planId } = req.body as { planId?: PlanTier };
    const db = getDb();
    const plan = db.plans.find((p) => p.id === planId);
    const biz = db.businesses.find((b) => b.id === req.currentUser!.businessId);
    if (!plan || !biz) {
      res.status(400).json({ error: 'Invalid plan selected.' });
      return;
    }
    biz.planId = plan.id;
    req.currentUser!.planId = plan.id;
    saveDb(db);
    res.json({
      business: biz,
      plan,
      invoice: {
        invoiceNumber: `INV-TFX-${Math.floor(10000 + Math.random() * 89999)}`,
        issuedAt: new Date().toISOString(),
        amountInr: plan.priceInrMonthly,
        gstInr: Math.round(plan.priceInrMonthly * 0.18),
        totalInr: Math.round(plan.priceInrMonthly * 1.18),
      },
    });
  });

  // --- SERVER-SIDE GEMINI AI ENDPOINTS ---
  app.post('/api/ai/review-assist', async (req, res) => {
    if (!checkRateLimit(`ai-assist:${req.ip}`, 15, 60_000)) {
      res.status(429).json({ error: 'Rate limit reached. Please write in your own words.' });
      return;
    }
    const { code, rating, tags, note, language } = req.body as {
      code?: string;
      rating?: number;
      tags?: string[];
      note?: string;
      language?: LanguageCode;
    };
    const db = getDb();
    if (db.siteConfig.globalAiKillSwitch) {
      res.status(503).json({ error: 'AI assist is temporarily paused. Please write in your own words.' });
      return;
    }
    const rp = db.reviewPages.find((r) => r.code === code);
    const biz = rp ? db.businesses.find((b) => b.id === rp.businessId) : null;
    if (!rp || !biz || !rp.aiAssistEnabled || !biz.aiEnabled) {
      res.status(403).json({ error: 'AI review assist is disabled for this shop.' });
      return;
    }
    const plan = db.plans.find((p) => p.id === biz.planId)!;
    if (biz.aiDraftsUsedThisMonth >= plan.maxAiDraftsPerMonth) {
      res.status(429).json({ error: 'Monthly AI draft quota reached for this business.' });
      return;
    }

    try {
      const result = await generateCustomerReviewAssist({
        shopName: rp.shopName,
        shopType: rp.shopType,
        rating: Number(rating || 5),
        tags: Array.isArray(tags) ? tags : [],
        note: String(note || ''),
        language: language || 'en',
      });
      if (result.variants.length > 0) {
        biz.aiDraftsUsedThisMonth += 1;
        db.aiUsage.unshift({
          id: `aiu-${crypto.randomUUID().slice(0, 8)}`,
          businessId: biz.id,
          feature: 'review-assist',
          tokensApprox: result.tokensApprox,
          costInr: Number(((result.tokensApprox / 1000) * 0.75).toFixed(2)),
          createdAt: new Date().toISOString(),
        });
        saveDb(db);
      }
      res.json(result);
    } catch (err) {
      res.status(502).json({ error: err instanceof Error ? err.message : 'AI service error' });
    }
  });

  app.post('/api/ai/reply-assist', requireAuth, async (req: AuthedRequest, res) => {
    const db = getDb();
    if (db.siteConfig.globalAiKillSwitch) {
      res.status(503).json({ error: 'Global AI kill switch is active.' });
      return;
    }
    const { reviewId } = req.body as { reviewId?: string };
    const biz = db.businesses.find((b) => b.id === req.currentUser!.businessId)!;
    const plan = db.plans.find((p) => p.id === biz.planId)!;
    if (!biz.aiEnabled) {
      res.status(403).json({ error: 'AI features are turned off for this business.' });
      return;
    }
    if (biz.aiDraftsUsedThisMonth >= plan.maxAiDraftsPerMonth) {
      res.status(429).json({ error: 'Monthly AI draft limit reached. Upgrade plan to continue.' });
      return;
    }
    const review = db.reviews.find((r) => r.id === reviewId && r.businessId === biz.id);
    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }
    try {
      const result = await generateOwnerReplyDraft({
        shopName: biz.name,
        contactPhone: biz.contactPhone,
        reviewerName: review.reviewerName,
        rating: review.rating,
        reviewText: review.text,
        language: review.language,
        tone: biz.replyTone,
        signature: biz.replySignature,
      });
      review.aiDraft = result.reply;
      if (review.replyStatus === 'pending') review.replyStatus = 'drafted';
      biz.aiDraftsUsedThisMonth += 1;
      db.aiUsage.unshift({
        id: `aiu-${crypto.randomUUID().slice(0, 8)}`,
        businessId: biz.id,
        feature: 'reply-assist',
        tokensApprox: result.tokensApprox,
        costInr: Number(((result.tokensApprox / 1000) * 0.75).toFixed(2)),
        createdAt: new Date().toISOString(),
      });
      saveDb(db);
      res.json({ reply: result.reply, review });
    } catch (err) {
      res.status(502).json({ error: err instanceof Error ? err.message : 'AI draft failed' });
    }
  });

  app.post('/api/ai/insights', requireAuth, async (req: AuthedRequest, res) => {
    const db = getDb();
    if (db.siteConfig.globalAiKillSwitch) {
      res.status(503).json({ error: 'Global AI kill switch is active.' });
      return;
    }
    const biz = db.businesses.find((b) => b.id === req.currentUser!.businessId)!;
    const reviews = db.reviews.filter((r) => r.businessId === biz.id);
    const totalReviews = reviews.length;
    const avg = totalReviews ? Number((reviews.reduce((a, b) => a + b.rating, 0) / totalReviews).toFixed(1)) : 0;
    const replied = reviews.filter((r) => r.replyStatus === 'posted').length;
    const positive = reviews.filter((r) => r.rating >= 4).length;
    const neutral = reviews.filter((r) => r.rating === 3).length;
    const negative = reviews.filter((r) => r.rating <= 2).length;

    const topicKeywords = ['food', 'service', 'wait', 'clean', 'price', 'menu'];
    const topics = topicKeywords.map((kw) => ({
      topic: kw,
      count: reviews.filter((r) => r.text.toLowerCase().includes(kw)).length,
    }));

    const computedStats = {
      totalReviews,
      averageRating: avg,
      responseRatePct: totalReviews ? Math.round((replied / totalReviews) * 100) : 0,
      positivePct: totalReviews ? Math.round((positive / totalReviews) * 100) : 0,
      neutralPct: totalReviews ? Math.round((neutral / totalReviews) * 100) : 0,
      negativePct: totalReviews ? Math.round((negative / totalReviews) * 100) : 0,
      topics,
    };

    try {
      const aiSummary = await generateReviewInsightsSummary({
        shopName: biz.name,
        computedStats,
        reviews: reviews.slice(0, 20),
      });
      biz.aiDraftsUsedThisMonth += 1;
      db.aiUsage.unshift({
        id: `aiu-${crypto.randomUUID().slice(0, 8)}`,
        businessId: biz.id,
        feature: 'insights',
        tokensApprox: aiSummary.tokensApprox,
        costInr: Number(((aiSummary.tokensApprox / 1000) * 0.75).toFixed(2)),
        createdAt: new Date().toISOString(),
      });
      saveDb(db);
      res.json({ computedStats, aiSummary });
    } catch (err) {
      res.status(502).json({ error: err instanceof Error ? err.message : 'AI insights error' });
    }
  });

  // --- ADMIN PORTAL APIs ---
  app.get('/api/admin/overview', requireAdmin, (_req, res) => {
    const db = getDb();
    const totalRevenueInr = db.orders.reduce((sum, o) => sum + o.totalInr, 0);
    res.json({
      users: db.users.map(sanitizeUser),
      businesses: db.businesses,
      orders: db.orders,
      products: db.products,
      plans: db.plans,
      qrCodes: db.qrCodes.filter((q) => !q.deleted),
      siteConfig: db.siteConfig,
      aiUsage: db.aiUsage,
      contacts: db.contacts,
      metrics: {
        totalUsers: db.users.length,
        activeSubscriptions: db.businesses.filter((b) => b.planId !== 'free').length,
        totalOrders: db.orders.length,
        totalRevenueInr,
        totalQrCodes: db.qrCodes.filter((q) => !q.deleted).length,
        totalScans: db.scans.length,
      },
    });
  });

  app.patch('/api/admin/orders/:id', requireAdmin, (req, res) => {
    const db = getDb();
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    const { status, proofUrl, trackingCode, courierName, adminNotes } = req.body as {
      status?: OrderStage;
      proofUrl?: string;
      trackingCode?: string;
      courierName?: string;
      adminNotes?: string;
    };
    if (status) order.status = status;
    if (proofUrl !== undefined) order.proofUrl = proofUrl;
    if (trackingCode !== undefined) order.trackingCode = trackingCode;
    if (courierName !== undefined) order.courierName = courierName;
    if (adminNotes !== undefined) order.adminNotes = adminNotes;
    order.updatedAt = new Date().toISOString();
    saveDb(db);
    res.json({ order });
  });

  app.patch('/api/admin/products/:id', requireAdmin, (req, res) => {
    const db = getDb();
    const prod = db.products.find((p) => p.id === req.params.id);
    if (!prod) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    const { priceInr, bundlePriceInr, name, tagline } = req.body as Partial<ProductRecord>;
    if (typeof priceInr === 'number' && priceInr >= 0) prod.priceInr = priceInr;
    if (typeof bundlePriceInr === 'number' && bundlePriceInr >= 0) prod.bundlePriceInr = bundlePriceInr;
    if (name) prod.name = name.trim();
    if (tagline) prod.tagline = tagline.trim();
    saveDb(db);
    res.json({ product: prod });
  });

  app.patch('/api/admin/plans/:id', requireAdmin, (req, res) => {
    const db = getDb();
    const plan = db.plans.find((p) => p.id === req.params.id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    Object.assign(plan, req.body);
    saveDb(db);
    res.json({ plan });
  });

  app.patch('/api/admin/businesses/:id', requireAdmin, (req, res) => {
    const db = getDb();
    const biz = db.businesses.find((b) => b.id === req.params.id);
    if (!biz) {
      res.status(404).json({ error: 'Business not found' });
      return;
    }
    const { planId, aiEnabled } = req.body as { planId?: PlanTier; aiEnabled?: boolean };
    if (planId) {
      biz.planId = planId;
      const owner = db.users.find((u) => u.id === biz.ownerId);
      if (owner) owner.planId = planId;
    }
    if (typeof aiEnabled === 'boolean') {
      biz.aiEnabled = aiEnabled;
      const rp = db.reviewPages.find((r) => r.businessId === biz.id);
      if (rp) rp.aiAssistEnabled = aiEnabled;
    }
    saveDb(db);
    res.json({ business: biz });
  });

  app.patch('/api/admin/config', requireAdmin, (req, res) => {
    const db = getDb();
    const { promoBanner, globalAiKillSwitch } = req.body as Partial<SiteConfig>;
    if (promoBanner) db.siteConfig.promoBanner = promoBanner;
    if (typeof globalAiKillSwitch === 'boolean') db.siteConfig.globalAiKillSwitch = globalAiKillSwitch;
    saveDb(db);
    res.json({ siteConfig: db.siteConfig });
  });

  app.patch('/api/admin/qrs/:id/toggle', requireAdmin, (req, res) => {
    const db = getDb();
    const qr = db.qrCodes.find((q) => q.id === req.params.id);
    if (!qr) {
      res.status(404).json({ error: 'QR not found' });
      return;
    }
    qr.status = qr.status === 'active' ? 'paused' : 'active';
    saveDb(db);
    res.json({ qr });
  });

  // --- VITE / STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`TapFX server listening on http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start TapFX server:', err);
  process.exit(1);
});
