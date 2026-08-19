"use client";

import React from "react";
import { cn } from "@/lib/utils";

/* ─── Text Input ────────────────────────────────────────────── */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--text-secondary)]"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full px-4 py-3 rounded-xl",
          "bg-[var(--bg-secondary)] border border-[var(--glass-border)]",
          "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
          "font-[var(--font-body)] text-base",
          "outline-none",
          "transition-all duration-200",
          "focus:border-[var(--accent-violet)] focus:shadow-[0_0_12px_rgba(124,58,237,0.2)]",
          error && "border-red-500/50 focus:border-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}

/* ─── Textarea ──────────────────────────────────────────────── */

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-sm font-medium text-[var(--text-secondary)]"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "w-full px-4 py-3 rounded-xl",
          "bg-[var(--bg-secondary)] border border-[var(--glass-border)]",
          "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
          "font-[var(--font-body)] text-base",
          "outline-none resize-y min-h-[120px]",
          "transition-all duration-200",
          "focus:border-[var(--accent-violet)] focus:shadow-[0_0_12px_rgba(124,58,237,0.2)]",
          error && "border-red-500/50 focus:border-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
