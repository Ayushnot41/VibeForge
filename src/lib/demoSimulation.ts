import { SimulationState } from "@/types/agents";

export const DEMO_SIMULATION: SimulationState = {
  userInput: {
    currentSituation: "Senior CS & AI student with full-stack skills, looking to build an AI SaaS startup and reach senior engineer velocity.",
    goals: "Build an AI-powered SaaS product to $50k MRR, master agentic workflows, and secure a lead engineering architect role.",
    timeHorizon: "3_years",
    riskTolerance: "aggressive",
  },
  researchInsights: [
    {
      category: "trend",
      title: "Agentic AI & Full-Stack Synergy",
      description: "Autonomous multi-agent systems and real-time WebGL interfaces are commanding 3.8x higher market demand.",
      relevance: 0.95,
      sources: ["TechCrunch 2026", "Gartner AI Trends"],
    },
    {
      category: "opportunity",
      title: "SaaS Micro-Acquisitions & B2B AI Tooling",
      description: "Niche developer productivity tools with gamified retention are achieving profitability within 6 months.",
      relevance: 0.9,
      sources: ["Indie Hackers Report"],
    },
    {
      category: "obstacle",
      title: "Context Switching & Execution Burnout",
      description: "Without structured 12-week cycles, 84% of solo technical founders lose momentum by month 4.",
      relevance: 0.85,
    },
  ],
  trendAnalysis: "Market demand for AI engineers who can bridge LLM orchestration with high-fidelity frontend systems has surged 240% year-over-year.",
  futurePaths: [
    {
      id: "path-optimistic",
      type: "optimistic",
      title: "The Tech Titan Protocol",
      summary: "You execute with ruthless consistency. By Year 2, your AI venture crosses $60k MRR, and you speak as a keynote speaker at Global AI Con.",
      narrative: "You woke up at 5:30 AM every morning and shipped relentlessly. By Month 6, your first prototype went viral on GitHub with 4,000 stars. By Month 18, enterprise contracts funded your private research lab in San Francisco.",
      milestones: [
        { month: 3, title: "Alpha Prototype Launch", description: "Deploy agentic orchestration MVP to first 1,000 beta users.", achieved: true },
        { month: 6, title: "$10k MRR Milestone", description: "Monetize enterprise tier and automate customer onboarding pipeline.", achieved: false },
        { month: 12, title: "Angel Round & Scaling", description: "Secure $500k pre-seed funding and expand core infrastructure.", achieved: false },
        { month: 24, title: "Global Keynote Speaker", description: "Deliver keynote on autonomous agents at International AI Summit.", achieved: false },
        { month: 36, title: "The $100k/mo Dynasty", description: "Achieve self-sustaining growth with 50,000 active developers worldwide.", achieved: false },
      ],
      dailyRoutines: [
        { timeOfDay: "06:00 AM", activity: "High-Cognitive Deep Work (Architecture & AI)", purpose: "Build core algorithms before distractions" },
        { timeOfDay: "01:00 PM", activity: "Growth Engineering & User Interviews", purpose: "Tighten feedback loops and ship improvements" },
        { timeOfDay: "07:00 PM", activity: "Mindset Alignment & Physical Training", purpose: "Sustain peak physical & mental stamina" },
      ],
      probabilityScore: 0.88,
    },
    {
      id: "path-realistic",
      type: "realistic",
      title: "The Senior Staff Architect Path",
      summary: "A steady, high-leverage climb. You lead an elite AI engineering team at a top tech unicorn while growing a $15k MRR side venture.",
      narrative: "You balanced your engineering craft with strategic career moves. Your side projects grew sustainably, giving you full financial autonomy and a lead role.",
      milestones: [
        { month: 4, title: "Staff Architect Promotion", description: "Lead the agentic tooling infrastructure team.", achieved: true },
        { month: 12, title: "Side SaaS Launch", description: "Release developer productivity tooling with 500 paid subscribers.", achieved: false },
        { month: 24, title: "$15k MRR Milestone", description: "Side project generates steady passive cash flow.", achieved: false },
        { month: 36, title: "Financial Sovereignty", description: "Full optionality to go full-time on your own startup.", achieved: false },
      ],
      dailyRoutines: [
        { timeOfDay: "07:00 AM", activity: "Focused Learning & Code Reviews", purpose: "Deepen systems design mastery" },
        { timeOfDay: "02:00 PM", activity: "High-Impact Architectural Decisions", purpose: "Lead team engineering deliverables" },
        { timeOfDay: "08:00 PM", activity: "Side SaaS Development", purpose: "Build independent enterprise value" },
      ],
      probabilityScore: 0.94,
    },
    {
      id: "path-pessimistic",
      type: "pessimistic",
      title: "The Pivot & Rebuild Path",
      summary: "Initial market resistance forces 2 major product pivots. You face severe technical hurdles, but rebuild into an unbreakable operator.",
      narrative: "Your first product failed to find product-market fit. Rather than quitting, you conducted 100 customer discovery calls, pivoted to B2B workflows, and found your niche.",
      milestones: [
        { month: 6, title: "The Reality Check", description: "First MVP stalls; conduct deep teardown and customer discovery.", achieved: false },
        { month: 12, title: "B2B Pivot", description: "Repurpose agent graph architecture for enterprise compliance tooling.", achieved: false },
        { month: 24, title: "Break-even Operations", description: "Achieve cash-flow positive operations through tenacity.", achieved: false },
        { month: 36, title: "The Phoenix Emergence", description: "Emerge as a seasoned, antifragile founder with proven execution grit.", achieved: false },
      ],
      dailyRoutines: [
        { timeOfDay: "07:30 AM", activity: "Root-Cause Analysis & Rapid Prototyping", purpose: "Iterate swiftly out of low-leverage tactics" },
        { timeOfDay: "01:30 PM", activity: "Direct Sales & Outreach", purpose: "Validate demand before writing code" },
      ],
      probabilityScore: 0.72,
    },
  ],
  obstacles: [
    {
      id: "obs-1",
      description: "Scope creep leading to delayed product releases.",
      probability: 0.65,
      mitigation: "Enforce strict 2-week shipping sprints with public accountability.",
    },
    {
      id: "obs-2",
      description: "Market noise and LLM API cost escalation.",
      probability: 0.45,
      mitigation: "Implement token caching, local small-model fallbacks, and usage tiering.",
    },
  ],
  feedbackLoopCount: 1,
  imagePrompts: [
    {
      sceneDescription: "Futuristic high-tech workspace overlooking Tokyo skyline at dawn, holographic terminal code displays, neon ambient lighting, sleek minimalist setup",
      style: "Cyberpunk Cinematic Photorealism, 8k, Unreal Engine 5 render",
      pathId: "path-optimistic",
      milestoneMonth: 3,
    },
    {
      sceneDescription: "Confident modern tech founder presenting on stage at global developer keynote, large holographic diagrams, packed auditorium applauding",
      style: "Cinematic Documentary, 35mm lens, dramatic lighting",
      pathId: "path-optimistic",
      milestoneMonth: 12,
    },
    {
      sceneDescription: "Executive boardroom in high-rise penthouse, signing strategic term sheet, sleek glass architecture, sunset golden hour glow",
      style: "Architectural Digest photography, luxury aesthetic",
      pathId: "path-optimistic",
      milestoneMonth: 24,
    },
    {
      sceneDescription: "State-of-the-art private AI research lab with floating multi-agent status orbs, clean white and violet obsidian glass",
      style: "Sci-Fi Realism, photorealistic DSLR 4k",
      pathId: "path-optimistic",
      milestoneMonth: 36,
    },
  ],
  narrativeScript: `Welcome to your future timeline.
Today is Month 18. You wake up at 5:30 AM in your downtown loft. The city is quiet, bathed in the early golden glow of dawn.
Your terminal screen pulses with live telemetry: 24,000 developers are actively running pipelines built on your platform.
Three years ago, you were overwhelmed by decisions, wondering if your ambitions were too vast. But you made a covenant with yourself: you stopped drifting and started executing the protocol.
Every milestone you hit was the direct mathematical result of weekly consistency. The world sees an overnight triumph. You know it was built block by block, week by week.
This is not fantasy. This is your calculated destiny. Open your protocol and conquer today.`,
  aggressivePitch: "Average is a choice. Greatness is a protocol. You have 120 weeks to build an unassailable tech dynasty — stop hesitating and execute.",
  actionPlan: {
    weeklyActions: [
      {
        week: 1,
        actions: [
          "Audit current technical stack and establish high-velocity Next.js 16 + LangGraph boilerplates.",
          "Implement core agent state graph with validation schemas and fallback mechanisms.",
          "Complete 5 customer discovery interviews with target engineering leads.",
        ],
        milestone: "Foundational Architecture Locked",
      },
      {
        week: 2,
        actions: [
          "Connect OpenRouter API inference pipeline with token limits and streaming responses.",
          "Design 3D command center glassmorphism UI components using Framer Motion.",
          "Set up automated GitHub Actions CI/CD pipeline to Vercel.",
        ],
        milestone: "Core Engine Operational",
      },
      {
        week: 3,
        actions: [
          "Integrate ElevenLabs text-to-speech audio narration player with waveform visualizer.",
          "Deploy Pollinations.ai image prompt routing for real-time future hologram rendering.",
          "Implement local state persistence with 24-hour cache invalidation.",
        ],
        milestone: "Multimodal Pipeline Complete",
      },
      {
        week: 4,
        actions: [
          "Launch private beta to 50 developers and collect structured telemetry feedback.",
          "Optimize WebGL Three.js particle counts for 60 FPS rendering on mobile devices.",
          "Refine AI rival benchmark and motivational health orb decay triggers.",
        ],
        milestone: "Beta Release Deployed",
      },
      {
        week: 5,
        actions: [
          "Implement Stripe and Razorpay dual payment gateways with tier checkouts.",
          "Build public landing page with interactive demonstration and SEO meta tags.",
          "Publish technical architecture breakdown on Hacker News and X.",
        ],
        milestone: "Monetization Live",
      },
      {
        week: 6,
        actions: [
          "Review week-over-week user retention metrics and iterate on onboarding friction.",
          "Add Google Calendar and Apple iCal automated action plan export.",
          "Automate weekly progress email summaries and rival taunt transmissions.",
        ],
        milestone: "Automated Growth Flywheel",
      },
    ],
    habits: [
      {
        name: "Morning Deep Work Sprint",
        frequency: "daily",
        description: "90 minutes of uninterrupted architecture and core coding before checking messages.",
        targetStreak: 30,
      },
      {
        name: "Ship to Production",
        frequency: "weekly",
        description: "Deploy at least one tangible user-facing improvement or bug fix every Friday.",
        targetStreak: 12,
      },
      {
        name: "Physical & Mental Conditioning",
        frequency: "daily",
        description: "45 minutes of strength training or aerobic exercise to maintain cognitive velocity.",
        targetStreak: 60,
      },
    ],
    calendarEvents: [
      {
        title: "VibeForge Weekly Sprint Planning",
        description: "Review past week completion rate, recalibrate tasks, and set top 3 weekly targets.",
        startDate: "2026-09-01T09:00:00Z",
        endDate: "2026-09-01T10:00:00Z",
        recurrence: "FREQ=WEEKLY;BYDAY=MO",
      },
      {
        title: "Deep Architecture Build Block",
        description: "Autonomous agent pipeline coding and WebGL performance tuning.",
        startDate: "2026-09-01T10:30:00Z",
        endDate: "2026-09-01T13:30:00Z",
        recurrence: "FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR",
      },
    ],
    rival: {
      name: "Vector Vance",
      bio: "An AI-powered relentless competitor executing 14 hours a day at 94% velocity.",
      taunts: [
        "I just shipped 4 features while you were deciding your color palette.",
        "Your weekly tasks look light. Did you forget your Year 3 milestones?",
        "I'm 3 weeks ahead on my execution roadmap. Can you catch up?",
      ],
      progressOffset: 12,
    },
  },
  status: "complete",
  errors: [],
  localSavedAt: Date.now(),
};
