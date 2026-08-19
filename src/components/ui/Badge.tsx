"use client";

import React from "react";
import { cn } from "@/lib/utils";

type BadgeColor = "violet" | "green" | "red" | "blue" | "amber" | "gray";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

const colorStyles: Record<BadgeColor, string> = {
  violet:
    "bg-[rgba(124,58,237,0.15)] text-[#A78BFA] border-[rgba(124,58,237,0.3)]",
  green:
    "bg-[rgba(34,197,94,0.15)] text-[#4ADE80] border-[rgba(34,197,94,0.3)]",
  red:
    "bg-[rgba(239,68,68,0.15)] text-[#F87171] border-[rgba(239,68,68,0.3)]",
  blue:
    "bg-[rgba(99,102,241,0.15)] text-[#818CF8] border-[rgba(99,102,241,0.3)]",
  amber:
    "bg-[rgba(245,158,11,0.15)] text-[#FCD34D] border-[rgba(245,158,11,0.3)]",
  gray:
    "bg-[rgba(161,161,170,0.1)] text-[#A1A1AA] border-[rgba(161,161,170,0.2)]",
};

export default function Badge({
  children,
  color = "violet",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        "px-3 py-1 rounded-full",
        "text-xs font-medium",
        "border",
        colorStyles[color],
        className
      )}
    >
      {children}
    </span>
  );
}
