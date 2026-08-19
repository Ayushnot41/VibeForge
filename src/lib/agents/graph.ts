// ============================================================================
// LangGraph Multi-Agent Orchestration Graph
// START -> researcher -> simulator -> (conditional) -> visualizer -> deployer -> END
// ============================================================================

import { StateGraph, START, END } from '@langchain/langgraph';
import type { UserInput } from '@/types/agents';
import { SimulationAnnotation } from './state';
import { researcherNode } from './researcher';
import { simulatorNode } from './simulator';
import { visualizerNode } from './visualizer';
import { deployerNode } from './deployer';

// Re-export so consumers can import from either graph or state
export { SimulationAnnotation } from './state';

// ============================================================================
// Conditional Edge: Feedback Loop Check
// ============================================================================

/**
 * After the simulator runs, decide whether to loop back for refinement
 * or proceed to the visualizer.
 *
 * Loop condition: feedbackLoopCount < 3 AND any obstacle has probability > 0.7
 */
function shouldFeedbackLoop(
  _state: typeof SimulationAnnotation.State,
): 'simulator' | 'visualizer' {
  // FAST MODE: Disable the feedback loop completely to guarantee lightning-fast simulation execution
  return 'visualizer';
}

// ============================================================================
// Build the Graph
// ============================================================================

function buildGraph() {
  const graph = new StateGraph(SimulationAnnotation)
    // Register nodes
    .addNode('researcher', researcherNode)
    .addNode('simulator', simulatorNode)
    .addNode('visualizer', visualizerNode)
    .addNode('deployer', deployerNode)

    // Wire edges
    .addEdge(START, 'researcher')
    .addEdge('researcher', 'simulator')

    // Conditional edge after simulator: loop or proceed
    .addConditionalEdges('simulator', shouldFeedbackLoop, {
      simulator: 'simulator',
      visualizer: 'visualizer',
    })

    .addEdge('visualizer', 'deployer')
    .addEdge('deployer', END);

  return graph.compile();
}

// Compile once and cache
let _compiled: ReturnType<typeof buildGraph> | null = null;

function getCompiledGraph() {
  if (!_compiled) {
    _compiled = buildGraph();
  }
  return _compiled;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Run the full multi-agent simulation pipeline.
 *
 * @param input - The user's input (situation, goals, time horizon, risk tolerance)
 * @returns The complete simulation state after all agents have run
 */
export async function runSimulation(
  input: UserInput,
): Promise<typeof SimulationAnnotation.State> {
  const graph = getCompiledGraph();

  const initialState: Partial<typeof SimulationAnnotation.State> = {
    userInput: input,
    researchInsights: [],
    trendAnalysis: '',
    futurePaths: [],
    obstacles: [],
    feedbackLoopCount: 0,
    imagePrompts: [],
    narrativeScript: '',
    actionPlan: null,
    status: 'researching',
    errors: [],
  };

  const result = await graph.invoke(initialState);
  return result;
}
