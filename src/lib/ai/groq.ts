import Groq from 'groq-sdk'

/**
 * Pre-configured Groq client for ultra-fast LLM inference.
 *
 * Uses the `GROQ_API_KEY` environment variable.
 * Import this singleton instead of constructing a new client each time.
 */
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})
