// ============================================================================
// Visualizer Agent — Comic-Type Roadmap Hologram & Narrative Engine
// Generates graphic novel hologram panel prompts for full career transformations
// ============================================================================

import { SimulationAnnotation } from './state';
import type { ImagePrompt, FuturePath, UserInput } from '@/types/agents';
import { callOpenRouterWithFallback } from '@/lib/openrouterClient';

const COMIC_STYLE_MAP: Record<FuturePath['type'], string> = {
  optimistic:
    'High-tech comic graphic novel splash panel, vibrant holographic neon blueprint overlays, glowing cyber-hologram timeline progression, dynamic action lines, crisp graphic ink lines, comic book color grading, Unreal Engine 5 volumetric lighting, 8k comic masterpiece, zero watermark, cinematic widescreen',
  realistic:
    'Detailed comic book illustration, holographic roadmap HUD interface displaying week-by-week milestones, clean ink linework, subtle neon blue and violet accents, modern graphic novel aesthetic, intense focus and deliberate practice, 8k resolution, cinematic',
  pessimistic:
    'Moody graphic novel comic panel, dark atmospheric cyber-noir shading, holographic glitch warnings and breakthrough solutions, resilient character overcoming obstacles, comic book cross-hatching, cinematic lighting, 8k masterwork',
};

/**
 * Selects key milestones to generate images for.
 * Picks the first, middle, and last milestone of each path.
 */
function selectKeyMilestones(path: FuturePath): typeof path.milestones {
  const ms = path.milestones;
  if (ms.length <= 3) return ms;

  const first = ms[0];
  const mid = ms[Math.floor(ms.length / 2)];
  const last = ms[ms.length - 1];
  return [first, mid, last];
}

/**
 * Build a Comic-Type Roadmap Hologram prompt for a specific milestone in a future path.
 */
function buildImagePrompt(
  path: FuturePath,
  milestone: { month: number; title: string; description: string },
  userInput: UserInput
): ImagePrompt {
  const yearMark = Math.ceil(milestone.month / 12);
  const style = COMIC_STYLE_MAP[path.type] || COMIC_STYLE_MAP.realistic;

  const sceneDescription = [
    `Stylized graphic novel comic roadmap panel depicting career transition from "${userInput.currentSituation}" to "${userInput.goals}".`,
    `Episode/Chapter: "${milestone.title}" (Month ${milestone.month}, Year ${yearMark} of ${path.title}).`,
    `The scene depicts the character actively executing: ${milestone.description}.`,
    `A floating holographic cyan and violet HUD interface glows in the air, illustrating the week-by-week progress roadmap, learning milestones, and skill blueprints.`,
    `The physical environment is heavily customized to their dream profession (${userInput.goals}).`,
    `Atmosphere reflects ${path.type === 'optimistic' ? 'triumphant peak mastery and cosmic success' : path.type === 'realistic' ? 'disciplined daily execution and steady growth' : 'gritty resilience overcoming brutal challenges'}.`,
    `Cinematic comic book composition, dramatic angles, crisp ink outlines, glowing neon accents, 8k masterwork.`,
  ].join(' ');

  return {
    sceneDescription,
    style,
    pathId: path.id,
    milestoneMonth: milestone.month,
  };
}

/**
 * Generate a voice-over narrative script that weaves all three paths together.
 */
function generateNarrativeScript(paths: FuturePath[]): string {
  const sections: string[] = [];

  // Opening
  sections.push(
    `[INTRO — Soft ambient music fades in]`,
    ``,
    `Imagine standing at a crossroads — not of roads, but of possibilities. ` +
      `Your future isn't a single line stretching into the distance. ` +
      `It's a constellation of paths, each shaped by the choices you make today.`,
    ``,
    `Let's explore three visions of your future.`,
    ``,
  );

  // Each path
  for (const path of paths) {
    const label =
      path.type === 'optimistic'
        ? '🌟 The Aspirational Path'
        : path.type === 'realistic'
          ? '⚡ The Grounded Path'
          : '🛡️ The Resilient Path';

    sections.push(
      `[${label.toUpperCase()} — Music shifts to ${path.type === 'optimistic' ? 'uplifting orchestral' : path.type === 'realistic' ? 'steady rhythmic' : 'contemplative piano'}]`,
      ``,
      `"${path.title}"`,
      ``,
      path.narrative,
      ``,
    );

    // Key milestones narration
    const keyMs = selectKeyMilestones(path);
    if (keyMs.length > 0) {
      sections.push(`Key moments along this path:`);
      for (const ms of keyMs) {
        const timeLabel =
          ms.month <= 12
            ? `Month ${ms.month}`
            : `Year ${Math.ceil(ms.month / 12)}`;
        sections.push(`  • ${timeLabel} — ${ms.title}: ${ms.description}`);
      }
      sections.push(``);
    }

    // Daily routine glimpse
    if (path.dailyRoutines.length > 0) {
      sections.push(`A day in this future looks like:`);
      for (const r of path.dailyRoutines.slice(0, 3)) {
        sections.push(`  ${r.timeOfDay}: ${r.activity} — ${r.purpose}`);
      }
      sections.push(``);
    }
  }

  // Closing
  sections.push(
    `[OUTRO — Music builds to a hopeful crescendo]`,
    ``,
    `These aren't predictions — they're possibilities. ` +
      `The future you live will be shaped by the habits you build, ` +
      `the obstacles you navigate, and the consistency of your effort.`,
    ``,
    `Your action plan is ready. Let's make one of these futures real.`,
    ``,
    `[Music fades out]`,
  );

  return sections.join('\n');
}

/**
 * Visualizer node — generates Comic Roadmap Hologram prompts and a narrative script.
 */
export async function visualizerNode(
  state: typeof SimulationAnnotation.State,
): Promise<Partial<typeof SimulationAnnotation.State>> {
  try {
    const { futurePaths } = state;

    if (futurePaths.length === 0) {
      return {
        imagePrompts: [],
        narrativeScript: 'No future paths available for visualization.',
        status: 'deploying',
      };
    }

    // Generate image prompts for key milestones of each path
    const imagePrompts: ImagePrompt[] = [];
    for (const path of futurePaths) {
      const keyMilestones = selectKeyMilestones(path);
      for (const ms of keyMilestones) {
        imagePrompts.push(buildImagePrompt(path, ms, state.userInput));
      }
    }

    let narrativeScript = '';
    try {
      const { content } = await callOpenRouterWithFallback({
        messages: [
          { role: 'system', content: "You are the user's highly motivational, energetic mentor and brother in arms. Write a short, punchy, dopamine-inducing speech (max 150 words) to hype them up about achieving their specific life goals. Speak directly to them like a champion brother. Do NOT read action steps. Just pure, hyper-focused motivation." },
          { role: 'user', content: `Goal: ${state.userInput.goals}. Current situation: ${state.userInput.currentSituation}` },
        ],
        preferredModels: ['meta-llama/llama-3.3-70b-instruct', 'openai/gpt-4o-mini', 'x-ai/grok-4.6', 'anthropic/claude-opus-5'],
        temperature: 0.85,
        maxTokens: 400,
      });
      narrativeScript = content || "Let's go get it! You have everything required to achieve this vision.";
    } catch (e) {
      console.warn("Failed to generate voice narrative:", e);
      narrativeScript = "Let's execute! You have everything required to achieve this vision.";
    }

    return {
      imagePrompts,
      narrativeScript,
      status: 'deploying',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Visualizer] Error:', message);
    return {
      imagePrompts: [],
      narrativeScript: '',
      status: 'error',
      errors: [...state.errors, `Visualizer agent failed: ${message}`],
    };
  }
}
