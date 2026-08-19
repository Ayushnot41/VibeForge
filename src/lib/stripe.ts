import Stripe from 'stripe'

/**
 * Server-side Stripe instance.
 *
 * Only import this in server code (Route Handlers, Server Actions).
 * For client-side usage, load the publishable key via `@stripe/stripe-js`.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
  typescript: true,
})

// ----------------------------------------------------------------
// Pricing tiers
// ----------------------------------------------------------------

export interface PricingTier {
  name: string
  description: string
  /** Monthly price in USD cents */
  price: number
  /** Stripe Price ID — set these once you create products in the dashboard */
  priceId: string
  features: string[]
}

/** Application pricing tiers. Update `priceId` values after creating Stripe products. */
export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Free',
    description: 'Get started with basic simulations',
    price: 0,
    priceId: '',
    features: [
      '3 simulations per month',
      'Basic AI models',
      'Text-only output',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    description: 'Unlock the full power of VibeForge',
    price: 1999,
    priceId: 'price_pro_monthly',
    features: [
      'Unlimited simulations',
      'All AI models (Claude, GPT-4, Groq)',
      'Image & audio generation',
      'Priority support',
      'Export & share',
    ],
  },
  {
    name: 'Enterprise',
    description: 'Custom solutions for teams',
    price: 9999,
    priceId: 'price_enterprise_monthly',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Custom AI model fine-tuning',
      'Dedicated support',
      'SSO & audit logs',
      'SLA guarantee',
    ],
  },
]
