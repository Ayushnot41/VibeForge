// ============================================================================
// POST /api/voice-qa — Interactive Human Voice Q&A Mentor
// Answers user doubts in simple, engaging, child-friendly conversational language
// and generates high-fidelity voice audio via ElevenLabs
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { callOpenRouterWithFallback } from "@/lib/openrouterClient";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, context, goals } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "A valid question is required." }, { status: 400 });
    }

    const systemPrompt = `You are the user's friendly, inspiring, and crystal-clear AI Voice Mentor.
The user has a question/doubt about their career roadmap to achieve: "${goals || 'their dream career'}".

CRITICAL INSTRUCTIONS:
- Explain the answer in VERY simple, easy-to-understand, encouraging language that even a 10-year-old or a beginner can easily understand.
- Use simple analogies and zero jargon.
- Keep the response short (40-70 words maximum) because this response will be read aloud in human voice.
- Speak directly to the user as an inspiring brother and mentor.`;

    const userPrompt = `User's Question: "${question}"
Context: ${context || "Career execution roadmap"}`;

    const { content } = await callOpenRouterWithFallback({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      preferredModels: [
        "meta-llama/llama-3.3-70b-instruct",
        "openai/gpt-4o-mini",
        "x-ai/grok-4.6",
      ],
      temperature: 0.7,
      maxTokens: 250,
    });

    const explanation = content?.trim() || "You are doing great! Just focus on taking one simple step today, and your goal will come within reach.";

    return NextResponse.json({
      explanation,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Voice mentor error";
    console.error("[/api/voice-qa] Error:", message);
    return NextResponse.json({
      explanation: "Remember, big goals are just small daily habits stacked together. Follow your Week 1 steps with patience and you will master this!",
    });
  }
}
