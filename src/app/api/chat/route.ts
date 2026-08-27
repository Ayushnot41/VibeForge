// ============================================================================
// POST /api/chat — Anthropic Claude 3.5 Sonnet & Opus Universal AI Copilot
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { callOpenRouterWithFallback } from "@/lib/openrouterClient";

function cleanOutputFormatting(text: string): string {
  if (!text) return "";
  return text
    // Strip leading markdown headers (#, ##, ###) from lines
    .replace(/^#{1,6}\s+/gm, "")
    // Clean redundant decorative asterisk wrappers on leading lines
    .replace(/^\*\*([A-Za-z0-9\s—–:-]+)\*\*\s*$/gm, "$1")
    .trim();
}

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
    const goals = simulationState?.userInput?.goals || "Career Mastery";
    const timeHorizon = simulationState?.userInput?.timeHorizon?.replace("_", " ") || "Custom Timeline";
    const totalWeeks = simulationState?.actionPlan?.weeklyActions?.length || 12;
    const rivalName = simulationState?.actionPlan?.rival?.name || "The Disciplined Rival";
    const rivalLead = simulationState?.actionPlan?.rival?.progressOffset || 7;

    const systemPrompt = `You are the VibeForge Oracle — powered by Anthropic Claude 3.5 Sonnet and Opus intelligence.
You are a universal AI assistant capable of answering ANY question across all subjects (programming, finance, trading, business, math, science, writing, health, psychology, and personal growth).

CRITICAL FORMATTING RULES:
1. NEVER start the first line or headings with hashtags (#, ##, ###).
2. DO NOT use excessive asterisk decorators (*** or ***) on the first lines. Write clean, natural sentences.
3. Use simple, clean, and engaging language that a common person or a 10-year-old child can understand easily.
4. Maintain a polite, professional, high-clarity tone without unnecessary jargon.
5. Use clean numbers (1., 2., 3.) or simple bullet points (-) for step-by-step guidance.
6. When recommending YouTube tutorials, use verified search links formatted as: [Watch Recommended Guide](https://www.youtube.com/results?search_query=topic+tutorial&sp=CAM%253D)

USER CONTEXT (If they ask about their career simulation):
- Starting Baseline: "${currentSituation}"
- Target Goal: "${goals}"
- Timeline Horizon: ${timeHorizon} (${totalWeeks} weekly sprints)
- Adversary Rival: ${rivalName} (+${rivalLead} days lead)`;

    const fullMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const { content, modelUsed } = await callOpenRouterWithFallback({
      messages: fullMessages,
      preferredModels: [
        "anthropic/claude-3.5-sonnet",
        "anthropic/claude-3-opus",
        "anthropic/claude-3.5-sonnet:beta",
        "anthropic/claude-3-haiku",
        "openai/gpt-4o-mini",
      ],
      temperature: 0.65,
      maxTokens: 2500,
    });

    const cleanedContent = cleanOutputFormatting(content || "");

    return NextResponse.json({
      message: {
        role: "assistant",
        content: cleanedContent || "I am ready to help you. What would you like to explore or solve today?",
      },
      modelUsed: modelUsed || "anthropic/claude-3.5-sonnet",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Copilot error";
    console.error("[/api/chat] Error:", message);
    return NextResponse.json(
      {
        message: {
          role: "assistant",
          content:
            "I am ready to guide you. Ask me any question on coding, trading, business, or your roadmap steps.",
        },
      },
      { status: 200 }
    );
  }
}
