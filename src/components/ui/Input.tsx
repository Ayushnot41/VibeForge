"use client";

import React from "react";
import { cn } from "@/lib/utils";

/* ─── Text Input ────────────────────────────────────────────── */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

function generateInputId(label?: string, id?: string) {
  return id || label?.toLowerCase().replace(/\s+/g, "-");
}

export function Input({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: InputProps) {
  const computedId = generateInputId(label, id);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={computedId}
          className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <input
        id={computedId}
        className={cn(
          "w-full px-4 py-3 rounded-2xl",
          "bg-[rgba(18,17,30,0.85)] border border-[var(--glass-border)]",
          "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
          "font-[var(--font-body)] text-sm md:text-base",
          "outline-none backdrop-blur-md",
          "transition-all duration-300 ease-out",
          "focus:border-[var(--neon-purple)] focus:shadow-[0_0_20px_rgba(139,92,246,0.3)] focus:bg-[rgba(26,24,44,0.95)]",
          error && "border-rose-500/70 focus:border-rose-500 focus:shadow-[0_0_20px_rgba(244,63,94,0.3)]",
          className
        )}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs text-[var(--text-muted)]">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-rose-400 font-medium">{error}</p>
      )}
    </div>
  );
}

/* ─── Textarea ──────────────────────────────────────────────── */

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: TextareaProps) {
  const computedId = generateInputId(label, id);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={computedId}
          className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <textarea
        id={computedId}
        className={cn(
          "w-full px-4 py-3.5 rounded-2xl",
          "bg-[rgba(18,17,30,0.85)] border border-[var(--glass-border)]",
          "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
          "font-[var(--font-body)] text-sm md:text-base",
          "outline-none resize-y min-h-[120px] backdrop-blur-md leading-relaxed",
          "transition-all duration-300 ease-out",
          "focus:border-[var(--neon-purple)] focus:shadow-[0_0_20px_rgba(139,92,246,0.3)] focus:bg-[rgba(26,24,44,0.95)]",
          error && "border-rose-500/70 focus:border-rose-500 focus:shadow-[0_0_20px_rgba(244,63,94,0.3)]",
          className
        )}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs text-[var(--text-muted)]">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-rose-400 font-medium">{error}</p>
      )}
    </div>
  );
}
