"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

/* ─── Animation Variants ────────────────────────────────────── */

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

/* ─── SVG Icons ─────────────────────────────────────────────── */

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/>
    <path d="M19 17v4"/>
    <path d="M3 5h4"/>
    <path d="M17 19h4"/>
  </svg>
);

const CompassIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
);

const CpuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2"/>
    <rect x="9" y="9" width="6" height="6"/>
    <path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/>
    <path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>
  </svg>
);

const ChecklistIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

const TimelineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/>
    <path d="m19 9-5 5-4-4-3 3"/>
  </svg>
);

const VisualsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    <circle cx="9" cy="9" r="2"/>
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
);

const MicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
    <line x1="16" x2="16" y1="2" y2="6"/>
    <line x1="8" x2="8" y1="2" y2="6"/>
    <line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

/* ─── Navbar ────────────────────────────────────────────────── */

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(10,10,15,0.75)] backdrop-blur-2xl border-b border-[var(--glass-border)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--accent-violet)] via-[var(--accent-purple)] to-[var(--accent-indigo)] p-[1px] shadow-[0_0_20px_rgba(124,58,237,0.4)] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all duration-300">
            <div className="w-full h-full bg-[#0E0C18] rounded-2xl flex items-center justify-center text-lg font-bold text-white">
              🔮
            </div>
          </div>
          <span className="text-xl font-bold font-[var(--font-heading)] gradient-text tracking-tight">
            VibeForge
          </span>
        </Link>

        {/* Center Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a
            href="#how-it-works"
            className="text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            How It Works
          </a>
          <a
            href="#features"
            className="text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            Features
          </a>
          <Link
            href="/pricing"
            className="text-[var(--text-secondary)] hover:text-white transition-colors"
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
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative pt-36 pb-20 md:pt-48 md:pb-36 px-6 bg-mesh overflow-hidden">
      {/* Decorative Radial Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-[var(--accent-violet)] opacity-[0.12] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[var(--accent-indigo)] opacity-[0.08] rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        className="max-w-4xl mx-auto text-center"
        initial={shouldReduceMotion ? undefined : "hidden"}
        animate={shouldReduceMotion ? undefined : "visible"}
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="flex justify-center mb-6">
          <Badge color="violet" dot className="shadow-lg">
            Multi-Agent Life Simulation & Execution Engine
          </Badge>
        </motion.div>

        <motion.h1
          variants={fadeInUp}
          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 text-balance leading-[1.08]"
        >
          See Your{" "}
          <span className="gradient-text">Future Self</span>
          <br />
          Before You Get There
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 text-balance leading-relaxed"
        >
          Input your ambitions. Our autonomous AI multi-agent pipeline researches market trends, simulates 3 parallel futures, renders cinematic holograms, and generates a week-by-week execution protocol.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10"
        >
          <Link href="/dashboard/simulate" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" className="w-full sm:w-auto px-8 py-4 shadow-xl">
              <SparklesIcon />
              <span>Start Free Simulation</span>
            </Button>
          </Link>
          <Link href="/dashboard/results/sim-demo" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto px-8 py-4">
              <span>⚡ Explore Live Demo</span>
            </Button>
          </Link>
        </motion.div>

        {/* Highlight Pills */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
        >
          <span className="px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs font-medium text-[var(--text-muted)] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            3 Parallel Timelines
          </span>
          <span className="px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs font-medium text-[var(--text-muted)] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            120-Week Action Protocol
          </span>
          <span className="px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs font-medium text-[var(--text-muted)] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            AI Rival & Tamagotchi Accountability
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── How It Works ──────────────────────────────────────────── */

const steps = [
  {
    icon: CompassIcon,
    color: "from-violet-500/20 to-indigo-500/20",
    border: "rgba(124, 58, 237, 0.4)",
    title: "1. Share Your Goals",
    description:
      "Specify your current situation, skills, target horizon (1 to 10 years), and risk tolerance.",
  },
  {
    icon: CpuIcon,
    color: "from-cyan-500/20 to-blue-500/20",
    border: "rgba(6, 182, 212, 0.4)",
    title: "2. Multi-Agent AI Simulates",
    description:
      "Researcher, Simulator, Visualizer, and Deployer agents orchestrate 3 distinct branching life paths.",
  },
  {
    icon: ChecklistIcon,
    color: "from-emerald-500/20 to-teal-500/20",
    border: "rgba(16, 185, 129, 0.4)",
    title: "3. Execute Your Protocol",
    description:
      "Get a granular weekly plan, YouTube tutorials, habit trackers, AI voice story, and rival benchmark.",
  },
];

function HowItWorks() {
  return (
    <section className="section-padding relative" id="how-it-works">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Badge color="cyan" dot className="mb-4">
              Architecture & Workflow
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4"
          >
            How VibeForge Works
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-[var(--text-secondary)] text-base md:text-lg max-w-xl mx-auto"
          >
            From raw ambitions to algorithmic execution in three seamless stages.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div key={i} variants={fadeInUp}>
                <Card
                  elevated
                  className="h-full flex flex-col items-center text-center p-8 group hover:-translate-y-2 transition-all duration-300"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white bg-gradient-to-br transition-transform duration-300 group-hover:scale-110 shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${step.border}, rgba(255,255,255,0.05))`,
                      border: `1px solid ${step.border}`,
                    }}
                  >
                    <Icon />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{step.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {step.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Features Grid ─────────────────────────────────────────── */

const features = [
  {
    icon: TimelineIcon,
    title: "Monte Carlo Multiverse",
    tag: "Stochastic Engine",
    description:
      "1,000 parallel random walk simulations compute quantitative P10, P50, and P90 confidence percentiles.",
  },
  {
    icon: CompassIcon,
    title: "What-If Timeline Forking",
    tag: "Counterfactual",
    description:
      "Branch any milestone to model career pivots and strategic investments with real-time downstream re-synthesis.",
  },
  {
    icon: VisualsIcon,
    title: "4K Hologram Lightbox",
    tag: "Visualizer",
    description:
      "Inspect high-resolution visual milestones with 3D cylindrical hologram cylinder and 2D high-density grid.",
  },
  {
    icon: ChecklistIcon,
    title: "120-Week Action Protocol",
    tag: "Deployer",
    description:
      "Algorithmic timeline expansion generates granular sprint tasks, deliverable rubrics, and habit loops.",
  },
  {
    icon: CpuIcon,
    title: "Autonomous Shadow Rival",
    tag: "Gamified",
    description:
      "Compete against an AI adversarial competitor that executes quarterly counter-moves and threat alerts.",
  },
  {
    icon: CalendarIcon,
    title: "Multi-Agent SSE Streaming",
    tag: "Real-time Stream",
    description:
      "Zero-latency Server-Sent Events stream live agent thought telemetry directly to your workspace.",
  },
];

function FeaturesGrid() {
  return (
    <section className="section-padding bg-[var(--bg-secondary)] relative" id="features">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Badge color="violet" dot className="mb-4">
              Engine Capabilities
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4"
          >
            Engineered For{" "}
            <span className="gradient-text">Relentless Execution</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-[var(--text-secondary)] text-base md:text-lg max-w-2xl mx-auto"
          >
            Powered by LangGraph multi-agent orchestration to turn abstract ambition into systematic reality.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div key={i} variants={fadeInUp}>
                <Card
                  className="h-full p-7 group hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                  glowColor="#7C3AED"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[var(--accent-purple)] group-hover:scale-110 group-hover:border-[var(--accent-purple)] transition-all duration-300">
                        <Icon />
                      </div>
                      <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {feature.tag}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-white group-hover:text-[var(--accent-purple)] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Bottom CTA ────────────────────────────────────────────── */

function BottomCTA() {
  return (
    <section className="section-padding relative">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="max-w-4xl mx-auto"
      >
        <motion.div
          variants={fadeInUp}
          className="relative rounded-3xl p-10 sm:p-16 text-center overflow-hidden border border-purple-500/30 bg-gradient-to-b from-purple-950/30 via-[var(--bg-secondary)] to-[#0A0A0F] shadow-[0_0_60px_rgba(124,58,237,0.2)]"
        >
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-[var(--accent-violet)] opacity-20 rounded-full blur-[100px] pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-bold mb-4 relative z-10 tracking-tight text-white">
            Excuses End Here.
            <br />
            <span className="gradient-text">Execute Your Vision.</span>
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto relative z-10">
            Average is a choice. Greatness is a protocol. Stop letting the future happen to you and start engineering it today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
            <Link href="/dashboard/simulate" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto px-8 py-4 shadow-xl">
                <span>🚀 Launch Simulation</span>
                <ArrowRightIcon />
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── Footer ────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-[var(--glass-border)] py-10 px-6 bg-[#07070B]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔮</span>
          <span className="font-bold font-[var(--font-heading)] gradient-text text-lg">
            VibeForge
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] text-center md:text-left">
          © {new Date().getFullYear()} VibeForge AI. Built for high-agency architects of the future.
        </p>
        <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)]">
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms
          </Link>
          <Link href="/pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
        </div>
      </div>
    </footer>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */

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
