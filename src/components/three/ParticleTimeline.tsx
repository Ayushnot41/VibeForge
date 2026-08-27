"use client";

import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { FuturePath } from "@/types/agents";

/* ─── Particle System Along a Curve ─────────────────────────── */

interface PathParticlesProps {
  color: string;
  curve: THREE.CatmullRomCurve3;
  count?: number;
  speed?: number;
}

function PathParticles({
  color,
  curve,
  count = 100,
  speed = 0.15,
}: PathParticlesProps) {
  const meshRef = useRef<THREE.Points>(null);

  const { positions, offsets } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const off = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // eslint-disable-next-line
      off[i] = Math.random();
      const point = curve.getPointAt(off[i]);
      pos[i * 3] = point.x;
      pos[i * 3 + 1] = point.y;
      pos[i * 3 + 2] = point.z;
    }
    return { positions: pos, offsets: off };
  }, [count, curve]);

  const offsetsRef = useRef(offsets);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const geo = meshRef.current.geometry;
    const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;
    const currentOffsets = offsetsRef.current;
    for (let i = 0; i < count; i++) {
      // eslint-disable-next-line
      currentOffsets[i] = (currentOffsets[i] + delta * speed * (0.5 + Math.random() * 0.5)) % 1;
      const point = curve.getPointAt(currentOffsets[i]);
      posAttr.setXYZ(i, point.x, point.y, point.z);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.06}
        transparent
        opacity={0.85}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ─── Curve Line ────────────────────────────────────────────── */

function CurveLine({ curve, color }: { curve: THREE.CatmullRomCurve3; color: string }) {
  const linePoints = useMemo(
    () => curve.getPoints(100).map((p) => [p.x, p.y, p.z] as [number, number, number]),
    [curve]
  );

  return (
    <Line
      points={linePoints}
      color={color}
      transparent
      opacity={0.2}
      lineWidth={1}
    />
  );
}

/* ─── Center Sphere ─────────────────────────────────────────── */

function CenterSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.scale.setScalar(
      1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
    );
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[0.12, 32, 32]} />
      <meshBasicMaterial
        color="#A855F7"
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

/* ─── Milestones Nodes ──────────────────────────────────────── */

function MilestoneNode({ position, color, label }: { position: THREE.Vector3; color: string; label: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = React.useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    const scale = hovered ? 1.5 : 1 + Math.sin(state.clock.elapsedTime * 3 + position.x) * 0.2;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {hovered && (
        <Html distanceFactor={10} center>
          <div className="px-3 py-1 bg-[#0A0A0F]/90 text-white text-xs whitespace-nowrap rounded border border-[var(--glass-border)] shadow-lg pointer-events-none">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ─── Path Component ────────────────────────────────────────── */

function FuturePathComponent({ path, curve, color }: { path: FuturePath; curve: THREE.CatmullRomCurve3; color: string }) {
  const maxMonth = Math.max(...path.milestones.map(m => m.month), 12);

  return (
    <group>
      <CurveLine curve={curve} color={color} />
      <PathParticles curve={curve} color={color} count={100} speed={0.12} />
      {path.milestones.map((milestone, idx) => {
        // Place milestones along the curve based on their month relative to maxMonth
        const t = Math.max(0.05, Math.min(1, milestone.month / maxMonth));
        const pos = curve.getPointAt(t);
        return (
          <MilestoneNode key={idx} position={pos} color={color} label={`Month ${milestone.month}: ${milestone.title}`} />
        );
      })}
    </group>
  );
}

/* ─── Scene ─────────────────────────────────────────────────── */

function ParticleScene({ paths }: { paths?: FuturePath[] }) {
  // Define base control points for the 3 branches
  const optimisticPoints = useMemo(() => [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1, 0.8, -0.5),
    new THREE.Vector3(2, 1.5, -0.3),
    new THREE.Vector3(3, 2.2, 0.2),
    new THREE.Vector3(4, 2.8, 0),
  ], []);

  const realisticPoints = useMemo(() => [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1, 0.3, 0.2),
    new THREE.Vector3(2, 0.5, 0.5),
    new THREE.Vector3(3, 0.8, 0.3),
    new THREE.Vector3(4, 1.1, 0),
  ], []);

  const pessimisticPoints = useMemo(() => [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1, -0.3, 0.5),
    new THREE.Vector3(2, -0.5, 0.8),
    new THREE.Vector3(3, -0.8, 0.4),
    new THREE.Vector3(4, -1.2, 0),
  ], []);

  const curves = useMemo(() => {
    return {
      optimistic: new THREE.CatmullRomCurve3(optimisticPoints, false, "catmullrom", 0.5),
      realistic: new THREE.CatmullRomCurve3(realisticPoints, false, "catmullrom", 0.5),
      pessimistic: new THREE.CatmullRomCurve3(pessimisticPoints, false, "catmullrom", 0.5),
    };
  }, [optimisticPoints, realisticPoints, pessimisticPoints]);

  if (!paths || paths.length === 0) {
    // Render defaults if no paths provided
    return (
      <>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />
        <CenterSphere />
        <CurveLine curve={curves.optimistic} color="#F59E0B" />
        <PathParticles curve={curves.optimistic} color="#F59E0B" count={100} speed={0.12} />
        <CurveLine curve={curves.realistic} color="#6366F1" />
        <PathParticles curve={curves.realistic} color="#6366F1" count={100} speed={0.15} />
        <CurveLine curve={curves.pessimistic} color="#EF4444" />
        <PathParticles curve={curves.pessimistic} color="#EF4444" count={100} speed={0.1} />
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.5} minPolarAngle={Math.PI / 3} maxPolarAngle={(2 * Math.PI) / 3} />
      </>
    );
  }

  const optimistic = paths.find(p => p.type === 'optimistic');
  const realistic = paths.find(p => p.type === 'realistic');
  const pessimistic = paths.find(p => p.type === 'pessimistic');

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={0.8} />

      <CenterSphere />

      {optimistic && <FuturePathComponent path={optimistic} curve={curves.optimistic} color="#F59E0B" />}
      {realistic && <FuturePathComponent path={realistic} curve={curves.realistic} color="#6366F1" />}
      {pessimistic && <FuturePathComponent path={pessimistic} curve={curves.pessimistic} color="#EF4444" />}

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.5}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={(2 * Math.PI) / 3}
      />
    </>
  );
}

/* ─── Exported Component ────────────────────────────────────── */

export default function ParticleTimeline({ paths }: { paths?: FuturePath[] }) {
  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-primary)] z-10 pointer-events-none" />
      <Canvas
        camera={{ position: [2, 1.5, 4], fov: 50 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <ParticleScene paths={paths} />
          <EffectComposer multisampling={0}>
            <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.5} height={200} intensity={1.5} />
          </EffectComposer>
        </Suspense>
      </Canvas>
      {/* Legend */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-6 text-xs font-medium">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
          Optimistic
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#6366F1]" />
          Realistic
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
          Pessimistic
        </span>
      </div>
    </div>
  );
}
