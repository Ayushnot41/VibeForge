// ============================================================================
// POST /api/chat — Anthropic Claude 3.5 Sonnet & Opus Universal AI Copilot
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { callOpenRouterWithFallback } from "@/lib/openrouterClient";

export const dynamic = "force-dynamic";

export function cleanOutputFormatting(text: string): string {
  if (!text) return "";
  return text
    // Remove all leading hashtags (#, ##, ###) from lines
    .replace(/^#{1,6}\s*/gm, "")
    // Remove all asterisks (*, **, ***) used for bold/italics, keeping text completely clean
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
    // Remove any stray asterisks or hash characters
    .replace(/[*#]/g, "")
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

STRICT FORMATTING REQUIREMENTS:
1. NEVER use any asterisks (*) or hashtags (#) anywhere in your output.
2. DO NOT use bold asterisks (like **word**) or header hashes (like # Title).
3. Use plain text formatting, uppercase labels (like 'Step 1:', 'Key Principle:', 'Action Plan:'), clean numbers (1., 2., 3.), and simple dashes (-) for lists.
4. Use very simple, clean, and engaging language that a common person or a 10-year-old child can easily understand.
5. Maintain a polite, professional, high-clarity tone without unnecessary jargon.
6. When recommending YouTube tutorials, format links cleanly as: [Watch Recommended Guide](https://www.youtube.com/results?search_query=topic+tutorial&sp=CAM%253D)

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
