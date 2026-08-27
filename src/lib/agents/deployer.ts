// ============================================================================
// Deployer Agent — Universal Career Transformation Curriculum Engine
// Generates 100% dynamic, tailored week-by-week roadmaps for ANY dream career.
// Integrates top-view YouTube guides, ego-hurting challenges, and rival matrix.
// ============================================================================

import { SimulationAnnotation } from './state';
import type { ActionPlan, FuturePath, WeeklyAction } from '@/types/agents';
import { callOpenRouterWithFallback, extractJsonFromResponse } from '@/lib/openrouterClient';

const DEPLOYER_SYSTEM_PROMPT = `You are the World's Elite Career Transformation Strategist and High-Performance Execution Architect.
Your mandate is to take any real human being from their EXACT CURRENT BACKGROUND (e.g. Student in Kolkata, Cashier, Novice, Jobseeker) and build a ruthless, step-by-step master roadmap to achieve their EXACT DREAM CAREER / GOAL (e.g. Full-Time Profitable Trader, AI Systems Architect, Content Creator, Medical Specialist, Agency Founder, etc.).

CRITICAL FIDELITY REQUIREMENTS:
1. 100% DOMAIN SPECIFICITY:
   - Every single task, milestone, habit, and calendar event MUST strictly match the user's specific target profession.
   - NEVER output generic coding, Next.js, or software tasks unless the user explicitly requested a software career.
2. CHILD-LEVEL CLARITY & PRACTICAL ACTIONABILITY:
   - What to do in crystal-clear simple terms.
   - Exact software/tools to open and how to practice.
   - Tangible deliverable for each week.
3. EGO-HURTING CHALLENGES & MENTAL SYNCHRONIZATION:
   - The first action of every single week MUST be a sharp, ego-stimulating "Mental Synchronization" task that crushes laziness, destroys excuses, and triggers competitive discipline.
4. TWO TOP-RATED YOUTUBE TUTORIAL GUIDES PER WEEK:
   - Include targeted YouTube search links with '&sp=CAM%253D' (sorts by highest view count and positive reviews):
     "[Watch Video Guide ⭐](https://www.youtube.com/results?search_query=topic+tutorial+beginners&sp=CAM%253D)"
5. BESPOKE RIVAL SYSTEM:
   - Create a realistic, highly disciplined rival striving for the same goal who taunts the user whenever they hesitate.

Return ONLY a valid JSON object matching this schema:
{
  "aggressivePitch": string (A high-adrenaline, motivational executive challenge tailored to their target profession),
  "weeklyActions": [
    {
      "week": number (1 to 12),
      "actions": string[] (3-4 beginner-friendly step-by-step actions tailored strictly to their goal, each ending with a live YouTube search link),
      "milestone": string (Milestone achieved this week)
    }
  ],
  "habits": [
    {
      "name": string,
      "frequency": "daily" | "weekly" | "monthly",
      "description": string (Practical habit for their target career),
      "targetStreak": number
    }
  ],
  "calendarEvents": [
    {
      "title": string,
      "description": string,
      "startDate": string,
      "endDate": string
    }
  ],
  "rival": {
    "name": string (Adversary persona tailored to target career),
    "bio": string (Why they are relentless and ahead),
    "taunts": string[] (3 sharp taunts to destroy procrastination),
    "progressOffset": number
  }
}`;

