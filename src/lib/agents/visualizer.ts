// ============================================================================
// Visualizer Agent — DALL-E 3 prompt generation & narrative scripting
// No external API calls — produces prompts and scripts for downstream use
// ============================================================================

import { SimulationAnnotation } from './state';
import type { ImagePrompt, FuturePath, UserInput } from '@/types/agents';
import { callOpenRouterWithFallback } from '@/lib/openrouterClient';

const STYLE_MAP: Record<FuturePath['type'], string> = {
  optimistic:
    'Hyper-realistic documentary photography, shot on 35mm lens, f/1.8, golden hour natural lighting, cinematic composition, authentic human expression, extremely detailed, highly realistic textures, zero digital art artifacts, award-winning photography, 8k resolution',
  realistic:
    'Hyper-realistic documentary photography, shot on 50mm lens, f/2.8, balanced soft daylight, professional authentic atmosphere, grounded reality, subtle depth of field, photorealistic textures, zero digital art artifacts, award-winning photography, 8k resolution',
  pessimistic:
    'Hyper-realistic documentary photography, shot on 35mm lens, f/2.0, overcast moody lighting, dramatic shadows, authentic resilience, gritty realism, photorealistic textures, zero digital art artifacts, award-winning photography, 8k resolution',
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
 * Build a DALL-E 3 prompt for a specific milestone in a future path.
 */
function buildImagePrompt(
  path: FuturePath,
  milestone: { month: number; title: string; description: string },
  userInput: UserInput
): ImagePrompt {
  const yearMark = Math.ceil(milestone.month / 12);
  const style = STYLE_MAP[path.type];

  const sceneDescription = [
    `Context: The user's goal is: "${userInput.goals}". Current situation: "${userInput.currentSituation}".`,
    `Scene: "${milestone.title}" — Year ${yearMark} of their ${path.type} future path titled "${path.title}".`,
    `CRITICAL INSTRUCTION: The environment MUST heavily and explicitly reflect their specific career or goal mentioned above (e.g., if they are a trader, show complex multi-monitor trading terminals; if a web developer, show modern coding setups and IDEs; if a doctor, show a high-tech hospital). Make it extremely specific to their profession or goal. Do NOT use generic sci-fi imagery.`,
    `A person ${milestone.description.toLowerCase()}.`,
    `The environment reflects ${path.type === 'optimistic' ? 'massive success and peak performance' : path.type === 'realistic' ? 'steady progress and daily grind' : 'harsh challenges being overcome with intense resilience'}.`,
    `No text or words in the image.`,
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
 * Visualizer node — generates DALL-E 3 prompts and a narrative script.
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
        preferredModels: ['anthropic/claude-opus-5', 'meta-llama/llama-3.3-70b-instruct', 'openai/gpt-4o-mini'],
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
