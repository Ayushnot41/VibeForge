import { SimulationState } from "@/types/agents";

export const DEMO_SIMULATION: SimulationState = {
  userInput: {
    currentSituation: "College student living in Kolkata with strong communication skills and an analytical mindset.",
    goals: "Become a full-time profitable stock and options trader in 3 years with consistent compound returns and financial independence.",
    timeHorizon: "3_years",
    riskTolerance: "aggressive",
    additionalContext: "Skills: Communication, Analytical mindset. Location: Kolkata, India.",
  },
  researchInsights: [
    {
      category: "trend",
      title: "Algorithmic & Systematic Price Action Surge",
      description: "Over 82% of consistently profitable retail traders rely on rule-based price action combined with defined-risk options strategies rather than emotional speculation.",
      relevance: 0.96,
      sources: ["NSE Market Telemetry 2026", "Journal of Financial Market Dynamics"],
    },
    {
      category: "opportunity",
      title: "Proprietary Trading Firm Capital Allocation",
      description: "Prop firms are funding disciplined traders with up to $200,000 accounts upon passing risk-managed evaluation benchmarks.",
      relevance: 0.92,
      sources: ["Prop Trading Global Review"],
    },
    {
      category: "obstacle",
      title: "Emotional Revenge Trading & Over-Leverage",
      description: "90% of beginners blow up accounts within 90 days due to lack of position sizing rules and revenge trading after losses.",
      relevance: 0.95,
    },
  ],
  trendAnalysis: "Retail participation in Indian & global derivatives has grown 180%. Traders with strict 1% risk rules and mathematical edge maintain positive expected value in all market conditions.",
  futurePaths: [
    {
      id: "path-optimistic",
      type: "optimistic",
      title: "The Sovereign Market Master",
      summary: "You execute with ruthless risk discipline. By Year 2, you manage a funded $100k account and achieve complete financial freedom in Kolkata.",
      narrative: "From your student desk in Kolkata, you committed to chart literacy, risk management, and rigorous journaling. By Month 6, your simulated win rate hit 58% with a 1:2.5 risk-to-reward. By Year 2, you passed elite prop firm challenges, generating steady monthly payouts while trading only 2 hours each morning.",
      milestones: [
        { month: 3, title: "Chart Literacy & Paper Trading Mastery", description: "Completed 100 logged simulated trades with strict 1:2 risk-reward compliance.", achieved: true },
        { month: 6, title: "Micro-Capital Live Transition", description: "Successfully traded small live capital without breaking risk management rules.", achieved: false },
        { month: 12, title: "First Funded Prop Account ($25,000)", description: "Passed Stage 1 & Stage 2 evaluation challenges with zero maximum drawdown violations.", achieved: false },
        { month: 24, title: "Scaling to $100,000 Capital Allocation", description: "Achieved consistent 4-6% monthly compound gains and regular withdrawals.", achieved: false },
        { month: 36, title: "Full-Time Sovereign Trader", description: "Complete financial independence operating your own systematic trading fund from Kolkata.", achieved: false },
      ],
      dailyRoutines: [
        { timeOfDay: "08:15 AM", activity: "Pre-Market Preparation & Level Mapping", purpose: "Identify key Support/Resistance and Open Interest levels before 9:15 AM" },
        { timeOfDay: "09:15 AM", activity: "High-Probability Execution Window (9:15 - 11:30 AM)", purpose: "Execute maximum 2 A+ setups with pre-calculated stop-loss orders" },
        { timeOfDay: "03:45 PM", activity: "Daily Trade Journaling & Mistake Audit", purpose: "Log entries, exits, emotions, and calculate daily R-multiples" },
        { timeOfDay: "07:30 PM", activity: "Psychology & Backtesting Block", purpose: "Backtest 20 historical chart patterns and review risk rules" },
      ],
      probabilityScore: 0.88,
    },
    {
      id: "path-realistic",
      type: "realistic",
      title: "The Systematic Disciplined Trader",
      summary: "A steady, high-probability transition. You master price action and risk rules while finishing your studies, reaching profitability by Month 18.",
      narrative: "You balanced your college studies in Kolkata with 2 hours of daily market mastery. You treated trading as a business rather than a casino, steadily building confidence and capital.",
      milestones: [
        { month: 4, title: "Risk Calculator & System Validation", description: "Built customized position sizing calculator and executed 60 paper trades.", achieved: true },
        { month: 12, title: "Consistent Breakeven & Small Profits", description: "Maintained positive expected value over 150 consecutive live trades.", achieved: false },
        { month: 24, title: "Prop Firm Funded Status ($50,000)", description: "Passed funded trader evaluation and generated first ₹1,50,000 payout.", achieved: false },
        { month: 36, title: "Full-Time Trading Sovereignty", description: "Transitioned from college graduate to self-employed full-time options trader.", achieved: false },
      ],
      dailyRoutines: [
        { timeOfDay: "08:30 AM", activity: "Key Level Mapping & News Screen", purpose: "Identify major daily market structure" },
        { timeOfDay: "09:30 AM", activity: "Disciplined Trade Execution", purpose: "Take only setups matching your written trade checklist" },
        { timeOfDay: "04:00 PM", activity: "Trade Log & Journal Review", purpose: "Track win rate, average risk-to-reward, and emotional control" },
      ],
      probabilityScore: 0.94,
    },
    {
      id: "path-pessimistic",
      type: "pessimistic",
      title: "The Antifragile Risk Guardian",
      summary: "Early volatility and initial drawdown force deep system refinement. You adapt, master strict risk defense, and build resilient long-term profitability.",
      narrative: "An early market crash tested your discipline. Instead of blowing up, your 1% stop-loss protected your capital. You audited every mistake and emerged as an elite risk manager.",
      milestones: [
        { month: 6, title: "The Drawdown Audit", description: "Survived volatile market regime with under 5% total account drawdown.", achieved: false },
        { month: 12, title: "System Overhaul & Strategy Narrowing", description: "Eliminated low-probability indicators and focused 100% on pure Price Action.", achieved: false },
        { month: 24, title: "Recovery & Steady Profitability", description: "Recovered all initial learning drawdown through strict 1:3 risk-reward trades.", achieved: false },
        { month: 36, title: "Battle-Tested Professional Trader", description: "Achieved unshakeable psychological resilience and steady annual returns.", achieved: false },
      ],
      dailyRoutines: [
        { timeOfDay: "08:30 AM", activity: "Risk Limit Setting", purpose: "Define hard daily loss limit (max 2% of account per day)" },
        { timeOfDay: "09:30 AM", activity: "Patient Level Observation", purpose: "Wait for price to hit key zones without chasing" },
        { timeOfDay: "05:00 PM", activity: "Deep Backtesting & Psychology Log", purpose: "Review discipline scorecard" },
      ],
      probabilityScore: 0.76,
    },
  ],
  obstacles: [
    {
      id: "obs-1",
      description: "FOMO (Fear of Missing Out) and entering trades without a validated checklist.",
      probability: 0.75,
      mitigation: "Enforce a mandatory physical 5-point checklist that must be signed before placing any order.",
    },
    {
      id: "obs-2",
      description: "Revenge trading to recover losses quickly after a red trade.",
      probability: 0.7,
      mitigation: "Hard terminal shutdown rule: Close TradingView and brokerage app immediately after 2 consecutive stop-losses.",
    },
    {
      id: "obs-3",
      description: "Capital constraints while transitioning from college student to full-time.",
      probability: 0.6,
      mitigation: "Trade paper/micro-capital first, then leverage proprietary trading firm evaluation challenges ($25k-$100k funded).",
    },
  ],
  imagePrompts: [
    {
      sceneDescription: "College student in Kolkata studying candlestick charts on TradingView late at night, glowing neon monitors, clean notebook with handwritten trading rules, high aesthetic visual study blueprint",
      style: "Notebook Infographic Blueprint",
      pathId: "path-optimistic",
      milestoneMonth: 3,
    },
    {
      sceneDescription: "Modern dual-screen trading workstation with TradingView price action charts, risk-management position size calculator open, structured notebook checklist with green checkmarks",
      style: "Notebook Infographic Blueprint",
      pathId: "path-optimistic",
      milestoneMonth: 6,
    },
    {
      sceneDescription: "Trader receiving official prop firm funded certificate notification on laptop screen, financial charts in background, sleek modern desk setup in Kolkata high-rise",
      style: "Notebook Infographic Blueprint",
      pathId: "path-optimistic",
      milestoneMonth: 12,
    },
    {
      sceneDescription: "Professional full-time trader executing morning market routine at luxury penthouse trading desk overlooking Kolkata skyline, four ultra-wide monitors displaying live price structure",
      style: "Notebook Infographic Blueprint",
      pathId: "path-optimistic",
      milestoneMonth: 24,
    },
    {
      sceneDescription: "Master options and equity trader celebrating 3 years of financial independence, complete trading sovereignty, elegant modern workspace bathed in golden sunrise light",
      style: "Notebook Infographic Blueprint",
      pathId: "path-optimistic",
      milestoneMonth: 36,
    },
  ],
  narrativeScript: `Welcome to your future timeline.
Today is Year 3. You wake up at 7:00 AM in your high-rise apartment overlooking the Kolkata skyline.
Three years ago, you were a college student with big ambitions, wondering how to bridge the gap from studying textbooks to conquering the financial markets.
You made a covenant with yourself: you stopped gambling on random tips and started executing the protocol.
You mastered Japanese candlesticks, locked in the unbreakable 1% risk rule, paper-traded 100 setups, and built unbreakable psychological discipline.
Today, you manage a multi-crore funded portfolio, trading only 2 hours each morning with absolute clarity and complete financial freedom.
This is not fantasy. This is your calculated destiny. Open your execution protocol and conquer today.`,
  aggressivePitch: "The financial markets take from the undisciplined and reward the relentless. As a student in Kolkata, your greatest asset is time and focus. Master your risk, control your emotions, and execute.",
  actionPlan: {
    weeklyActions: [
      {
        week: 1,
        actions: [
          "Mental Synchronization: Commit to the 1% risk rule — never risk more than 1% of account capital on any single trade. [📺 Watch Trading Psychology & Discipline Guide](https://www.youtube.com/results?search_query=trading+psychology+and+discipline+for+beginners&sp=CAM%253D)",
          "Account Setup: Open a TradingView account and Demat brokerage account. Set up clean candlestick charts on Nifty 50 and Bank Nifty. [🎥 Watch TradingView Complete Beginner Tutorial](https://www.youtube.com/results?search_query=tradingview+tutorial+for+beginners+complete+guide&sp=CAM%253D)",
          "Candlestick Literacy: Master Bullish/Bearish Engulfing, Hammer, Shooting Star, and multi-timeframe analysis (Daily, 1-Hour, 15-Minute). [📺 Watch Candlestick Patterns Masterclass](https://www.youtube.com/results?search_query=candlestick+patterns+for+beginners+complete+guide&sp=CAM%253D)",
          "Daily Routine: Spend 30 minutes each morning from 9:00 AM to 9:30 AM observing market open price structure without placing orders. [🎥 Watch How to Read Market Structure](https://www.youtube.com/results?search_query=how+to+read+market+structure+for+beginners&sp=CAM%253D)",
        ],
        milestone: "Chart Literacy & Trading Station Setup Complete",
      },
      {
        week: 2,
        actions: [
          "Mental Synchronization: Accept that losses are simply the cost of doing business in trading. Quality of execution is your only metric. [📺 Watch Risk Management & The 1% Rule](https://www.youtube.com/results?search_query=risk+management+in+trading+1+percent+rule&sp=CAM%253D)",
          "Position Sizing: Build an Excel position sizing calculator that determines exact quantity and stop-loss levels before entering any trade. [🎥 Watch Position Sizing Calculator Guide](https://www.youtube.com/results?search_query=position+sizing+and+risk+reward+ratio+trading&sp=CAM%253D)",
          "Risk-to-Reward Ratio: Understand why a 1:2 minimum risk-to-reward ratio guarantees profitability even with a 45% win rate. [📺 Watch Risk-Reward Ratio Masterclass](https://www.youtube.com/results?search_query=risk+to+reward+ratio+trading+strategy&sp=CAM%253D)",
          "Order Types: Practice placing Limit, Market, Stop-Loss Market (SL-M), and GTT orders on your trading platform. [🎥 Watch How to Place Stop Loss Orders Properly](https://www.youtube.com/results?search_query=how+to+place+stop+loss+orders+in+trading&sp=CAM%253D)",
        ],
        milestone: "Capital Preservation & Risk Shield Operational",
      },
      {
        week: 3,
        actions: [
          "Mental Synchronization: Practice extreme patience. Wait for the market to come to your key price levels rather than chasing green candles. [📺 Watch Price Action Trading Basics](https://www.youtube.com/results?search_query=price+action+trading+strategies+for+beginners&sp=CAM%253D)",
          "Support & Resistance: Learn how to draw clean Support, Resistance, and Supply/Demand zones on Daily and 1-Hour charts. [🎥 Watch How to Draw Support and Resistance Zones](https://www.youtube.com/results?search_query=how+to+draw+support+and+resistance+zones&sp=CAM%253D)",
          "Trend Identification: Learn to identify Uptrends (Higher Highs/Higher Lows), Downtrends, and Sideways ranges. [📺 Watch Market Trend Analysis Tutorial](https://www.youtube.com/results?search_query=market+trend+analysis+price+action&sp=CAM%253D)",
          "Level Mapping: Mark key weekly high/low levels on 5 liquid assets (Nifty 50, Bank Nifty, Reliance, HDFC Bank, Tata Motors). [🎥 Watch Live Market Level Mapping](https://www.youtube.com/results?search_query=live+market+analysis+price+action+levels&sp=CAM%253D)",
        ],
      },
      {
        week: 4,
        actions: [
          "Mental Synchronization: Treat your paper trading account with the exact same emotional respect as real money. [📺 Watch How to Paper Trade on TradingView](https://www.youtube.com/results?search_query=how+to+paper+trade+on+tradingview+step+by+step&sp=CAM%253D)",
          "Virtual Trading Launch: Start a ₹1,00,000 virtual trading account. Execute a maximum of 2 trades per day following your written rules. [🎥 Watch Paper Trading Live Execution Demo](https://www.youtube.com/results?search_query=paper+trading+live+session+for+beginners&sp=CAM%253D)",
          "Trading Journal: Maintain a detailed spreadsheet recording: Date, Asset, Entry Price, Stop Loss, Target, Risk-Reward, Reason, and Emotion. [📺 Watch How to Keep a Trading Journal](https://www.youtube.com/results?search_query=how+to+keep+a+trading+journal+spreadsheet&sp=CAM%253D)",
          "Month 1 Review: Audit your first 15 paper trades. Calculate win rate, profit factor, and identify any emotional rule breaks. [🎥 Watch Trade Performance Review & Error Audit](https://www.youtube.com/results?search_query=how+to+review+trading+performance+and+mistakes&sp=CAM%253D)",
        ],
        milestone: "Month 1 Paper Trading Certification Achieved",
      },
      {
        week: 5,
        actions: [
          "Mental Synchronization: Master trend-following mindset. Trade what you see on the chart, not what you think or hope will happen. [📺 Watch Trend Trading Strategies](https://www.youtube.com/results?search_query=trend+following+trading+strategy+beginners&sp=CAM%253D)",
          "Moving Averages: Master the 20 EMA (dynamic pullback support) and 200 EMA (institutional baseline trend). [🎥 Watch Moving Averages Trading Strategy Guide](https://www.youtube.com/results?search_query=20+ema+200+ema+trading+strategy&sp=CAM%253D)",
          "Breakout vs Pullback: Learn high-probability breakout confirmation (volume + retest) vs false breakouts. [📺 Watch How to Trade Breakouts and Retests](https://www.youtube.com/results?search_query=breakout+and+retest+trading+strategy&sp=CAM%253D)",
          "Backtesting: Backtest 30 EMA pullback setups on historical Nifty 50 charts and record your win-rate metrics. [🎥 Watch How to Backtest on TradingView](https://www.youtube.com/results?search_query=how+to+backtest+a+trading+strategy+on+tradingview&sp=CAM%253D)",
        ],
      },
      {
        week: 6,
        actions: [
          "Mental Synchronization: Respect options leverage. Options are risk-transfer instruments, not lottery tickets. [📺 Watch Options Trading for Beginners](https://www.youtube.com/results?search_query=options+trading+basics+for+beginners+complete+guide&sp=CAM%253D)",
          "Options Fundamentals: Learn Calls (CE), Puts (PE), Strike Prices (ITM, ATM, OTM), and Expiry mechanics. [🎥 Watch Call and Put Options Explained Simply](https://www.youtube.com/results?search_query=call+and+put+options+explained+with+examples&sp=CAM%253D)",
          "Option Greeks: Master Delta (price movement sensitivity) and Theta (time decay) to understand premium decay. [📺 Watch Option Greeks Delta Theta Vega Explained](https://www.youtube.com/results?search_query=option+greeks+delta+theta+gamma+vega+explained&sp=CAM%253D)",
          "Option Chain Analysis: Learn how to read Open Interest (OI) and Change in OI to identify institutional support/resistance. [🎥 Watch How to Read Option Chain Analysis](https://www.youtube.com/results?search_query=how+to+read+option+chain+for+nifty+and+banknifty&sp=CAM%253D)",
        ],
        milestone: "Options Trading & Derivatives Fundamentals Locked",
      },
      {
        week: 7,
        actions: [
          "Mental Synchronization: Always trade defined-risk strategies where your maximum loss is capped before you press buy. [📺 Watch Defined Risk Option Strategies](https://www.youtube.com/results?search_query=defined+risk+options+strategies&sp=CAM%253D)",
          "Bull Call & Bear Put Spreads: Learn how debit spreads reduce capital cost and eliminate overnight wipeout risk. [🎥 Watch Bull Call and Bear Put Spread Tutorial](https://www.youtube.com/results?search_query=bull+call+spread+and+bear+put+spread+explained&sp=CAM%253D)",
          "Credit Spreads & Iron Condors: Learn how to sell high-probability options credit spreads to profit from sideways consolidation. [📺 Watch Iron Condor and Credit Spreads Guide](https://www.youtube.com/results?search_query=iron+condor+options+strategy+for+beginners&sp=CAM%253D)",
          "Option Simulation: Place 5 simulated option spread trades on Sensibull or Opstra and monitor daily Greek changes. [🎥 Watch Sensibull and Opstra Options Strategy Builder](https://www.youtube.com/results?search_query=sensibull+strategy+builder+tutorial&sp=CAM%253D)",
        ],
      },
      {
        week: 8,
        actions: [
          "Mental Synchronization: Emotional discipline is 80% of trading success. Read key chapters from 'Trading in the Zone'. [📺 Watch Trading in the Zone by Mark Douglas Summary](https://www.youtube.com/results?search_query=trading+in+the+zone+mark+douglas+summary&sp=CAM%253D)",
          "Micro-Capital Live Transition: Fund your brokerage account with a small ₹10,000 real risk capital. Limit risk to ₹100-₹150 per trade. [🎥 Watch How to Start Real Money Trading with Small Capital](https://www.youtube.com/results?search_query=how+to+trade+with-small-capital-for-beginners&sp=CAM%253D)",
          "Execution Protocol: Execute 1 live trade per day strictly matching your 5-point setup checklist. [📺 Watch Live Trading Rules & Psychology Execution](https://www.youtube.com/results?search_query=live+intraday+trading-rules-discipline&sp=CAM%253D)",
          "Quarter 2 Milestone Review: Audit your real vs simulated execution emotions. Ensure zero revenge trades occurred. [🎥 Watch How to Audit Your Trading Mindset](https://www.youtube.com/results?search_query=how-to-fix-emotional-trading-mistakes&sp=CAM%253D)",
        ],
        milestone: "Month 2 Live Micro-Capital Transition Complete",
      },
      {
        week: 9,
        actions: [
          "Mental Synchronization: Overcome fear of pulling the trigger. When your setup criteria are met, execute without hesitation. [📺 Watch Overcoming Fear and Hesitation in Trading](https://www.youtube.com/results?search_query=how+to+overcome+fear+in+trading&sp=CAM%253D)",
          "Prop Firm Introduction: Research top global and Indian proprietary trading firms (FTMO, FundedNext, 5%ers). [🎥 Watch Prop Firm Trading Explained Step by Step](https://www.youtube.com/results?search_query=prop+firm+trading+explained+for+beginners&sp=CAM%253D)",
          "Challenge Rules: Study evaluation metrics: Maximum Daily Loss (5%), Maximum Total Loss (10%), and Profit Target (8-10%). [📺 Watch How to Pass a Prop Firm Challenge](https://www.youtube.com/results?search_query=how+to+pass+prop+firm+challenge+rules&sp=CAM%253D)",
          "Prop Challenge Practice: Run a 30-day simulated prop firm challenge with exact drawdown limits. [🎥 Watch Prop Firm Simulation Backtesting](https://www.youtube.com/results?search_query=prop+firm+evaluation+practice+session&sp=CAM%253D)",
        ],
      },
      {
        week: 10,
        actions: [
          "Mental Synchronization: Understand the math of compounding. A consistent 4% monthly gain on a funded account generates life-changing income. [📺 Watch The Power of Compounding in Trading](https://www.youtube.com/results?search_query=compounding-gains-in-trading-accounts&sp=CAM%253D)",
          "Prop Challenge Launch: Register for your first $10,000 or $25,000 funded evaluation challenge. [🎥 Watch Taking Your First Prop Firm Evaluation](https://www.youtube.com/results?search_query=taking+first+prop+firm+challenge+step+by+step&sp=CAM%253D)",
          "Daily Risk Protocol: Strictly cap daily loss at 1% of the challenge account. Never take more than 2 trades per session. [📺 Watch Daily Loss Limits & Drawdown Protection](https://www.youtube.com/results?search_query=how+to-manage-drawdown-in-prop-firms&sp=CAM%253D)",
          "Weekly Performance Log: Submit weekly journal logs and ensure average win/loss ratio stays above 1.8. [🎥 Watch Prop Firm Trade Review & Analytics](https://www.youtube.com/results?search_query=how+to-pass-funded-trader-evaluations&sp=CAM%253D)",
        ],
      },
      {
        week: 11,
        actions: [
          "Mental Synchronization: Maintain zero emotional attachment to daily P&L. Focus purely on flawless trade execution. [📺 Watch Detaching Emotions from Money in Trading](https://www.youtube.com/results?search_query=detaching-emotions-from-money-trading&sp=CAM%253D)",
          "Evaluation Phase 2: Complete the Stage 2 consistency verification phase of your funded evaluation. [🎥 Watch Passing Phase 2 Prop Challenge](https://www.youtube.com/results?search_query=passing-phase-2-prop-firm-challenge&sp=CAM%253D)",
          "Risk Scaling: Fine-tune lot sizing as equity reaches evaluation profit threshold. [📺 Watch Risk Scaling Techniques in Trading](https://www.youtube.com/results?search_query=how-to-scale-trading-positions-safely&sp=CAM%253D)",
          "Milestone Verification: Complete funded trader KYC and receive live funded account credentials. [🎥 Watch Funded Trader Verification & Account Setup](https://www.youtube.com/results?search_query=funded-trader-certificate-and-payout-setup&sp=CAM%253D)",
        ],
        milestone: "Funded Trader Certification & Capital Allocation Unlocked",
      },
      {
        week: 12,
        actions: [
          "Mental Synchronization: You have officially crossed the threshold from college student to professional systematic trader. Protect your edge with continuous humility. [📺 Watch The Professional Trader Mindset & Routine](https://www.youtube.com/results?search_query=professional-trader-daily-routine-mindset&sp=CAM%253D)",
          "First Live Funded Payout: Execute your first month on the funded account and request your first 80/20 profit split payout. [🎥 Watch Prop Firm Profit Withdrawal & Taxation Guide](https://www.youtube.com/results?search_query=prop-firm-profit-payout-withdrawal-guide&sp=CAM%253D)",
          "Capital Scaling Roadmap: Set up the 3-year scaling trajectory from $25k to $200k in managed trading capital. [📺 Watch How to Scale from $25k to $200k Trading Capital](https://www.youtube.com/results?search_query=how-to-scale-trading-capital-to-six-figures&sp=CAM%253D)",
          "Sovereign Independence: Establish your full-time trading hours (9:15 AM - 11:30 AM), leaving the rest of the day for health, learning, and freedom. [🎥 Watch Designing Your Full-Time Trader Lifestyle](https://www.youtube.com/results?search_query=full-time-trader-lifestyle-and-routine&sp=CAM%253D)",
        ],
        milestone: "Full-Time Trader Transformation Complete • 3-Year Master Protocol Live",
      },
    ],
    habits: [
      {
        name: "Morning Market Preparation (08:30 AM)",
        frequency: "daily",
        description: "Analyze pre-market index futures, global cues, and mark key Support/Resistance zones.",
        targetStreak: 90,
      },
      {
        name: "Strict 1% Risk Rule Compliance",
        frequency: "daily",
        description: "Never risk more than 1% of total account capital on any single trade.",
        targetStreak: 120,
      },
      {
        name: "Daily Trade Journaling & Mistake Audit",
        frequency: "daily",
        description: "Record every entry, exit, screenshot, risk-reward ratio, and emotional state in your journal.",
        targetStreak: 90,
      },
      {
        name: "Weekend Backtesting & Strategy Review",
        frequency: "weekly",
        description: "Backtest 20 chart setups every Saturday to refine strategy edge.",
        targetStreak: 24,
      },
    ],
    calendarEvents: [
      {
        title: "Trading Station & Chart Literacy Setup",
        description: "Configure TradingView layout, candlestick templates, and Demat brokerage account.",
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
      },
      {
        title: "Paper Trading Simulation Launch",
        description: "Begin 30-day virtual trading simulation with strict 1:2 risk-reward execution.",
        startDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      },
      {
        title: "Micro-Capital Live Trading Transition",
        description: "Transition from paper trading to ₹10,000 live risk capital.",
        startDate: new Date(Date.now() + 60 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 60 * 86400000).toISOString(),
      },
      {
        title: "Prop Firm Funded Challenge Registration",
        description: "Enroll in your first $25,000 funded trader evaluation challenge.",
        startDate: new Date(Date.now() + 90 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 90 * 86400000).toISOString(),
      },
    ],
    rival: {
      name: "The Disciplined Trader",
      bio: "They follow their 1% risk rules without hesitation, never revenge trade, and review their journal every evening. Every day you execute your plan, you build an unbreakable edge.",
      taunts: [
        "I followed my risk rules and closed my terminal on time today. Did you?",
        "Emotions blow up accounts. Discipline prints returns.",
        "Consistency is my edge. What is yours?",
      ],
      progressOffset: 7,
    },
  },
  status: "complete",
  errors: [],
  feedbackLoopCount: 0,
};
