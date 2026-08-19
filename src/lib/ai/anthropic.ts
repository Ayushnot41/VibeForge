import Anthropic from '@anthropic-ai/sdk'

/**
 * Pre-configured Anthropic client.
 *
 * Uses the `ANTHROPIC_API_KEY` environment variable.
 * Import this singleton instead of constructing a new client each time.
 */
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})
