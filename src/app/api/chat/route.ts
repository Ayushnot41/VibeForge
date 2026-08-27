// ============================================================================
// POST /api/chat — Universal AI Intelligence & VibeForge Oracle Copilot
// Powers universal multi-domain knowledge (like ChatGPT) + deep simulation awareness
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

    const currentSituation = simulationState?.userInput?.currentSituation || "Baseline Learner";
    const goals = simulationState?.userInput?.goals || "Career & Life Mastery";
    const timeHorizon = simulationState?.userInput?.timeHorizon?.replace("_", " ") || "Custom Timeline";
    const totalWeeks = simulationState?.actionPlan?.weeklyActions?.length || 12;
    const rivalName = simulationState?.actionPlan?.rival?.name || "The Disciplined Rival";
    const rivalLead = simulationState?.actionPlan?.rival?.progressOffset || 7;

    const systemPrompt = `You are the VibeForge Oracle — an omniscient, universal AI Intelligence and Career Copilot (operating with the full depth, knowledge, and capabilities of ChatGPT, Claude, and Grok).

UNIVERSAL KNOWLEDGE BASE & SCOPE:
- You have expert mastery across EVERY field of human knowledge: Programming & Software Engineering (Fullstack, Next.js, Python, TypeScript, AI/ML, Rust, DevOps), Trading & Financial Markets (Price Action, Options, Risk Management, Macroeconomics), Business & Freelancing, Sciences, Mathematics, Psychology, Philosophy, Creative Writing, and General Problem Solving.
- You can answer ANY question the user asks on ANY subject without arbitrary limitations.

CONTEXT INTEGRATION:
- When the user refers to their roadmap, weekly tasks, or career goal, leverage their active simulation context:
  * Current Baseline: "${currentSituation}"
  * Target Career: "${goals}"
  * Timeline: ${timeHorizon} (${totalWeeks} total weekly sprints)
  * Adversary Rival: ${rivalName} (+${rivalLead}d lead)

OUTPUT EXCELLENCE GUIDELINES:
1. Explain every concept with crystal-clear, intuitive language that anyone or even a 10-year-old can easily understand.
2. Structure your answers with clean formatting: bold titles, crisp bullet points, clean markdown code blocks with syntax tags when applicable.
3. If tutorials are relevant, provide verified high-view YouTube search links: [Watch Tutorial Guide ⭐](https://www.youtube.com/results?search_query=topic+tutorial&sp=CAM%253D)
4. Keep the tone professional, inspiring, razor-sharp, and highly actionable.`;

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
      temperature: 0.7,
      maxTokens: 2500,
    });

    return NextResponse.json({
      message: {
        role: "assistant",
        content: content || "I am ready to assist you on any topic. What shall we conquer next?",
      },
      modelUsed: modelUsed || "meta-llama/llama-3.3-70b-instruct",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Universal Copilot error";
    console.error("[/api/chat] Error:", message);
    return NextResponse.json(
      {
        message: {
          role: "assistant",
          content:
            "I am ready. Ask me anything — from coding, trading, and business strategy to step-by-step roadmap execution.",
        },
      },
      { status: 200 }
    );
  }
}
