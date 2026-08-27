// ============================================================================
// Deployer Agent — Action Protocol & Implementation Curriculum Engine
// Powered by Grok 4.6 (Research/Curriculum) & Anthropic Claude Opus 5 / Sonnet 5
// Creates crystal-clear, beginner-friendly weekly action plans with top-rated YouTube links.
// ============================================================================

import { SimulationAnnotation } from './state';
import type { ActionPlan, FuturePath, WeeklyAction } from '@/types/agents';
import { callOpenRouterWithFallback, extractJsonFromResponse } from '@/lib/openrouterClient';

const DEPLOYER_SYSTEM_PROMPT = `You are an elite master coach and implementation curriculum architect. Given a person's goals, current background, and realistic future path, create a world-class, step-by-step Execution Protocol.

CRITICAL COMMUNICATION RULES:
1. Language must be CRYSTAL-CLEAR and SO SIMPLE that even a 10-year-old or complete beginner can understand it effortlessly.
2. Every action must explain:
   - WHAT to do in plain words
   - HOW to do it step-by-step
   - WHY it matters
3. EVERY SINGLE ACTION MUST end with a high-relevance YouTube tutorial search link sorted by highest view count and ratings, formatted exactly like:
   "Task description here. [Watch Top-Rated Tutorial ⭐](https://www.youtube.com/results?search_query=how+to+learn+topic+step+by+step&sp=CAM%253D)"
   (Notice &sp=CAM%253D sorts YouTube results by highest view count).
4. The FIRST action of each week MUST be a "Mental Synchronization Task" to prime their focus and mindset.

Return your response as a valid JSON object matching this exact schema:
{
  "aggressivePitch": string (A high-adrenaline, motivational executive pitch tailored to the user's specific goal that sparks relentless drive),
  "weeklyActions": [
    {
      "week": number (1 to 12),
      "actions": string[] (3-5 specific, step-by-step, beginner-friendly actions with YouTube search links attached),
      "milestone": string (optional, milestone name if this week reaches a checkpoint)
    }
  ],
  "habits": [
    {
      "name": string,
      "frequency": "daily" | "weekly" | "monthly",
      "description": string (Simple, actionable description),
      "targetStreak": number (in days)
    }
  ],
  "calendarEvents": [
    {
      "title": string,
      "description": string,
      "startDate": string (ISO 8601 date),
      "endDate": string (ISO 8601 date),
      "recurrence": string (optional, e.g. "RRULE:FREQ=WEEKLY;COUNT=12")
    }
  ],
  "rival": {
    "name": string (A fictional, hyper-realistic adversary competing for the exact same goal),
    "bio": string (Why they are dangerous and currently ahead),
    "taunts": string[] (3 aggressive taunts to keep the user disciplined),
    "progressOffset": number (Days ahead)
  }
}

CRITICAL RULES:
- 'weeklyActions' MUST contain 12 weeks. NEVER return 0 weeks.
- Each week MUST have 3-5 comprehensive actions.
- Return ONLY the JSON object without markdown fences or outside commentary.`;

function buildUserPrompt(state: typeof SimulationAnnotation.State): string {
  const { userInput, futurePaths, obstacles } = state;

  const realisticPath: FuturePath | undefined =
    futurePaths.find((p) => p.type === 'realistic') ?? futurePaths[0];

  if (!realisticPath) {
    return `Generate a comprehensive, simple, step-by-step 12-week execution protocol for the goal: "${userInput.goals}".`;
  }

  const startDate = new Date().toISOString().split('T')[0];
  const topObstacles = obstacles
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  return `## User Profile
**Current Situation:** ${userInput.currentSituation}
**Goals:** ${userInput.goals}
**Risk Tolerance:** ${userInput.riskTolerance}
**Plan Start Date:** ${startDate}

## Realistic Future Scenario: "${realisticPath.title}"
${realisticPath.narrative}

### Milestones to Reach
${realisticPath.milestones.map((m) => `- Month ${m.month}: ${m.title} — ${m.description}`).join('\n')}

### Target Daily Routines
${realisticPath.dailyRoutines.map((r) => `- ${r.timeOfDay}: ${r.activity} (${r.purpose})`).join('\n')}

### Risks to Counter
${topObstacles.map((o) => `- ${o.description} — Mitigation: ${o.mitigation}`).join('\n')}

Generate the 12-week step-by-step implementation curriculum starting from ${startDate}. Keep the language ultra-simple, practical, and include live YouTube tutorial links for every action.`;
}

/**
 * Parse the raw LLM output into a structured ActionPlan.
 */
