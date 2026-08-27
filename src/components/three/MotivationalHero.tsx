"use client";

import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Stars, Torus, Icosahedron } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

function EnergyCore() {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.5;
      coreRef.current.rotation.x = t * 0.3;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.x = t * 1.2;
      ringRef1.current.rotation.y = Math.sin(t * 0.5) * 0.5;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.y = t * -0.8;
      ringRef2.current.rotation.z = Math.cos(t * 0.3) * 0.5;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central Distorted Energy Core */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh ref={coreRef}>
          <Icosahedron args={[1, 15]}>
            <MeshDistortMaterial
              color="#7C3AED"
              emissive="#4F46E5"
              emissiveIntensity={0.5}
              distort={0.4}
              speed={2}
              roughness={0.2}
              metalness={0.8}
            />
          </Icosahedron>
        </mesh>
      </Float>

      {/* Outer Rings */}
      <Torus ref={ringRef1} args={[1.8, 0.05, 16, 100]} rotation={[Math.PI / 3, 0, 0]}>
        <meshStandardMaterial color="#A78BFA" emissive="#7C3AED" emissiveIntensity={2} />
      </Torus>
      <Torus ref={ringRef2} args={[2.4, 0.02, 16, 100]} rotation={[0, Math.PI / 4, 0]}>
        <meshStandardMaterial color="#60A5FA" emissive="#3B82F6" emissiveIntensity={2} />
      </Torus>
    </group>
  );
}

export default function MotivationalHero({ goals }: { goals: string }) {
  // Extract a keyword or use a default motivational phrase based on their goals
  const shortGoal = goals.length > 50 ? goals.substring(0, 50) + "..." : goals;

  return (
    <div className="relative w-full h-[450px] rounded-3xl overflow-hidden bg-[rgba(10,10,15,0.8)] border border-[var(--glass-border)] shadow-[0_0_50px_rgba(124,58,237,0.2)]">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#fff" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#7C3AED" />
          <Suspense fallback={null}>
            <Stars radius={50} depth={20} count={1500} factor={4} fade speed={2} />
            <EnergyCore />
          </Suspense>
        </Canvas>
      </div>

      {/* HTML Overlay Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-transparent via-[rgba(10,10,15,0.2)] to-[rgba(10,10,15,0.9)] text-center">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-[rgba(124,58,237,0.2)] text-[var(--accent-purple)] border border-[rgba(124,58,237,0.4)] mb-6 inline-block">
            YOUR FUTURE IS FORGED HERE
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-2xl">
            Relentless Focus. <br />
            <span className="gradient-text">Unstoppable Action.</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto drop-shadow-md">
            The core is stabilized. Your timeline is locked. It is time to achieve:
            <br />
            <span className="text-white font-bold italic mt-2 inline-block">&quot;{shortGoal}&quot;</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
