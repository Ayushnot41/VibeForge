import type { ActionPlan, WeeklyAction } from '@/types/agents';

/**
 * Pure Client-Safe Universal Dynamic Profession Roadmap Generator
 * Creates an authentic, progressive roadmap for ANY career input across ANY number of weeks.
 * Zero server-only dependencies (no OpenRouter, no Node.js APIs).
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
