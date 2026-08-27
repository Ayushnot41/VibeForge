"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import careerStats from "@/data/careerStats.json";

// ── Types ─────────────────────────────────────────────────────────────────────
interface CareerStat {
  title: string;
  emoji: string;
  marketDemand: string;
  demandDetail: string;
  salaryRange: string;
  salaryGlobal: string;
  topSkill: string;
  growthRate: string;
  timeToHire: string;
  topCompanies: string[];
}

interface ClassifyResult {
  category: string;
  confidence: number;
  source: "ml" | "fallback";
}

interface RealityCheckPanelProps {
  goal: string;
}

// ── Category label map ─────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  ml_engineer:      "Machine Learning Engineer",
  full_stack_dev:   "Full Stack Developer",
  commercial_pilot: "Commercial Airline Pilot",
  data_scientist:   "Data Scientist",
  product_manager:  "Product Manager",
  other:            "General / Entrepreneurship",
};

// ── Stat Card Component ────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  detail,
  borderColor,
  glowColor,
  delay = 0,
}: {
  icon: string;
  label: string;
  value: string;
  detail: string;
  borderColor: string;
  glowColor: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="relative flex-1 min-w-0 rounded-2xl p-5 overflow-hidden"
      style={{
        background: "var(--glass-bg)",
        border: `1px solid var(--glass-border)`,
        borderLeft: `3px solid ${borderColor}`,
        boxShadow: `0 0 24px ${glowColor}, var(--shadow-card)`,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Glow layer */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(circle at 0% 50%, ${glowColor} 0%, transparent 65%)` }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{icon}</span>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: borderColor }}>
            {label}
          </span>
        </div>
        <p className="text-white font-bold text-lg leading-tight mb-1">{value}</p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{detail}</p>
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function RealityCheckPanel({ goal }: RealityCheckPanelProps) {
  const [result, setResult] = useState<ClassifyResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!goal) { setLoading(false); return; }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/classify-goal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goal }),
        });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setResult(data);
        }
      } catch {
        // silent fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [goal]);

  const category  = result?.category ?? "other";
  const stats     = (careerStats as Record<string, CareerStat>)[category] ?? (careerStats as Record<string, CareerStat>).other;
  const label     = CATEGORY_LABELS[category] ?? "General";
  const isFallback = result?.source === "fallback";
  const confidence = result?.confidence ?? null;

  return (
    <div className="space-y-6">
      {/* Header badge */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
          >
            <div className="w-4 h-4 rounded-full border-2 border-[var(--accent-violet)]/30 border-t-[var(--accent-violet)] animate-spin" />
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              Classifying career path with ML model…
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap items-center gap-3 px-5 py-3 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(99,102,241,0.06) 100%)",
              border: "1px solid rgba(124,58,237,0.3)",
              boxShadow: "0 0 20px rgba(124,58,237,0.12)",
            }}
          >
            <span className="text-2xl">{stats.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--accent-purple)" }}>
                Detected Career Path
              </p>
              <p className="text-white font-bold text-sm md:text-base truncate">{label}</p>
            </div>
            <div className="shrink-0">
              {isFallback ? (
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: "rgba(245,158,11,0.15)", color: "var(--accent-amber)", border: "1px solid rgba(245,158,11,0.3)" }}
                >
                  keyword match
                </span>
              ) : confidence !== null ? (
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: "rgba(16,185,129,0.15)", color: "var(--accent-emerald)", border: "1px solid rgba(16,185,129,0.3)" }}
                >
                  {Math.round(confidence * 100)}% confidence
                </span>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Growth rate strip */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
          style={{ background: "rgba(16,185,129,0.08)", color: "var(--accent-emerald)", border: "1px solid rgba(16,185,129,0.2)" }}
        >
          <span>📈</span>
          <span>{stats.growthRate}</span>
          <span className="mx-2 opacity-30">·</span>
          <span>⏱</span>
          <span>{stats.timeToHire}</span>
        </motion.div>
      )}

      {/* 3 Stat Cards */}
      {!loading && (
        <div className="flex flex-col sm:flex-row gap-4">
          <StatCard
            icon="🌐"
            label="Market Demand"
            value={stats.marketDemand}
            detail={stats.demandDetail}
            borderColor="#3B82F6"
            glowColor="rgba(59,130,246,0.12)"
            delay={0.1}
          />
          <StatCard
            icon="💰"
            label="Average Entry Salary"
            value={stats.salaryRange}
            detail={stats.salaryGlobal}
            borderColor="#10B981"
            glowColor="rgba(16,185,129,0.12)"
            delay={0.2}
          />
          <StatCard
            icon="⚡"
            label="Top In-Demand Skill"
            value={stats.topSkill}
            detail={`Also hiring at: ${stats.topCompanies.slice(0, 2).join(", ")}`}
            borderColor="#A855F7"
            glowColor="rgba(168,85,247,0.12)"
            delay={0.3}
          />
        </div>
      )}

      {/* Top Companies */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-2"
        >
          <span className="text-xs font-bold uppercase tracking-widest mr-1" style={{ color: "var(--text-muted)" }}>Top Hiring:</span>
          {stats.topCompanies.map((co) => (
            <span
              key={co}
              className="text-xs px-2.5 py-1 rounded-lg font-medium"
              style={{
                background: "var(--glass-bg-elevated)",
                color: "var(--text-secondary)",
                border: "1px solid var(--glass-border)",
              }}
            >
              {co}
            </span>
          ))}
        </motion.div>
      )}

      {/* Disclaimer */}
      {!loading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          📋 Estimates based on aggregated industry data as of 2026. Actual results vary by location, experience, and market conditions. The career path is detected via {isFallback ? "keyword matching (ML service offline)" : "a TF-IDF + Logistic Regression classifier"}.
        </motion.p>
      )}
    </div>
  );
}
