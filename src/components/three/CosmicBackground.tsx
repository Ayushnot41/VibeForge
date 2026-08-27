"use client";

import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Starfield() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 3000;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const colorOptions = [
      new THREE.Color("#7C3AED"), // Violet
      new THREE.Color("#6366F1"), // Indigo
      new THREE.Color("#EC4899"), // Pink
      new THREE.Color("#ffffff"), // White
    ];

    for (let i = 0; i < count; i++) {
      // Create a sprawling nebula-like shape
      // eslint-disable-next-line
      const radius = 10 + Math.random() * 30;
      // eslint-disable-next-line
      const theta = 2 * Math.PI * Math.random();
      // eslint-disable-next-line
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      // eslint-disable-next-line
      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.025;
      
      // Gentle mouse parallax
      const { x, y } = state.pointer;
      pointsRef.current.position.x = THREE.MathUtils.lerp(pointsRef.current.position.x, x * 2, 0.05);
      pointsRef.current.position.y = THREE.MathUtils.lerp(pointsRef.current.position.y, y * 2, 0.05);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function CosmicBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#0A0A0F]">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }} gl={{ alpha: true, antialias: true }}>
        <fog attach="fog" args={["#0A0A0F", 10, 40]} />
        <Suspense fallback={null}>
          <Starfield />
        </Suspense>
      </Canvas>
    </div>
  );
}
