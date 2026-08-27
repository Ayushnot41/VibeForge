// ============================================================================
// OpenRouter Resilient Client with Dual API Key Switching & Model Failover
// Seamlessly balances requests, switches keys on 401/402/429/timeouts, and cascades
// through flagship models (Grok 4.6 / Claude Opus 5 -> Llama 3.3 70B -> GPT-4o-mini -> Llama 3.1 8B).
// ============================================================================

import OpenAI from 'openai';

interface OpenRouterRequestOptions {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  preferredModels?: string[];
  temperature?: number;
  maxTokens?: number;
  responseFormatJson?: boolean;
}

/**
 * Returns available OpenRouter API keys in priority order.
 */
function getApiKeys(): string[] {
  const keys: string[] = [];
  if (process.env.OPENROUTER_API_KEY?.trim()) {
    keys.push(process.env.OPENROUTER_API_KEY.trim());
  }
  if (
    process.env.OPENROUTER_API_KEY_BACKUP?.trim() &&
    process.env.OPENROUTER_API_KEY_BACKUP.trim() !== process.env.OPENROUTER_API_KEY?.trim()
  ) {
    keys.push(process.env.OPENROUTER_API_KEY_BACKUP.trim());
  }
  return keys;
}

const DEFAULT_MODEL_CASCADE = [
  'meta-llama/llama-3.3-70b-instruct',
  'openai/gpt-4o-mini',
  'x-ai/grok-4.6',
  'anthropic/claude-opus-5',
  'meta-llama/llama-3.1-8b-instruct',
];

/**
 * Executes a chat completion with multi-key failover and multi-model cascading.
 */
export async function callOpenRouterWithFallback(options: OpenRouterRequestOptions): Promise<{
  content: string;
  modelUsed: string;
  keyIndexUsed: number;
}> {
  const apiKeys = getApiKeys();

  if (apiKeys.length === 0) {
    throw new Error('No OpenRouter API keys configured in environment variables.');
  }

  const modelList = options.preferredModels && options.preferredModels.length > 0
    ? Array.from(new Set([...options.preferredModels, ...DEFAULT_MODEL_CASCADE]))
    : DEFAULT_MODEL_CASCADE;

  let lastError: Error | null = null;

  // Try each API key in order
  for (let keyIdx = 0; keyIdx < apiKeys.length; keyIdx++) {
    const apiKey = apiKeys[keyIdx];
    const client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'https://vibeforge.ai',
        'X-Title': 'VibeForge Autonomous Platform',
      },
    });

    // Try each model in the cascade for this key
    for (const model of modelList) {
      try {
        const response = await client.chat.completions.create({
          model,
          messages: options.messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 3500,
          ...(options.responseFormatJson ? { response_format: { type: 'json_object' } } : {}),
        });

        const rawContent = response.choices[0]?.message?.content;
        if (rawContent && rawContent.trim().length > 0) {
          return {
            content: rawContent.trim(),
            modelUsed: model,
            keyIndexUsed: keyIdx + 1,
          };
        }
      } catch (err: any) {
        const status = err?.status || err?.response?.status;
        const msg = err?.message || String(err);
        
        // If it's a 402 (Payment/Credits) or 404 (Model unavailable) or 429 (Rate limit),
        // try the next model immediately. If all models fail on this key, loop moves to next key.
        console.warn(`[OpenRouter Key ${keyIdx + 1}] Model '${model}' failed (${status || 'ERR'}): ${msg.slice(0, 120)}`);
        lastError = err instanceof Error ? err : new Error(msg);
      }
    }
  }

  throw new Error(`All OpenRouter API keys and models exhausted. Last error: ${lastError?.message || 'Unknown'}`);
}

/**
 * Helper to safely extract JSON from LLM output, stripping markdown code fences.
 */
export function extractJsonFromResponse<T = any>(rawText: string): T {
  let cleaned = rawText.trim();

  // Strip markdown code fences if present (e.g. ```json ... ```)
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  } else {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }

  return JSON.parse(cleaned);
}