function parseActionPlan(raw: string): { actionPlan: ActionPlan; aggressivePitch: string } | null {
  try {
    const parsed = extractJsonFromResponse(raw);
    const aggressivePitch = parsed.aggressivePitch ? String(parsed.aggressivePitch) : '';

    const weeklyActions = Array.isArray(parsed.weeklyActions)
      ? parsed.weeklyActions.map((w: Record<string, unknown>) => ({
          week: Number(w.week) || 1,
          actions: Array.isArray(w.actions) ? w.actions.map(String) : [],
          milestone: w.milestone ? String(w.milestone) : undefined,
        }))
      : [];

    const totalActions = weeklyActions.reduce((sum: number, w: { actions: string[] }) => sum + w.actions.length, 0);
    if (weeklyActions.length === 0 || totalActions === 0) {
      console.error('[Deployer] Parsed JSON had 0 actions. Retrying.');
      return null;
    }

    const actionPlan: ActionPlan = {
      weeklyActions,
      habits: Array.isArray(parsed.habits)
        ? parsed.habits.map((h: Record<string, unknown>) => ({
            name: String(h.name ?? 'Core Habit'),
            frequency: (['daily', 'weekly', 'monthly'] as const).includes(
              h.frequency as 'daily' | 'weekly' | 'monthly',
            )
              ? (h.frequency as 'daily' | 'weekly' | 'monthly')
              : 'daily',
            description: String(h.description ?? ''),
            targetStreak: Number(h.targetStreak) || 30,
          }))
        : [],
      calendarEvents: Array.isArray(parsed.calendarEvents)
        ? parsed.calendarEvents.map((e: Record<string, unknown>) => ({
            title: String(e.title ?? ''),
            description: String(e.description ?? ''),
            startDate: String(e.startDate ?? new Date().toISOString()),
            endDate: String(e.endDate ?? new Date().toISOString()),
            recurrence: e.recurrence ? String(e.recurrence) : undefined,
          }))
        : [],
      rival: parsed.rival
        ? {
            name: String(parsed.rival.name ?? 'The Unknown Rival'),
            bio: String(parsed.rival.bio ?? 'They are outworking you right now.'),
            taunts: Array.isArray(parsed.rival.taunts) ? parsed.rival.taunts.map(String) : ['They are ahead. Move.'],
            progressOffset: Number(parsed.rival.progressOffset) || 5,
          }
        : undefined,
    };

    return { actionPlan, aggressivePitch };
  } catch (e) {
    console.error('[Deployer] JSON parse failed:', e);
    return null;
  }
}

/**
 * Generate a rich, failsafe action plan with YouTube search links.
 */
function generateFallbackPlan(goals: string): { actionPlan: ActionPlan; aggressivePitch: string } {
  console.warn('[Deployer] Using structured fallback plan for goal:', goals);
  const goalKeyword = encodeURIComponent(goals.split(' ').slice(0, 3).join(' '));

  const weeks = Array.from({ length: 12 }, (_, i) => ({
    week: i + 1,
    actions: [
      `Mental Synchronization: Sit quietly for 10 minutes and visualize achieving "${goals}". Write down your #1 priority for Week ${i + 1}. [Watch Guided Visualization ⭐](https://www.youtube.com/results?search_query=goal+visualization+meditation+beginner&sp=CAM%253D)`,
      `Master the Core Skill: Follow a beginner-friendly tutorial on ${goals.slice(0, 30)}. Practice for 45 minutes without distractions. [Watch Step-by-Step Tutorial ⭐](https://www.youtube.com/results?search_query=${goalKeyword}+complete+tutorial+for+beginners&sp=CAM%253D)`,
      `Hands-On Execution: Create one tangible piece of work or exercise toward your goal and save it in your portfolio. [Watch Practical Exercise Guide ⭐](https://www.youtube.com/results?search_query=${goalKeyword}+practical+project+guide&sp=CAM%253D)`,
      `Weekly Review & Calibration: Write down 3 wins and 1 obstacle from this week, then set next week's schedule. [Watch Weekly Review Method ⭐](https://www.youtube.com/results?search_query=how+to+do+a+weekly+review+productivity&sp=CAM%253D)`,
    ],
    milestone: i % 4 === 3 ? `Phase ${Math.floor(i / 4) + 1} Mastery Checkpoint` : undefined,
  }));

  return {
    aggressivePitch: `The future belongs to those who execute while others hesitate. "${goals}" will become your reality through consistent, daily steps. Stay focused and conquer every week.`,
    actionPlan: {
      weeklyActions: weeks,
      habits: [
        { name: 'Daily Focus Hour', frequency: 'daily' as const, description: 'Spend 60 uninterrupted minutes on your core goal.', targetStreak: 90 },
        { name: 'Skill Immersion', frequency: 'daily' as const, description: 'Watch 1 high-yield tutorial and take notes.', targetStreak: 60 },
        { name: 'Sunday Strategy', frequency: 'weekly' as const, description: 'Plan the upcoming 7 days on your calendar.', targetStreak: 12 },
        { name: 'Progress Journal', frequency: 'weekly' as const, description: 'Document your completed milestones and wins.', targetStreak: 12 },
      ],
      calendarEvents: [
        { title: 'Sprint Kickoff', description: 'Start your journey with full focus.', startDate: new Date().toISOString(), endDate: new Date().toISOString() },
        { title: 'Month 1 Milestone Checkpoint', description: 'Review your initial progress and recalibrate.', startDate: new Date(Date.now() + 30 * 86400000).toISOString(), endDate: new Date(Date.now() + 30 * 86400000).toISOString() },
        { title: 'Month 2 Growth Sprint', description: 'Accelerate output and complete advanced projects.', startDate: new Date(Date.now() + 60 * 86400000).toISOString(), endDate: new Date(Date.now() + 60 * 86400000).toISOString() },
        { title: 'Quarter 1 Mastery Review', description: 'Comprehensive review of your transformed trajectory.', startDate: new Date(Date.now() + 84 * 86400000).toISOString(), endDate: new Date(Date.now() + 84 * 86400000).toISOString() },
      ],
      rival: {
        name: 'The Competitor',
        bio: `They are striving toward "${goals}" with continuous discipline. Every day you execute puts you further ahead.`,
        taunts: [
          "Consistency is my superpower. What is yours?",
          "I completed today's action plan. Did you?",
          "No excuses. Just progress.",
        ],
        progressOffset: 7,
      },
    },
  };
}

