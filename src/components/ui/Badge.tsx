"use client";

import React from "react";
import { cn } from "@/lib/utils";

type BadgeColor = "violet" | "green" | "red" | "blue" | "amber" | "gray" | "cyan" | "rose" | "emerald";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
  dot?: boolean;
}

const colorStyles: Record<BadgeColor, { badge: string; dot: string }> = {
  violet: {
    badge: "bg-[rgba(124,58,237,0.15)] text-[#C4B5FD] border-[rgba(124,58,237,0.35)] shadow-[0_0_15px_rgba(124,58,237,0.2)]",
    dot: "bg-[var(--accent-purple)] shadow-[0_0_8px_#A855F7]",
  },
  green: {
    badge: "bg-[rgba(16,185,129,0.15)] text-[#6EE7B7] border-[rgba(16,185,129,0.35)] shadow-[0_0_15px_rgba(16,185,129,0.2)]",
    dot: "bg-emerald-400 shadow-[0_0_8px_#34D399]",
  },
  emerald: {
    badge: "bg-[rgba(16,185,129,0.15)] text-[#6EE7B7] border-[rgba(16,185,129,0.35)] shadow-[0_0_15px_rgba(16,185,129,0.2)]",
    dot: "bg-emerald-400 shadow-[0_0_8px_#34D399]",
  },
  cyan: {
    badge: "bg-[rgba(6,182,212,0.15)] text-[#67E8F9] border-[rgba(6,182,212,0.35)] shadow-[0_0_15px_rgba(6,182,212,0.2)]",
    dot: "bg-cyan-400 shadow-[0_0_8px_#22D3EE]",
  },
  red: {
    badge: "bg-[rgba(244,63,94,0.15)] text-[#FDA4AF] border-[rgba(244,63,94,0.35)] shadow-[0_0_15px_rgba(244,63,94,0.2)]",
    dot: "bg-rose-500 shadow-[0_0_8px_#F43F5E]",
  },
  rose: {
    badge: "bg-[rgba(244,63,94,0.15)] text-[#FDA4AF] border-[rgba(244,63,94,0.35)] shadow-[0_0_15px_rgba(244,63,94,0.2)]",
    dot: "bg-rose-500 shadow-[0_0_8px_#F43F5E]",
  },
  blue: {
    badge: "bg-[rgba(99,102,241,0.15)] text-[#A5B4FC] border-[rgba(99,102,241,0.35)] shadow-[0_0_15px_rgba(99,102,241,0.2)]",
    dot: "bg-indigo-400 shadow-[0_0_8px_#818CF8]",
  },
  amber: {
    badge: "bg-[rgba(245,158,11,0.15)] text-[#FDE68A] border-[rgba(245,158,11,0.35)] shadow-[0_0_15px_rgba(245,158,11,0.2)]",
    dot: "bg-amber-400 shadow-[0_0_8px_#FBBF24]",
  },
  gray: {
    badge: "bg-[rgba(255,255,255,0.06)] text-[#E2E8F0] border-[rgba(255,255,255,0.12)]",
    dot: "bg-slate-400 shadow-[0_0_8px_#94A3B8]",
  },
};

export default function Badge({
  children,
  color = "violet",
  dot = false,
  className,
}: BadgeProps) {
  const style = colorStyles[color] || colorStyles.violet;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2",
        "px-3.5 py-1 rounded-full",
        "text-xs font-semibold tracking-wide",
        "border backdrop-blur-md select-none",
        style.badge,
        className
      )}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", style.dot)} />}
      {children}
    </span>
  );
}
