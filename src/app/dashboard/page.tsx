"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

/* ─── Animation ─────────────────────────────────────────────── */

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── Types ─────────────────────────────────────────────────── */

interface SavedSim {
  id: string;
  title: string;
  date: string;
  status: "completed" | "processing";
  paths: number;
  horizon: string;
  isDemo?: boolean;
}

export default function DashboardPage() {
  const [recentSimulations, setRecentSimulations] = useState<SavedSim[]>([]);
  const [activeModal, setActiveModal] = useState<"sims" | "paths" | "actions" | null>(null);

  useEffect(() => {
    loadUserSimulations();
  }, []);

  const loadUserSimulations = () => {
    const loadedSims: SavedSim[] = [];
    if (typeof window !== "undefined") {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("sim_") && key !== "sim_sim-demo") {
          try {
            const data = JSON.parse(localStorage.getItem(key) || "{}");
            if (data.userInput && data.userInput.goals) {
              loadedSims.push({
                id: key.replace("sim_", ""),
                title: data.userInput.goals.substring(0, 52) + (data.userInput.goals.length > 52 ? "..." : ""),
                date: new Date(data.timestamp || Date.now()).toLocaleDateString(),
                status: data.status === "complete" ? "completed" : "processing",
                paths: data.futurePaths?.length || 3,
                horizon: data.userInput.timeHorizon ? data.userInput.timeHorizon.replace("_", " ") : "3 years",
              });
            }
          } catch (e) {
            console.error("Failed to parse sim data", e);
          }
        }
      }
    }
    setRecentSimulations(loadedSims);
  };

  const handleClearSimulations = () => {
    if (typeof window !== "undefined" && confirm("Clear your recent simulation history?")) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("sim_") && key !== "sim_sim-demo") {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      setRecentSimulations([]);
    }
  };

  const totalSimsCount = Math.max(recentSimulations.length, 1);
  const totalPathsCount = recentSimulations.length > 0 ? recentSimulations.length * 3 : 3;
  const totalActionsCount = recentSimulations.length > 0 ? recentSimulations.length * 12 : 12;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-8"
    >
      {/* Welcome & Pro Upgrade Bar */}
      <motion.div variants={fadeIn}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight text-white font-[var(--font-heading)]">
              Command Overview ⚡
            </h1>
            <p className="text-[var(--text-secondary)] text-sm md:text-base">
              Autonomous multi-agent execution hub. Simulate realities, orchestrate timelines, and conquer protocols.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/checkout/pro?billing=monthly&price=799">
              <Button variant="primary" size="md" className="shadow-[0_0_20px_rgba(168,85,247,0.4)] font-bold">
                ⚡ Get Pro (₹799/mo)
              </Button>
            </Link>
            <Link href="/dashboard/simulate">
              <Button variant="secondary" size="md">
                + New Simulation
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Start Hero Card */}
      <motion.div variants={fadeIn}>
        <Card
          elevated
          className="relative overflow-hidden p-8 sm:p-10 border border-purple-500/30 shadow-[0_0_50px_rgba(124,58,237,0.15)]"
          glowColor="#7C3AED"
        >
          <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-[var(--accent-purple)] opacity-15 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <Badge color="violet" dot className="mb-3">
                Autonomous 4-Agent Protocol
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white font-[var(--font-heading)]">
                Forge a New Future Timeline
              </h2>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
                Input your target horizon and risk profile. Our agents synthesize market research, simulate 3 distinct pathways, render 4K future holograms, and deploy a 120-week action protocol.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link href="/dashboard/simulate" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" className="w-full justify-center shadow-lg font-bold">
                  🚀 Launch Wizard
                </Button>
              </Link>
              <Link href="/dashboard/results/sim-demo" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full justify-center">
                  ⚡ Open Demo Hub
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Live Clickable Stats Row */}
      <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Simulations Run */}
        <div 
          onClick={() => setActiveModal("sims")}
          className="cursor-pointer group"
          role="button"
          tabIndex={0}
        >
          <Card className="flex items-center gap-4 p-6 hover:-translate-y-1.5 transition-all duration-300 border-white/10 group-hover:border-purple-500/50 shadow-lg group-hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, rgba(168,85,247,0.4), rgba(255,255,255,0.05))`,
                border: `1px solid rgba(168,85,247,0.3)`,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black gradient-text">{totalSimsCount}</span>
                <span className="text-[11px] text-[var(--accent-purple)] font-bold uppercase tracking-wider">Live Hub →</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">
                Simulations Run
              </div>
            </div>
          </Card>
        </div>

        {/* Card 2: Paths Explored */}
        <div 
          onClick={() => setActiveModal("paths")}
          className="cursor-pointer group"
          role="button"
          tabIndex={0}
        >
          <Card className="flex items-center gap-4 p-6 hover:-translate-y-1.5 transition-all duration-300 border-white/10 group-hover:border-cyan-500/50 shadow-lg group-hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, rgba(6,182,212,0.4), rgba(255,255,255,0.05))`,
                border: `1px solid rgba(6,182,212,0.3)`,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-cyan-400">{totalPathsCount}</span>
                <span className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider">Multiverse →</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">
                Path Explorer
              </div>
            </div>
          </Card>
        </div>

        {/* Card 3: Actions Completed */}
        <div 
          onClick={() => setActiveModal("actions")}
          className="cursor-pointer group"
          role="button"
          tabIndex={0}
        >
          <Card className="flex items-center gap-4 p-6 hover:-translate-y-1.5 transition-all duration-300 border-white/10 group-hover:border-emerald-500/50 shadow-lg group-hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, rgba(16,185,129,0.4), rgba(255,255,255,0.05))`,
                border: `1px solid rgba(16,185,129,0.3)`,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-emerald-400">{totalActionsCount}</span>
                <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Tracker →</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">
                Actions Completed
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Active Simulations Section */}
      <motion.div variants={fadeIn}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white font-[var(--font-heading)]">Recent Simulations</h2>
            <Badge color="violet" dot>{recentSimulations.length} Custom</Badge>
          </div>

          <div className="flex items-center gap-2">
            {recentSimulations.length > 0 && (
              <button
                onClick={handleClearSimulations}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
              >
                Clear History
              </button>
            )}

            <Link href="/dashboard/my-simulations">
              <Button variant="ghost" size="sm" className="hover:text-[var(--accent-purple)] font-semibold">
                View All Simulations →
              </Button>
            </Link>
          </div>
        </div>

        {recentSimulations.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center border-dashed border-white/15 bg-white/[0.01]">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mx-auto mb-4">
              🔮
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Custom Simulations Found</h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-6">
              You haven&apos;t run a custom simulation yet. Create one or test our interactive sample protocol below.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/dashboard/simulate">
                <Button variant="primary" size="md">
                  🚀 Launch First Simulation
                </Button>
              </Link>
              <Link href="/dashboard/results/sim-demo">
                <Button variant="secondary" size="md">
                  ⚡ Preview Sample Simulation
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentSimulations.map((sim) => (
              <Link key={sim.id} href={`/dashboard/results/${sim.id}`}>
                <Card className="h-full group cursor-pointer hover:border-[var(--accent-purple)] transition-all duration-300 flex flex-col justify-between p-6 shadow-md hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <Badge color="violet" dot>
                        Completed
                      </Badge>
                      <span className="text-xs text-[var(--text-muted)]">
                        {sim.date}
                      </span>
                    </div>
                    <h3 className="text-base font-bold mb-2 text-white group-hover:text-[var(--accent-purple)] transition-colors line-clamp-2">
                      {sim.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold text-[var(--text-secondary)] pt-4 border-t border-white/5 mt-4">
                    <span className="flex items-center gap-1.5 text-purple-300">
                      <span>🔮</span> {sim.paths} Paths
                    </span>
                    <span className="flex items-center gap-1.5 text-cyan-300">
                      <span>⏱️</span> {sim.horizon}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* Interactive Modal Portals for Stat Buttons */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[#0F0F16] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(124,58,237,0.3)] relative"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-colors"
              >
                ✕
              </button>

              {activeModal === "sims" && (
                <div>
                  <Badge color="violet" dot className="mb-2">Simulation Engine</Badge>
                  <h3 className="text-2xl font-bold text-white mb-2 font-[var(--font-heading)]">Simulations Intelligence Hub</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-6">
                    Real-time synthesis performance across your lifetime timeline models.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                      <span className="text-xs text-gray-400 block mb-1">Active Runs</span>
                      <span className="text-2xl font-black text-white">{totalSimsCount}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                      <span className="text-xs text-gray-400 block mb-1">Synthesis Success</span>
                      <span className="text-2xl font-black text-emerald-400">99.4%</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link href="/dashboard/simulate" className="flex-1">
                      <Button variant="primary" size="md" fullWidth>
                        🚀 Launch New Simulation
                      </Button>
                    </Link>
                    <Link href="/dashboard/my-simulations" className="flex-1">
                      <Button variant="secondary" size="md" fullWidth>
                        📂 View All Records
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {activeModal === "paths" && (
                <div>
                  <Badge color="cyan" dot className="mb-2">Multiverse Analysis</Badge>
                  <h3 className="text-2xl font-bold text-white mb-2 font-[var(--font-heading)]">Parallel Path Explorer</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-6">
                    Comparison matrix of simulated future trajectories across risk and opportunity vectors.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-purple-300 block">Path A: Optimistic Horizon</span>
                        <span className="text-xs text-white/70">Breakthrough scaling with venture backing</span>
                      </div>
                      <Badge color="emerald">88% Match</Badge>
                    </div>

                    <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-cyan-300 block">Path B: Realistic Horizon</span>
                        <span className="text-xs text-white/70">Bootstrapped sustainable organic expansion</span>
                      </div>
                      <Badge color="cyan">94% Match</Badge>
                    </div>

                    <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-rose-300 block">Path C: Risk Mitigated Horizon</span>
                        <span className="text-xs text-white/70">Macro-defensive pivots and resilience hedging</span>
                      </div>
                      <Badge color="rose">72% Match</Badge>
                    </div>
                  </div>

                  <Link href="/dashboard/results/sim-demo">
                    <Button variant="primary" size="md" fullWidth>
                      🌌 Explore 3D Timeline Visualization →
                    </Button>
                  </Link>
                </div>
              )}

              {activeModal === "actions" && (
                <div>
                  <Badge color="emerald" dot className="mb-2">Execution Protocol</Badge>
                  <h3 className="text-2xl font-bold text-white mb-2 font-[var(--font-heading)]">Global Action Protocol Tracker</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-6">
                    Weekly sprint milestones, habit streaks, and execution velocity.
                  </p>

                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/30 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-emerald-300">12-Week Sprint Velocity</span>
                      <span className="text-sm font-black text-emerald-400">76% Completed</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full w-3/4" />
                    </div>
                  </div>

                  <Link href="/dashboard/action-plan/sim-demo">
                    <Button variant="primary" size="md" fullWidth>
                      📋 Open Interactive 3D Action Plan →
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
