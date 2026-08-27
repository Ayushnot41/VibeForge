"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import { Input as TextInput } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { DEMO_SIMULATION } from "@/lib/demoSimulation";

/* ─── Types ─────────────────────────────────────────────────── */

interface FormData {
  situation: string;
  skills: string[];
  location: string;
  goals: string;
  timeHorizon: string;
  customWeeks?: number;
  riskTolerance: number;
}

const initialForm: FormData = {
  situation: "",
  skills: [],
  location: "",
  goals: "",
  timeHorizon: "36_weeks",
  customWeeks: undefined,
  riskTolerance: 50,
};

/* ─── Step Config ───────────────────────────────────────────── */

const stepLabels = [
  "Current Profile",
  "Aspirations & Goals",
  "Timeframe & Risk",
  "Review & Synthesize",
];

const timeHorizons = [
  { value: "6_weeks", label: "6 Weeks", emoji: "⚡", sub: "Rapid Sprint" },
  { value: "12_weeks", label: "12 Weeks", emoji: "🏃", sub: "Quarter Goal" },
  { value: "24_weeks", label: "24 Weeks", emoji: "🚀", sub: "6-Month Build" },
  { value: "36_weeks", label: "36 Weeks", emoji: "🔥", sub: "9-Month Mastery" },
  { value: "1_year", label: "1 Year", emoji: "🎯", sub: "52-Week Journey" },
  { value: "3_years", label: "3 Years", emoji: "🌟", sub: "Multi-Year Empire" },
  { value: "5_years", label: "5 Years", emoji: "🌌", sub: "Industry Leader" },
];

/* ─── Animations ────────────────────────────────────────────── */

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

/* ─── Step Components ───────────────────────────────────────── */

function Step1({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (d: Partial<FormData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-white">Your Current Baseline 📍</h2>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
          Where are you starting from today? Specify your technical background, current role, and core strengths.
        </p>
      </div>

      <Textarea
        label="Current Situation & Background"
        placeholder="e.g. 21-year-old student living in Kolkata with strong communication skills and analytical mindset, looking to start my career journey..."
        value={data.situation}
        onChange={(e) => onChange({ situation: e.target.value })}
        className="min-h-[140px]"
      />

      <Textarea
        label="Core Skills & Superpowers"
        placeholder="e.g. Communication, Analytical Thinking, Fast Learner, Discipline, Problem Solving, Market Awareness"
        value={data.skills.join(", ")}
        onChange={(e) =>
          onChange({
            skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
          })
        }
        className="min-h-[90px]"
      />

      <TextInput
        label="Location / Target Market"
        placeholder="e.g. Kolkata, India / Mumbai / Remote"
        value={data.location}
        onChange={(e) => onChange({ location: e.target.value })}
      />
    </div>
  );
}

function Step2({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (d: Partial<FormData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-white">Your Ultimate Vision 🎯</h2>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
          Define your targets without artificial limits. Our multi-agent engine will reverse-engineer the required execution milestones.
        </p>
      </div>

      <Textarea
        label="What is your primary career or life goal?"
        placeholder="e.g. Become a full-time profitable trader within 3 years, mastering price action, risk management, and capital scaling from student baseline..."
        value={data.goals}
        onChange={(e) => onChange({ goals: e.target.value })}
        className="min-h-[180px]"
      />
    </div>
  );
}

function Step3({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (d: Partial<FormData>) => void;
}) {
  const riskLabel =
    data.riskTolerance < 33
      ? "Conservative (High Stability)"
      : data.riskTolerance < 66
        ? "Moderate (Calculated Asymmetry)"
        : "Aggressive (Extreme High-Growth)";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-white">Timeline Horizon & Risk Profile ⚙️</h2>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
          How far ahead should we project, and what intensity level suits your strategy?
        </p>
      </div>

      {/* Time Horizon */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Target Horizon / Timeline
          </label>
          <span className="text-xs text-white/50 font-mono">
            {data.customWeeks ? `${data.customWeeks} Custom Weeks` : data.timeHorizon.replace("_", " ")}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {timeHorizons.map((th) => (
            <button
              key={th.value}
              type="button"
              onClick={() => onChange({ timeHorizon: th.value, customWeeks: undefined })}
              className={cn(
                "flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-200 cursor-pointer",
                data.timeHorizon === th.value && !data.customWeeks
                  ? "bg-[rgba(124,58,237,0.18)] border-[var(--accent-purple)] shadow-[0_0_20px_rgba(124,58,237,0.3)] text-white"
                  : "bg-[rgba(255,255,255,0.03)] border-white/10 hover:border-white/20 text-[var(--text-secondary)]"
              )}
            >
              <span className="text-2xl mb-1">{th.emoji}</span>
              <span className="text-sm font-bold text-white mb-0.5">{th.label}</span>
              <span className="text-[11px] text-[var(--text-muted)]">{th.sub}</span>
            </button>
          ))}
        </div>

        {/* Or enter custom weeks */}
        <div className="pt-2 flex items-center gap-3">
          <span className="text-xs text-white/50 font-mono whitespace-nowrap">Or custom duration:</span>
          <input
            type="number"
            min={2}
            max={260}
            placeholder="e.g. 8, 16, 24, 36, 48 weeks"
            value={data.customWeeks || ""}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              onChange({ customWeeks: isNaN(val) ? undefined : val });
            }}
            className="w-44 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--accent-purple)] font-mono"
          />
          <span className="text-xs text-white/40 font-mono">weeks</span>
        </div>
      </div>

      {/* Risk Tolerance */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Risk Tolerance
          </label>
          <span className="text-xs font-bold text-[var(--accent-purple)] bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
            {riskLabel}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={data.riskTolerance}
          onChange={(e) =>
            onChange({ riskTolerance: parseInt(e.target.value) })
          }
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[var(--bg-secondary)] accent-[var(--accent-purple)]"
        />
        <div className="flex justify-between text-xs text-[var(--text-muted)]">
          <span>🛡️ Methodical & Low Drawdown</span>
          <span>⚡ High Asymmetry & Velocity</span>
        </div>
      </div>
    </div>
  );
}

function Step4({ data }: { data: FormData }) {
  const horizonLabel = timeHorizons.find(
    (t) => t.value === data.timeHorizon
  )?.label;
  const riskLabel =
    data.riskTolerance < 33
      ? "Conservative"
      : data.riskTolerance < 66
        ? "Moderate"
        : "Aggressive";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-white">Review & Synthesize 🚀</h2>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
          Verify your simulation parameters. Launching will trigger the Researcher, Simulator, Visualizer, and Deployer multi-agent pipeline.
        </p>
      </div>

      <Card elevated className="space-y-4 p-6 border border-white/10">
        <ReviewRow label="Situation" value={data.situation || "Student / Early Career"} />
        <ReviewRow
          label="Skills"
          value={
            data.skills.length > 0 ? data.skills.join(", ") : "Communication, Analysis"
          }
        />
        <ReviewRow label="Location" value={data.location || "India"} />
        <ReviewRow label="Goals" value={data.goals || "Career Mastery"} />
        <ReviewRow label="Horizon" value={horizonLabel || "3 Years"} />
        <ReviewRow label="Risk Profile" value={riskLabel} />
      </Card>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-1.5 border-b border-white/5 last:border-0">
      <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider sm:w-28 shrink-0">
        {label}
      </span>
      <span className="text-sm text-[var(--text-primary)] font-medium leading-relaxed">
        {value}
      </span>
    </div>
  );
}

