"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "glow";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    "bg-gradient-to-r from-[var(--accent-violet)] via-[var(--accent-purple)] to-[var(--accent-indigo)]",
    "text-white font-semibold",
    "shadow-[0_4px_20px_rgba(124,58,237,0.35)]",
    "hover:shadow-[0_8px_30px_rgba(124,58,237,0.5)]",
    "border border-white/10",
  ].join(" "),
  glow: [
    "bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-indigo)]",
    "text-white font-semibold",
    "shadow-[0_0_25px_rgba(124,58,237,0.5)]",
    "hover:shadow-[0_0_40px_rgba(168,85,247,0.7)]",
    "border border-purple-400/30",
  ].join(" "),
  secondary: [
    "bg-[rgba(255,255,255,0.04)]",
    "border border-[var(--glass-border)]",
    "text-[var(--text-primary)]",
    "backdrop-blur-md",
    "hover:bg-[var(--glass-hover)]",
    "hover:border-[rgba(168,85,247,0.4)]",
    "hover:text-white",
  ].join(" "),
  danger: [
    "bg-gradient-to-r from-rose-600 to-red-500",
    "text-white font-semibold",
    "shadow-[0_4px_20px_rgba(244,63,94,0.35)]",
    "hover:shadow-[0_8px_30px_rgba(244,63,94,0.5)]",
    "border border-rose-400/20",
  ].join(" "),
  ghost: [
    "bg-transparent",
    "text-[var(--text-secondary)]",
    "hover:text-[var(--text-primary)]",
    "hover:bg-[var(--glass-bg)]",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs rounded-xl font-medium tracking-wide",
  md: "px-5 py-2.5 text-sm rounded-xl font-semibold",
  lg: "px-7 py-3.5 text-base rounded-2xl font-bold",
};

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.02, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      disabled={disabled}
      className={cn(
        "relative inline-flex items-center justify-center gap-2",
        "font-[var(--font-body)] cursor-pointer select-none",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-purple)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]",
        "disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
