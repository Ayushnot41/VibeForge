// ============================================================================
// Simulator Agent — Anthropic Claude Opus 5 & Grok 4.6 Scenario Engine
// Generates 3 parallel future trajectories with stochastic milestones
// Uses multi-key failover and resilient OpenRouter client
// ============================================================================

import { SimulationAnnotation } from './state';
import type { FuturePath, Obstacle } from '@/types/agents';
import { TIME_HORIZON_MONTHS } from '@/types/agents';
import { callOpenRouterWithFallback, extractJsonFromResponse } from '@/lib/openrouterClient';

const SIMULATOR_SYSTEM_PROMPT = `You are a master life strategist and personal trajectory planner. Given a person's current situation and specific career goal (e.g. Student in Kolkata transitioning into a Profitable Trader, or any other career), generate three detailed parallel future scenarios tailored 100% to their specific profession.

CRITICAL MANDATE: Never assume tech or software engineering unless requested. For a Trader, describe chart analysis, risk control, trading sessions, profit consistency, account drawdowns, and capital scaling.

For each scenario, provide:
- A compelling narrative of their life in that field
- Milestones at 3-month intervals
- Sample daily routines relevant to that exact career
- Potential obstacles with probability scores

Think deeply about cause-and-effect chains.

Return your response as a JSON object with exactly this structure:
{
  "futurePaths": [
    {
      "id": string,
      "type": "optimistic" | "realistic" | "pessimistic",
      "title": string,
      "narrative": string (2-3 paragraphs),
      "milestones": [
        { "month": number, "title": string, "description": string, "achieved": false }
      ],
      "dailyRoutines": [
        { "timeOfDay": string, "activity": string, "purpose": string }
      ],
      "probabilityScore": number (0-1)
    }
  ],
  "obstacles": [
    {
      "id": string,
      "description": string,
      "probability": number (0-1),
      "mitigation": string,
      "revisedPath": string (optional, ID of affected path)
    }
  ]
}

Return ONLY the JSON object, no additional text or code fences.`;

function buildUserPrompt(state: typeof SimulationAnnotation.State): string {
  const { userInput, feedbackLoopCount, obstacles: prevObstacles } = state;
  const months = TIME_HORIZON_MONTHS[userInput.timeHorizon];

  let prompt = `## User Profile
**Situation:** ${userInput.currentSituation}
**Goals:** ${userInput.goals}
**Time Horizon:** ${userInput.timeHorizon.replace('_', ' ')} (${months} months)
**Risk Tolerance:** ${userInput.riskTolerance}

Generate milestones at 3-month intervals up to month ${months}. Provide 4-6 daily routine items per path. Generate 4-8 obstacles total across all paths.`;

  // Feedback loop: include previous obstacles for refinement
  if (feedbackLoopCount > 0 && prevObstacles.length > 0) {
    const highRisk = prevObstacles.filter((o) => o.probability > 0.7);
    prompt += `\n\n## FEEDBACK LOOP ITERATION ${feedbackLoopCount}
The following HIGH-RISK obstacles were identified in the previous iteration. Please revise the scenarios to better account for and mitigate these risks:
${highRisk.map((o) => `- ${o.description} (probability: ${o.probability}) — Previous mitigation: ${o.mitigation}`).join('\n')}

Adjust milestones, routines, and narratives accordingly. Lower the probability of these obstacles if your revised plan adequately mitigates them.`;
  }

  return prompt;
}

/**
 * Simulator node — runs Claude Opus 5 / Grok 4.6 / Llama 3.3 70B
 * with multi-key failover.
 */
export async function simulatorNode(
  state: typeof SimulationAnnotation.State,
): Promise<Partial<typeof SimulationAnnotation.State>> {
  try {
    const { content, modelUsed, keyIndexUsed } = await callOpenRouterWithFallback({
      messages: [
        { role: 'system', content: SIMULATOR_SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(state) },
      ],
      preferredModels: [
        'x-ai/grok-4.6',
        'meta-llama/llama-3.3-70b-instruct',
        'openai/gpt-4o-mini',
        'anthropic/claude-opus-5',
      ],
      temperature: 0.8,
      maxTokens: 3000,
      responseFormatJson: true,
    });

    console.log(`[Simulator] Success using model '${modelUsed}' on API Key #${keyIndexUsed}`);

    let futurePaths: FuturePath[] = [];
    let obstacles: Obstacle[] = [];

    try {
      const parsed = extractJsonFromResponse(content);
      futurePaths = Array.isArray(parsed.futurePaths) ? parsed.futurePaths : [];
      obstacles = Array.isArray(parsed.obstacles) ? parsed.obstacles : [];
    } catch {
      console.error('[Simulator] Failed to parse Simulator JSON:', content.slice(0, 200));
    }

    // Validate future paths
    futurePaths = futurePaths.map((p, idx) => ({
      id: String(p.id || `path-${idx}`),
      type: (['optimistic', 'realistic', 'pessimistic'] as const).includes(
        p.type as 'optimistic' | 'realistic' | 'pessimistic',
      )
        ? p.type
        : (['optimistic', 'realistic', 'pessimistic'] as const)[idx] ?? 'realistic',
      title: String(p.title ?? `Scenario ${idx + 1}`),
      summary: String((p as any).summary ?? ''),
      narrative: String(p.narrative ?? ''),
      milestones: Array.isArray(p.milestones)
        ? p.milestones.map((m) => ({
            month: Number(m.month) || 3,
            title: String(m.title ?? ''),
            description: String(m.description ?? ''),
            achieved: false,
          }))
        : [],
      dailyRoutines: Array.isArray(p.dailyRoutines)
        ? p.dailyRoutines.map((r) => ({
            timeOfDay: String(r.timeOfDay ?? ''),
            activity: String(r.activity ?? ''),
            purpose: String(r.purpose ?? ''),
          }))
        : [],
      probabilityScore: Math.min(1, Math.max(0, Number(p.probabilityScore) || 0.5)),
    }));

    // Validate obstacles
    obstacles = obstacles.map((o, idx) => ({
      id: String(o.id || `obstacle-${idx}`),
      description: String(o.description ?? ''),
      probability: Math.min(1, Math.max(0, Number(o.probability) || 0.5)),
      mitigation: String(o.mitigation ?? ''),
      revisedPath: o.revisedPath ? String(o.revisedPath) : undefined,
    }));

    return {
      futurePaths,
      obstacles,
      feedbackLoopCount: state.feedbackLoopCount + 1,
      status: 'visualizing',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Simulator] Error:', message);
    return {
      futurePaths: [],
      obstacles: [],
      feedbackLoopCount: state.feedbackLoopCount + 1,
      status: 'error',
      errors: [...state.errors, `Simulator agent failed: ${message}`],
    };
  }
}
