"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

/* ─── Animation ─────────────────────────────────────────────── */

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── Demo Data ─────────────────────────────────────────────── */

interface SavedSim {
  id: string;
  title: string;
  date: string;
  status: "completed" | "processing";
  paths: number;
  horizon: string;
}

const stats = [
  { label: "Simulations Run", value: "12", emoji: "🔮" },
  { label: "Paths Explored", value: "36", emoji: "🌿" },
  { label: "Actions Completed", value: "89", emoji: "✅" },
];

/* ─── Page ──────────────────────────────────────────────────── */

export default function DashboardPage() {
  const [recentSimulations, setRecentSimulations] = React.useState<SavedSim[]>([]);

  React.useEffect(() => {
    const loadedSims: SavedSim[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sim_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || "{}");
          if (data.userInput && data.userInput.goals) {
            loadedSims.push({
              id: key.replace("sim_", ""),
              title: data.userInput.goals.substring(0, 40) + (data.userInput.goals.length > 40 ? "..." : ""),
              date: new Date(data.timestamp || Date.now()).toLocaleDateString(),
              status: data.status === "complete" ? "completed" : "processing",
              paths: data.futurePaths?.length || 0,
              horizon: data.userInput.timeHorizon.replace("_", " "),
            });
          }
        } catch (e) {
          console.error("Failed to parse sim data", e);
        }
      }
    }
    // Sort newest first
    loadedSims.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setTimeout(() => setRecentSimulations(loadedSims), 0);
  }, []);
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-8"
    >
      {/* Welcome */}
      <motion.div variants={fadeIn}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-[var(--text-secondary)] text-lg">
          Ready to explore more futures? Your simulations are waiting.
        </p>
      </motion.div>

      {/* Quick Start */}
      <motion.div variants={fadeIn}>
        <Card
          className="relative overflow-hidden"
          glowColor="#7C3AED"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-[var(--accent-violet)] opacity-10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                ✨ Start a New Simulation
              </h2>
              <p className="text-[var(--text-secondary)] max-w-md">
                Tell us your goals and let AI simulate 3 parallel futures for
                you — with visuals, narration, and action plans.
              </p>
            </div>
            <Link href="/dashboard/simulate">
              <Button size="lg" variant="primary">
                🚀 New Simulation
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="text-center py-6">
            <div className="text-3xl mb-2">{stat.emoji}</div>
            <div className="text-3xl font-bold gradient-text mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              {stat.label}
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Recent Simulations */}
      <motion.div variants={fadeIn}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Recent Simulations</h2>
          <Button variant="ghost" size="sm">
            View All →
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentSimulations.length > 0 ? (
            recentSimulations.map((sim) => (
              <Link
                key={sim.id}
                href={`/dashboard/results/${sim.id}`}
              >
                <Card className="h-full group cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <Badge
                      color={sim.status === "completed" ? "green" : "amber"}
                    >
                      {sim.status === "completed" ? "✅ Completed" : "🔄 Processing"}
                    </Badge>
                    <span className="text-xs text-[var(--text-muted)]">
                      {sim.date}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-[var(--accent-purple)] transition-colors">
                    {sim.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                    <span>🔮 {sim.paths} paths</span>
                    <span>⏱️ {sim.horizon}</span>
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-3 text-center py-10 bg-white/5 rounded-xl border border-white/10">
              <p className="text-[var(--text-secondary)]">No simulations found. Run your first simulation to see it here!</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
