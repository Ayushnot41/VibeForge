// ============================================================================
// POST /api/simulation/stream — SSE stream that runs the FAST Multi-Agent Pipeline
// Optimizes latency by running Visualizer & Deployer concurrently in parallel
// ============================================================================

import { NextRequest } from "next/server";
import type { UserInput, SimulationState } from "@/types/agents";
import { checkRateLimit, DEFAULT_CONFIGS } from "@/lib/rateLimiter";
import { TelemetryLogger } from "@/lib/telemetry";

import { researcherNode } from "@/lib/agents/researcher";
import { simulatorNode } from "@/lib/agents/simulator";
import { visualizerNode } from "@/lib/agents/visualizer";
import { deployerNode } from "@/lib/agents/deployer";
import type { SimulationAnnotation } from "@/lib/agents/state";

export const maxDuration = 120; // Up to 2 minutes

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

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(event: string, data: Record<string, unknown>) {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      }

      try {
        TelemetryLogger.startTimer("sse_simulation_pipeline");

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
          progress: 15,
          message: `Deep-scanning career dynamics & market vectors for ${userInput.goals.slice(0, 40)}...`,
        });

        const researchResult = await researcherNode(state);
        state = { ...state, ...researchResult } as typeof SimulationAnnotation.State;

        const insightCount = state.researchInsights?.length || 0;
        sendEvent("agent_progress", {
          agent: "Researcher",
          status: "complete",
          progress: 35,
          message: `Researcher complete: ${insightCount} career insights & obstacles identified.`,
        });

        // ─── Stage 2: Simulator Agent ────────────────────────────────
        sendEvent("agent_progress", {
          agent: "Simulator",
          status: "simulating",
          progress: 40,
          message: "Synthesizing 3 realistic future trajectories (Optimistic, Realistic, Risk-Mitigated)...",
        });

        const simulatorResult = await simulatorNode(state);
        state = { ...state, ...simulatorResult } as typeof SimulationAnnotation.State;

        const pathCount = state.futurePaths?.length || 0;
        sendEvent("agent_progress", {
          agent: "Simulator",
          status: "complete",
          progress: 60,
          message: `Simulator complete: ${pathCount} career timelines & milestone branches forged.`,
        });

        // ─── Stage 3 & 4: Concurrent Parallel Synthesis (Visualizer + Deployer) ─────
        sendEvent("agent_progress", {
          agent: "Visualizer & Deployer",
          status: "synthesizing",
          progress: 65,
          message: "Parallel synthesizing: Comic Roadmap Holograms & Weekly Action Protocol...",
        });

        // Execute Visualizer and Deployer concurrently to double throughput speed!
        const [visualizerResult, deployerResult] = await Promise.all([
          visualizerNode(state).catch((err) => {
            console.error("[Visualizer Parallel Error]", err);
            return { imagePrompts: [], narrativeScript: "Let's conquer your vision!" };
          }),
          deployerNode(state).catch((err) => {
            console.error("[Deployer Parallel Error]", err);
            return { actionPlan: null, aggressivePitch: "Discipline beats motivation every single time." };
          }),
        ]);

        state = {
          ...state,
          ...visualizerResult,
          ...deployerResult,
        } as typeof SimulationAnnotation.State;

        sendEvent("agent_progress", {
          agent: "Orchestrator",
          status: "complete",
          progress: 95,
          message: "Finalizing multiverse parameters and locking career trajectory...",
        });

        // ─── Final Assembly ──────────────────────────────────────────
        const finalState: SimulationState = {
          userInput: state.userInput,
          researchInsights: state.researchInsights || [],
          trendAnalysis: state.trendAnalysis || "",
          futurePaths: state.futurePaths || [],
          obstacles: state.obstacles || [],
          imagePrompts: state.imagePrompts || [],
          narrativeScript: state.narrativeScript || "",
          actionPlan: state.actionPlan,
          aggressivePitch: state.aggressivePitch,
          feedbackLoopCount: state.feedbackLoopCount || 0,
          errors: state.errors || [],
          status: "complete",
          localSavedAt: Date.now(),
        };

        TelemetryLogger.logAgentExecution({
          agentName: "OrchestratorPipeline",
          durationMs: TelemetryLogger.endTimer("sse_simulation_pipeline"),
          status: "success",
          timestamp: new Date().toISOString(),
        });

        sendEvent("complete", {
          state: finalState,
          progress: 100,
          message: "Simulation fully synthesized and stabilized.",
        });

        controller.close();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error in simulation pipeline";
        console.error("[Simulation Stream] Pipeline Error:", message);
        sendEvent("error", { message });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
