// ============================================================================
// Deployer Agent — OpenRouter + Llama 3.1 8B
// Creates actionable plans, habit trackers, and calendar events
// Includes retry logic and a guaranteed hardcoded fallback so the action plan
// is NEVER empty.
// ============================================================================

import OpenAI from 'openai';
import { SimulationAnnotation } from './state';
import type { ActionPlan, FuturePath, WeeklyAction } from '@/types/agents';

const DEPLOYER_SYSTEM_PROMPT = `You are an elite productivity coach and action planning specialist. Given a person's realistic future path with milestones, create a comprehensive action plan that bridges their current situation to their ultimate goal.

Return your response as a JSON object with exactly this structure:
{
  "aggressivePitch": string (A highly aggressive, adrenaline-boosting, ego-hitting motivational pitch tailored specifically to the user's goal. e.g. for a trader: "The market doesn't care about your feelings. It takes from the weak and gives to the ruthless. Wake up." For a developer: "Code is shipping while you sleep. Are you going to be replaced or are you going to build the future?"),
  "weeklyActions": [
    {
      "week": number (1 to 12),
      "actions": string[] (3-5 specific, fluent, simple, and highly user-friendly actions. The FIRST action of each week MUST be a 'Mental Synchronization Challenge Task' to align their mind with their goal. VERY IMPORTANT: You MUST append a direct YouTube search link to the end of EVERY action string, formatted exactly like: "Learn NextJS. [Watch Tutorial](https://www.youtube.com/results?search_query=how+to+learn+nextjs)"),
      "milestone": string (optional, name of milestone this week leads toward)
    }
  ],
  "habits": [
    {
      "name": string,
      "frequency": "daily" | "weekly" | "monthly",
      "description": string (Fluent, simple, and user-friendly description),
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
    "name": string (A fictional, hyper-realistic rival competing for the exact same goal),
    "bio": string (Why they are dangerous and currently beating the user),
    "taunts": string[] (3 hyper-aggressive, dopamine-spiking taunts to fuel the user's competitive drive),
    "progressOffset": number (An integer between 5 and 20, representing how many days ahead they are)
  }
}

CRITICAL INSTRUCTIONS:
1. Your 'weeklyActions' array MUST contain EXACTLY 12 weeks. NEVER return 0 weeks.
2. Each week MUST have 3-5 actions. NEVER return 0 actions for any week.
3. Create 4-6 habits, and 4-6 calendar events.
4. Keep the language extremely simple, fluent, and user-friendly (except for the aggressive pitch, which must be hard-hitting).
5. Return ONLY the valid JSON object. No additional text or markdown formatting.
6. The rival MUST always be included.`;

function buildUserPrompt(state: typeof SimulationAnnotation.State): string {
  const { userInput, futurePaths, obstacles } = state;

  // Prefer the realistic path; fall back to first available
  const realisticPath: FuturePath | undefined =
    futurePaths.find((p) => p.type === 'realistic') ?? futurePaths[0];

  if (!realisticPath) {
    return `No future path available. Generate a generic 12-week productivity plan for the user's goal: "${userInput.goals}".`;
  }

  // Build a start date for calendar events (today)
  const startDate = new Date().toISOString().split('T')[0];

  const topObstacles = obstacles
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  return `## User Profile
**Situation:** ${userInput.currentSituation}
**Goals:** ${userInput.goals}
**Risk Tolerance:** ${userInput.riskTolerance}
**Plan Start Date:** ${startDate}

## Realistic Future Path: "${realisticPath.title}"
${realisticPath.narrative}

### Milestones
${realisticPath.milestones.map((m) => `- Month ${m.month}: ${m.title} — ${m.description}`).join('\n')}

### Daily Routines (target state)
${realisticPath.dailyRoutines.map((r) => `- ${r.timeOfDay}: ${r.activity} (${r.purpose})`).join('\n')}

### Top Obstacles to Mitigate
${topObstacles.map((o) => `- ${o.description} (probability: ${o.probability}) — Mitigation: ${o.mitigation}`).join('\n')}

CRITICAL: Generate EXACTLY 12 weeks of plans starting from ${startDate}. Each week must have 3-5 specific, measurable actions. Include habits that build toward the daily routines described above. NEVER leave weeklyActions empty.`;
}

