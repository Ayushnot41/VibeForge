"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Sparkles, Float } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import Button from "@/components/ui/Button";
import RealityCheckPanel from "@/components/RealityCheckPanel";
import { SimulationState } from "@/types/agents";
import { DEMO_SIMULATION } from "@/lib/demoSimulation";

// ── 3D Ambient Background ────────────────────────────────────────────────────
function DataStreamBackground() {
  const group = React.useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = t * 0.015;
    group.current.rotation.x = Math.sin(t * 0.008) * 0.04;
  });

  return (
    <group ref={group}>
      <Stars radius={90} depth={60} count={2500} factor={3} saturation={0.4} fade speed={0.5} />
      <Sparkles count={80} scale={[18, 18, 18]} size={1.5} speed={0.3} color="#3B82F6" />
      <Sparkles count={50} scale={[12, 12, 12]} size={1} speed={0.5} color="#10B981" />

      {/* Floating data nodes */}
      {Array.from({ length: 10 }).map((_, i) => (
        <Float
          key={i}
          speed={0.7}
          rotationIntensity={0.5}
          floatIntensity={0.8}
          position={[
            Math.sin(i * 2.1) * 10,
            Math.cos(i * 1.7) * 6,
            -5 - (i % 4) * 1.5,
          ]}
        >
          <mesh>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? "#3B82F6" : i % 3 === 1 ? "#10B981" : "#7C3AED"}
              emissive={i % 3 === 0 ? "#1D4ED8" : i % 3 === 1 ? "#065F46" : "#4C1D95"}
              emissiveIntensity={0.8}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// ── Framer Motion Variants ────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RealityCheckPage() {
  const params   = useParams();
  const router   = useRouter();
  const id       = (params?.id as string) || "demo";

  const [state, setState]   = useState<SimulationState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localData = typeof window !== "undefined" ? localStorage.getItem(`sim_${id}`) : null;
    if (localData) {
      try { setState(JSON.parse(localData)); }
      catch { setState(DEMO_SIMULATION); }
    } else {
      setState(DEMO_SIMULATION);
    }
    setLoading(false);
  }, [id]);

  const goal = state?.userInput?.goals || "";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <div className="w-10 h-10 border-4 border-[var(--accent-violet)]/30 border-t-[var(--accent-violet)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>

      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 12], fov: 55 }}>
          <color attach="background" args={["#04040A"]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[0, 10, 5]} color="#3B82F6" intensity={4} distance={40} />
          <pointLight position={[0, -10, -5]} color="#10B981" intensity={3} distance={40} />
          <Suspense fallback={null}>
            <DataStreamBackground />
          </Suspense>
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-20">

        {/* Back button */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/results/${id}`)}>
            ← Command Center
          </Button>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8">

          {/* Page Header */}
          <motion.div variants={fadeUp} className="text-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
              style={{ background: "rgba(59,130,246,0.12)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.3)" }}
            >
              <span>⚡</span> Reality Check
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
              Market Reality
            </h1>
            <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
              Your goal classified by a real ML model against live market data.
            </p>
          </motion.div>

          {/* Goal Display */}
          {goal && (
            <motion.div
              variants={fadeUp}
              className="p-5 rounded-2xl"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                backdropFilter: "blur(12px)",
              }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                Your Goal
              </p>
              <p className="text-white text-base font-medium leading-relaxed">"{goal}"</p>
            </motion.div>
          )}

          {/* Reality Check Panel */}
          <motion.div
            variants={fadeUp}
            className="p-6 rounded-3xl"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              backdropFilter: "blur(16px)",
              boxShadow: "var(--shadow-depth-3)",
            }}
          >
            <RealityCheckPanel goal={goal} />
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeUp} className="flex justify-center gap-4">
            <Button onClick={() => router.push(`/dashboard/action-plan/${id}`)}>
              ⚡ View Execution Protocol
            </Button>
            <Button variant="secondary" onClick={() => router.push(`/dashboard/results/${id}`)}>
              ← Command Center
            </Button>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
