// ============================================================================
// POST /api/agents — Run the multi-agent simulation pipeline
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { runSimulation } from '@/lib/agents/graph';
import type { UserInput } from '@/types/agents';

const VALID_TIME_HORIZONS = ['1_year', '3_years', '5_years', '10_years'] as const;
const VALID_RISK_TOLERANCES = ['conservative', 'moderate', 'aggressive'] as const;

function validateInput(body: unknown): { valid: true; input: UserInput } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object.' };
  }

  const b = body as Record<string, unknown>;

  if (!b.currentSituation || typeof b.currentSituation !== 'string' || b.currentSituation.trim().length === 0) {
    return { valid: false, error: '`currentSituation` is required and must be a non-empty string.' };
  }

  if (!b.goals || typeof b.goals !== 'string' || b.goals.trim().length === 0) {
    return { valid: false, error: '`goals` is required and must be a non-empty string.' };
  }

  if (!b.timeHorizon || !VALID_TIME_HORIZONS.includes(b.timeHorizon as typeof VALID_TIME_HORIZONS[number])) {
    return {
      valid: false,
      error: `\`timeHorizon\` must be one of: ${VALID_TIME_HORIZONS.join(', ')}.`,
    };
  }

  if (!b.riskTolerance || !VALID_RISK_TOLERANCES.includes(b.riskTolerance as typeof VALID_RISK_TOLERANCES[number])) {
    return {
      valid: false,
      error: `\`riskTolerance\` must be one of: ${VALID_RISK_TOLERANCES.join(', ')}.`,
    };
  }

  return {
    valid: true,
    input: {
      currentSituation: (b.currentSituation as string).trim(),
      goals: (b.goals as string).trim(),
      timeHorizon: b.timeHorizon as UserInput['timeHorizon'],
      riskTolerance: b.riskTolerance as UserInput['riskTolerance'],
      additionalContext: typeof b.additionalContext === 'string' ? b.additionalContext.trim() : undefined,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body.' },
        { status: 400 },
      );
    }

    // Validate
    const validation = validateInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 },
      );
    }

    // Check required API keys
    const missingKeys: string[] = [];
    if (!process.env.OPENROUTER_API_KEY) missingKeys.push('OPENROUTER_API_KEY');

    if (missingKeys.length > 0) {
      return NextResponse.json(
        { error: `Missing required environment variables: ${missingKeys.join(', ')}` },
        { status: 500 },
      );
    }

    // Run the simulation
    const result = await runSimulation(validation.input);

    // Check for errors in the pipeline
    if (result.status === 'error' && result.errors.length > 0) {
      return NextResponse.json(
        {
          error: 'Simulation completed with errors.',
          details: result.errors,
          partialResult: result,
        },
        { status: 207 }, // Multi-Status — partial success
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    console.error('[/api/agents] Unhandled error:', message);
    return NextResponse.json(
      { error: 'Internal server error.', details: message },
      { status: 500 },
    );
  }
}
