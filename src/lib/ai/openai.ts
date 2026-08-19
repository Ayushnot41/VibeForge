import OpenAI from 'openai'

/**
 * Pre-configured OpenAI client.
 *
 * Uses the `OPENAI_API_KEY` environment variable.
 * Import this singleton instead of constructing a new client each time.
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generate an image using DALL-E 3.
 *
 * @param prompt - The text prompt describing the desired image.
 * @returns The URL of the generated image.
 */
export async function generateImage(prompt: string): Promise<string> {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    quality: 'hd',
  })

  const url = response.data?.[0]?.url
  if (!url) {
    throw new Error('DALL-E 3 returned no image URL')
  }

  return url
}

/**
 * Generate a vector embedding for the given text.
 *
 * Uses the `text-embedding-3-small` model which returns 1536-dimensional
 * vectors, matching the pgvector column in our database.
 *
 * @param text - The text to embed.
 * @returns A 1536-dimensional float array.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })

  const embedding = response.data[0]?.embedding
  if (!embedding) {
    throw new Error('OpenAI returned no embedding')
  }

  return embedding
}
