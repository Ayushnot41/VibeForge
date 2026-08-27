import { NextResponse } from "next/server";
import { runMonteCarloSimulation } from "@/lib/monteCarloEngine";
import { checkRateLimit, DEFAULT_CONFIGS } from "@/lib/rateLimiter";
import { TelemetryLogger } from "@/lib/telemetry";

export async function POST(req: Request) {
  const startTime = Date.now();
  const clientIp = req.headers.get("x-forwarded-for") || "anonymous";

  // Enforce sliding-window rate limit
  const rateLimit = checkRateLimit(clientIp, DEFAULT_CONFIGS.publicApi);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Too many stochastic passes requested." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "Retry-After": String(rateLimit.resetSeconds),
        },
      }
    );
  }

  try {
    const body = await req.json();
    const { timeHorizonMonths = 36, riskProfile = "medium", baseGrowthFactor = 1.08 } = body;

    const result = runMonteCarloSimulation(timeHorizonMonths, riskProfile, baseGrowthFactor);

    const duration = Date.now() - startTime;
    TelemetryLogger.logApiRequest("/api/simulation/monte-carlo", "POST", 200, duration, clientIp);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      {
        headers: {
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(rateLimit.resetSeconds),
        },
      }
    );
  } catch (error: any) {
    console.error("Monte Carlo calculation error:", error);
    return NextResponse.json({ error: error.message || "Failed to execute stochastic simulation" }, { status: 500 });
  }
}
