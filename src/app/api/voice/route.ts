// ============================================================================
// POST /api/voice — Text-to-speech via ElevenLabs API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';
const DEFAULT_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'; // George — deep, sophisticated male (Jarvis-like)

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

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing required environment variable: ELEVENLABS_API_KEY' },
        { status: 500 },
      );
    }

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
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text().catch(() => 'Unknown error');
      console.error('[/api/voice] ElevenLabs error:', elevenLabsResponse.status, errorText);
      return NextResponse.json(
        { error: `ElevenLabs API error: ${elevenLabsResponse.status}`, details: errorText },
        { status: elevenLabsResponse.status },
      );
    }

    // Stream the audio response back to the client
    const audioStream = elevenLabsResponse.body;

    if (!audioStream) {
      return NextResponse.json(
        { error: 'ElevenLabs did not return an audio stream.' },
        { status: 502 },
      );
    }

    return new NextResponse(audioStream, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[/api/voice] Error:', message);
    return NextResponse.json(
      { error: 'Failed to generate speech.', details: message },
      { status: 500 },
    );
  }
}
