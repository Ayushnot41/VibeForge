import { NextRequest, NextResponse } from "next/server";

// Keyword-based fallback when ML service is unreachable
function keywordFallback(goal: string): { category: string; confidence: number } {
  const g = goal.toLowerCase();
  if (g.includes("machine learning") || g.includes(" ml ") || g.includes("ai engineer") || g.includes("deep learning") || g.includes("neural")) {
    return { category: "ml_engineer", confidence: 0.75 };
  }
  if (g.includes("full stack") || g.includes("fullstack") || g.includes("web developer") || g.includes("react") || g.includes("next.js")) {
    return { category: "full_stack_dev", confidence: 0.75 };
  }
  if (g.includes("pilot") || g.includes("airline") || g.includes("aviation") || g.includes("aircraft") || g.includes("atpl") || g.includes("cpl")) {
    return { category: "commercial_pilot", confidence: 0.75 };
  }
  if (g.includes("data scien") || g.includes("data analyst") || g.includes("statistics") || g.includes("pandas") || g.includes("analytics")) {
    return { category: "data_scientist", confidence: 0.75 };
  }
  if (g.includes("product manager") || g.includes("product management") || g.includes(" pm ") || g.includes("roadmap")) {
    return { category: "product_manager", confidence: 0.75 };
  }
  return { category: "other", confidence: 0.6 };
}

export async function POST(req: NextRequest) {
  try {
    const { goal } = await req.json();
    if (!goal || typeof goal !== "string") {
      return NextResponse.json({ error: "goal is required" }, { status: 400 });
    }

    // Try ML service with 1.5s timeout
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);

      const mlRes = await fetch("http://localhost:8000/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: goal }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (mlRes.ok) {
        const data = await mlRes.json();
        return NextResponse.json({
          category: data.category,
          confidence: data.confidence,
          source: "ml",
        });
      }
    } catch {
      // ML service unreachable or timed out — use keyword fallback
    }

    // Fallback: keyword matching
    const fallback = keywordFallback(goal);
    return NextResponse.json({ ...fallback, source: "fallback" });
  } catch (error) {
    console.error("classify-goal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
