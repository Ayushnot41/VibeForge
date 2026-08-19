"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles, Octahedron, Sphere } from "@react-three/drei";
import * as THREE from "three";

interface VibeCoreProps {
  progress: number; // 0.0 to 1.0
  health?: number; // 0.0 to 1.0 (defaults to 1.0)
  skin?: "default" | "quantum" | "infernal" | "chronos";
  className?: string;
}

function CoreEntity({ progress, health = 1.0, skin = "default" }: { progress: number; health: number; skin: "default" | "quantum" | "infernal" | "chronos" }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    if (meshRef.current) {
      // Rotation gets smoother and faster as progress increases. Low health makes it erratic.
      const erratic = health < 0.5 ? Math.sin(t * 10) * 0.1 : 0;
      const baseSpeed = 0.2 + (progress * 0.8) + erratic;
      meshRef.current.rotation.y = t * baseSpeed;
      meshRef.current.rotation.x = t * (baseSpeed * 0.5);
    }

    if (outerRef.current) {
      outerRef.current.rotation.y = t * -0.5;
      outerRef.current.rotation.z = Math.sin(t * 0.5) * 0.2;
    }
  });

  // Colors based on health, progress, and skin
  const isBleeding = health < 0.5;
  
  let skinStartColor = "#4B5563";
  let skinEndColor = "#7C3AED";
  let skinEmissiveColor = "#4F46E5";
  let sparkColor = "#E0E7FF";

  if (skin === "quantum") {
    skinStartColor = "#1e1b4b";
    skinEndColor = "#c084fc"; // purple-400
    skinEmissiveColor = "#e879f9"; // fuchsia-400
    sparkColor = "#fbcfe8";
  } else if (skin === "infernal") {
    skinStartColor = "#450a0a";
    skinEndColor = "#ef4444"; // red-500
    skinEmissiveColor = "#f97316"; // orange-500
    sparkColor = "#fef08a";
  } else if (skin === "chronos") {
    skinStartColor = "#022c22";
    skinEndColor = "#10b981"; // emerald-500
    skinEmissiveColor = "#34d399"; // emerald-400
    sparkColor = "#a7f3d0";
  }

  const startColor = new THREE.Color(isBleeding ? "#7F1D1D" : skinStartColor);
  const endColor = new THREE.Color(isBleeding ? "#DC2626" : skinEndColor);
  const currentColor = startColor.clone().lerp(endColor, progress);
  
  const emissiveColor = new THREE.Color(isBleeding ? "#EF4444" : skinEmissiveColor);
  const currentEmissive = new THREE.Color("#000000").lerp(emissiveColor, progress);

  return (
    <group>
      {/* The Central Core */}
      <Float speed={isBleeding ? 8 : 2} rotationIntensity={isBleeding ? 2 : 0.5 - (progress * 0.4)} floatIntensity={isBleeding ? 2 : 1}>
        <mesh ref={meshRef}>
          {progress > 0.5 && !isBleeding ? (
            <Octahedron args={[1.5, progress > 0.8 ? 2 : 0]}>
              <MeshDistortMaterial
                color={currentColor}
                emissive={currentEmissive}
                emissiveIntensity={progress * 2}
                distort={0.4 * (1 - progress)}
                speed={3}
                roughness={0.2}
                metalness={0.8}
                wireframe={progress < 0.8 && progress > 0.3}
              />
            </Octahedron>
          ) : (
            <Sphere args={[1.5, 16, 16]}>
              <MeshDistortMaterial
                color={currentColor}
                emissive={currentEmissive}
                emissiveIntensity={isBleeding ? 2 : 0}
                distort={isBleeding ? 1.5 : 0.8} // Highly unstable if bleeding
                speed={isBleeding ? 10 : 5}
                roughness={0.8}
                metalness={0.2}
              />
            </Sphere>
          )}
        </mesh>
      </Float>

      {/* Orbiting Energy Ring (Breaks if health is low) */}
      {progress > 0.3 && !isBleeding && (
        <mesh ref={outerRef} scale={progress * 1.5}>
          <torusGeometry args={[1.8, 0.02, 16, 100]} />
          <meshStandardMaterial color={endColor} emissive={emissiveColor} emissiveIntensity={progress * 3} />
        </mesh>
      )}

      {/* Magical Sparkles or Blood Particles */}
      <Sparkles
        count={Math.floor(progress * (skin === 'quantum' ? 400 : 200)) + (isBleeding ? 100 : 0)}
        scale={6}
        size={isBleeding ? 6 : (skin === 'quantum' ? 6 : 4)}
        speed={isBleeding ? 2 : (skin === 'chronos' ? 0.1 : 0.4)}
        opacity={progress || 0.5}
        color={isBleeding ? "#F87171" : sparkColor}
      />
    </group>
  );
}

export default function VibeCore({ progress, health = 1.0, skin = "default", className = "" }: VibeCoreProps) {
  // Ensure values are clamped
  const safeProgress = Math.min(1, Math.max(0, progress));
  const safeHealth = Math.min(1, Math.max(0, health));
  
  return (
    <div className={`relative ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.2 + (safeProgress * 0.3)} />
        <pointLight position={[10, 10, 10]} intensity={1 + safeProgress} color={safeHealth < 0.5 ? "#ef4444" : "#fff"} />
        <pointLight position={[-10, -10, -10]} intensity={safeProgress * 2} color={safeHealth < 0.5 ? "#b91c1c" : (skin === 'chronos' ? "#10b981" : (skin === 'infernal' ? "#ef4444" : "#7C3AED"))} />
        <CoreEntity progress={safeProgress} health={safeHealth} skin={skin} />
      </Canvas>
    </div>
  );
}
