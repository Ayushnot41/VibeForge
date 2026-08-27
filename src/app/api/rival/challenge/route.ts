import { NextRequest, NextResponse } from "next/server";
import { callOpenRouterWithFallback } from "@/lib/openrouterClient";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      goals = "Elite Professional",
      situation = "Student / Professional",
      weekNumber = 1,
      completedCount = 0,
      totalActions = 3,
      streak = 0,
      timeline = "3 years",
    } = body;

    const systemPrompt = `You are the psychological engine behind VibeForge's Adversary Rival System.
Your job is to act as an unyielding, high-performing rival in the EXACT same career domain (${goals}) who is competing for the same market, client, or capital opportunities.

The user is currently starting from: "${situation}", aiming to become "${goals}" over ${timeline}.
Current progress: Week ${weekNumber}, completed ${completedCount} of ${totalActions} actions today. User streak: ${streak} days.

Generate a fierce, ego-hitting, competitive psychological response that:
1. Names a fierce rival persona tailored to the region/domain.
2. Describes what the rival already accomplished today at 5:30 AM while the user was hesitating.
3. Delivers a direct, ego-hurting, discipline-triggering taunt (2-3 sentences) that directly challenges their self-respect and pride.
4. Gives a concrete 25-minute "Ego-Crush Challenge" for today's sprint.

Return ONLY a valid JSON object matching this schema:
{
  "rivalName": string,
  "rivalArchetype": string,
  "rivalStatus": string,
  "rivalLeadDays": number,
  "rivalCompletionPct": number,
  "userCompletionPct": number,
  "egoTaunt": string,
  "egoChallenge": string,
  "recommendedAction": string
}`;

    const userPrompt = `Target Career: ${goals}
Baseline Background: ${situation}
Week Number: ${weekNumber}
Actions Completed: ${completedCount}/${totalActions}
User Streak: ${streak} days

Generate the ego-hitting rivalry challenge now in JSON format.`;

    try {
      const response = await callOpenRouterWithFallback({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        preferredModels: [
          "anthropic/claude-3.5-sonnet",
          "meta-llama/llama-3.3-70b-instruct",
          "openai/gpt-4o-mini",
        ],
        temperature: 0.8,
        responseFormatJson: true,
      });

      const parsed = JSON.parse(response.content);
      return NextResponse.json({
        success: true,
        ...parsed,
      });
    } catch (llmErr) {
      // High-impact dynamic fallback if LLM is unavailable
      const goalsClean = goals.replace(/[^a-zA-Z0-9 ]/g, "").trim();
      return NextResponse.json({
        success: true,
        rivalName: "Alexander 'Vanguard' Drake",
        rivalArchetype: "The Disciplined Competitor",
        rivalStatus: `Completed 3h 30m of deep ${goalsClean} execution & verified metrics at 5:45 AM.`,
        rivalLeadDays: Math.max(7, weekNumber * 2),
        rivalCompletionPct: 94,
        userCompletionPct: Math.round((completedCount / Math.max(1, totalActions)) * 100),
        egoTaunt: `You talk about becoming a sovereign ${goalsClean}, but your daily action looks like a hobbyist. While you hesitate, I've already put in 3 hours of focused execution today. If you genuinely believe you have the discipline, stop making excuses and prove me wrong in the next 25 minutes.`,
        egoChallenge: `🔥 25-Minute Ego Sprint: Complete your Week ${weekNumber} deliverables right now without touching your phone. Fail now, or stay average.`,
        recommendedAction: `Execute 25-Minute Focus Sprint for Week ${weekNumber}.`,
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to generate rival challenge" },
      { status: 500 }
    );
  }
}
