// ============================================================================
// Deployer Agent — Action Protocol & Implementation Curriculum Engine
// Powered by Grok 4.6 (Research/Curriculum) & Anthropic Claude Opus 5 / Sonnet 5
// Creates 100% personalized, beginner-friendly weekly action plans with top-rated YouTube links.
// ============================================================================

import { SimulationAnnotation } from './state';
import type { ActionPlan, FuturePath, WeeklyAction } from '@/types/agents';
import { callOpenRouterWithFallback, extractJsonFromResponse } from '@/lib/openrouterClient';

const DEPLOYER_SYSTEM_PROMPT = `You are an elite master coach and personal career transformation strategist. Your mission is to take the user from their CURRENT BACKGROUND (e.g. Student in Kolkata, Beginner, Jobseeker, etc.) and guide them step-by-step to achieve their EXACT TARGET CAREER / GOAL (e.g. Profitable Trader, Doctor, Athlete, Founder, Artist, etc.).

CRITICAL FIDELITY RULES:
1. STRICT DOMAIN RELEVANCE: 100% of all weekly tasks, habits, and milestones MUST strictly focus on the user's EXACT target goal and profession.
   - For example, if the user is a STUDENT wanting to become a TRADER: Every single week must teach financial markets, opening a trading/Demat account (e.g. Zerodha, Groww, TradingView in India), understanding Price Action & Candlestick patterns, Risk-to-Reward ratio (1:2 rule), Risk Management (never risking >1% per trade), Paper Trading with virtual capital, Backtesting 100 setups, Trading Psychology, and scaling capital.
   - NEVER output software development, coding, web development, or Next.js tasks unless the user's goal was EXPLICITLY to become a software developer.
2. CHILD-LEVEL SIMPLICITY: The language must be ultra-simple, practical, and crystal-clear so that a 10-year-old or complete beginner can follow it immediately without confusion:
   - What to do in simple words.
   - Step-by-step instructions on what app/tool to open and how to practice.
   - Clear tangible deliverable for that week.
3. LIVE TOP-RATED YOUTUBE TUTORIALS: Every single action MUST end with a targeted YouTube search tutorial link sorted by highest views and reviews:
   "[Watch Top-Rated Tutorial ⭐](https://www.youtube.com/results?search_query=relevant+topic+tutorial+for+beginners&sp=CAM%253D)"
   (The parameter &sp=CAM%253D automatically sorts YouTube results by highest view count).
4. The FIRST action of each week MUST be a "Mental Synchronization Task" to prime their discipline and focus.

Return your response as a valid JSON object matching this exact schema:
{
  "aggressivePitch": string (A high-adrenaline, motivational executive pitch tailored directly to their target profession, e.g. for a trader: "The financial markets take from the undisciplined and reward the relentless. Master your risk, control your emotions, and execute."),
  "weeklyActions": [
    {
      "week": number (1 to 12),
      "actions": string[] (3-5 specific, step-by-step, beginner-friendly actions tailored to their exact goal, each ending with a live YouTube search link),
      "milestone": string (optional, milestone name if this week completes a key checkpoint)
    }
  ],
  "habits": [
    {
      "name": string,
      "frequency": "daily" | "weekly" | "monthly",
      "description": string (Simple, practical habit tailored to their target profession),
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
    "name": string (A realistic rival striving for the exact same profession),
    "bio": string (Why they are disciplined and currently ahead),
    "taunts": string[] (3 aggressive taunts to keep the user focused),
    "progressOffset": number (Days ahead)
  }
}

CRITICAL RULES:
- 'weeklyActions' MUST contain 12 weeks. NEVER return 0 weeks.
- Each week MUST have 3-5 comprehensive actions.
- Return ONLY the JSON object without markdown fences.`;