function buildUserPrompt(state: typeof SimulationAnnotation.State, targetWeeks: number): string {
  const { userInput, futurePaths, obstacles } = state;
  const realisticPath: FuturePath | undefined =
    futurePaths.find((p) => p.type === 'realistic') ?? futurePaths[0];

  const startDate = new Date().toISOString().split('T')[0];
  const topObstacles = obstacles
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  return `## USER PROFILE & CAREER TRANSITION
**Starting Background:** ${userInput.currentSituation}
**Target Dream Career / Goal:** ${userInput.goals}
**Total Timeline Horizon:** ${targetWeeks} Weeks (${userInput.timeHorizon?.replace('_', ' ') || `${targetWeeks} weeks`})
**Risk Tolerance:** ${userInput.riskTolerance}
${userInput.additionalContext ? `**Context & Notes:** ${userInput.additionalContext}` : ''}
**Start Date:** ${startDate}

## REALISTIC SCENARIO: "${realisticPath?.title || 'The Realistic Transformation'}"
${realisticPath?.narrative || ''}

### Target Milestones
${(realisticPath?.milestones || []).map((m) => `- Month ${m.month}: ${m.title} — ${m.description}`).join('\n')}

### Obstacles to Overcome
${topObstacles.map((o) => `- ${o.description} — Mitigation: ${o.mitigation}`).join('\n')}

MANDATE: Build the comprehensive, step-by-step career action roadmap to take this real person from "${userInput.currentSituation}" to achieving "${userInput.goals}" across this ${targetWeeks}-week timeline. Every single action must be 100% specific to "${userInput.goals}". Keep language simple for beginners and attach high-view YouTube tutorial links to each step.`;
}

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
      return null;
    }

    const actionPlan: ActionPlan = {
      weeklyActions,
      habits: Array.isArray(parsed.habits)
        ? parsed.habits.map((h: Record<string, unknown>) => ({
            name: String(h.name ?? 'Core Discipline Habit'),
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
          }))
        : [],
      rival: parsed.rival
        ? {
            name: String(parsed.rival.name ?? 'The Disciplined Rival'),
            bio: String(parsed.rival.bio ?? 'They are grinding every single day toward the same goal without excuses.'),
            taunts: Array.isArray(parsed.rival.taunts) && parsed.rival.taunts.length > 0
              ? parsed.rival.taunts.map(String)
              : [
                  "I executed my daily plan without hesitation. Did you?",
                  "Excuses build regret. Discipline prints results.",
                  "While you procrastinate, I am taking your future clients and returns.",
                ],
            progressOffset: Number(parsed.rival.progressOffset) || 7,
          }
        : {
            name: 'The Dedicated Competitor',
            bio: 'They wake up early, follow their rules, and execute relentlessly.',
            taunts: [
              "I executed my daily plan without hesitation. Did you?",
              "Excuses build regret. Discipline prints results.",
              "While you procrastinate, I am taking your future clients and returns.",
            ],
            progressOffset: 7,
          },
    };

    return { actionPlan, aggressivePitch };
  } catch (e) {
    console.error('[Deployer] JSON parse failed:', e);
    return null;
  }
}

/**
 * Universal Dynamic Profession Roadmap Generator
 * Creates an authentic, progressive roadmap for ANY career input across ANY number of weeks.
 */
