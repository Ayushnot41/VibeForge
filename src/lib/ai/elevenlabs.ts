const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1'

/** Default voice — "Rachel" (a warm, natural narrator). */
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'

/**
 * Generate speech audio from text using the ElevenLabs API.
 *
 * @param text    - The text to convert to speech.
 * @param voiceId - Optional ElevenLabs voice ID (defaults to Rachel).
 * @returns An ArrayBuffer containing the raw audio bytes (mpeg).
 */
export async function generateSpeech(
  text: string,
  voiceId: string = DEFAULT_VOICE_ID
): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY environment variable is not set')
  }

  const response = await fetch(
    `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    }
  )

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `ElevenLabs API error (${response.status}): ${errorBody}`
    )
  }

  return response.arrayBuffer()
}
