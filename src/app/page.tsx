"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

/* ─── Animation Variants ────────────────────────────────────── */

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

/* ─── Navbar ────────────────────────────────────────────────── */

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(10,10,15,0.8)] backdrop-blur-xl border-b border-[var(--glass-border)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🔮</span>
          <span className="text-xl font-bold font-[var(--font-heading)] gradient-text">
            VibeForge
          </span>
        </Link>

        {/* Center Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            Features
          </a>
          <Link
            href="/pricing"
            className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            Pricing
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard/my-simulations">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              My Simulations
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/dashboard/simulate">
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero ──────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6 bg-mesh overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[var(--accent-violet)] opacity-[0.08] rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[var(--accent-indigo)] opacity-[0.06] rounded-full blur-[128px] pointer-events-none" />

      <motion.div
        className="max-w-4xl mx-auto text-center"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp}>
          <Badge color="violet" className="mb-6">
            ✨ AI-Powered Future Planning
          </Badge>
        </motion.div>

        <motion.h1
          variants={fadeInUp}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-balance"
        >
          See Your{" "}
          <span className="gradient-text">Future Self</span>
          <br />
          Before You Get There
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 text-balance"
        >
          Tell us your goals, and our AI simulates 3 parallel futures — with
          visuals, narration, and a week-by-week action plan to make the best
          one happen.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <Link href="/dashboard/simulate">
            <Button size="lg" variant="primary">
              🚀 Start Free Simulation
            </Button>
          </Link>
          <Button size="lg" variant="secondary">
            ▶️ Watch Demo
          </Button>
        </motion.div>

        <motion.p
          variants={fadeInUp}
          className="text-sm font-bold tracking-widest uppercase text-purple-400 mt-4"
        >
          Stop drifting. Start dominating. Your legacy won&apos;t build itself.
        </motion.p>
      </motion.div>
    </section>
  );
}

/* ─── How It Works ──────────────────────────────────────────── */

const steps = [
  {
    emoji: "🎯",
    title: "Share Your Goals",
    description:
      "Tell us about your current situation, skills, and where you want to be.",
  },
  {
    emoji: "🤖",
    title: "AI Simulates",
    description:
      "Our multi-agent AI researches, simulates, and visualizes 3 possible futures.",
  },
  {
    emoji: "📋",
    title: "Get Your Plan",
    description:
      "Receive a week-by-week action plan with milestones to reach your best future.",
  },
];

function HowItWorks() {
  return (
    <section className="section-padding" id="how-it-works">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Badge color="blue" className="mb-4">
              How It Works
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl font-bold"
          >
            Three Simple Steps
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {steps.map((step, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="glass-card p-8 text-center"
            >
              <div className="text-5xl mb-5">{step.emoji}</div>
              <div className="text-xs font-medium text-[var(--accent-violet)] mb-3 tracking-widest uppercase">
                Step {i + 1}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Features Grid ─────────────────────────────────────────── */

const features = [
  {
    emoji: "🔮",
    title: "3 Parallel Futures",
    description:
      "See optimistic, realistic, and pessimistic paths — so you can plan for any outcome.",
  },
  {
    emoji: "🎨",
    title: "AI Visuals",
    description:
      "AI-generated images of your future life — your workspace, lifestyle, and achievements.",
  },
  {
    emoji: "🎙️",
    title: "Voice Narration",
    description:
      "Listen to an AI narrator describe your future day as a personalized audio story.",
  },
  {
    emoji: "🌌",
    title: "3D Timeline",
    description:
      "Explore an interactive 3D visualization of your branching future paths.",
  },
  {
    emoji: "✅",
    title: "Action Plans",
    description:
      "Get a detailed week-by-week plan with habits, milestones, and check-ins.",
  },
  {
    emoji: "📅",
    title: "Calendar Export",
    description:
      "Export your action plan directly to Google Calendar or Apple Calendar.",
  },
];

function FeaturesGrid() {
  return (
    <section className="section-padding bg-[var(--bg-secondary)]" id="features">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Badge color="amber" className="mb-4">
              Features
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            Everything You Need to
            <br />
            <span className="gradient-text">Plan Your Future</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto"
          >
            Powered by a multi-agent AI system that researches, simulates,
            visualizes, and deploys your personalized future plan.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="glass-card p-7 group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.emoji}
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Bottom CTA ────────────────────────────────────────────── */

function BottomCTA() {
  return (
    <section className="section-padding">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="max-w-4xl mx-auto"
      >
        <motion.div
          variants={fadeInUp}
          className="relative rounded-3xl p-12 md:p-16 text-center overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(99,102,241,0.15) 50%, rgba(168,85,247,0.1) 100%)",
            border: "1px solid rgba(124,58,237,0.3)",
          }}
        >
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[var(--accent-violet)] opacity-15 rounded-full blur-[80px] pointer-events-none" />

          <h2 className="text-3xl md:text-5xl font-bold mb-4 relative z-10 tracking-tight">
            Excuses End Here.
            <br />
            <span className="gradient-text">Execute Your Vision.</span>
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto relative z-10 font-medium">
            Average is a choice. Greatness is a protocol. Stop letting the future happen to you, and start engineering it.
          </p>
          <Link href="/dashboard/simulate" className="relative z-10">
            <Button size="lg" variant="primary">
              🚀 Start Your Free Simulation
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── Footer ────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-[var(--glass-border)] py-10 px-6">
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
          <a href="#" className="hover:text-white transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <FeaturesGrid />
      <BottomCTA />
      <Footer />
    </main>
  );
}