export function generateDynamicProfessionCurriculum(
  goals: string,
  situation: string,
  targetWeeks: number,
): { actionPlan: ActionPlan; aggressivePitch: string } {
  const goalKeyword = encodeURIComponent(goals.split(' ').slice(0, 4).join(' '));
  const isTrading = /trad(e|ing|er)|stock|forex|crypto|market|nifty/i.test(goals);
  const isCreator = /youtub|content creator|freelanc|influencer|video edit|channel|podcast/i.test(goals);
  const isCoding = /programm|software|develop|full stack|frontend|backend|ai engineer|web dev|code/i.test(goals);

  const weeks: WeeklyAction[] = [];

  for (let w = 1; w <= targetWeeks; w++) {
    const phase = Math.ceil((w / targetWeeks) * 4);
    const month = Math.ceil(w / 4);
    const year = Math.ceil(w / 48);

    if (isTrading) {
      if (w <= 4) {
        weeks.push({
          week: w,
          actions: [
            `Mental Synchronization: Commit to the 1% risk rule. Your competitor doesn't gamble; they execute high-probability setups. [Watch Trading Psychology Mastery ⭐](https://www.youtube.com/results?search_query=trading+psychology+and+discipline+mark+douglas&sp=CAM%253D)`,
            `Market Literacy: Open a TradingView chart. Identify Major Support/Resistance levels and 15-minute Candlestick price action. [Watch Price Action Basics ⭐](https://www.youtube.com/results?search_query=candlestick+patterns+and+price+action+for+beginners&sp=CAM%253D)`,
            `Risk Calculator: Build a lot-size position calculator spreadsheet. Never take a trade without defined Stop-Loss. [Watch Position Sizing Rules ⭐](https://www.youtube.com/results?search_query=position+sizing+and+risk+reward+ratio+trading&sp=CAM%253D)`,
            `Daily Drill: Spend 45 minutes daily observing live market structure without placing emotional orders. [Watch How to Read Market Trends ⭐](https://www.youtube.com/results?search_query=how+to+read+market+structure+for+beginners&sp=CAM%253D)`,
          ],
          milestone: w === 4 ? `Month 1: Trading Framework & Chart Literacy` : undefined,
        });
      } else if (w <= 16) {
        weeks.push({
          week: w,
          actions: [
            `Mental Synchronization: Accept small losses as business operational costs. Never revenge trade. [Watch Controlling Fear and Greed in Trading ⭐](https://www.youtube.com/results?search_query=how+to+stop+revenge+trading+and+overtrading&sp=CAM%253D)`,
            `Paper Trading & Edge: Execute 15 simulated trades strictly using 1:2 Risk-to-Reward setups. [Watch Paper Trading Strategy Guide ⭐](https://www.youtube.com/results?search_query=paper+trading+step+by+step+tradingview&sp=CAM%253D)`,
            `Journal Analytics: Log Entry, Stop-Loss, Target, and emotional state in your spreadsheet after every trade. [Watch How to Keep a Trading Journal ⭐](https://www.youtube.com/results?search_query=how+to+maintain+a+trading+journal+spreadsheet&sp=CAM%253D)`,
          ],
          milestone: w % 4 === 0 ? `Month ${month}: Strategy Testing & Win Rate Optimization` : undefined,
        });
      } else if (w <= 48) {
        weeks.push({
          week: w,
          actions: [
            `Mental Synchronization: Treat trading as a high-stakes business, not a casino hobby. [Watch Discipline and Long-Term Trading Edge ⭐](https://www.youtube.com/results?search_query=how+to+build+a+long+term+trading+edge&sp=CAM%253D)`,
            `Micro-Capital Deployment: Execute live trades with micro-capital (₹10,000 / $200) with strict ₹100 max risk per trade. [Watch Live Capital Execution ⭐](https://www.youtube.com/results?search_query=transitioning+from+paper+trading+to+real+money&sp=CAM%253D)`,
            `Strategy Backtesting: Backtest 50 historical market charts to verify edge across trending and sideways market regimes. [Watch Backtesting Strategies ⭐](https://www.youtube.com/results?search_query=how+to+backtest+candlestick+strategies+properly&sp=CAM%253D)`,
          ],
          milestone: w % 12 === 0 ? `Quarter ${Math.ceil(w / 12)}: Capital Preservation & Live Execution Mastery` : undefined,
        });
      } else {
        weeks.push({
          week: w,
          actions: [
            `Mental Synchronization: Scale capital only when your Sharpe ratio and 3-month profit factor exceed 2.0. [Watch Scaling Trading Capital Safely ⭐](https://www.youtube.com/results?search_query=how+to+scale+up+position+size+trading&sp=CAM%253D)`,
            `Prop Firm & Portfolio Scaling: Manage funded accounts and compound returns with systematic risk rules. [Watch Passing Prop Firm Challenges ⭐](https://www.youtube.com/results?search_query=how+to+pass+prop+firm+challenge+step+by+step&sp=CAM%253D)`,
            `Institutional Auditing: Audit performance metrics, tax compliance, and multi-asset diversification weekly. [Watch Professional Trading Business Model ⭐](https://www.youtube.com/results?search_query=full+time+trading+business+and+taxation&sp=CAM%253D)`,
          ],
          milestone: w % 24 === 0 ? `Year ${year} Milestone: Full-Time Professional Trader Sovereignty` : undefined,
        });
      }
    } else if (isCreator) {
      if (w <= 4) {
        weeks.push({
          week: w,
          actions: [
            `Mental Synchronization: Overcome perfectionism. Your competitors publish and improve; your unmade videos help no one. [Watch Creator Mindset and Confidence ⭐](https://www.youtube.com/results?search_query=how+to+be+confident+on+camera+youtube&sp=CAM%253D)`,
            `Niche & Channel Setup: Optimize your YouTube channel layout, high-converting banner, and SEO description. [Watch Complete Channel Setup Tutorial ⭐](https://www.youtube.com/results?search_query=youtube+channel+setup+tutorial+step+by+step&sp=CAM%253D)`,
            `Production Basics: Master timeline editing, J/L cuts, and thumbnail design in CapCut/Premiere and Canva. [Watch Video Editing Masterclass ⭐](https://www.youtube.com/results?search_query=video+editing+tutorial+for+beginners+capcut+premiere&sp=CAM%253D)`,
            `First Release: Script, record, and publish your first cornerstone video. [Watch How to Upload on YouTube for Maximum Views ⭐](https://www.youtube.com/results?search_query=how+to+upload+video+on+youtube+with+seo&sp=CAM%253D)`,
          ],
          milestone: w === 4 ? `Month 1: Channel Launch & Content Engine Complete` : undefined,
        });
      } else {
        weeks.push({
          week: w,
          actions: [
            `Mental Synchronization: Focus on audience retention and CTR. Learn from analytics without taking low views personally. [Watch Increasing YouTube Retention ⭐](https://www.youtube.com/results?search_query=how+to+increase+audience+retention+youtube&sp=CAM%253D)`,
            `Weekly Publishing: Script, film, and edit 1 long-form high-value video and 3 vertical Shorts. [Watch Content Creation Workflow ⭐](https://www.youtube.com/results?search_query=youtube+content+creation+workflow+step+by+step&sp=CAM%253D)`,
            `Packaging Optimization: Design 2 distinct thumbnail variations and test high-CTR titles. [Watch Thumbnail & Title Packaging ⭐](https://www.youtube.com/results?search_query=how+to+make+viral+thumbnails+photoshop+canva&sp=CAM%253D)`,
          ],
          milestone: w % 4 === 0 ? `Month ${month}: Audience Growth & Monetization Sprint` : undefined,
        });
      }
    } else {
      // Universal Career Transformation Framework
      if (w <= 4) {
        weeks.push({
          week: w,
          actions: [
            `Mental Synchronization: Step out of student/beginner mode. Your rival is logging 3 hours of daily practice right now. No excuses. [Watch High Performance Focus & Discipline ⭐](https://www.youtube.com/results?search_query=high+performance+focus+and+discipline&sp=CAM%253D)`,
            `Foundation Setup: Install required professional tools and master the core fundamentals of ${goals.slice(0, 35)}. [Watch Complete Beginner Masterclass ⭐](https://www.youtube.com/results?search_query=${goalKeyword}+complete+guide+for+beginners&sp=CAM%253D)`,
            `Hands-On Exercise: Complete your first practical beginner exercise and record key learnings in your daily log. [Watch Practical Exercise Guide ⭐](https://www.youtube.com/results?search_query=${goalKeyword}+practical+exercises+for+beginners&sp=CAM%253D)`,
          ],
          milestone: w === 4 ? `Month 1: Core Fundamentals & Workflow Setup` : undefined,
        });
      } else if (w <= 16) {
        weeks.push({
          week: w,
          actions: [
            `Mental Synchronization: Discipline is choosing between what you want now and what you want most. Focus on Week ${w} deliverables. [Watch Atomic Habits & Deep Work Execution ⭐](https://www.youtube.com/results?search_query=deep+work+and+daily+execution+habits&sp=CAM%253D)`,
            `Skill Deep Dive: Execute an intermediate project module targeting industry-standard practices in ${goals.slice(0, 30)}. [Watch Intermediate Practical Masterclass ⭐](https://www.youtube.com/results?search_query=${goalKeyword}+intermediate+tutorials+and+projects&sp=CAM%253D)`,
            `Portfolio Artifact: Document your project deliverable with clean documentation, screenshots, and measurable results. [Watch Building an Elite Portfolio ⭐](https://www.youtube.com/results?search_query=how+to+build+an+elite+portfolio+in+${goalKeyword}&sp=CAM%253D)`,
          ],
          milestone: w % 4 === 0 ? `Month ${month}: Project Execution & Portfolio Milestone` : undefined,
        });
      } else if (w <= 48) {
        weeks.push({
          week: w,
          actions: [
            `Mental Synchronization: Push through the plateau. True expertise is built when motivation fades and discipline takes over. [Watch Mental Toughness & Resilience ⭐](https://www.youtube.com/results?search_query=mental+toughness+and+resilience+masterclass&sp=CAM%253D)`,
            `Advanced Practical Implementation: Build end-to-end client-ready solutions or high-tier deliverables in ${goals.slice(0, 30)}. [Watch Advanced Production Standards ⭐](https://www.youtube.com/results?search_query=${goalKeyword}+advanced+production+standards&sp=CAM%253D)`,
            `Industry Networking & Pitching: Connect with 5 industry leaders, share your case study, and request targeted feedback. [Watch Professional Networking & Outreach ⭐](https://www.youtube.com/results?search_query=professional+outreach+and+client+acquisition&sp=CAM%253D)`,
          ],
          milestone: w % 12 === 0 ? `Quarter ${Math.ceil(w / 12)}: Industry-Ready Execution Checkpoint` : undefined,
        });
      } else {
        weeks.push({
          week: w,
          actions: [
            `Mental Synchronization: Operate at top 1% standards. Compound your reputation, deliver flawless execution, and scale. [Watch Operating at the Highest Level ⭐](https://www.youtube.com/results?search_query=operating+at+the+highest+professional+level&sp=CAM%253D)`,
            `High-Value Deliverables: Lead multi-faceted initiatives, scale client acquisition, and command premium authority in ${goals.slice(0, 30)}. [Watch Scaling High Value Services ⭐](https://www.youtube.com/results?search_query=scaling+high+value+career+services+and+authority&sp=CAM%253D)`,
            `Weekly Mastery Review: Review KPIs, revenue/performance velocity, and optimize your weekly operational routine. [Watch Elite Performance Systems ⭐](https://www.youtube.com/results?search_query=elite+performance+systems+and+audits&sp=CAM%253D)`,
          ],
          milestone: w % 24 === 0 ? `Year ${year}: Elite Professional Sovereignty & Mastery` : undefined,
        });
      }
    }
  }

  const rivalTitle = isTrading
    ? 'The Disciplined Quantitative Trader'
    : isCreator
    ? 'The Hyper-Consistent Creator'
    : isCoding
    ? 'The Elite Senior Architect'
    : 'The Relentless Competitor';

  return {
    aggressivePitch: `The world does not care about your potential; it rewards your ruthless execution. From "${situation}" to "${goals}", your transformation starts with conquering Week 1. Wake up, eliminate distractions, and execute your protocol.`,
    actionPlan: {
      weeklyActions: weeks,
      habits: [
        { name: 'Daily Skill Practice & Execution', frequency: 'daily' as const, description: `Spend 60 minutes of uninterrupted focus practicing core ${goals.slice(0, 25)} skills.`, targetStreak: 90 },
        { name: 'Progress & Mistake Journaling', frequency: 'daily' as const, description: 'Log daily wins, errors, and emotional discipline notes before sleeping.', targetStreak: 90 },
        { name: 'Weekly Performance Audit', frequency: 'weekly' as const, description: 'Audit metrics, deliverable completion rate, and calibrate next week goals.', targetStreak: 12 },
        { name: 'Discipline & Physical Prime', frequency: 'daily' as const, description: 'Physical workout and mental focus routine every morning.', targetStreak: 60 },
      ],
      calendarEvents: [
        { title: 'Transformation Kickoff', description: 'Begin your journey with 100% focus and zero excuses.', startDate: new Date().toISOString(), endDate: new Date().toISOString() },
        { title: 'Foundation Milestone Review', description: 'Assess first month deliverables and core competency score.', startDate: new Date(Date.now() + 30 * 86400000).toISOString(), endDate: new Date(Date.now() + 30 * 86400000).toISOString() },
        { title: 'Intermediate Execution Checkpoint', description: 'Evaluate portfolio artifacts and practice metrics.', startDate: new Date(Date.now() + 90 * 86400000).toISOString(), endDate: new Date(Date.now() + 90 * 86400000).toISOString() },
      ],
      rival: {
        name: rivalTitle,
        bio: `They wake up early, follow their rules without hesitation, and never procrastinate. Every day you execute your plan, you build an unbreakable edge over them.`,
        taunts: [
          "I completed my core daily tasks before you woke up. Did you?",
          "Excuses build regret. Relentless execution builds wealth and freedom.",
          "While you hesitate, I am executing and taking your future opportunities.",
        ],
        progressOffset: 7,
      },
    },
  };
}

