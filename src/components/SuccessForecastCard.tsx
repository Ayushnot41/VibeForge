"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────────
interface CheckIn {
  weekNumber: number;
  completionPercent: number;
}

interface SuccessForecastCardProps {
  simulationId: string;
  checkIns: CheckIn[];
  totalWeeks: number;
  totalTasks: number;
  completedTasks: number;
}

interface ForecastResult {
  status: "on_track" | "at_risk";
  probability: number;
  features: {
    avg_completion_percent: number;
    completion_trend: number;
    weeks_elapsed_ratio: number;
    num_checkins_missed: number;
  };
}

// ── Feature Engineering ───────────────────────────────────────────────────────
function computeFeatures(
  checkIns: CheckIn[],
  totalWeeks: number,
): {
  avg_completion_percent: number;
  completion_trend: number;
  weeks_elapsed_ratio: number;
  num_checkins_missed: number;
} | null {
  if (!checkIns || checkIns.length < 2) return null;

  const sorted = [...checkIns].sort((a, b) => a.weekNumber - b.weekNumber);

  // avg completion
  const avg_completion_percent =
    sorted.reduce((s, c) => s + c.completionPercent, 0) / sorted.length;

  // completion_trend: slope over last 3 check-ins (pct pts / week)
  const last3 = sorted.slice(-3);
  let completion_trend = 0;
  if (last3.length >= 2) {
    const dx = last3[last3.length - 1].weekNumber - last3[0].weekNumber;
    const dy = last3[last3.length - 1].completionPercent - last3[0].completionPercent;
    completion_trend = dx > 0 ? dy / dx : 0;
  }

  // weeks_elapsed_ratio
  const maxWeekChecked = Math.max(...sorted.map((c) => c.weekNumber));
  const weeks_elapsed_ratio = totalWeeks > 0 ? Math.min(maxWeekChecked / totalWeeks, 1) : 0;

  // num_checkins_missed = weeks elapsed with no check-in
  const checkedWeeks = new Set(sorted.map((c) => c.weekNumber));
  let num_checkins_missed = 0;
  for (let w = 1; w <= maxWeekChecked; w++) {
    if (!checkedWeeks.has(w)) num_checkins_missed++;
  }

  return {
    avg_completion_percent: Math.round(avg_completion_percent * 100) / 100,
    completion_trend:       Math.round(completion_trend * 1000) / 1000,
    weeks_elapsed_ratio:    Math.round(weeks_elapsed_ratio * 10000) / 10000,
    num_checkins_missed,
  };
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SuccessForecastCard({
  checkIns,
  totalWeeks,
}: SuccessForecastCardProps) {
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [loading, setLoading]   = useState(false);
  const [hidden, setHidden]     = useState(false);

  const fetchForecast = useCallback(async () => {
    const features = computeFeatures(checkIns, totalWeeks);
    if (!features) return; // not enough data

    setLoading(true);
    try {
      const res = await fetch("/api/predict-success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(features),
      });
      if (!res.ok) { setHidden(true); return; }
      const data = await res.json();
      if (data.unavailable) { setHidden(true); return; }
      setForecast({ ...data, features });
    } catch {
      setHidden(true);
    } finally {
      setLoading(false);
    }
  }, [checkIns, totalWeeks]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  // Not enough data yet
  if (!checkIns || checkIns.length < 2) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          color: "var(--text-muted)",
        }}
      >
        <span className="text-lg">🔮</span>
        <span>
          <span className="font-bold text-white/80">Success Forecast: </span>
          Complete at least 2 check-ins to unlock your AI-powered success prediction.
        </span>
      </div>
    );
  }

  // Service unreachable — hide gracefully
  if (hidden) return null;

  // Loading state
  if (loading || !forecast) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
      >
        <div className="w-4 h-4 rounded-full border-2 border-[var(--accent-violet)]/30 border-t-[var(--accent-violet)] animate-spin" />
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          Running success probability model…
        </span>
      </div>
    );
  }

  const isOnTrack   = forecast.status === "on_track";
  const pct         = Math.round(forecast.probability * 100);
  const statusColor = isOnTrack ? "#10B981" : "#F59E0B";
  const statusBg    = isOnTrack ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)";
  const statusBorder= isOnTrack ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)";
  const statusGlow  = isOnTrack ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)";

  const trendArrow = forecast.features.completion_trend > 0.3 ? "↑" : forecast.features.completion_trend < -0.3 ? "↓" : "→";
  const trendColor = forecast.features.completion_trend > 0.3 ? "#10B981" : forecast.features.completion_trend < -0.3 ? "#F43F5E" : "#94A3B8";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${statusBg} 0%, var(--glass-bg) 100%)`,
          border: `1px solid ${statusBorder}`,
          boxShadow: `0 0 28px ${statusGlow}, var(--shadow-card)`,
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Glow pulse */}
        <div
          className="absolute inset-0 pointer-events-none animate-pulse"
          style={{ background: `radial-gradient(circle at 10% 50%, ${statusGlow} 0%, transparent 60%)`, animationDuration: "3s" }}
        />

        <div className="relative z-10 flex flex-wrap items-center gap-4 px-5 py-4">
          {/* Status pill */}
          <div className="flex items-center gap-2">
            <span className="text-xl">{isOnTrack ? "🟢" : "🟡"}</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--text-muted)" }}>
                Success Forecast
              </p>
              <span
                className="text-sm font-black px-3 py-1 rounded-full"
                style={{ background: statusBg, color: statusColor, border: `1px solid ${statusBorder}` }}
              >
                {isOnTrack ? "On Track" : "At Risk"}
              </span>
            </div>
          </div>

          {/* Probability ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                <circle
                  cx="18" cy="18" r="15.9"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="3"
                />
                <circle
                  cx="18" cy="18" r="15.9"
                  fill="none"
                  stroke={statusColor}
                  strokeWidth="3"
                  strokeDasharray={`${pct} ${100 - pct}`}
                  strokeLinecap="round"
                />
              </svg>
              <span
                className="absolute inset-0 flex items-center justify-center text-xs font-black"
                style={{ color: statusColor }}
              >
                {pct}%
              </span>
            </div>
            <p className="text-[10px] mt-0.5 font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              probability
            </p>
          </div>

          {/* Mini stats */}
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--text-muted)" }}>Avg. Completion</span>
              <span className="text-white font-bold text-sm">{forecast.features.avg_completion_percent.toFixed(1)}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--text-muted)" }}>Trend</span>
              <span className="font-bold text-sm" style={{ color: trendColor }}>{trendArrow} {Math.abs(forecast.features.completion_trend).toFixed(1)} pts/wk</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--text-muted)" }}>Missed Check-ins</span>
              <span className="text-white font-bold text-sm">{forecast.features.num_checkins_missed} weeks</span>
            </div>
          </div>

          {/* Source badge */}
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-lg self-start"
            style={{ background: "rgba(124,58,237,0.15)", color: "var(--accent-purple)", border: "1px solid rgba(124,58,237,0.25)" }}
          >
            RandomForest ML
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
