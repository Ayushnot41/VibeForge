// ============================================================================
// VibeForge Agent Types - Complete type definitions for the multi-agent system
// ============================================================================

// --- User Input ---

export interface UserInput {
  currentSituation: string;  // Career, education, location, skills
  goals: string;             // Short/medium/long-term goals
  timeHorizon: '6_weeks' | '12_weeks' | '24_weeks' | '36_weeks' | '1_year' | '3_years' | '5_years' | '10_years' | string;
  customWeeks?: number;      // Exact user-specified number of weeks (e.g. 6, 24, 36, 52, etc.)
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  additionalContext?: string;
  // Custom target date (ISO yyyy-mm-dd). When set, the simulation duration is
  // derived from the time between "now" and this date with no upper limit.
  targetDate?: string;
  // Computed number of months from now until targetDate (or overrides preset).
  timeHorizonMonths?: number;
}

// --- Researcher Output ---

export interface ResearchInsight {
  category: 'trend' | 'obstacle' | 'opportunity';
  title: string;
  description: string;
  relevance: number; // 0-1
  sources?: string[];
}

// --- Simulator Output ---

export interface FuturePath {
  id: string;
  type: 'optimistic' | 'realistic' | 'pessimistic';
  title: string;
  summary: string;
  narrative: string;
  milestones: Milestone[];
  dailyRoutines: DailyRoutine[];
  probabilityScore: number; // 0-1
}

export interface Milestone {
  month: number;
  title: string;
  description: string;
  achieved: boolean;
}

export interface DailyRoutine {
  timeOfDay: string;
  activity: string;
  purpose: string;
}

export interface Obstacle {
  id: string;
  description: string;
  probability: number; // 0-1
  mitigation: string;
  revisedPath?: string;
}

// --- Visualizer Output ---

export interface ImagePrompt {
  sceneDescription: string;
  style: string;
  pathId: string;
  milestoneMonth: number;
}

// --- Deployer Output ---

export interface ActionPlan {
  weeklyActions: WeeklyAction[];
  habits: HabitTracker[];
  calendarEvents: CalendarEvent[];
  rival?: {
    name: string;
    bio: string;
    taunts: string[];
    progressOffset: number; // How far ahead or behind they are (default 0)
  };
}

export interface WeeklyAction {
  week: number;
  actions: string[];
  milestone?: string;
}

export interface HabitTracker {
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  description: string;
  targetStreak: number;
}

export interface CalendarEvent {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  recurrence?: string;
}

// --- Simulation State (LangGraph state) ---

export interface SimulationState {
  // Input
  userInput: UserInput;
  // Researcher output
  researchInsights: ResearchInsight[];
  trendAnalysis: string;
  // Simulator output
  futurePaths: FuturePath[];
  obstacles: Obstacle[];
  feedbackLoopCount: number;
  // Visualizer output
  imagePrompts: ImagePrompt[];
  narrativeScript: string;
  // Deployer output
  actionPlan: ActionPlan | null;
  aggressivePitch?: string; // New adrenaline motivation field
  // Meta
  status: 'researching' | 'simulating' | 'visualizing' | 'deploying' | 'complete' | 'error';
  errors: string[];
  formState?: Record<string, unknown>; // To support the frontend usage
  localSavedAt?: number; // Timestamp when saved locally (for 24h expiry and health calc)
}

// --- Database Simulation Record ---

export interface Simulation {
  id: string;
  userId: string;
  input: UserInput;
  state: SimulationState;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

// --- Time horizon helpers ---

export const TIME_HORIZON_MONTHS: Record<string, number> = {
  '6_weeks': 1.5,
  '12_weeks': 3,
  '24_weeks': 6,
  '36_weeks': 9,
  '1_year': 12,
  '2_years': 24,
  '3_years': 36,
  '5_years': 60,
  '10_years': 120,
};

/**
 * Returns the effective simulation duration in months. Prefers a custom
 * computed duration (from a target date) when present, otherwise falls back
 * to the preset time horizon lookup with a guaranteed safe fallback of 36 months.
 */
export function getTimeHorizonMonths(input: UserInput): number {
  if (input.timeHorizonMonths && input.timeHorizonMonths > 0) {
    return Math.round(input.timeHorizonMonths);
  }
  return TIME_HORIZON_MONTHS[input.timeHorizon] || 36;
}
