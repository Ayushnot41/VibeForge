"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import * as THREE from "three";

function FloatingSettingsCubes() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.1;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[2, 1, -2]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#7C3AED" wireframe />
        </mesh>
      </Float>
      <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1.5}>
        <mesh position={[-2, -1, -3]}>
          <octahedronGeometry args={[1]} />
          <meshStandardMaterial color="#4F46E5" roughness={0.2} metalness={0.8} />
        </mesh>
      </Float>
    </group>
  );
}

export default function SettingsPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} color="#7C3AED" intensity={2} />
          <pointLight position={[-10, -10, -10]} color="#4F46E5" intensity={2} />
          <Stars radius={100} depth={50} count={2000} factor={4} fade speed={1} />
          <FloatingSettingsCubes />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl mx-auto pt-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2">Account Settings ⚙️</h1>
          <p className="text-[var(--text-secondary)] mb-10">
            Manage your VibeForge preferences and API integrations.
          </p>

          <div className="space-y-6">
            <Card glowColor="#7C3AED" className="space-y-4">
              <h2 className="text-xl font-semibold mb-4 border-b border-[var(--glass-border)] pb-2">
                Profile Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Display Name" defaultValue="Ayush" />
                <Input label="Email Address" defaultValue="ayush@example.com" type="email" />
              </div>
              <div className="flex justify-end pt-4">
                <Button variant="primary">Save Changes</Button>
              </div>
            </Card>

            <Card glowColor="#4F46E5" className="space-y-4">
              <h2 className="text-xl font-semibold mb-4 border-b border-[var(--glass-border)] pb-2">
                External API Connections
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Link your own API keys to bypass rate limits and access premium generation models.
              </p>
              <div className="space-y-4">
                <Input
                  label="Nano Banana API Key"
                  type="password"
                  placeholder="Enter your API key"
                />
                <Input
                  label="OpenRouter API Key"
                  type="password"
                  placeholder="sk-or-v1-..."
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button variant="secondary">Update Keys</Button>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
