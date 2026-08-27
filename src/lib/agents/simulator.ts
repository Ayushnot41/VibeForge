// ============================================================================
// Simulator Agent — LangGraph Node
// Synthesizes 3 distinct future scenarios (Optimistic, Realistic, Risk-Mitigated)
// Powered by Claude Opus 5 / Grok 4.6 / Llama 3.3 70B via OpenRouter
// ============================================================================

import { SimulationAnnotation } from './state';
import type { FuturePath, Obstacle, UserInput } from '@/types/agents';
import { callOpenRouterWithFallback, extractJsonFromResponse } from '@/lib/openrouterClient';

const SIMULATOR_SYSTEM_PROMPT = `You are an elite predictive futures engine and career scenario simulator.
Your job is to project THREE distinct, highly realistic future trajectories based on a user's current situation, goals, risk profile, and market research insights:

1. "optimistic": High-velocity execution, favorable market tailwinds, breakthroughs.
2. "realistic": Disciplined steady progress, navigating setbacks, high probability.
3. "pessimistic": Resilience path, overcoming severe market downturns or obstacles.

CRITICAL INSTRUCTIONS:
- You MUST return a valid JSON object matching the exact schema below.
- NEVER include conversational text outside the JSON object.
- Make all narratives vivid, inspiring, and grounded in realistic industry mechanics.

JSON SCHEMA:
{
  "futurePaths": [
    {
      "id": "path-1",
      "type": "optimistic",
      "title": "Short punchy title",
      "summary": "1-2 sentence overview",
      "narrative": "Detailed narrative story of this future (150-250 words)",
      "milestones": [
        { "month": 3, "title": "Milestone title", "description": "Specific deliverable achieved" }
      ],
      "dailyRoutines": [
        { "timeOfDay": "Morning", "activity": "Deep work on core edge", "purpose": "Skill compounding" }
      ],
      "probabilityScore": 0.35
    }
  ],
  "obstacles": [
    {
      "id": "obs-1",
      "description": "Critical obstacle description",
      "probability": 0.45,
      "mitigation": "Strategic mitigation action"
    }
  ]
}`;

function buildUserPrompt(state: typeof SimulationAnnotation.State): string {
  const { userInput, researchInsights, feedbackLoopCount, obstacles: prevObstacles } = state;
  const months = userInput.timeHorizon === '1_year' ? 12 : userInput.timeHorizon === '3_years' ? 36 : userInput.timeHorizon === '5_years' ? 60 : 120;

  let prompt = `## USER PROFILE & GOALS
**Current Situation:** ${userInput.currentSituation}
**Goals:** ${userInput.goals}
**Time Horizon:** ${userInput.timeHorizon.replace('_', ' ')} (${months} months)
**Risk Tolerance:** ${userInput.riskTolerance}

Generate milestones at 3-month intervals up to month ${months}. Provide 4-6 daily routine items per path. Generate 4-8 obstacles total across all paths.`;

  if (feedbackLoopCount > 0 && prevObstacles.length > 0) {
    const highRisk = prevObstacles.filter((o) => o.probability > 0.7);
    prompt += `\n\n## FEEDBACK LOOP ITERATION ${feedbackLoopCount}
Mitigate these high risk obstacles:
${highRisk.map((o) => `- ${o.description} (prob: ${o.probability}) — Mitigation: ${o.mitigation}`).join('\n')}`;
  }

  return prompt;
}

