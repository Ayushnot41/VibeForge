import { z } from "zod";

export const UserInputSchema = z.object({
  currentSituation: z.string().min(1),
  goals: z.string().min(1),
  timeHorizon: z.enum(["1_year", "3_years", "5_years", "10_years"]),
  riskTolerance: z.enum(["conservative", "moderate", "aggressive"]).or(z.enum(["low", "medium", "high"])),
  additionalContext: z.string().optional(),
});

export const ResearchInsightSchema = z.object({
  category: z.enum(["trend", "obstacle", "opportunity"]).or(z.string()),
  title: z.string(),
  description: z.string(),
  relevance: z.number(),
  sources: z.array(z.string()).optional(),
});

export const MilestoneSchema = z.object({
  month: z.number(),
  title: z.string(),
  description: z.string(),
  achieved: z.boolean().optional(),
});

export const DailyRoutineSchema = z.object({
  timeOfDay: z.string(),
  activity: z.string(),
  purpose: z.string(),
});

export const FuturePathSchema = z.object({
  id: z.string(),
  type: z.enum(["optimistic", "realistic", "pessimistic"]),
  title: z.string(),
  summary: z.string().optional(),
  narrative: z.string(),
  milestones: z.array(MilestoneSchema),
  dailyRoutines: z.array(DailyRoutineSchema).optional(),
  probabilityScore: z.number().optional(),
});

export const WeeklyActionSchema = z.object({
  week: z.number(),
  actions: z.array(z.string()),
  milestone: z.string().optional(),
});

export const ActionPlanSchema = z.object({
  weeklyActions: z.array(WeeklyActionSchema),
  habits: z.array(z.any()).optional(),
  calendarEvents: z.array(z.any()).optional(),
  rival: z.any().optional(),
});

export const ImagePromptSchema = z.object({
  sceneDescription: z.string(),
  style: z.string(),
  pathId: z.string(),
  milestoneMonth: z.number(),
});

export const SimulationStateSchema = z.object({
  userInput: UserInputSchema,
  researchInsights: z.array(ResearchInsightSchema),
  trendAnalysis: z.string().optional(),
  futurePaths: z.array(FuturePathSchema),
  obstacles: z.array(z.any()).optional(),
  feedbackLoopCount: z.number().optional(),
  imagePrompts: z.array(ImagePromptSchema),
  narrativeScript: z.string(),
  actionPlan: ActionPlanSchema.nullable().optional(),
  status: z.string().optional(),
  errors: z.array(z.string()).optional(),
  localSavedAt: z.number().optional(),
});

export type ValidatedSimulationState = z.infer<typeof SimulationStateSchema>;

/**
 * Sanitizes and repairs partial/malformed JSON strings returned from LLMs
 */
export function sanitizeAndParseJSON(raw: string): any {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, (match) => {
    if (match === "\n" || match === "\r" || match === "\t") return match;
    return "";
  });

  return JSON.parse(cleaned);
}

/**
 * Validates simulation state against strict Zod schema with automatic repair
 */
export function validateSimulationState(data: unknown): { success: boolean; data?: ValidatedSimulationState; errors?: string[] } {
  const result = SimulationStateSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errorMessages = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    return { success: false, errors: errorMessages };
  }
}
