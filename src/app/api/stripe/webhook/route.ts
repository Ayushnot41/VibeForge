// ============================================================================
// POST /api/stripe/webhook — Handle Stripe webhook events
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

/**
 * Handle a successful checkout session.
 * In production, this would update the user's subscription status in the database.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id || session.metadata?.userId;
  const subscriptionId = session.subscription as string | null;
  const customerId = session.customer as string | null;

  console.log('[Webhook] Checkout completed:', {
    userId,
    subscriptionId,
    customerId,
    amountTotal: session.amount_total,
  });

  if (supabase && userId) {
    await supabase.from('profiles').update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      plan: 'pro',
      subscription_status: 'active',
      current_period_end: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
    }).eq('id', userId);
  } else {
    console.warn('[Webhook] Supabase not configured or missing userId, skipping database update.');
  }
}

/**
 * Handle subscription updates (plan changes, renewals).
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  console.log('[Webhook] Subscription updated:', {
    subscriptionId: subscription.id,
    customerId,
    status: subscription.status,
  });

  if (supabase && subscription.id) {
    await supabase.from('profiles').update({
      subscription_status: subscription.status,
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
    }).eq('stripe_subscription_id', subscription.id);
  }
}

/**
 * Handle subscription cancellation / deletion.
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('[Webhook] Subscription deleted:', {
    subscriptionId: subscription.id,
    customerId: subscription.customer as string,
  });

  if (supabase && subscription.id) {
    await supabase.from('profiles').update({
      subscription_status: 'cancelled',
      plan: 'free',
    }).eq('stripe_subscription_id', subscription.id);
  }
}

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey || !webhookSecret) {
      console.error('[Webhook] Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET');
      return NextResponse.json(
        { error: 'Server configuration error.' },
        { status: 500 },
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2026-05-27.dahlia',
    });

    // Read the raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header.' },
        { status: 400 },
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown verification error';
      console.error('[Webhook] Signature verification failed:', message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${message}` },
        { status: 400 },
      );
    }

    // Route the event to the appropriate handler
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Webhook] Unhandled error:', message);
    // Return 200 anyway to prevent Stripe from retrying on our bugs
    return NextResponse.json({ received: true, error: message }, { status: 200 });
  }
}