function generateDynamicFallbackPaths(userInput: UserInput): FuturePath[] {
  const horizonMonths = userInput.timeHorizon === '1_year' ? 12 : userInput.timeHorizon === '3_years' ? 36 : userInput.timeHorizon === '5_years' ? 60 : 120;

  return [
    {
      id: 'path-optimistic',
      type: 'optimistic',
      title: 'Accelerated Breakthrough Trajectory',
      summary: `High-velocity execution and market timing catapult you to peak achievement in ${userInput.goals}.`,
      narrative: `You leverage disciplined daily focus and superior compounding to shatter industry averages. From "${userInput.currentSituation}", your relentless consistency creates unmatched market advantage. Within ${horizonMonths} months, you achieve complete independence as an elite practitioner in ${userInput.goals}.`,
      milestones: [
        { month: Math.min(3, horizonMonths), title: 'Foundational Mastery & Early Wins', description: `Completed core setup and early validation benchmarks for ${userInput.goals}.`, achieved: false },
        { month: Math.min(6, horizonMonths), title: 'Systematic Scaling & High ROI', description: 'Established disciplined daily routines, risk systems, and compounding output.', achieved: false },
        { month: horizonMonths, title: 'Dream Profession Pinnacle', description: `Full mastery and market authority achieved in ${userInput.goals}.`, achieved: false },
      ],
      dailyRoutines: [
        { timeOfDay: '6:00 AM', activity: 'Mental Synchronization & Market/Skill Analysis', purpose: 'Establish daily edge' },
        { timeOfDay: '9:00 AM', activity: 'High-Impact Execution Block', purpose: 'Uninterrupted deep work' },
        { timeOfDay: '5:00 PM', activity: 'Journaling & Performance Metrics Audit', purpose: 'Rapid iterative learning' },
      ],
      probabilityScore: 0.35,
    },
    {
      id: 'path-realistic',
      type: 'realistic',
      title: 'Disciplined Compounding Trajectory',
      summary: `Steady, repeatable progression overcoming obstacles through systematic execution.`,
      narrative: `You navigate real-world friction with stoic resilience. Each setback becomes a learning data point. By focusing on process over outcome, you steadily climb the ranks from "${userInput.currentSituation}" to achieve sustainable success in "${userInput.goals}".`,
      milestones: [
        { month: Math.min(3, horizonMonths), title: 'Execution Baseline Established', description: 'Completed structured onboarding, paper trading/practice projects, and risk rules.', achieved: false },
        { month: Math.min(6, horizonMonths), title: 'Consistent Win-Rate & Strategy Refinement', description: 'Eliminated rookie mistakes and built a verified, repeatable playbook.', achieved: false },
        { month: horizonMonths, title: 'Sustainable Career Transformation', description: `Full-time financial and professional freedom attained in ${userInput.goals}.`, achieved: false },
      ],
      dailyRoutines: [
        { timeOfDay: '7:00 AM', activity: 'Core Skill Study & Practice Session', purpose: 'Knowledge reinforcement' },
        { timeOfDay: '10:00 AM', activity: 'Deliberate Practice & Live Execution', purpose: 'Skill compounding' },
        { timeOfDay: '6:00 PM', activity: 'Daily Risk Audit & Review', purpose: 'Capital and mindset protection' },
      ],
      probabilityScore: 0.55,
    },
    {
      id: 'path-pessimistic',
      type: 'pessimistic',
      title: 'Resilient Crucible Trajectory',
      summary: `Overcoming severe drawdowns and steep learning curves to forge unbreakable endurance.`,
      narrative: `The path proves demanding, testing your resolve with unexpected market shifts. However, your strict risk management shields you from ruin. You adapt, refine your methodology, and emerge stronger than ever, securing your ultimate goals through sheer grit.`,
      milestones: [
        { month: Math.min(3, horizonMonths), title: 'Capital & Mindset Preservation', description: 'Survived early volatility without blowing accounts or quitting.', achieved: false },
        { month: Math.min(6, horizonMonths), title: 'Pivot & System Re-engineering', description: 'Rebuilt edge with defensive risk-reward protocols.', achieved: false },
        { month: horizonMonths, title: 'Battle-Tested Mastery', description: `Hard-earned success and long-term durability in ${userInput.goals}.`, achieved: false },
      ],
      dailyRoutines: [
        { timeOfDay: '6:30 AM', activity: 'Risk Management Checklist Review', purpose: 'Prevent emotional errors' },
        { timeOfDay: '11:00 AM', activity: 'Defensive Execution & Position Sizing', purpose: 'Protect downside' },
        { timeOfDay: '7:00 PM', activity: 'Post-Mortem Analysis of All Decisions', purpose: 'Continuous iteration' },
      ],
      probabilityScore: 0.1,
    },
  ];
}

/**
 * Simulator node — runs Claude Opus 5 / Grok 4.6 / Llama 3.3 70B
 * with multi-key failover and resilient fallback generation.
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
        'meta-llama/llama-3.3-70b-instruct',
        'openai/gpt-4o-mini',
        'x-ai/grok-4.6',
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
      console.warn('[Simulator] Using dynamic synthesized paths for:', state.userInput.goals);
      futurePaths = generateDynamicFallbackPaths(state.userInput);
    }

    if (futurePaths.length === 0) {
      futurePaths = generateDynamicFallbackPaths(state.userInput);
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

    return {
      futurePaths,
      obstacles,
      feedbackLoopCount: state.feedbackLoopCount + 1,
      status: 'visualizing',
    };
  } catch (error) {
    console.warn('[Simulator] Generating dynamic fallback paths due to error:', error);
    const fallbackPaths = generateDynamicFallbackPaths(state.userInput);
    return {
      futurePaths: fallbackPaths,
      obstacles: [
        {
          id: 'obs-1',
          description: 'Market volatility and initial learning curve friction',
          probability: 0.6,
          mitigation: 'Strict 1% risk management and daily deliberate practice',
        },
      ],
      feedbackLoopCount: state.feedbackLoopCount + 1,
      status: 'visualizing',
    };
  }
}
