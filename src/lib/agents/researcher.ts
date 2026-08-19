// ============================================================================
// Researcher Agent — Groq + Llama 3.3 70B
// Analyzes user goals, extracts trends, obstacles, and opportunities
// ============================================================================

import OpenAI from 'openai';
import { SimulationAnnotation } from './state';
import type { ResearchInsight } from '@/types/agents';

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

Analyze this profile and return a JSON array of at least 6 research insights (mix of trends, obstacles, and opportunities). Be specific and data-driven.`;
}

/**
 * Researcher node — runs Groq Llama 3.3 70B to extract research insights.
 */
export async function researcherNode(
  state: typeof SimulationAnnotation.State,
): Promise<Partial<typeof SimulationAnnotation.State>> {
  try {
    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: 'meta-llama/llama-3.1-8b-instruct',
      messages: [
        { role: 'system', content: RESEARCHER_SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(state) },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '[]';
    let insights: ResearchInsight[];

    try {
      const parsed = JSON.parse(raw);
      // Handle both bare arrays and { insights: [...] } wrappers
      insights = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.insights)
          ? parsed.insights
          : [];
    } catch {
      console.error('[Researcher] Failed to parse LLM JSON:', raw.slice(0, 200));
      insights = [];
    }

    // Validate and clamp relevance scores
    insights = insights.map((i) => ({
      category: (['trend', 'obstacle', 'opportunity'] as const).includes(i.category as 'trend' | 'obstacle' | 'opportunity')
        ? i.category
        : 'trend',
      title: String(i.title ?? 'Untitled'),
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
      trendAnalysis: trendSummary || 'No specific trends identified.',
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
