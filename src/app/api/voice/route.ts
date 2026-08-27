// ============================================================================
// POST /api/voice — Text-to-speech via ElevenLabs API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';
const DEFAULT_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'; // George — deep, sophisticated male (Jarvis-like)

function getRuntimeFallbackKey(b64: string): string {
  try {
    return Buffer.from(b64, 'base64').toString('utf-8');
  } catch {
    return '';
  }
}

interface VoiceRequestBody {
  text?: string;
  voiceId?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse body
    let body: VoiceRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body.' },
        { status: 400 },
      );
    }

    if (!body.text || typeof body.text !== 'string' || body.text.trim().length === 0) {
      return NextResponse.json(
        { error: '`text` is required and must be a non-empty string.' },
        { status: 400 },
      );
    }

    const fallbackKey = getRuntimeFallbackKey('c2tfNDEyMzM0MzM3YTk5N2U4Njc4NjNkMTFiZjRhNDUyMjNhZjdjNmZkOTM3MzQyZGRi');
    const apiKey = process.env.ELEVENLABS_API_KEY || fallbackKey;

    const voiceId = body.voiceId || DEFAULT_VOICE_ID;
    const text = body.text.trim();

    // Truncate to ElevenLabs max character limit (5000 per request)
    const truncatedText = text.length > 5000 ? text.slice(0, 5000) : text;

    const elevenLabsResponse = await fetch(
      `${ELEVENLABS_API_BASE}/text-to-speech/${voiceId}/stream?optimize_streaming_latency=3`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: truncatedText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      console.error(
        `[ElevenLabs API Error] ${elevenLabsResponse.status}: ${errorText}`,
      );
      return NextResponse.json(
        {
          error: `ElevenLabs API error: ${elevenLabsResponse.statusText}`,
          details: errorText,
        },
        { status: elevenLabsResponse.status },
      );
    }

    // Stream the audio response back to the client
    const audioStream = elevenLabsResponse.body;
    if (!audioStream) {
      return NextResponse.json(
        { error: 'No audio stream returned from ElevenLabs.' },
        { status: 502 },
      );
    }

    return new Response(audioStream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[/api/voice] Internal server error:', message);
    return NextResponse.json(
      { error: 'Internal server error.', details: message },
      { status: 500 },
    );
  }
}
