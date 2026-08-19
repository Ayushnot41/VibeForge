// ============================================================================
// Simulation State Annotation — shared state schema for the LangGraph graph
// Extracted into its own module to avoid circular imports between graph <-> agents
// ============================================================================

import { Annotation } from '@langchain/langgraph';
import type {
  UserInput,
  ResearchInsight,
  FuturePath,
  Obstacle,
  ImagePrompt,
  ActionPlan,
} from '@/types/agents';

export const SimulationAnnotation = Annotation.Root({
  // Input
  userInput: Annotation<UserInput>(),

  // Researcher output
  researchInsights: Annotation<ResearchInsight[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  trendAnalysis: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => '',
  }),

  // Simulator output
  futurePaths: Annotation<FuturePath[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  obstacles: Annotation<Obstacle[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  feedbackLoopCount: Annotation<number>({
    reducer: (_prev, next) => next,
    default: () => 0,
  }),

  // Visualizer output
  imagePrompts: Annotation<ImagePrompt[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  narrativeScript: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => '',
  }),

  // Deployer output
  actionPlan: Annotation<ActionPlan | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  aggressivePitch: Annotation<string | undefined>({
    reducer: (_prev, next) => next,
    default: () => undefined,
  }),

  // Meta
  status: Annotation<
    'researching' | 'simulating' | 'visualizing' | 'deploying' | 'complete' | 'error'
  >({
    reducer: (_prev, next) => next,
    default: () => 'researching' as const,
  }),
  errors: Annotation<string[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
});
