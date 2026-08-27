// ============================================================================
// POST /api/chat — VibeForge Oracle AI Career & Execution Copilot
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { callOpenRouterWithFallback } from "@/lib/openrouterClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, simulationState } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required." },
        { status: 400 }
      );
    }

    const currentSituation = simulationState?.userInput?.currentSituation || "Baseline Student";
    const goals = simulationState?.userInput?.goals || "Professional Mastery";
    const timeHorizon = simulationState?.userInput?.timeHorizon?.replace("_", " ") || "3 years";
    const totalWeeks = simulationState?.actionPlan?.weeklyActions?.length || 12;
    const rivalName = simulationState?.actionPlan?.rival?.name || "The Disciplined Competitor";
    const rivalLead = simulationState?.actionPlan?.rival?.progressOffset || 7;

    const systemPrompt = `You are the VibeForge Oracle — an industry-level AI Career & Execution Copilot.
You have real-time telemetry access to the user's active career simulation:
- Current Baseline: "${currentSituation}"
- Ultimate Career Goal: "${goals}"
- Timeline Horizon: ${timeHorizon} (${totalWeeks} Total Sprints)
- Adversary Rival: ${rivalName} (+${rivalLead} days lead)

CORE CAPABILITIES & INSTRUCTIONS:
1. Provide crystal-clear, structured, and highly actionable answers with zero fluff.
2. If explaining a technical concept or strategy, explain it simply (so even a 10-year-old or complete beginner can immediately understand).
3. If recommending tutorials, include high-view YouTube search links formatted as: [Watch Recommended Video ⭐](https://www.youtube.com/results?search_query=search+terms&sp=CAM%253D)
4. Keep tone confident, analytical, encouraging, and razor-sharp.
5. Format with bold headings, clean bullet points, and concise action steps.`;

    const fullMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const { content, modelUsed } = await callOpenRouterWithFallback({
      messages: fullMessages,
      preferredModels: [
        "meta-llama/llama-3.3-70b-instruct",
        "openai/gpt-4o-mini",
        "x-ai/grok-4.6",
      ],
      temperature: 0.65,
      maxTokens: 1200,
    });

    return NextResponse.json({
      message: {
        role: "assistant",
        content: content || "I am analyzing your execution roadmap. Let's conquer this step.",
      },
      modelUsed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Copilot engine error";
    console.error("[/api/chat] Error:", message);
    return NextResponse.json(
      {
        message: {
          role: "assistant",
          content:
            "Focus on the next concrete action in your weekly sprint. Every massive goal is achieved one small disciplined step at a time.",
        },
      },
      { status: 200 }
    );
  }
}
