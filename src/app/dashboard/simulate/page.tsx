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

/* ─── Types ─────────────────────────────────────────────────── */

interface FormData {
  situation: string;
  skills: string[];
  location: string;
  goals: string;
  timeHorizon: "1_year" | "3_years" | "5_years" | "10_years";
  riskTolerance: number;
}

const initialForm: FormData = {
  situation: "",
  skills: [],
  location: "",
  goals: "",
  timeHorizon: "3_years",
  riskTolerance: 50,
};

/* ─── Step Config ───────────────────────────────────────────── */

const stepLabels = [
  "About You",
  "Your Goals",
  "Preferences",
  "Review & Launch",
];

const timeHorizons = [
  { value: "1_year" as const, label: "1 Year", emoji: "🏃" },
  { value: "3_years" as const, label: "3 Years", emoji: "🚀" },
  { value: "5_years" as const, label: "5 Years", emoji: "🌟" },
  { value: "10_years" as const, label: "10 Years", emoji: "🌌" },
];

/* ─── Animations ────────────────────────────────────────────── */

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 200 : -200,
    opacity: 0,
    transition: { duration: 0.25 },
  }),
};

/* ─── Removed SkillTags Component ───────────────────────────── */

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
        <h2 className="text-2xl font-bold mb-2">Tell Us About You 🙋</h2>
        <p className="text-[var(--text-secondary)]">
          What&apos;s your current situation? The more detail you give, the better
          your simulation.
        </p>
      </div>

      <Textarea
        label="Your Current Situation"
        placeholder="I'm a 22-year-old computer science student in my final year at university. I know Python, JavaScript, and some machine learning basics. I've done two internships at startups..."
        value={data.situation}
        onChange={(e) => onChange({ situation: e.target.value })}
        className="min-h-[160px]"
      />

      <Textarea
        label="Skills & Strengths"
        placeholder="e.g., Python, Leadership, Public Speaking, Design..."
        value={data.skills.join(", ")}
        onChange={(e) =>
          onChange({
            skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
          })
        }
        className="min-h-[100px]"
      />

      <TextInput
        label="Location"
        placeholder="e.g., San Francisco, CA"
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
        <h2 className="text-2xl font-bold mb-2">Your Goals 🎯</h2>
        <p className="text-[var(--text-secondary)]">
          What do you want to achieve? Dream big — our AI handles the rest.
        </p>
      </div>

      <Textarea
        label="What are your goals?"
        placeholder="I want to become a senior ML engineer at a top tech company, earn $200k+, build a side project that gets 10k users, and maintain a healthy work-life balance. I also want to start public speaking at tech conferences..."
        value={data.goals}
        onChange={(e) => onChange({ goals: e.target.value })}
        className="min-h-[200px]"
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
      ? "Conservative"
      : data.riskTolerance < 66
        ? "Moderate"
        : "Aggressive";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Preferences ⚙️</h2>
        <p className="text-[var(--text-secondary)]">
          How far ahead should we look, and how much risk are you comfortable
          with?
        </p>
      </div>

      {/* Time Horizon */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          Time Horizon
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {timeHorizons.map((th) => (
            <button
              key={th.value}
              type="button"
              onClick={() => onChange({ timeHorizon: th.value })}
              className={cn(
                "flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-200 cursor-pointer",
                data.timeHorizon === th.value
                  ? "bg-[rgba(124,58,237,0.15)] border-[var(--accent-violet)] shadow-[0_0_20px_rgba(124,58,237,0.2)]"
                  : "bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[rgba(124,58,237,0.3)]"
              )}
            >
              <span className="text-3xl">{th.emoji}</span>
              <span className="text-sm font-semibold">{th.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Risk Tolerance */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[var(--text-secondary)]">
            Risk Tolerance
          </label>
          <span className="text-sm font-medium text-[var(--accent-purple)]">
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
          className="w-full h-2 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-runnable-track]:rounded-full
            [&::-webkit-slider-runnable-track]:bg-[var(--bg-secondary)]
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[var(--accent-violet)]
            [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(124,58,237,0.5)]
            [&::-webkit-slider-thumb]:cursor-pointer
          "
        />
        <div className="flex justify-between text-xs text-[var(--text-muted)]">
          <span>🛡️ Play it safe</span>
          <span>⚡ High risk, high reward</span>
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
        <h2 className="text-2xl font-bold mb-2">Review & Launch 🚀</h2>
        <p className="text-[var(--text-secondary)]">
          Everything look good? Hit launch to start your AI simulation.
        </p>
      </div>

      <Card className="space-y-5">
        <ReviewRow label="Situation" value={data.situation || "Not provided"} />
        <ReviewRow
          label="Skills"
          value={
            data.skills.length > 0 ? data.skills.join(", ") : "None added"
          }
        />
        <ReviewRow label="Location" value={data.location || "Not provided"} />
        <ReviewRow label="Goals" value={data.goals || "Not provided"} />
        <ReviewRow label="Time Horizon" value={horizonLabel || "3 Years"} />
        <ReviewRow label="Risk Tolerance" value={riskLabel} />
      </Card>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
      <span className="text-sm font-medium text-[var(--text-muted)] sm:w-32 shrink-0">
        {label}
      </span>
      <span className="text-sm text-[var(--text-primary)] leading-relaxed">
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
    <div className="flex items-center justify-center gap-2 mb-10">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <React.Fragment key={i}>
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
              i <= currentStep
                ? "bg-[var(--accent-violet)] text-white shadow-[0_0_16px_rgba(124,58,237,0.4)]"
                : "bg-[var(--glass-bg)] text-[var(--text-muted)] border border-[var(--glass-border)]"
            )}
          >
            {i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div
              className={cn(
                "w-12 sm:w-20 h-0.5 rounded-full transition-all duration-300",
                i < currentStep
                  ? "bg-[var(--accent-violet)]"
                  : "bg-[var(--glass-border)]"
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const riskLabel =
        data.riskTolerance < 33
          ? "conservative"
          : data.riskTolerance < 66
            ? "moderate"
            : "aggressive";

      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentSituation: `Situation: ${data.situation}\nSkills: ${data.skills.join(", ")}\nLocation: ${data.location}`,
          goals: data.goals,
          timeHorizon: data.timeHorizon,
          riskTolerance: riskLabel,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Simulation failed: ${errText}`);
      }

      const resultData = await response.json();
      const id = uuidv4();

      // Save locally (since we don't have real Supabase keys configured)
      const savedData = { ...resultData, localSavedAt: Date.now() };
      localStorage.setItem(`sim_${id}`, JSON.stringify(savedData));

      // Route directly to the Results Hub
      router.push(`/dashboard/results/${id}`);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg((err as Error).message || "An unexpected error occurred.");
      setIsSubmitting(false);
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
        <span className="text-xs font-medium text-[var(--accent-violet)] tracking-widest uppercase">
          Step {step + 1} of 4 — {stepLabels[step]}
        </span>
      </div>

      {/* Animated Step Content */}
      <div className="relative overflow-hidden min-h-[400px]">
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
          <div className="flex flex-col items-end gap-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating (Approx 30s)...
                </span>
              ) : (
                "🚀 Launch Simulation"
              )}
            </Button>
            {errorMsg && <p className="text-red-400 text-sm mt-2">{errorMsg}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
