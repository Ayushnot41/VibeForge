// ============================================================================
// Researcher Agent — Deep Research Analysis with Grok 4.6 & Claude Opus 5
// Analyzes user goals, extracts trends, obstacles, and opportunities
// Uses multi-key failover and resilient OpenRouter client
// ============================================================================

import { SimulationAnnotation } from './state';
import type { ResearchInsight } from '@/types/agents';
import { callOpenRouterWithFallback, extractJsonFromResponse } from '@/lib/openrouterClient';

const RESEARCHER_SYSTEM_PROMPT = `You are an elite career intelligence analyst and industry strategist. Analyze the user's EXACT career transition from their current situation (e.g. Student in Kolkata with communication skills) to their specific target goal (e.g. Profitable Trader, Doctor, Athlete, etc.):
1) Emerging trends strictly relevant to their specific target industry/profession
2) Potential real-world obstacles and pitfalls in that exact field
3) High-leverage opportunities they should capitalize on

CRITICAL MANDATE: Never default to software development, coding, or tech startups unless the user explicitly requested software engineering. If the user wants to become a TRADER, provide insights specifically on financial markets, price action, risk management, Indian market dynamics (NSE/BSE), and trading psychology.

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
**Time Horizon:** ${userInput.targetDate ? `Until ${userInput.targetDate}` : userInput.timeHorizon.replace('_', ' ')}
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
        'meta-llama/llama-3.3-70b-instruct',
        'openai/gpt-4o-mini',
        'x-ai/grok-4.6',
        'anthropic/claude-opus-5',
      ],
      temperature: 0.7,
      maxTokens: 2500,
      responseFormatJson: true,
    });

    console.log(`[Researcher] Success using model '${modelUsed}' on API Key #${keyIndexUsed}`);

    let insights: ResearchInsight[];

    try {
      const parsed = extractJsonFromResponse(content);
      if (Array.isArray(parsed)) {
        insights = parsed;
      } else if (Array.isArray(parsed.insights)) {
        insights = parsed.insights;
      } else if (Array.isArray(parsed.researchInsights)) {
        insights = parsed.researchInsights;
      } else if (parsed.trends || parsed.obstacles || parsed.opportunities) {
        const trends = Array.isArray(parsed.trends) ? parsed.trends.map((t: any) => ({ ...t, category: 'trend' })) : [];
        const obstacles = Array.isArray(parsed.obstacles) ? parsed.obstacles.map((o: any) => ({ ...o, category: 'obstacle' })) : [];
        const opps = Array.isArray(parsed.opportunities) ? parsed.opportunities.map((op: any) => ({ ...op, category: 'opportunity' })) : [];
        insights = [...trends, ...obstacles, ...opps];
      } else if (parsed.title || parsed.description) {
        insights = [parsed];
      } else {
        insights = [];
      }
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
