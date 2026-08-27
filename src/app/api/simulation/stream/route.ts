// ============================================================================
// POST /api/simulation/stream — SSE stream that runs the REAL LangGraph pipeline
// Sends agent_progress events as each agent completes, then a complete event
// with the full SimulationState.
// ============================================================================

import { NextRequest } from "next/server";
import type { UserInput, SimulationState } from "@/types/agents";
import { checkRateLimit, DEFAULT_CONFIGS } from "@/lib/rateLimiter";
import { TelemetryLogger } from "@/lib/telemetry";

// Import the real LangGraph agent modules directly (not the compiled graph,
// because we need to stream progress between each agent step)
import { researcherNode } from "@/lib/agents/researcher";
import { simulatorNode } from "@/lib/agents/simulator";
import { visualizerNode } from "@/lib/agents/visualizer";
import { deployerNode } from "@/lib/agents/deployer";
import type { SimulationAnnotation } from "@/lib/agents/state";

export const maxDuration = 120; // Allow up to 2 minutes for full pipeline

export async function POST(req: NextRequest) {
  const clientIp = req.headers.get("x-forwarded-for") || "anonymous";

  // Rate Limiting Check
  const rateLimit = checkRateLimit(clientIp, DEFAULT_CONFIGS.simulationApi);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Please wait before streaming another simulation." }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  let body: { userInput: UserInput };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON input" }), { status: 400 });
  }

  const { userInput } = body;
  if (!userInput || !userInput.goals) {
    return new Response(JSON.stringify({ error: "User goals are required" }), { status: 400 });
  }

  // Validate required API key
  if (!process.env.OPENROUTER_API_KEY) {
    return new Response(
      JSON.stringify({ error: "OPENROUTER_API_KEY is not configured. Cannot run AI pipeline." }),
      { status: 500 }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(event: string, data: Record<string, unknown>) {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      }

      try {
        TelemetryLogger.startTimer("sse_simulation_pipeline");

        // Build initial LangGraph state
        let state: typeof SimulationAnnotation.State = {
          userInput,
          researchInsights: [],
          trendAnalysis: "",
          futurePaths: [],
          obstacles: [],
          feedbackLoopCount: 0,
          imagePrompts: [],
          narrativeScript: "",
          actionPlan: null,
          aggressivePitch: undefined,
          status: "researching",
          errors: [],
        } as typeof SimulationAnnotation.State;

        // ─── Stage 1: Researcher Agent ───────────────────────────────
        sendEvent("agent_progress", {
          agent: "Researcher",
          status: "researching",
          progress: 10,
          message: "Deep-scanning industry benchmarks, market vectors, and skill dependencies via Llama 3.1...",
        });

        const researchResult = await researcherNode(state);
        state = { ...state, ...researchResult } as typeof SimulationAnnotation.State;

        const insightCount = state.researchInsights?.length || 0;
        sendEvent("agent_progress", {
          agent: "Researcher",
          status: "complete",
          progress: 30,
          message: `Researcher complete: ${insightCount} insights extracted (trends, obstacles, opportunities).`,
        });

        // ─── Stage 2: Simulator Agent ────────────────────────────────
        sendEvent("agent_progress", {
          agent: "Simulator",
          status: "simulating",
          progress: 35,
          message: "Synthesizing 3 parallel future trajectories (Optimistic, Realistic, Risk-Mitigated)...",
        });

        const simulatorResult = await simulatorNode(state);
        state = { ...state, ...simulatorResult } as typeof SimulationAnnotation.State;

        const pathCount = state.futurePaths?.length || 0;
        const obstacleCount = state.obstacles?.length || 0;
        sendEvent("agent_progress", {
          agent: "Simulator",
          status: "complete",
          progress: 55,
          message: `Simulator complete: ${pathCount} future paths, ${obstacleCount} obstacles identified.`,
        });

        // ─── Stage 3: Visualizer Agent ───────────────────────────────
        sendEvent("agent_progress", {
          agent: "Visualizer",
          status: "visualizing",
          progress: 60,
          message: "Generating 4K future milestone image prompts & motivational narrative...",
        });

        const visualizerResult = await visualizerNode(state);
        state = { ...state, ...visualizerResult } as typeof SimulationAnnotation.State;

        const promptCount = state.imagePrompts?.length || 0;
        sendEvent("agent_progress", {
          agent: "Visualizer",
          status: "complete",
          progress: 75,
          message: `Visualizer complete: ${promptCount} image prompts, narrative script generated.`,
        });

        // ─── Stage 4: Deployer Agent ─────────────────────────────────
        sendEvent("agent_progress", {
          agent: "Deployer",
          status: "planning",
          progress: 80,
          message: "Compiling personalized weekly action protocol with YouTube resources & rival system...",
        });

        const deployerResult = await deployerNode(state);
        state = { ...state, ...deployerResult } as typeof SimulationAnnotation.State;

        const weekCount = state.actionPlan?.weeklyActions?.length || 0;
        sendEvent("agent_progress", {
          agent: "Deployer",
          status: "complete",
          progress: 95,
          message: `Deployer complete: ${weekCount}-week execution protocol with habits, calendar & rival system.`,
        });

        // ─── Final Assembly ──────────────────────────────────────────
        const finalState: SimulationState = {
          userInput: state.userInput,
          researchInsights: state.researchInsights || [],
          trendAnalysis: state.trendAnalysis || "",
          futurePaths: state.futurePaths || [],
          obstacles: state.obstacles || [],
          feedbackLoopCount: state.feedbackLoopCount || 0,
          imagePrompts: state.imagePrompts || [],
          narrativeScript: state.narrativeScript || "",
          actionPlan: state.actionPlan || null,
          aggressivePitch: state.aggressivePitch,
          status: "complete",
          errors: state.errors || [],
          localSavedAt: Date.now(),
        };

        const duration = TelemetryLogger.endTimer("sse_simulation_pipeline");
        TelemetryLogger.logAgentExecution({
          agentName: "OrchestratorPipeline",
          durationMs: duration,
          status: "success",
          timestamp: new Date().toISOString(),
        });

        // Complete Event — frontend saves this to localStorage
        sendEvent("complete", {
          progress: 100,
          state: finalState,
        });

        controller.close();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Simulation generation failed";
        console.error("[SSE Pipeline] Fatal error:", message);
        sendEvent("error", { error: message });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
