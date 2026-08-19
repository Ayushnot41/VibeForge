"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: string;
  noPadding?: boolean;
  noHover?: boolean;
}

export default function Card({
  children,
  glowColor,
  noPadding = false,
  noHover = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl",
        "bg-[var(--glass-bg)] border border-[var(--glass-border)]",
        "backdrop-blur-xl",
        "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        !noHover && "hover:bg-[var(--glass-hover)] hover:border-[rgba(124,58,237,0.3)]",
        !noHover && "hover:shadow-[0_0_20px_rgba(124,58,237,0.2)]",
        !noPadding && "p-6",
        className
      )}
      style={
        glowColor
          ? {
              borderColor: `${glowColor}40`,
              boxShadow: `0 0 24px ${glowColor}20`,
            }
          : undefined
      }
      {...props}
    >
      {children}
    </div>
  );
}
