"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: string;
  noPadding?: boolean;
  noHover?: boolean;
  elevated?: boolean;
}

export default function Card({
  children,
  glowColor,
  noPadding = false,
  noHover = false,
  elevated = false,
  className,
  style,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl md:rounded-3xl",
        elevated ? "glass-card-elevated" : "glass-card",
        "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        noHover && "hover:transform-none hover:shadow-none hover:border-[var(--glass-border)]",
        !noPadding && "p-6 sm:p-8",
        className
      )}
      style={{
        ...(glowColor
          ? {
              borderColor: `${glowColor}40`,
              boxShadow: `0 8px 32px 0 ${glowColor}18, 0 0 20px 0 ${glowColor}25`,
            }
          : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
