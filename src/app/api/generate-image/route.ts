// ============================================================================
// POST /api/generate-image — Generate images via AI with multi-tier fallback
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Curated high-aesthetic futuristic photography fallbacks
const FALLBACK_THEMES: Record<string, string[]> = {
  tech: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1024&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1024&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1024&q=80',
  ],
  speaking: [
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1024&q=80',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1024&q=80',
  ],
  office: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1024&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1024&q=80',
  ],
  general: [
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1024&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1024&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1024&q=80',
  ],
};

function getAestheticFallback(prompt: string, seed: number = 0): string {
  const p = prompt.toLowerCase();
  let pool = FALLBACK_THEMES.general;
  if (p.includes('speak') || p.includes('stage') || p.includes('conference') || p.includes('talk')) {
    pool = FALLBACK_THEMES.speaking;
  } else if (p.includes('code') || p.includes('software') || p.includes('ai') || p.includes('developer') || p.includes('system')) {
    pool = FALLBACK_THEMES.tech;
  } else if (p.includes('office') || p.includes('company') || p.includes('startup') || p.includes('executive')) {
    pool = FALLBACK_THEMES.office;
  }
  return pool[Math.abs(seed) % pool.length];
}

export async function POST(request: NextRequest) {
  let prompt = '';
  let seed = 42;

  try {
    const body = await request.json();
    prompt = (body.prompt || '').trim();
    seed = body.seed || Math.floor(Math.random() * 10000);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  if (!prompt) {
    prompt = 'Futuristic visual of career milestone breakthrough, 8k cinematic lighting';
  }

  // Clean prompt of markdown / meta tags
  const cleanPrompt = prompt
    .replace(/CRITICAL INSTRUCTION:[^.]*(\.|$)/gi, '')
    .replace(/Context:[^.]*(\.|$)/gi, '')
    .replace(/Scene:[^.]*(\.|$)/gi, '')
    .replace(/No text or words in the image\.?/gi, '')
    .substring(0, 300)
    .trim();

  // Try 1: OpenAI DALL-E 3 if OPENAI_API_KEY is available
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('placeholder')) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: `${cleanPrompt}, photorealistic, 8k resolution`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      });
      const imageUrl = response.data?.[0]?.url;
      if (imageUrl) {
        return NextResponse.json({ url: imageUrl, source: 'openai' }, { status: 200 });
      }
    } catch (e) {
      console.warn('[/api/generate-image] OpenAI generation failed:', e);
    }
  }

  // Try 2: Nano Banana if valid
  if (process.env.NANO_BANANA_API_KEY && process.env.NANO_BANANA_API_KEY.startsWith('sk-')) {
    try {
      const openai = new OpenAI({
        apiKey: process.env.NANO_BANANA_API_KEY,
        baseURL: 'https://api.nanobanana.ai/v1',
      });
      const response = await openai.images.generate({
        model: 'nano-banana-pro',
        prompt: cleanPrompt,
        n: 1,
        size: '1024x1024',
      });
      const imageUrl = response.data?.[0]?.url;
      if (imageUrl) {
        return NextResponse.json({ url: imageUrl, source: 'nanobanana' }, { status: 200 });
      }
    } catch (e) {
      console.warn('[/api/generate-image] Nano Banana failed:', e);
    }
  }

  // Try 3: High-reliability Pollinations AI standard endpoint
  try {
    const encoded = encodeURIComponent(`${cleanPrompt}, photorealistic, masterpiece, 8k`);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encoded}?width=800&height=800&nologo=true&seed=${seed}`;
    return NextResponse.json({ url: pollinationsUrl, source: 'pollinations' }, { status: 200 });
  } catch {
    // Try 4: High-aesthetic curated photo fallback
    const fallbackUrl = getAestheticFallback(cleanPrompt, seed);
    return NextResponse.json({ url: fallbackUrl, source: 'curated' }, { status: 200 });
  }
}