/**
 * Expands core weeks into the target number of weeks ensuring 100% completeness and domain fidelity.
 */
function expandWeeks(
  coreWeeks: WeeklyAction[],
  targetWeeks: number,
  goals: string,
  situation: string,
): WeeklyAction[] {
  if (coreWeeks.length >= targetWeeks) {
    return coreWeeks.slice(0, targetWeeks);
  }

  const generated = generateDynamicProfessionCurriculum(goals, situation, targetWeeks);
  const fullCurriculum = generated.actionPlan.weeklyActions;

  // Use core weeks for the first N weeks, then seamlessly append the remaining progressive weeks
  const result: WeeklyAction[] = [];
  coreWeeks.forEach((cw, idx) => {
    result.push({
      ...cw,
      week: idx + 1,
    });
  });

  for (let w = result.length + 1; w <= targetWeeks; w++) {
    const fallbackWeek = fullCurriculum[w - 1] || {
      week: w,
      actions: [
        `Mental Synchronization: Review progress and maintain absolute focus on Week ${w} goals. [Watch High Performance Focus ⭐](https://www.youtube.com/results?search_query=high+performance+focus+and+discipline&sp=CAM%253D)`,
        `Skill Execution Sprint: Spend 90 minutes executing the core project milestone for Month ${Math.ceil(w / 4)}. [Watch Advanced Masterclass ⭐](https://www.youtube.com/results?search_query=${encodeURIComponent(goals.slice(0, 30))}+tutorials&sp=CAM%253D)`,
        `Performance Audit: Audit deliverable quality and log metrics in your journal. [Watch Feedback Loops for Fast Mastery ⭐](https://www.youtube.com/results?search_query=how+to+master+skills+fast&sp=CAM%253D)`,
      ],
      milestone: w % 4 === 0 ? `Month ${Math.ceil(w / 4)} Mastery Checkpoint` : undefined,
    };
    result.push({
      ...fallbackWeek,
      week: w,
    });
  }

  return result;
}