function buildUserPrompt(state: typeof SimulationAnnotation.State): string {
  const { userInput, futurePaths, obstacles } = state;

  const realisticPath: FuturePath | undefined =
    futurePaths.find((p) => p.type === 'realistic') ?? futurePaths[0];

  const startDate = new Date().toISOString().split('T')[0];
  const topObstacles = obstacles
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  return `## USER PROFILE & CAREER TRANSITION
**Current Situation:** ${userInput.currentSituation}
**Target Goal / Career:** ${userInput.goals}
**Time Horizon:** ${userInput.timeHorizon.replace('_', ' ')}
**Risk Tolerance:** ${userInput.riskTolerance}
${userInput.additionalContext ? `**Additional Context:** ${userInput.additionalContext}` : ''}
**Start Date:** ${startDate}

## REALISTIC SCENARIO: "${realisticPath?.title || 'The Realistic Transformation'}"
${realisticPath?.narrative || ''}

### Target Milestones
${(realisticPath?.milestones || []).map((m) => `- Month ${m.month}: ${m.title} — ${m.description}`).join('\n')}

### Target Daily Routines
${(realisticPath?.dailyRoutines || []).map((r) => `- ${r.timeOfDay}: ${r.activity} (${r.purpose})`).join('\n')}

### Obstacles to Overcome
${topObstacles.map((o) => `- ${o.description} — Mitigation: ${o.mitigation}`).join('\n')}

MANDATE: Build the exact 12-week step-by-step action roadmap to take this person from "${userInput.currentSituation}" to achieving "${userInput.goals}". Every single action must be 100% specific to "${userInput.goals}". Keep language simple enough for a beginner and attach high-view YouTube tutorial links to each step.`;
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
            name: String(parsed.rival.name ?? 'The Dedicated Rival'),
            bio: String(parsed.rival.bio ?? 'They are grinding every single day toward the same goal.'),
            taunts: Array.isArray(parsed.rival.taunts) ? parsed.rival.taunts.map(String) : ['I practiced today. Did you?', 'Discipline beats talent every time.', 'No excuses.'],
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
 * Generate a dynamic fallback action plan strictly based on the user's specific goals.
 */
function generateFallbackPlan(goals: string, situation: string): { actionPlan: ActionPlan; aggressivePitch: string } {
  console.warn('[Deployer] Generating dynamic domain fallback plan for:', goals);
  const goalKeyword = encodeURIComponent(goals.split(' ').slice(0, 4).join(' '));
  const isTrading = /trad(e|ing|er)|stock|forex|crypto|market|nifty/i.test(goals);
  const isCreator = /youtub|content creator|freelanc|influencer|video edit|channel|podcast/i.test(goals);

  const weeks: WeeklyAction[] = [];

  if (isTrading) {
    // Specific high-yield Trading curriculum
    const tradingWeeks = [
      {
        week: 1,
        title: "Market Fundamentals & Setting Up",
        actions: [
          "Mental Synchronization: Write down your trading rules and commit to never risking more than 1% of your account on any trade. [Watch Trading Psychology Guide ⭐](https://www.youtube.com/results?search_query=trading+psychology+and+discipline+for+beginners&sp=CAM%253D)",
          "Account Setup: Open a free TradingView account and a Demat trading account (e.g. Zerodha/Groww). Learn how to navigate candlestick charts. [Watch TradingView Complete Tutorial ⭐](https://www.youtube.com/results?search_query=tradingview+tutorial+for+beginners+complete+guide&sp=CAM%253D)",
          "Chart Basics: Study Japanese Candlesticks, Bullish/Bearish bars, and timeframe analysis (Daily, 4-Hour, 15-Minute). [Watch Candlestick Patterns Masterclass ⭐](https://www.youtube.com/results?search_query=candlestick+patterns+for+beginners+complete+guide&sp=CAM%253D)",
          "Daily Routine: Spend 30 minutes every morning observing the market open and identifying major price levels. [Watch How to Read Market Structure ⭐](https://www.youtube.com/results?search_query=how+to+read+market+structure+for+beginners&sp=CAM%253D)",
        ],
        milestone: "Trading Setup & Chart Literacy Complete",
      },
      {
        week: 2,
        title: "Risk Management & The 1% Rule",
        actions: [
          "Mental Synchronization: Accept that losing trades are part of the business. Focus on execution quality over profit. [Watch Risk Management Rules ⭐](https://www.youtube.com/results?search_query=risk+management+in+trading+1+percent+rule&sp=CAM%253D)",
          "Position Sizing: Build a Position Size Calculator spreadsheet to calculate exact lot sizes and stop-loss levels before entering any trade. [Watch Position Sizing Calculator Guide ⭐](https://www.youtube.com/results?search_query=position+sizing+and+risk+reward+ratio+trading&sp=CAM%253D)",
          "Risk-to-Reward Ratio: Learn why a 1:2 or 1:3 minimum risk-to-reward ratio guarantees profitability even with a 45% win rate. [Watch Risk Reward Ratio Masterclass ⭐](https://www.youtube.com/results?search_query=risk+to+reward+ratio+trading+strategy&sp=CAM%253D)",
          "Simulation: Practice setting Stop-Loss and Take-Profit orders on 10 historical charts. [Watch How to Set Stop Loss Accurately ⭐](https://www.youtube.com/results?search_query=how+to+set+stop+loss+in+trading+properly&sp=CAM%253D)",
        ],
        milestone: "Risk Management & Capital Preservation Shield",
      },
      {
        week: 3,
        title: "Price Action & Key Levels",
        actions: [
          "Mental Synchronization: Practice patience. Wait for the market to come to your key price levels instead of chasing candles. [Watch Price Action Basics ⭐](https://www.youtube.com/results?search_query=price+action+trading+strategies+for+beginners&sp=CAM%253D)",
          "Support & Resistance: Learn how to draw clean Support, Resistance, and Supply/Demand zones on Daily and 1-Hour charts. [Watch Support and Resistance Complete Guide ⭐](https://www.youtube.com/results?search_query=how+to+draw+support+and+resistance+zones&sp=CAM%253D)",
          "Trend Identification: Learn how to identify Uptrends (Higher Highs/Higher Lows) vs Downtrends vs Consolidation. [Watch Trend Analysis Tutorial ⭐](https://www.youtube.com/results?search_query=market+trend+analysis+price+action&sp=CAM%253D)",
          "Exercise: Mark key levels on 5 top liquid assets (Nifty 50, Bank Nifty, EUR/USD, Apple, Bitcoin). [Watch Live Market Level Mapping ⭐](https://www.youtube.com/results?search_query=live+market+analysis+price+action+levels&sp=CAM%253D)",
        ],
      },
      {
        week: 4,
        title: "Paper Trading & Execution Practice",
        actions: [
          "Mental Synchronization: Treat your paper trading account with the exact same emotional respect as real money. [Watch Paper Trading Setup ⭐](https://www.youtube.com/results?search_query=how+to+paper+trade+on+tradingview+step+by+step&sp=CAM%253D)",
          "Virtual Trading Launch: Start a ₹1,00,000 paper trading simulation on TradingView or FrontPage. Execute maximum 2 trades per day. [Watch Paper Trading Live Demo ⭐](https://www.youtube.com/results?search_query=paper+trading+live+session+for+beginners&sp=CAM%253D)",
          "Trade Journal: Create a trading journal logging Entry, Stop Loss, Target, Risk-Reward, Reason for entry, and Emotion. [Watch How to Maintain a Trading Journal ⭐](https://www.youtube.com/results?search_query=how+to+keep+a+trading+journal+spreadsheet&sp=CAM%253D)",
          "Weekly Review: Review your first 10 paper trades. Calculate your win rate and average risk-to-reward. [Watch Trade Review & Analytics ⭐](https://www.youtube.com/results?search_query=how+to+review+trading+performance+and+mistakes&sp=CAM%253D)",
        ],
        milestone: "Month 1 Paper Trading Certification",
      },
    ];

    for (let i = 1; i <= 12; i++) {
      if (i <= 4) {
        weeks.push(tradingWeeks[i - 1]);
      } else {
        const phaseNum = Math.floor((i - 1) / 4) + 1;
        weeks.push({
          week: i,
          actions: [
            `Mental Synchronization: Review trading psychology notes. Never revenge trade or over-leverage after a loss. [Watch Trading Psychology Masterclass ⭐](https://www.youtube.com/results?search_query=trading+in+the+zone+mark+douglas+summary&sp=CAM%253D)`,
            `Strategy Refinement: Backtest 20 setups using your defined price action strategy on historical charts. [Watch Backtesting Strategy Guide ⭐](https://www.youtube.com/results?search_query=how+to+backtest+a+trading+strategy+on+tradingview&sp=CAM%253D)`,
            `Live Execution Practice: Log all daily simulated trades and verify 100% compliance with your risk rules. [Watch Live Market Execution ⭐](https://www.youtube.com/results?search_query=price+action+live+trading+session&sp=CAM%253D)`,
            `End of Week Journal Audit: Calculate weekly profit factor, maximum drawdown, and emotional discipline score. [Watch Weekly Trading Journal Audit ⭐](https://www.youtube.com/results?search_query=trading+performance+metrics+and+drawdown&sp=CAM%253D)`,
          ],
          milestone: i % 4 === 0 ? `Phase ${phaseNum} Trading Mastery Checkpoint` : undefined,
        });
      }
    }
  } else if (isCreator) {
    // Specific high-yield Content Creator & YouTuber curriculum
    const creatorWeeks = [
      {
        week: 1,
        title: "Niche Selection & Channel Architecture",
        actions: [
          "Mental Synchronization: Define your unfair advantage and core audience persona. Commit to consistent creation. [Watch Finding Your YouTube Niche ⭐](https://www.youtube.com/results?search_query=how+to+find+your+youtube+niche+for+beginners&sp=CAM%253D)",
          "Channel Setup: Configure YouTube Studio, high-converting channel banner, profile icon, and SEO description. [Watch Complete YouTube Channel Setup Guide ⭐](https://www.youtube.com/results?search_query=youtube+channel+setup+tutorial+step+by+step&sp=CAM%253D)",
          "Topic Ideation: Brainstorm 20 high-demand video topics using YouTube search auto-suggest and Google Trends. [Watch YouTube Video Ideas Research ⭐](https://www.youtube.com/results?search_query=how+to+find+viral+youtube+video+ideas&sp=CAM%253D)",
          "Equipment Prep: Setup your smartphone 4K camera, ring light, and lapel microphone for clean audio. [Watch Best Budget YouTube Equipment Guide ⭐](https://www.youtube.com/results?search_query=budget+youtube+setup+for+beginners&sp=CAM%253D)",
        ],
        milestone: "Channel Architecture & Tech Setup Complete",
      },
      {
        week: 2,
        title: "Video Editing & Visual Storytelling",
        actions: [
          "Mental Synchronization: Overcome camera shyness. The first 10 videos are practice to build confidence. [Watch How to Be Confident on Camera ⭐](https://www.youtube.com/results?search_query=how+to+be+confident+on+camera+youtube&sp=CAM%253D)",
          "Editing Software: Master timeline cutting, B-roll overlays, J/L cuts, and sound effects in CapCut or Premiere Pro. [Watch Video Editing Masterclass for Beginners ⭐](https://www.youtube.com/results?search_query=video+editing+tutorial+for+beginners+capcut+premiere&sp=CAM%253D)",
          "Thumbnail Psychology: Learn high-CTR thumbnail composition (contrast, facial expression, 3-word text limit). [Watch High CTR YouTube Thumbnail Masterclass ⭐](https://www.youtube.com/results?search_query=how+to+make+viral+thumbnails+photoshop+canva&sp=CAM%253D)",
          "First Recording: Record a 60-second test video to verify lighting, audio levels, and eye contact. [Watch YouTube Audio and Lighting Setup ⭐](https://www.youtube.com/results?search_query=youtube+lighting+and+audio+tutorial&sp=CAM%253D)",
        ],
        milestone: "Editing & Thumbnail Mastery Blueprint",
      },
      {
        week: 3,
        title: "Scriptwriting & High-Retention Production",
        actions: [
          "Mental Synchronization: Hook viewers in the first 5 seconds. Eliminate filler words and fluff. [Watch YouTube Scriptwriting Frameworks ⭐](https://www.youtube.com/results?search_query=how+to+write+engaging+youtube+scripts&sp=CAM%253D)",
          "First Full Video: Script and film your first cornerstone 8-minute high-value video. [Watch Filming Your First YouTube Video ⭐](https://www.youtube.com/results?search_query=how+to+film+first+youtube+video&sp=CAM%253D)",
          "Retention Editing: Insert pattern interrupts every 30 seconds (zoom-ins, sound effects, B-roll). [Watch Increasing YouTube Audience Retention ⭐](https://www.youtube.com/results?search_query=how+to+increase+audience+retention+youtube&sp=CAM%253D)",
          "Thumbnail A/B Test: Design 2 distinct thumbnail variations in Canva/Photoshop. [Watch Thumbnail Testing Guide ⭐](https://www.youtube.com/results?search_query=youtube+thumbnail+ab+testing+tutorial&sp=CAM%253D)",
        ],
      },
      {
        week: 4,
        title: "Publishing, SEO & Community Launch",
        actions: [
          "Mental Synchronization: Detach your self-worth from early view counts. Focus on iterative improvement. [Watch Creator Mindset and Consistency ⭐](https://www.youtube.com/results?search_query=youtube+creator+mindset+motivation&sp=CAM%253D)",
          "Publish Video #1: Upload video with optimized title, search tags, chapter timestamps, and pinned comment. [Watch How to Upload Video on YouTube Properly ⭐](https://www.youtube.com/results?search_query=how+to+upload+video+on+youtube+with+seo&sp=CAM%253D)",
          "Shorts Repurposing: Cut 3 vertical Shorts/Reels from the main video to drive organic traffic. [Watch Repurposing Long Form to Shorts ⭐](https://www.youtube.com/results?search_query=how+to+repurpose+youtube+videos+into+shorts&sp=CAM%253D)",
          "Analytics Review: Analyze Click-Through-Rate (CTR) and Average Percentage Viewed (APV) in YouTube Analytics. [Watch Understanding YouTube Analytics ⭐](https://www.youtube.com/results?search_query=how+to+read+youtube+analytics+for+beginners&sp=CAM%253D)",
        ],
        milestone: "Month 1 Content Creator Launch Certified",
      },
    ];

    for (let i = 1; i <= 12; i++) {
      if (i <= 4) {
        weeks.push(creatorWeeks[i - 1]);
      } else {
        const phaseNum = Math.floor((i - 1) / 4) + 1;
        weeks.push({
          week: i,
          actions: [
            `Mental Synchronization: Review creator metrics. Double down on what worked and discard what underperformed. [Watch Scaling YouTube Channel Fast ⭐](https://www.youtube.com/results?search_query=how+to+scale+youtube+channel+views&sp=CAM%253D)`,
            `Weekly Video Production: Script, record, and edit 1 high-value long-form video and 2 Shorts. [Watch Streamlining YouTube Production Workflow ⭐](https://www.youtube.com/results?search_query=youtube+content+creation+workflow&sp=CAM%253D)`,
            `Community & Engagement: Reply to all comments within 2 hours of publishing and post a community poll. [Watch Building Loyal YouTube Community ⭐](https://www.youtube.com/results?search_query=how+to+build+a+loyal+audience+on+youtube&sp=CAM%253D)`,
            `End of Week Performance Audit: Track subscriber velocity, watch hours, and plan next week's packaging. [Watch YouTube Packaging Masterclass ⭐](https://www.youtube.com/results?search_query=youtube+title+and+thumbnail+packaging&sp=CAM%253D)`,
          ],
          milestone: i % 4 === 0 ? `Phase ${phaseNum} Creator Growth Milestone` : undefined,
        });
      }
    }
  } else {
    // Universal career-specific curriculum
    for (let i = 1; i <= 12; i++) {
      weeks.push({
        week: i,
        actions: [
          `Mental Synchronization: Sit for 10 minutes and visualize achieving "${goals}". Write down your top focus for Week ${i}. [Watch Guided Goal Visualization ⭐](https://www.youtube.com/results?search_query=goal+visualization+meditation+beginner&sp=CAM%253D)`,
          `Core Skill Immersion: Follow a structured, beginner-friendly step-by-step masterclass on ${goals.slice(0, 35)}. Practice for 60 minutes. [Watch Top-Rated Masterclass ⭐](https://www.youtube.com/results?search_query=${goalKeyword}+step+by+step+guide+for+beginners&sp=CAM%253D)`,
          `Hands-On Execution: Build one tangible project, exercise, or deliverable toward your goal and document it. [Watch Practical Exercise Guide ⭐](https://www.youtube.com/results?search_query=${goalKeyword}+practical+exercises+and+examples&sp=CAM%253D)`,
          `Weekly Progress Audit: Review what worked, identify 1 mistake to eliminate next week, and set your schedule. [Watch Weekly Review & Goal Tracking ⭐](https://www.youtube.com/results?search_query=weekly+review+and+habit+tracking+methods&sp=CAM%253D)`,
        ],
        milestone: i % 4 === 0 ? `Phase ${Math.floor(i / 4)} Milestone Checkpoint` : undefined,
      });
    }
  }

  return {
    aggressivePitch: `The financial markets and elite professions do not care about excuses. They reward patience, discipline, and ruthless execution. From "${situation}" to "${goals}", your transformation starts with conquering Week 1. Wake up and execute.`,
    actionPlan: {
      weeklyActions: weeks,
      habits: [
        { name: 'Daily Market/Skill Review', frequency: 'daily' as const, description: 'Spend 45 minutes studying charts or core skill material.', targetStreak: 90 },
        { name: 'Risk & Journal Log', frequency: 'daily' as const, description: 'Log every action, decision, and emotional state in your journal.', targetStreak: 90 },
        { name: 'Weekly Performance Audit', frequency: 'weekly' as const, description: 'Calculate win rate, drawdown, and lessons learned every weekend.', targetStreak: 12 },
        { name: 'Mindset & Discipline Routine', frequency: 'daily' as const, description: 'Physical workout and mental focus meditation before market open.', targetStreak: 60 },
      ],
      calendarEvents: [
        { title: 'Sprint Kickoff', description: 'Start your transformation with full commitment.', startDate: new Date().toISOString(), endDate: new Date().toISOString() },
        { title: 'Month 1 Foundation Review', description: 'Evaluate your chart literacy and paper trading metrics.', startDate: new Date(Date.now() + 30 * 86400000).toISOString(), endDate: new Date(Date.now() + 30 * 86400000).toISOString() },
        { title: 'Month 2 Consistency Sprint', description: 'Refine your edge, eliminate emotional trading errors.', startDate: new Date(Date.now() + 60 * 86400000).toISOString(), endDate: new Date(Date.now() + 60 * 86400000).toISOString() },
        { title: 'Quarter 1 Capital Scaling Review', description: 'Comprehensive evaluation of risk metrics and scaling readiness.', startDate: new Date(Date.now() + 84 * 86400000).toISOString(), endDate: new Date(Date.now() + 84 * 86400000).toISOString() },
      ],
      rival: {
        name: 'The Disciplined Trader',
        bio: `They follow their risk rules without hesitation and never overtrade. Every day you execute your plan, you build an unbreakable edge over the competition.`,
        taunts: [
          "I followed my risk rules today. Did you?",
          "Emotions blow up accounts. Discipline prints returns.",
          "Consistency is my edge. What is yours?",
        ],
        progressOffset: 7,
      },
    },
  };
}

/**
 * Expands core weeks into the target number of weeks (e.g. 12, 36, 60, or 120).
 */
/**
 * Expands core weeks into the target number of weeks (e.g. 12, 36, 60, or 120)
 * ensuring every single week is distinct, progressive, and has unique actions.
 */
function expandWeeks(coreWeeks: WeeklyAction[], targetWeeks: number, goals: string): WeeklyAction[] {
  if (coreWeeks.length >= targetWeeks) {
    return coreWeeks.slice(0, targetWeeks);
  }

  const isTrading = /trad(e|ing|er)|stock|forex|crypto|market|nifty/i.test(goals);
  const result: WeeklyAction[] = [];

  // First, add all unique core weeks returned by the LLM
  coreWeeks.forEach((cw, idx) => {
    result.push({
      ...cw,
      week: idx + 1,
    });
  });

  // For remaining weeks (Week coreWeeks.length + 1 to targetWeeks), generate progressive milestones
  for (let w = result.length + 1; w <= targetWeeks; w++) {
    const month = Math.ceil(w / 4);
    const quarter = Math.ceil(w / 12);

    if (isTrading) {
      if (w <= 8) {
        result.push({
          week: w,
          actions: [
            `Mental Synchronization: Review trading psychology and maintain strict 1% risk discipline. [Watch Trading in the Zone Summary ⭐](https://www.youtube.com/results?search_query=trading+in+the+zone+mark+douglas+key+takeaways&sp=CAM%253D)`,
            `Live Chart Analysis: Mark daily support/resistance levels and track price action on Nifty 50 and Bank Nifty during market hours. [Watch Live Price Action Reading ⭐](https://www.youtube.com/results?search_query=live+price+action+reading+nifty+banknifty&sp=CAM%253D)`,
            `Journaling & Review: Log every simulated trade and calculate your weekly profit factor. [Watch Trading Journal Review Process ⭐](https://www.youtube.com/results?search_query=how+to+audit+trading+journal+mistakes&sp=CAM%253D)`,
          ],
          milestone: w % 4 === 0 ? `Month ${month} Risk & Paper Trading Mastery` : undefined,
        });
      } else if (w <= 16) {
        result.push({
          week: w,
          actions: [
            `Capital Transition: Deploy small live capital (₹10,000) with strict 0.5% stop-loss to test real psychology. [Watch Transitioning to Real Money Trading ⭐](https://www.youtube.com/results?search_query=paper+trading+to+real+money+transition+tips&sp=CAM%253D)`,
            `Strategy Optimization: Backtest 30 high-probability setups and refine entry confirmation triggers. [Watch Backtesting Strategies on TradingView ⭐](https://www.youtube.com/results?search_query=how+to+backtest+candlestick+strategies+properly&sp=CAM%253D)`,
            `Emotional Audit: Record any impulsive urge to revenge trade and review how you managed it. [Watch Controlling Fear and Greed in Trading ⭐](https://www.youtube.com/results?search_query=how+to+stop+revenge+trading+and+overtrading&sp=CAM%253D)`,
          ],
          milestone: w % 4 === 0 ? `Quarter ${quarter} Micro-Capital Execution Checkpoint` : undefined,
        });
      } else if (w <= 24) {
        result.push({
          week: w,
          actions: [
            `Funded Account Prep: Practice meeting 8% profit targets with strict 5% max drawdown rules. [Watch Prop Firm Challenge Passing Rules ⭐](https://www.youtube.com/results?search_query=how+to+pass+prop+firm+challenge+step+by+step&sp=CAM%253D)`,
            `Market Regime Analysis: Identify trending vs sideways ranging market conditions. [Watch Identifying Market Conditions ⭐](https://www.youtube.com/results?search_query=how+to+identify+trending+vs+ranging+market&sp=CAM%253D)`,
            `Weekly Performance Metric: Audit Sharpe ratio, win rate, and risk-to-reward consistency. [Watch Trading Performance Statistics Guide ⭐](https://www.youtube.com/results?search_query=trading+performance+metrics+win+rate+risk+reward&sp=CAM%253D)`,
          ],
          milestone: w % 4 === 0 ? `Month ${month} Prop Firm Readiness Checkpoint` : undefined,
        });
      } else {
        result.push({
          week: w,
          actions: [
            `Capital Scaling & Longevity: Scale position sizing systematically by 20% only after 4 consecutive green weeks. [Watch How to Scale Trading Capital Safely ⭐](https://www.youtube.com/results?search_query=how+to+scale+up+position+size+trading&sp=CAM%253D)`,
            `Tax & Business Structure: Setup trading records for Indian tax compliance and accounting. [Watch Income Tax on Trading in India ⭐](https://www.youtube.com/results?search_query=income+tax+on+stock+and+fno+trading+india&sp=CAM%253D)`,
            `Continuous Edge Refinement: Review 100 historical trades to continuously optimize execution edge. [Watch Building Long-Term Trading Edge ⭐](https://www.youtube.com/results?search_query=how+to+build+a+long+term+trading+edge&sp=CAM%253D)`,
          ],
          milestone: w % 4 === 0 ? `Quarter ${quarter} Professional Trader Sovereignty` : undefined,
        });
      }
    } else {
      result.push({
        week: w,
        actions: [
          `Mental Synchronization: Dedicate 15 minutes to review progress and commit to Week ${w} goals. [Watch High Performance Focus ⭐](https://www.youtube.com/results?search_query=high+performance+focus+and+discipline&sp=CAM%253D)`,
          `Skill Execution Sprint: Spend 90 minutes executing the core project or skill milestone for Month ${month}. [Watch Advanced Practical Masterclass ⭐](https://www.youtube.com/results?search_query=${encodeURIComponent(goals.slice(0, 30))}+advanced+tutorials&sp=CAM%253D)`,
          `Feedback & Refinement: Test your deliverable, gather real feedback, and update your strategy. [Watch Feedback Loops for Fast Improvement ⭐](https://www.youtube.com/results?search_query=how+to+get+better+at+skills+fast&sp=CAM%253D)`,
        ],
        milestone: w % 4 === 0 ? `Month ${month} Mastery Checkpoint` : undefined,
      });
    }
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
    '1_year': 12,
    '3_years': 36,
    '5_years': 60,
    '10_years': 120,
  };
  const targetWeeks = timeHorizonWeeks[state.userInput.timeHorizon] || 12;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Deployer] Attempt ${attempt + 1}/${MAX_RETRIES + 1} for goal: "${state.userInput.goals}"`);

      const { content, modelUsed, keyIndexUsed } = await callOpenRouterWithFallback({
        messages: [
          { role: 'system', content: DEPLOYER_SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(state) },
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
      if (result) {
        console.log(`[Deployer] Successfully parsed ${result.actionPlan.weeklyActions.length} weeks. Expanding to ${targetWeeks} weeks.`);
        result.actionPlan.weeklyActions = expandWeeks(result.actionPlan.weeklyActions, targetWeeks, state.userInput.goals);
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

  // Failsafe fallback plan strictly matching the user's career domain
  console.warn('[Deployer] Retries exhausted. Using dynamic domain fallback plan.');
  const fallback = generateFallbackPlan(state.userInput.goals, state.userInput.currentSituation);
  fallback.actionPlan.weeklyActions = expandWeeks(fallback.actionPlan.weeklyActions, targetWeeks, state.userInput.goals);
  return {
    actionPlan: fallback.actionPlan,
    aggressivePitch: fallback.aggressivePitch,
    status: 'complete',
  };
}
