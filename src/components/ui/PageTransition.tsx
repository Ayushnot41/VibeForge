"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    initial: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 12, scale: 0.995 },
    animate: shouldReduceMotion
      ? { opacity: 1 }
      : { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* Page Content with Framer Motion Smooth Transition */}
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        transition={{
          duration: 0.45,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="w-full min-h-screen"
      >
        {children}
      </motion.div>
    </div>
  );
}