/* ─── Step Indicator ────────────────────────────────────────── */

function StepIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <React.Fragment key={i}>
          <div
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300",
              i <= currentStep
                ? "bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-indigo)] text-white shadow-[0_0_16px_rgba(124,58,237,0.4)]"
                : "bg-white/[0.04] text-[var(--text-muted)] border border-white/10"
            )}
          >
            {i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div
              className={cn(
                "w-10 sm:w-16 h-0.5 rounded-full transition-all duration-300",
                i < currentStep
                  ? "bg-[var(--accent-violet)]"
                  : "bg-white/10"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */

export default function SimulatePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<FormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const updateData = (partial: Partial<FormData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  const goNext = () => {
    if (step < 3) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const [agentProgressMsg, setAgentProgressMsg] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    setAgentProgressMsg("Connecting to Autonomous Multi-Agent Protocol...");
    setProgressPercent(10);

    const riskLabel =
      data.riskTolerance < 33
        ? "conservative"
        : data.riskTolerance < 66
          ? "moderate"
          : "aggressive";

    const id = uuidv4();

    try {
      // 1. Attempt Enterprise Server-Sent Events (SSE) stream
      const currentSit = data.situation.trim() || "Student in Kolkata";
      const targetGoal = data.goals.trim() || "Become a profitable trader";

      const response = await fetch("/api/simulation/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: {
            currentSituation: currentSit,
            goals: targetGoal,
            timeHorizon: data.timeHorizon,
            customWeeks: data.customWeeks,
            riskTolerance: riskLabel,
            additionalContext: [
              data.skills.length > 0 ? `Skills: ${data.skills.join(", ")}` : "",
              data.location ? `Location: ${data.location}` : "",
            ].filter(Boolean).join(". ") || undefined,
          },
        }),
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("event: agent_progress")) {
              const dataMatch = line.match(/data: (.*)/);
              if (dataMatch) {
                try {
                  const eventData = JSON.parse(dataMatch[1]);
                  setAgentProgressMsg(`[${eventData.agent}] ${eventData.message}`);
                  setProgressPercent(eventData.progress || 50);
                } catch (e) {}
              }
            } else if (line.startsWith("event: complete")) {
              const dataMatch = line.match(/data: (.*)/);
              if (dataMatch) {
                try {
                  const eventData = JSON.parse(dataMatch[1]);
                  const savedData = { ...eventData.state, id, localSavedAt: Date.now() };
                  localStorage.setItem(`sim_${id}`, JSON.stringify(savedData));

                  // Permanently store in master vault index
                  try {
                    const vaultRaw = localStorage.getItem("vibeforge_vault_simulations");
                    const vault = vaultRaw ? JSON.parse(vaultRaw) : [];
                    const entry = {
                      id,
                      title: savedData.userInput?.goals || "Career Transformation",
                      situation: savedData.userInput?.currentSituation || "",
                      timeHorizon: savedData.userInput?.timeHorizon || "3_years",
                      customWeeks: savedData.userInput?.customWeeks,
                      totalWeeks: savedData.actionPlan?.weeklyActions?.length || 12,
                      createdAt: Date.now(),
                    };
                    const updatedVault = [entry, ...vault.filter((v: any) => v.id !== id)];
                    localStorage.setItem("vibeforge_vault_simulations", JSON.stringify(updatedVault));
                  } catch (vErr) {
                    console.error("Vault save notice:", vErr);
                  }

                  setProgressPercent(100);
                  router.push(`/dashboard/results/${id}`);
                  return;
                } catch (e) {}
              }
            }
          }
        }
      }

      // Fallback if SSE completed without final redirect
      const fallbackData = {
        ...DEMO_SIMULATION,
        userInput: {
          currentSituation: currentSit,
          goals: targetGoal,
          timeHorizon: data.timeHorizon,
          riskTolerance: riskLabel,
        },
        localSavedAt: Date.now(),
      };
      localStorage.setItem(`sim_${id}`, JSON.stringify(fallbackData));
      router.push(`/dashboard/results/${id}`);
    } catch (err: unknown) {
      console.error(err);
      const currentSit = data.situation.trim() || "Student in Kolkata";
      const targetGoal = data.goals.trim() || "Become a profitable trader";
      const fallbackData = {
        ...DEMO_SIMULATION,
        userInput: {
          currentSituation: currentSit,
          goals: targetGoal,
          timeHorizon: data.timeHorizon,
          riskTolerance: riskLabel,
        },
        localSavedAt: Date.now(),
      };
      localStorage.setItem(`sim_${id}`, JSON.stringify(fallbackData));
      router.push(`/dashboard/results/${id}`);
    }
  };

  const steps = [
    <Step1 key="s1" data={data} onChange={updateData} />,
    <Step2 key="s2" data={data} onChange={updateData} />,
    <Step3 key="s3" data={data} onChange={updateData} />,
    <Step4 key="s4" data={data} />,
  ];

  return (
    <div className="max-w-2xl mx-auto py-4">
      <StepIndicator currentStep={step} totalSteps={4} />

      {/* Step Labels */}
      <div className="text-center mb-8">
        <span className="text-xs font-semibold text-[var(--accent-purple)] tracking-widest uppercase bg-purple-500/10 border border-purple-500/20 px-3.5 py-1 rounded-full">
          Step {step + 1} of 4 — {stepLabels[step]}
        </span>
      </div>

      {/* Animated Step Content */}
      <div className="relative overflow-hidden min-h-[380px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-[var(--glass-border)]">
        <Button
          variant="ghost"
          size="md"
          onClick={goBack}
          disabled={step === 0}
        >
          ← Back
        </Button>

        {step < 3 ? (
          <Button variant="primary" size="md" onClick={goNext}>
            Continue →
          </Button>
        ) : (
          <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="shadow-xl w-full sm:w-auto"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Synthesizing Multi-Agent Horizon...
                </span>
              ) : (
                "🚀 Launch Simulation"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Live SSE Multi-Agent Telemetry Stream Banner */}
      {isSubmitting && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-2xl bg-black/60 border border-purple-500/30 backdrop-blur-xl shadow-lg"
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-purple-300 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              {agentProgressMsg || "Initializing Multi-Agent Stream..."}
            </span>
            <span className="text-white/60 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </motion.div>
      )}

      {errorMsg && <p className="text-rose-400 text-xs mt-3 text-center">{errorMsg}</p>}
    </div>
  );
}
