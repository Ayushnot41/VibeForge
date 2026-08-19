// ============================================================================
// POST /api/generate-image — Generate images via OpenAI DALL-E 3
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    // Parse body
    let body: { prompt?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body.' },
        { status: 400 },
      );
    }

    if (!body.prompt || typeof body.prompt !== 'string' || body.prompt.trim().length === 0) {
      return NextResponse.json(
        { error: '`prompt` is required and must be a non-empty string.' },
        { status: 400 },
      );
    }

    if (!process.env.NANO_BANANA_API_KEY) {
      return NextResponse.json(
        { error: 'Missing required environment variable: NANO_BANANA_API_KEY' },
        { status: 500 },
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.NANO_BANANA_API_KEY,
      baseURL: 'https://api.nanobanana.ai/v1',
    });

    const response = await openai.images.generate({
      model: 'nano-banana-pro',
      prompt: body.prompt.trim(),
      n: 1,
      size: '1024x1024',
      quality: 'hd',
    });

    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('Nano Banana did not return an image URL.');
    }

    return NextResponse.json({ url: imageUrl }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[/api/generate-image] Primary AI failed, falling back to Pollinations AI:', message);

    // Fallback to free, keyless AI generation via Pollinations AI
    // We parse the prompt string to make sure it's URL-safe
    try {
      let body: { prompt?: string };
      try {
        body = await request.clone().json();
      } catch {
        body = { prompt: "abstract futuristic glowing architecture" }; // generic fallback
      }
      
      const safePrompt = encodeURIComponent((body.prompt || "futuristic visualization").trim());
      // Append a random seed so duplicate prompts yield different images
      const seed = Math.floor(Math.random() * 100000);
      const fallbackUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=1024&height=1024&nologo=true&seed=${seed}`;
      
      return NextResponse.json({ url: fallbackUrl }, { status: 200 });
    } catch (fallbackError) {
      return NextResponse.json(
        { error: 'Both primary and fallback image generation failed.' },
        { status: 500 },
      );
    }
  }
}