/**
 * Parse the raw LLM output into a structured ActionPlan.
 * Returns null if parsing fails so the caller can retry.
 */
function parseActionPlan(raw: string): { actionPlan: ActionPlan; aggressivePitch: string } | null {
  try {
    // Try to extract JSON if the model wrapped it in markdown
    let jsonStr = raw;
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonStr);
    const aggressivePitch = parsed.aggressivePitch ? String(parsed.aggressivePitch) : '';

    const weeklyActions = Array.isArray(parsed.weeklyActions)
      ? parsed.weeklyActions.map((w: Record<string, unknown>) => ({
          week: Number(w.week) || 1,
          actions: Array.isArray(w.actions) ? w.actions.map(String) : [],
          milestone: w.milestone ? String(w.milestone) : undefined,
        }))
      : [];

    // CRITICAL CHECK: If we got 0 weeks or all weeks have 0 actions, reject this parse
    const totalActions = weeklyActions.reduce((sum: number, w: { actions: string[] }) => sum + w.actions.length, 0);
    if (weeklyActions.length === 0 || totalActions === 0) {
      console.error('[Deployer] Parsed JSON but got 0 weeks or 0 total actions. Rejecting.');
      return null;
    }

    const actionPlan: ActionPlan = {
      weeklyActions,
      habits: Array.isArray(parsed.habits)
        ? parsed.habits.map((h: Record<string, unknown>) => ({
            name: String(h.name ?? ''),
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
    console.error('[Deployer] JSON parse failed:', e, 'Raw (first 300):', raw.slice(0, 300));
    return null;
  }
}

/**
 * Generate a hardcoded fallback action plan so the user NEVER sees an empty page.
 * This is the absolute last resort.
 */
function generateFallbackPlan(goals: string): { actionPlan: ActionPlan; aggressivePitch: string } {
  console.warn('[Deployer] Using hardcoded fallback plan for goal:', goals);
  const goalKeyword = encodeURIComponent(goals.split(' ').slice(0, 3).join(' '));

  const weeks = Array.from({ length: 12 }, (_, i) => ({
    week: i + 1,
    actions: [
      `Mental Synchronization: Visualize yourself achieving "${goals}" for 10 minutes. [Watch Visualization Guide](https://www.youtube.com/results?search_query=visualization+meditation+for+goals)`,
      `Research and study the #1 skill needed for your goal this week. [Watch Tutorial](https://www.youtube.com/results?search_query=${goalKeyword}+tutorial+week+${i + 1})`,
      `Take one concrete action step toward your goal today. Document your progress. [Watch Motivation](https://www.youtube.com/results?search_query=daily+progress+motivation)`,
      `Connect with one person in your field or community. [Watch Networking Tips](https://www.youtube.com/results?search_query=networking+tips+for+beginners)`,
    ],
    milestone: i % 4 === 3 ? `Month ${Math.floor(i / 4) + 1} Checkpoint` : undefined,
  }));

  return {
    aggressivePitch: `While you're reading this, someone with HALF your talent is outworking you. "${goals}" isn't going to achieve itself. Every second you waste is a second your competition gains. Wake up and execute.`,
    actionPlan: {
      weeklyActions: weeks,
      habits: [
        { name: 'Morning Goal Review', frequency: 'daily' as const, description: 'Spend 5 minutes reviewing your goals and todays action steps.', targetStreak: 90 },
        { name: 'Skill Practice', frequency: 'daily' as const, description: 'Dedicate 1 hour to deliberate practice toward your goal.', targetStreak: 90 },
        { name: 'Weekly Reflection', frequency: 'weekly' as const, description: 'Every Sunday, review what you achieved and plan next week.', targetStreak: 12 },
        { name: 'Community Engagement', frequency: 'weekly' as const, description: 'Engage with communities related to your goal online or offline.', targetStreak: 12 },
      ],
      calendarEvents: [
        { title: 'Week 1 Kickoff', description: 'Start your journey.', startDate: new Date().toISOString(), endDate: new Date().toISOString() },
        { title: 'Month 1 Review', description: 'Review first month progress.', startDate: new Date(Date.now() + 30 * 86400000).toISOString(), endDate: new Date(Date.now() + 30 * 86400000).toISOString() },
        { title: 'Month 2 Review', description: 'Review second month progress.', startDate: new Date(Date.now() + 60 * 86400000).toISOString(), endDate: new Date(Date.now() + 60 * 86400000).toISOString() },
        { title: 'Final Review', description: 'Comprehensive 12-week review.', startDate: new Date(Date.now() + 84 * 86400000).toISOString(), endDate: new Date(Date.now() + 84 * 86400000).toISOString() },
      ],
      rival: {
        name: 'Shadow',
        bio: `They started with less than you but they never take a day off. Every hour you rest, they are grinding toward "${goals}".`,
        taunts: [
          "I don't need motivation. I have discipline. Do you?",
          "You checked social media 3 times today. I checked off 3 tasks.",
          "Sleep well tonight. I'll be working.",
        ],
        progressOffset: 7,
      },
    },
  };
}

/**
 * Expands 12 core weeks into the target number of weeks (e.g. 60 or 120).
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
 * Deployer node — uses OpenRouter Llama 3.1 8B to create an executable action plan.
 * Includes retry logic and a guaranteed hardcoded fallback.
 */
export async function deployerNode(
  state: typeof SimulationAnnotation.State,
): Promise<Partial<typeof SimulationAnnotation.State>> {
  const MAX_RETRIES = 2;
  const timeHorizonMonths = {
    '1_year': 12,
    '3_years': 36,
    '5_years': 60,
    '10_years': 120,
  };
  const targetWeeks = timeHorizonMonths[state.userInput.timeHorizon] || 12;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Deployer] Attempt ${attempt + 1}/${MAX_RETRIES + 1}`);

      const openai = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: 'meta-llama/llama-3.1-8b-instruct',
        messages: [
          { role: 'system', content: DEPLOYER_SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(state) },
        ],
        temperature: 0.6,
        max_tokens: 16384,
        response_format: { type: 'json_object' },
      });

      const raw = completion.choices[0]?.message?.content ?? '{}';
      console.log(`[Deployer] Got ${raw.length} chars from LLM`);

      const result = parseActionPlan(raw);
      if (result) {
        console.log(`[Deployer] Successfully parsed ${result.actionPlan.weeklyActions.length} weeks. Expanding to ${targetWeeks} weeks.`);
        result.actionPlan.weeklyActions = expandWeeks(result.actionPlan.weeklyActions, targetWeeks);
        return {
          actionPlan: result.actionPlan,
          aggressivePitch: result.aggressivePitch,
          status: 'complete',
        };
      }

      // If parse returned null, continue to retry
      console.warn(`[Deployer] Attempt ${attempt + 1} failed: parse returned null. Retrying...`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Deployer] Attempt ${attempt + 1} error:`, message);
    }
  }

  // ALL retries failed. Use the hardcoded fallback so the user NEVER sees an empty plan.
  console.error('[Deployer] All retries exhausted. Using hardcoded fallback plan.');
  const fallback = generateFallbackPlan(state.userInput.goals);
  fallback.actionPlan.weeklyActions = expandWeeks(fallback.actionPlan.weeklyActions, targetWeeks);
  return {
    actionPlan: fallback.actionPlan,
    aggressivePitch: fallback.aggressivePitch,
    status: 'complete',
  };
}
