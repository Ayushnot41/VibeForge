// ============================================================================
// OpenRouter Client — Multi-Key Failover & Resilient Model Cascading
// Supports primary and backup OpenRouter keys with automated model cascading
// ============================================================================

import OpenAI from 'openai';

export interface OpenRouterCallOptions {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  preferredModels?: string[];
  temperature?: number;
  maxTokens?: number;
  responseFormatJson?: boolean;
}

export interface OpenRouterCallResult {
  content: string;
  modelUsed: string;
  keyIndexUsed: number;
}

const DEFAULT_MODEL_CASCADE = [
  'meta-llama/llama-3.3-70b-instruct',
  'openai/gpt-4o-mini',
  'x-ai/grok-4.6',
  'anthropic/claude-opus-5',
];

/**
 * Executes an LLM completion with automatic API key and model failover.
 */
export async function callOpenRouterWithFallback(
  options: OpenRouterCallOptions,
): Promise<OpenRouterCallResult> {
  const primaryKey = process.env.OPENROUTER_API_KEY;
  const backupKey = process.env.BACKUP_OPENROUTER_API_KEY;

  const apiKeys = [primaryKey, backupKey].filter((k): k is string => Boolean(k && k.trim().length > 0));

  if (apiKeys.length === 0) {
    throw new Error('No OpenRouter API keys configured in environment variables.');
  }

  const modelList = options.preferredModels && options.preferredModels.length > 0
    ? options.preferredModels
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
        
        console.warn(`[OpenRouter Key ${keyIdx + 1}] Model '${model}' failed (${status || 'ERR'}): ${msg.slice(0, 120)}`);
        lastError = err instanceof Error ? err : new Error(msg);
      }
    }
  }

  throw new Error(`All OpenRouter API keys and models exhausted. Last error: ${lastError?.message || 'Unknown'}`);
}

/**
 * Helper to safely extract JSON from LLM output with robust repair for markdown fences and syntax quirks.
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

  // Remove potential leading/trailing non-json chars
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let startIdx = 0;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace !== -1) {
      cleaned = cleaned.slice(startIdx, lastBrace + 1);
    }
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    const lastBracket = cleaned.lastIndexOf(']');
    if (lastBracket !== -1) {
      cleaned = cleaned.slice(startIdx, lastBracket + 1);
    }
  }

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Attempt minor repair: remove trailing commas before closing braces/brackets
    const repaired = cleaned
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
    return JSON.parse(repaired);
  }
}
