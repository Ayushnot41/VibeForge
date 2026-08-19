// ============================================================================
// POST /api/stripe/checkout — Create a Stripe Checkout session
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    // Parse body
    let body: { priceId?: string; userId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body.' },
        { status: 400 },
      );
    }

    if (!body.priceId || typeof body.priceId !== 'string') {
      return NextResponse.json(
        { error: '`priceId` is required and must be a string.' },
        { status: 400 },
      );
    }

    if (!body.userId || typeof body.userId !== 'string') {
      return NextResponse.json(
        { error: '`userId` is required and must be a string.' },
        { status: 400 },
      );
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Missing required environment variable: STRIPE_SECRET_KEY' },
        { status: 500 },
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2026-05-27.dahlia',
    });

    // Determine app URL for redirects
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: body.priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?checkout=cancelled`,
      client_reference_id: body.userId,
      metadata: {
        userId: body.userId,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Stripe did not return a checkout URL.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[/api/stripe/checkout] Error:', message);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: error.statusCode ?? 500 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session.', details: message },
      { status: 500 },
    );
  }
}
