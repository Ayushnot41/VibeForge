"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

/* ─── Animation ─────────────────────────────────────────────── */

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─── Pricing Data ──────────────────────────────────────────── */

const plans = [
  {
    name: "Explorer",
    emoji: "🌱",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Perfect for trying out VibeForge",
    featured: false,
    features: [
      "3 simulations per month",
      "Basic path analysis",
      "Text-based action plans",
    ],
    cta: "Start Free",
    ctaVariant: "secondary" as const,
  },
  {
    name: "Pro",
    emoji: "🚀",
    monthlyPrice: 9,
    yearlyPrice: 7,
    description: "For serious future planners",
    featured: true,
    badge: "MOST POPULAR",
    features: [
      "7 Days Free Trial",
      "Unlimited simulations",
      "AI voice narration",
      "AI-generated visuals",
      "3D interactive timelines",
      "Calendar export",
    ],
    cta: "Get Pro",
    ctaVariant: "primary" as const,
  },
  {
    name: "Enterprise",
    emoji: "🏢",
    monthlyPrice: 99,
    yearlyPrice: 79,
    description: "For teams and organizations",
    featured: false,
    features: [
      "14 Days Free Trial",
      "Everything in Pro",
      "Team workspaces",
      "API access",
      "Custom AI models",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    ctaVariant: "secondary" as const,
  },
];

/* ─── FAQ Data ──────────────────────────────────────────────── */

const faqs = [
  {
    question: "How does the AI simulation work?",
    answer:
      "Our multi-agent AI system uses 4 specialized agents: a Researcher analyzes trends and data, a Simulator creates 3 parallel future paths, a Visualizer generates images and narration, and a Deployer creates your actionable week-by-week plan.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes! You can cancel your subscription at any time with no questions asked. Your simulations and data will remain accessible for 30 days after cancellation.",
  },
  {
    question: "What happens to my data?",
    answer:
      "Your data is encrypted and stored securely. We never share your personal information or simulation data with third parties. You can export or delete all your data at any time.",
  },
  {
    question: "How accurate are the simulations?",
    answer:
      "Our simulations use real-world data, industry trends, and proven career patterns to create realistic scenarios. While no prediction is 100% accurate, our AI provides well-researched projections with clearly labeled probability scores.",
  },
];

/* ─── FAQ Accordion ─────────────────────────────────────────── */

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <Card
          key={i}
          noHover
          className="cursor-pointer"
          onClick={() => setOpenIndex(openIndex === i ? null : i)}
        >
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-base font-semibold">{faq.question}</h3>
            <span
              className={cn(
                "text-[var(--accent-violet)] text-xl transition-transform duration-300 shrink-0",
                openIndex === i && "rotate-45"
              )}
            >
              +
            </span>
          </div>
          {openIndex === i && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed"
            >
              {faq.answer}
            </motion.p>
          )}
        </Card>
      ))}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const router = useRouter();

  const handleSelectPlan = (planName: string) => {
    router.push(`/checkout/${planName.toLowerCase()}`);
  };

  return (
    <main className="min-h-screen bg-mesh">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(10,10,15,0.8)] backdrop-blur-xl border-b border-[var(--glass-border)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🔮</span>
            <span className="text-xl font-bold font-[var(--font-heading)] gradient-text">
              VibeForge
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="pt-32 pb-20 px-6"
      >
        {/* Header */}
        <motion.div variants={fadeIn} className="text-center mb-12">
          <Badge color="violet" className="mb-4">
            💎 Pricing
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Choose Your <span className="gradient-text">Plan</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
            Start free, upgrade when you&apos;re ready. All plans include our
            core AI simulation engine.
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          variants={fadeIn}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              !isYearly
                ? "text-white"
                : "text-[var(--text-muted)]"
            )}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={cn(
              "relative w-14 h-7 rounded-full p-1 transition-colors duration-300 cursor-pointer",
              isYearly
                ? "bg-[var(--accent-violet)]"
                : "bg-[var(--bg-secondary)] border border-[var(--glass-border)]"
            )}
          >
            <div
              className={cn(
                "w-5 h-5 rounded-full bg-white transition-transform duration-300",
                isYearly && "translate-x-7"
              )}
            />
          </button>
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              isYearly
                ? "text-white"
                : "text-[var(--text-muted)]"
            )}
          >
            Yearly
            <Badge color="green" className="ml-2">
              Save 20%
            </Badge>
          </span>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={fadeIn}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20"
        >
          {plans.map((plan) => (
            <Card
              key={plan.name}
              glowColor={plan.featured ? "#7C3AED" : undefined}
              className={cn(
                "relative flex flex-col",
                plan.featured &&
                  "ring-2 ring-[var(--accent-violet)] shadow-[0_0_40px_rgba(124,58,237,0.2)]"
              )}
            >
              {plan.featured && plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge color="violet">{plan.badge}</Badge>
                </div>
              )}

              <div className="text-center mb-6 pt-2">
                <div className="text-4xl mb-3">{plan.emoji}</div>
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">
                    $
                    {isYearly
                      ? plan.yearlyPrice
                      : plan.monthlyPrice}
                  </span>
                  <span className="text-[var(--text-muted)]">/mo</span>
                </div>
                {isYearly && plan.monthlyPrice > 0 && (
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Billed annually (${(isYearly ? plan.yearlyPrice : plan.monthlyPrice) * 12}/yr)
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                  >
                    <span className="text-[var(--accent-violet)] mt-0.5">
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.monthlyPrice === 0 ? (
                <Link href="/dashboard/simulate" className="block w-full">
                  <Button variant={plan.ctaVariant} size="lg" fullWidth>
                    {plan.cta}
                  </Button>
                </Link>
              ) : (
                <Button
                  variant={plan.ctaVariant}
                  size="lg"
                  fullWidth
                  onClick={() => handleSelectPlan(plan.name)}
                >
                  {plan.cta}
                </Button>
              )}
            </Card>
          ))}
        </motion.div>

        {/* FAQ */}
        <motion.div variants={fadeIn} className="max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <FAQAccordion />
        </motion.div>

        {/* Bottom CTA */}
        <motion.div variants={fadeIn} className="max-w-3xl mx-auto">
          <div
            className="relative rounded-3xl p-12 text-center overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(99,102,241,0.15) 50%, rgba(168,85,247,0.1) 100%)",
              border: "1px solid rgba(124,58,237,0.3)",
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[250px] h-[250px] bg-[var(--accent-violet)] opacity-15 rounded-full blur-[80px] pointer-events-none" />

            <h2 className="text-3xl font-bold mb-4 relative z-10">
              Still Not Sure?
            </h2>
            <p className="text-[var(--text-secondary)] mb-6 relative z-10">
              Try 3 free simulations. No credit card required.
            </p>
            <Link href="/dashboard/simulate" className="relative z-10">
              <Button size="lg" variant="primary">
                🚀 Start Free
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="border-t border-[var(--glass-border)] mt-20 pt-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔮</span>
              <span className="font-bold font-[var(--font-heading)] gradient-text">
                VibeForge
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              © {new Date().getFullYear()} VibeForge. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)]">
              <a
                href="#"
                className="hover:text-white transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </footer>
      </motion.div>
    </main>
  );
}