/**
 * Expands core weeks into the target number of weeks (e.g. 12, 36, 60, or 120).
 */
function expandWeeks(coreWeeks: WeeklyAction[], targetWeeks: number): WeeklyAction[] {
  if (targetWeeks <= coreWeeks.length) return coreWeeks.slice(0, targetWeeks);

  const expanded: WeeklyAction[] = [];
  const multiplier = Math.ceil(targetWeeks / coreWeeks.length);
  
  for (let w = 1; w <= targetWeeks; w++) {
    const coreIndex = Math.floor((w - 1) / multiplier);
    const coreWeek = coreWeeks[Math.min(coreIndex, coreWeeks.length - 1)];
    
    expanded.push({
      week: w,
      actions: coreWeek.actions.map((a: string) => a.replace(/week \d+/gi, `week ${w}`)),
      milestone: w % multiplier === 0 ? (coreWeek.milestone || `Phase ${Math.ceil(w / multiplier)} Complete`) : undefined
    });
  }
  return expanded;
}

/**
 * Deployer node — uses dual-key OpenRouter failover to generate the execution plan.
 */
export async function deployerNode(
  state: typeof SimulationAnnotation.State,
): Promise<Partial<typeof SimulationAnnotation.State>> {
  const MAX_RETRIES = 2;
  const timeHorizonWeeks: Record<string, number> = {
    '1_year': 12,
    '3_years': 36,
    '5_years': 60,
    '10_years': 120,
  };
  const targetWeeks = timeHorizonWeeks[state.userInput.timeHorizon] || 12;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Deployer] Attempt ${attempt + 1}/${MAX_RETRIES + 1}`);

      const { content, modelUsed, keyIndexUsed } = await callOpenRouterWithFallback({
        messages: [
          { role: 'system', content: DEPLOYER_SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(state) },
        ],
        preferredModels: [
          'anthropic/claude-opus-5',
          'x-ai/grok-4.6',
          'meta-llama/llama-3.3-70b-instruct',
          'openai/gpt-4o-mini',
        ],
        temperature: 0.65,
        maxTokens: 16384,
        responseFormatJson: true,
      });

      console.log(`[Deployer] Generated ${content.length} chars using model '${modelUsed}' on API Key #${keyIndexUsed}`);

      const result = parseActionPlan(content);
      if (result) {
        console.log(`[Deployer] Successfully parsed ${result.actionPlan.weeklyActions.length} weeks. Expanding to ${targetWeeks} weeks.`);
        result.actionPlan.weeklyActions = expandWeeks(result.actionPlan.weeklyActions, targetWeeks);
        return {
          actionPlan: result.actionPlan,
          aggressivePitch: result.aggressivePitch,
          status: 'complete',
        };
      }

      console.warn(`[Deployer] Attempt ${attempt + 1} parse failed. Retrying...`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Deployer] Attempt ${attempt + 1} error:`, message);
    }
  }

  // Failsafe fallback plan
  console.warn('[Deployer] Retries exhausted. Using structured fallback plan.');
  const fallback = generateFallbackPlan(state.userInput.goals);
  fallback.actionPlan.weeklyActions = expandWeeks(fallback.actionPlan.weeklyActions, targetWeeks);
  return {
    actionPlan: fallback.actionPlan,
    aggressivePitch: fallback.aggressivePitch,
    status: 'complete',
  };
}
