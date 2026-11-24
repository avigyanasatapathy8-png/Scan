import { GoogleGenAI, Type } from '@google/genai';
import type { LanguageCode, ReviewRecord } from '../types/tapfx';

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function sanitizePii(input: string): string {
  return input
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email removed]')
    .replace(/(?:\+?\d[\d\s\-()]{7,}\d)/g, '[phone removed]')
    .trim();
}

function languageName(lang: LanguageCode): string {
  if (lang === 'od') return 'Odia (ଓଡ଼ିଆ script)';
  if (lang === 'hi') return 'Hindi (हिन्दी Devanagari script)';
  return 'English';
}

export async function generateCustomerReviewAssist(params: {
  shopName: string;
  shopType: string;
  rating: number;
  tags: string[];
  note: string;
  language: LanguageCode;
}): Promise<{ variants: string[]; reason?: string; tokensApprox: number }> {
  const cleanNote = sanitizePii(params.note);
  const hasDetails = params.tags.length > 0 || cleanNote.length >= 6;
  if (!hasDetails) {
    return { variants: [], reason: 'need_more_details', tokensApprox: 0 };
  }

  const ai = getAiClient();
  const prompt = `Shop: ${params.shopName} (${params.shopType})
Customer Rating: ${params.rating} out of 5 stars
Selected experience tags: ${params.tags.join(', ') || 'none'}
Customer's own note: ${cleanNote || 'none'}
Requested output language: ${languageName(params.language)}

Draft 3 distinct, natural first-person review options (20 to 55 words each) using ONLY the tags and note above.`;

  const systemInstruction = `You help a real customer put their own visit experience into clear words for a Google review.
STRICT GUARDRAILS:
1. Use ONLY details the customer selected or typed. NEVER invent dish names, product names, staff names, prices, dates, or events.
2. Write in first person in ${languageName(params.language)}, 20 to 55 words per variant, natural and specific, no hype or marketing clichés, no emojis unless the customer typed them.
3. Match the rating honestly and politely (if rating is 1-3, keep tone constructive and polite).
4. If the details are too sparse to write honestly, return empty variants and reason "need_more_details".`;

  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            variants: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            reason: { type: Type.STRING },
          },
          required: ['variants'],
        },
      },
    });

    try {
      const parsed = JSON.parse((response.text ?? '{}').trim()) as {
        variants?: string[];
        reason?: string;
      };
      if (Array.isArray(parsed.variants)) {
        const cleanVariants = parsed.variants
          .map((v) => String(v).trim())
          .filter(Boolean)
          .slice(0, 3);
        const tokensApprox = Math.max(120, Math.round((prompt.length + cleanVariants.join(' ').length) / 3.5));
        return {
          variants: cleanVariants,
          reason: parsed.reason,
          tokensApprox,
        };
      }
    } catch {
      if (attempt === 1) {
        throw new Error('Could not format review suggestions. Please write in your own words.');
      }
    }
  }

  return { variants: [], reason: 'need_more_details', tokensApprox: 0 };
}

export async function generateOwnerReplyDraft(params: {
  shopName: string;
  contactPhone: string;
  reviewerName: string;
  rating: number;
  reviewText: string;
  language: LanguageCode;
  tone: 'warm' | 'formal' | 'short';
  signature: string;
}): Promise<{ reply: string; tokensApprox: number }> {
  const ai = getAiClient();
  const cleanText = sanitizePii(params.reviewText);

  const systemInstruction = `You draft a reply from a business owner (${params.shopName}) to a public Google review.
RULES:
1. Write in ${languageName(params.language)}, 30 to 70 words, tone: ${params.tone}.
2. Thank the reviewer (${params.reviewerName}) and reference ONLY details present in their review.
3. For ratings 1 to 3 stars: apologise sincerely, never argue or reveal private details, and invite them to contact the shop at ${params.contactPhone}.
4. Never offer refunds, discounts, or gifts.
5. End with signature "${params.signature}" if appropriate.`;

  const prompt = `Rating: ${params.rating}/5
Reviewer: ${params.reviewerName}
Review text: ${cleanText}`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reply: { type: Type.STRING },
        },
        required: ['reply'],
      },
    },
  });

  const parsed = JSON.parse((response.text ?? '{}').trim()) as { reply?: string };
  const reply = (parsed.reply ?? '').trim();
  if (!reply) {
    throw new Error('Failed to generate reply draft.');
  }
  return {
    reply,
    tokensApprox: Math.max(140, Math.round((prompt.length + reply.length) / 3.5)),
  };
}

export async function generateReviewInsightsSummary(params: {
  shopName: string;
  computedStats: {
    totalReviews: number;
    averageRating: number;
    responseRatePct: number;
    positivePct: number;
    neutralPct: number;
    negativePct: number;
    topics: { topic: string; count: number }[];
  };
  reviews: Pick<ReviewRecord, 'rating' | 'text' | 'reviewDate'>[];
}): Promise<{
  summary: string;
  likes: string[];
  fixes: string[];
  actions: string[];
  tokensApprox: number;
}> {
  const ai = getAiClient();

  const systemInstruction = `You summarize customer review insights for a local business owner (${params.shopName}).
ACCURACY RULE:
Use ONLY the numbers supplied in computedStats. Do NOT calculate, invent, or guess any new numbers or percentages.
Keep language plain, practical, and friendly.`;

  const prompt = `Computed statistics (exact, code-calculated):
${JSON.stringify(params.computedStats)}

Recent reviews:
${params.reviews.map((r) => `- [${r.rating}★ on ${r.reviewDate}] ${sanitizePii(r.text)}`).join('\n')}`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          likes: { type: Type.ARRAY, items: { type: Type.STRING } },
          fixes: { type: Type.ARRAY, items: { type: Type.STRING } },
          actions: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['summary', 'likes', 'fixes', 'actions'],
      },
    },
  });

  const parsed = JSON.parse((response.text ?? '{}').trim()) as {
    summary?: string;
    likes?: string[];
    fixes?: string[];
    actions?: string[];
  };

  return {
    summary: parsed.summary || 'Summary ready based on your synced reviews.',
    likes: Array.isArray(parsed.likes) ? parsed.likes.slice(0, 4) : [],
    fixes: Array.isArray(parsed.fixes) ? parsed.fixes.slice(0, 4) : [],
    actions: Array.isArray(parsed.actions) ? parsed.actions.slice(0, 3) : [],
    tokensApprox: Math.max(180, Math.round(prompt.length / 3)),
  };
}
