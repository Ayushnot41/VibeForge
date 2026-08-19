"use client";

import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

// Generate random points in a sphere
function generatePoints(count: number) {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = Math.random() * 20 + 2;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(Math.random() * 2 - 1);
    
    points[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    points[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    points[i * 3 + 2] = r * Math.cos(phi);
  }
  return points;
}

function WarpField({ isNavigating }: { isNavigating: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const [points] = useState(() => generatePoints(3000));
  const speed = useRef(0.5);

  useFrame((state, delta) => {
    if (!ref.current) return;
    
    // Accelerate to "warp speed" when navigating, decelerate when done
    const targetSpeed = isNavigating ? 15 : 0.5;
    speed.current = THREE.MathUtils.lerp(speed.current, targetSpeed, delta * 3);
    
    // Move points towards the camera to simulate flying forward
    ref.current.rotation.z += delta * 0.1;
    
    const positions = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 2] += speed.current * delta;
      
      // Reset points that pass the camera back to the far distance
      if (positions[i + 2] > 5) {
        positions[i + 2] = -20;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={points} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#8B5CF6"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(true);

  // Trigger warp speed briefly whenever the pathname changes
  useEffect(() => {
    setTimeout(() => setIsNavigating(true), 0);
    const timeout = setTimeout(() => {
      setIsNavigating(false);
    }, 800); // Warp speed lasts for 800ms
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <div className="relative w-full min-h-screen">
      {/* 3D Global Transition Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <WarpField isNavigating={isNavigating} />
        </Canvas>
      </div>

      {/* Page Content with Framer Motion Fade/Scale */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full min-h-screen"
      >
        {children}
      </motion.div>
    </div>
  );
}