/**
 * Deployer node — uses dual-key OpenRouter failover to generate the execution plan.
 */
export async function deployerNode(
  state: typeof SimulationAnnotation.State,
): Promise<Partial<typeof SimulationAnnotation.State>> {
  const MAX_RETRIES = 2;
  const timeHorizonWeeks: Record<string, number> = {
    '6_weeks': 6,
    '12_weeks': 12,
    '24_weeks': 24,
    '36_weeks': 36,
    '1_year': 48,
    '2_years': 96,
    '3_years': 144,
    '5_years': 240,
    '10_years': 480,
  };

  const customMonths = state.userInput.timeHorizonMonths && state.userInput.timeHorizonMonths > 0
    ? state.userInput.timeHorizonMonths
    : 0;
  const targetWeeks = customMonths > 0
    ? Math.round(customMonths * 4)
    : (timeHorizonWeeks[state.userInput.timeHorizon] || 12);

  console.log(`[Deployer] Generating roadmap for "${state.userInput.currentSituation}" -> "${state.userInput.goals}" across ${targetWeeks} weeks.`);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { content, modelUsed, keyIndexUsed } = await callOpenRouterWithFallback({
        messages: [
          { role: 'system', content: DEPLOYER_SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(state, targetWeeks) },
        ],
        preferredModels: [
          'meta-llama/llama-3.3-70b-instruct',
          'openai/gpt-4o-mini',
          'x-ai/grok-4.6',
          'anthropic/claude-opus-5',
        ],
        temperature: 0.65,
        maxTokens: 3500,
        responseFormatJson: true,
      });

      console.log(`[Deployer] Generated ${content.length} chars using model '${modelUsed}' on API Key #${keyIndexUsed}`);

      const result = parseActionPlan(content);
      if (result && result.actionPlan.weeklyActions.length > 0) {
        result.actionPlan.weeklyActions = expandWeeks(
          result.actionPlan.weeklyActions,
          targetWeeks,
          state.userInput.goals,
          state.userInput.currentSituation,
        );
        return {
          actionPlan: result.actionPlan,
          aggressivePitch: result.aggressivePitch,
          status: 'complete',
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[Deployer] Attempt ${attempt + 1} notice:`, message);
    }
  }

  // Failsafe dynamic domain fallback plan
  console.warn('[Deployer] Using universal dynamic curriculum generator for:', state.userInput.goals);
  const fallback = generateDynamicProfessionCurriculum(
    state.userInput.goals,
    state.userInput.currentSituation,
    targetWeeks,
  );

  return {
    actionPlan: fallback.actionPlan,
    aggressivePitch: fallback.aggressivePitch,
    status: 'complete',
  };
}
