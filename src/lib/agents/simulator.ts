// ============================================================================
// Simulator Agent — Anthropic Claude Sonnet
// Generates 3 parallel future scenarios with feedback loop
// ============================================================================

import OpenAI from 'openai';
import { SimulationAnnotation } from './state';
import type { FuturePath, Obstacle } from '@/types/agents';
import { TIME_HORIZON_MONTHS } from '@/types/agents';

const SIMULATOR_SYSTEM_PROMPT = `You are a master life strategist and future scenario planner. Given research insights about a person's goals and situation, generate three detailed parallel future scenarios. For each scenario, provide:
- A compelling narrative
- Milestones at 3-month intervals
- Sample daily routines
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
 * Simulator node — runs Anthropic Claude to generate 3 parallel future paths.
 */
export async function simulatorNode(
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
        { role: 'system', content: SIMULATOR_SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(state) },
      ],
      temperature: 0.8,
      max_tokens: 8192,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';

    let futurePaths: FuturePath[] = [];
    let obstacles: Obstacle[] = [];

    try {
      // Strip possible markdown code fences
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleaned);

      futurePaths = Array.isArray(parsed.futurePaths) ? parsed.futurePaths : [];
      obstacles = Array.isArray(parsed.obstacles) ? parsed.obstacles : [];
    } catch {
      console.error('[Simulator] Failed to parse Claude JSON:', raw.slice(0, 200));
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
