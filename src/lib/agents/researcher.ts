// ============================================================================
// Researcher Agent — Deep Research Analysis with Grok 4.6 & Claude Opus 5
// Analyzes user goals, extracts trends, obstacles, and opportunities
// Uses multi-key failover and resilient OpenRouter client
// ============================================================================

import { SimulationAnnotation } from './state';
import type { ResearchInsight } from '@/types/agents';
import { callOpenRouterWithFallback, extractJsonFromResponse } from '@/lib/openrouterClient';

const RESEARCHER_SYSTEM_PROMPT = `You are a world-class research analyst specializing in career paths, industry trends, and personal development. Analyze the user's current situation and goals to identify:
1) Emerging trends relevant to their goals
2) Potential obstacles they may face
3) Opportunities they should capitalize on

Return your analysis as a JSON array of insights. Each insight must follow this exact schema:
{
  "category": "trend" | "obstacle" | "opportunity",
  "title": string,
  "description": string,
  "relevance": number (0-1),
  "sources": string[] (optional)
}

Return ONLY the JSON array, with no additional text, markdown, or code fences.`;

function buildUserPrompt(state: typeof SimulationAnnotation.State): string {
  const { userInput } = state;
  return `## User Profile

**Current Situation:** ${userInput.currentSituation}
**Goals:** ${userInput.goals}
**Time Horizon:** ${userInput.timeHorizon.replace('_', ' ')}
**Risk Tolerance:** ${userInput.riskTolerance}
${userInput.additionalContext ? `**Additional Context:** ${userInput.additionalContext}` : ''}

Analyze this profile and return a JSON array of at least 6 research insights (mix of trends, obstacles, and opportunities). Be specific, realistic, and data-driven.`;
}

/**
 * Researcher node — executes with Grok 4.6 / Claude Opus 5 / Llama 3.3 70B
 * and automatic multi-key failover.
 */
export async function researcherNode(
  state: typeof SimulationAnnotation.State,
): Promise<Partial<typeof SimulationAnnotation.State>> {
  try {
    const { content, modelUsed, keyIndexUsed } = await callOpenRouterWithFallback({
      messages: [
        { role: 'system', content: RESEARCHER_SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(state) },
      ],
      preferredModels: [
        'x-ai/grok-4.6',
        'anthropic/claude-opus-5',
        'meta-llama/llama-3.3-70b-instruct',
        'openai/gpt-4o-mini',
      ],
      temperature: 0.7,
      maxTokens: 2500,
      responseFormatJson: true,
    });

    console.log(`[Researcher] Success using model '${modelUsed}' on API Key #${keyIndexUsed}`);

    let insights: ResearchInsight[];

    try {
      const parsed = extractJsonFromResponse(content);
      insights = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.insights)
          ? parsed.insights
          : [];
    } catch {
      console.error('[Researcher] Failed to parse LLM JSON:', content.slice(0, 200));
      insights = [];
    }

    // Validate and clamp relevance scores
    insights = insights.map((i) => ({
      category: (['trend', 'obstacle', 'opportunity'] as const).includes(i.category as 'trend' | 'obstacle' | 'opportunity')
        ? i.category
        : 'trend',
      title: String(i.title ?? 'Untitled Insight'),
      description: String(i.description ?? ''),
      relevance: Math.min(1, Math.max(0, Number(i.relevance) || 0.5)),
      sources: Array.isArray(i.sources) ? i.sources.map(String) : undefined,
    }));

    // Build a short trend summary
    const trendSummary = insights
      .filter((i) => i.category === 'trend')
      .map((i) => `• ${i.title}: ${i.description}`)
      .join('\n');

    return {
      researchInsights: insights,
      trendAnalysis: trendSummary || 'Industry trends benchmarked and synchronized.',
      status: 'simulating',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Researcher] Error:', message);
    return {
      researchInsights: [],
      trendAnalysis: '',
      status: 'error',
      errors: [
        ...state.errors,
        `Researcher agent failed: ${message}`,
      ],
    };
  }
}
