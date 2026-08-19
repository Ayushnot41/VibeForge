"use client";

import React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    "bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-indigo)]",
    "text-white font-semibold",
    "shadow-[0_0_20px_rgba(124,58,237,0.3)]",
    "hover:shadow-[0_0_40px_rgba(124,58,237,0.5)]",
    "hover:-translate-y-0.5",
    "active:translate-y-0",
  ].join(" "),
  secondary: [
    "bg-transparent",
    "border border-[var(--glass-border)]",
    "text-[var(--text-primary)]",
    "hover:bg-[var(--glass-hover)]",
    "hover:border-[var(--accent-violet)]",
  ].join(" "),
  danger: [
    "bg-gradient-to-r from-red-600 to-red-500",
    "text-white font-semibold",
    "hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]",
    "hover:-translate-y-0.5",
  ].join(" "),
  ghost: [
    "bg-transparent",
    "text-[var(--text-secondary)]",
    "hover:text-[var(--text-primary)]",
    "hover:bg-[var(--glass-bg)]",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-6 py-3 text-base rounded-xl",
  lg: "px-8 py-4 text-lg rounded-xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "font-[var(--font-body)] cursor-pointer",
        "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
