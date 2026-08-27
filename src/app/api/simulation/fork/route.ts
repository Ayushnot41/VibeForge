import { NextResponse } from "next/server";
import { FuturePath, Milestone, WeeklyAction } from "@/types/agents";
import { checkRateLimit, DEFAULT_CONFIGS } from "@/lib/rateLimiter";
import { TelemetryLogger } from "@/lib/telemetry";

export async function POST(req: Request) {
  const startTime = Date.now();
  const clientIp = req.headers.get("x-forwarded-for") || "anonymous";

  const rateLimit = checkRateLimit(clientIp, DEFAULT_CONFIGS.publicApi);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before branching new timelines." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const {
      basePath,
      forkMonth = 6,
      pivotDecision = "Shift to enterprise direct sales",
      riskShift = "high",
    }: {
      basePath: FuturePath;
      forkMonth: number;
      pivotDecision: string;
      riskShift: "low" | "medium" | "high";
    } = body;

    if (!basePath || !basePath.milestones) {
      return NextResponse.json({ error: "Valid base path with milestones is required" }, { status: 400 });
    }

    // Re-synthesize downstream milestones post-forkMonth
    const preservedMilestones = basePath.milestones.filter((m) => m.month < forkMonth);
    const downstreamMilestones = basePath.milestones.filter((m) => m.month >= forkMonth);

    const forkedMilestones: Milestone[] = [
      ...preservedMilestones,
      {
        month: forkMonth,
        title: `🔀 Timeline Fork: ${pivotDecision}`,
        description: `Strategic inflection point triggered: ${pivotDecision}. Downstream capital allocation and go-to-market pivot re-routed.`,
        achieved: false,
      },
      ...downstreamMilestones.map((m) => ({
        ...m,
        title: `${m.title} (Forked)`,
        description: `${m.description} Enhanced with accelerated leverage from ${pivotDecision}.`,
      })),
    ];

    // Generate forked weekly actions
    const forkedWeeklyActions: WeeklyAction[] = [
      {
        week: forkMonth * 4 + 1,
        actions: [
          `Execute Inflection Sprint: ${pivotDecision}`,
          "Restructure capital runway & operational roadmap",
          "Align stakeholders with the revised milestone timeline",
        ],
        milestone: `Fork Initiation: ${pivotDecision.substring(0, 24)}`,
      },
      {
        week: forkMonth * 4 + 2,
        actions: [
          "Deploy accelerated customer & market feedback loops",
          "Measure initial conversion rate and qualitative sentiment",
        ],
        milestone: "Feedback Loop Calibration",
      },
    ];

    const currentScore = basePath.probabilityScore || 0.85;
    const forkedPath: FuturePath = {
      ...basePath,
      id: `fork_${Date.now()}`,
      title: `${basePath.title} 🔀 [Fork: ${pivotDecision.substring(0, 24)}]`,
      probabilityScore: Math.min(0.98, Math.max(0.4, currentScore + (riskShift === "high" ? -0.08 : 0.06))),
      summary: `Forked at Month ${forkMonth} with inflection decision: ${pivotDecision}`,
      narrative: `Timeline branched at Month ${forkMonth}. By executing '${pivotDecision}', the downstream trajectory introduces distinct operational dynamics and altered risk-reward asymmetric upside.`,
      milestones: forkedMilestones,
    };

    const duration = Date.now() - startTime;
    TelemetryLogger.logApiRequest("/api/simulation/fork", "POST", 200, duration, clientIp);

    return NextResponse.json({
      success: true,
      forkMonth,
      pivotDecision,
      forkedPath,
      forkedWeeklyActions,
    });
  } catch (error: any) {
    console.error("Timeline fork synthesis error:", error);
    return NextResponse.json({ error: error.message || "Failed to fork timeline" }, { status: 500 });
  }
}
