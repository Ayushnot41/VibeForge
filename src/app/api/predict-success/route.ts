import { NextRequest, NextResponse } from "next/server";

export interface SuccessFeatures {
  avg_completion_percent: number;
  completion_trend: number;
  weeks_elapsed_ratio: number;
  num_checkins_missed: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: SuccessFeatures = await req.json();
    const { avg_completion_percent, completion_trend, weeks_elapsed_ratio, num_checkins_missed } = body;

    if (
      avg_completion_percent === undefined ||
      completion_trend === undefined ||
      weeks_elapsed_ratio === undefined ||
      num_checkins_missed === undefined
    ) {
      return NextResponse.json({ error: "All 4 features are required" }, { status: 400 });
    }

    // Try ML service with 1.5s timeout
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);

      const mlRes = await fetch("http://localhost:8000/predict-success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avg_completion_percent, completion_trend, weeks_elapsed_ratio, num_checkins_missed }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (mlRes.ok) {
        const data = await mlRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Service unreachable — return null to let frontend hide the card
    }

    return NextResponse.json({ unavailable: true }, { status: 200 });
  } catch (error) {
    console.error("predict-success error:", error);
    return NextResponse.json({ unavailable: true }, { status: 200 });
  }
}
