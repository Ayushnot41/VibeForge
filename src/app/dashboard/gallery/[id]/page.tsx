"use client";

import React, { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { SimulationState, ImagePrompt } from "@/types/agents";
import * as THREE from "three";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { DEMO_SIMULATION } from "@/lib/demoSimulation";

function getHologramUrl(prompt: ImagePrompt, index: number): string {
  if (prompt.sceneDescription && prompt.sceneDescription.startsWith("http")) {
    return prompt.sceneDescription;
  }
  const comicQuery = encodeURIComponent(
    `Graphic novel comic panel, stylized holographic neon overlays, glowing cyan and violet roadmap HUD, career transformation milestone: ${prompt.sceneDescription.slice(0, 180)} 8k resolution comic art`
  );
  return `https://image.pollinations.ai/prompt/${comicQuery}?width=1024&height=1024&nologo=true&seed=${index * 79 + 1042}&model=flux`;
}

// Interactive 3D Card in the Cylinder using hardware-accelerated HTML transform
function CylinderCard3D({
  url,
  position,
  rotation,
  title,
  subtitle,
  onClick,
}: {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const [imgSrc, setImgSrc] = useState(url);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.08;
    }
  });

  return (
    <group position={position} rotation={rotation} ref={meshRef}>
      <Html transform distanceFactor={5.5} center className="pointer-events-none">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="w-[420px] h-[540px] flex flex-col justify-between p-4 rounded-3xl overflow-hidden bg-[#070712]/95 backdrop-blur-2xl border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.3)] transition-all duration-300 hover:scale-105 hover:border-cyan-300 cursor-pointer pointer-events-auto group select-none"
        >
          <div className="w-full h-full relative rounded-2xl overflow-hidden bg-black flex flex-col justify-between p-4">
            <img
              src={imgSrc}
              alt={title}
              onError={() =>
                setImgSrc("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1024&q=80")
              }
              className="absolute inset-0 w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/40 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-cyan-950/90 backdrop-blur-md border border-cyan-400/50 text-[11px] font-black text-cyan-300 tracking-wider uppercase shadow-lg">
                ⚡ {title}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-950/90 border border-purple-400/50 text-[10px] font-bold text-purple-300 uppercase">
                Hologram
              </span>
            </div>

            <div className="relative z-10 text-left">
              <p className="text-white text-sm font-bold leading-snug line-clamp-2 drop-shadow-lg mb-2">
                {subtitle}
              </p>
              <span className="text-cyan-400 text-xs font-bold inline-flex items-center gap-1 group-hover:text-cyan-300">
                🔍 Click to Inspect 4K Blueprint →
              </span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

// 3D Rotating Cylinder Orbit Group
function HologramCylinder3D({
  prompts,
  rotationY,
  onSelect,
}: {
  prompts: ImagePrompt[];
  rotationY: number;
  onSelect: (index: number) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const radius = Math.max(5.5, prompts.length * 0.95);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        rotationY,
        8,
        delta
      );
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {prompts.map((prompt, index) => {
        const angle = (index / prompts.length) * Math.PI * 2;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        const rotY = angle;
        const primaryUrl = getHologramUrl(prompt, index);

        return (
          <CylinderCard3D
            key={index}
            url={primaryUrl}
            position={[x, 0, z]}
            rotation={[0, rotY, 0]}
            title={`Month ${prompt.milestoneMonth || (index + 1) * 3}`}
            subtitle={prompt.sceneDescription}
            onClick={() => onSelect(index)}
          />
        );
      })}

      <pointLight position={[0, 0, 0]} color="#06b6d4" intensity={4} distance={15} />
      <pointLight position={[0, 3, 0]} color="#a855f7" intensity={3} distance={15} />
    </group>
  );
}

export default function GalleryPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [state, setState] = useState<SimulationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"3d" | "grid">("3d");
  const [selectedHologram, setSelectedHologram] = useState<number | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Wheel / Touch Horizontal Rotation Physics
  const [rotationY, setRotationY] = useState(0);
  const isDragging = useRef(false);
  const startX = useRef(0);

  useEffect(() => {
    async function fetchSim() {
      try {
        const localData = typeof window !== "undefined" ? localStorage.getItem(`sim_${id}`) : null;
        if (localData) {
          setState(JSON.parse(localData));
        } else {
          setState(DEMO_SIMULATION);
        }
      } catch (e) {
        console.error(e);
        setState(DEMO_SIMULATION);
      } finally {
        setLoading(false);
      }
    }
    fetchSim();
  }, [id]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (viewMode !== "3d") return;
      const sensitivity = 0.0025;
      setRotationY((prev) => prev - e.deltaY * sensitivity);
    },
    [viewMode]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode !== "3d") return;
    isDragging.current = true;
    startX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || viewMode !== "3d") return;
    const deltaX = e.clientX - startX.current;
    startX.current = e.clientX;
    setRotationY((prev) => prev + deltaX * 0.005);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (viewMode !== "3d") return;
    isDragging.current = true;
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || viewMode !== "3d") return;
    const deltaX = e.touches[0].clientX - startX.current;
    startX.current = e.touches[0].clientX;
    setRotationY((prev) => prev + deltaX * 0.007);
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#030308]">
        <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4" />
        <p className="text-white/60 text-sm font-mono tracking-wider">Generating Comic-Type Roadmap Holograms...</p>
      </div>
    );
  }

  const prompts: ImagePrompt[] =
    state?.imagePrompts && state.imagePrompts.length > 0
      ? state.imagePrompts
      : DEMO_SIMULATION.imagePrompts;

  const currentHologram = selectedHologram !== null ? prompts[selectedHologram] : null;
  const currentImageUrl =
    selectedHologram !== null ? getHologramUrl(prompts[selectedHologram], selectedHologram) : "";

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownloadImage = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.jpg`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full min-h-screen relative bg-[#030308] text-white select-none font-[var(--font-body)] flex flex-col">
      {/* Top Sticky Navigation Bar — 100% Clickable with high z-index */}
      <header className="sticky top-0 z-50 px-6 py-4 bg-[#030308]/95 backdrop-blur-xl border-b border-zinc-800 flex items-center justify-between pointer-events-auto">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/results/${id}`)}>
          ← Command Center
        </Button>

        {/* 3D / 2D View Switcher */}
        <div className="flex items-center gap-2 bg-zinc-950/90 border border-zinc-800 p-1.5 rounded-2xl shadow-xl">
          <button
            onClick={() => setViewMode("3d")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === "3d"
                ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            🌀 3D Hologram Cylinder
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            📖 Comic Roadmap Panels
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      {viewMode === "3d" ? (
        <div
          className="flex-1 w-full h-[calc(100vh-73px)] relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Scroll / Drag Interaction Hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center">
            <span className="px-6 py-2 rounded-full bg-black/85 backdrop-blur-md border border-cyan-500/40 text-xs font-bold text-cyan-300 uppercase tracking-widest animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              ↕ Scroll Wheel / Drag to Rotate 3D Cylinder Left & Right
            </span>
          </div>

          <Canvas camera={{ position: [0, 0, 9.5], fov: 50 }} dpr={[1, 2]}>
            <color attach="background" args={["#030308"]} />
            <fog attach="fog" args={["#030308", 4, 25]} />
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} />

            <Suspense fallback={null}>
              <HologramCylinder3D
                prompts={prompts}
                rotationY={rotationY}
                onSelect={(idx) => setSelectedHologram(idx)}
              />
            </Suspense>
          </Canvas>
        </div>
      ) : (
        <div className="flex-1 w-full overflow-y-auto px-6 py-10">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <Badge color="cyan" dot className="mb-2">
                Graphic Novel Progression Engine
              </Badge>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Comic Roadmap <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-300">Holograms</span>
              </h1>
              <p className="text-zinc-400 text-sm max-w-2xl mx-auto">
                Step-by-step graphic novel panels illustrating your transformation from{" "}
                <strong className="text-white">{state?.userInput?.currentSituation || "baseline"}</strong> to{" "}
                <strong className="text-cyan-300">{state?.userInput?.goals || "dream profession"}</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {prompts.map((prompt, index) => {
                const hologramUrl = getHologramUrl(prompt, index);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Card
                      elevated
                      className="overflow-hidden p-0 border-zinc-800 hover:border-cyan-400/60 group cursor-pointer transition-all duration-300 flex flex-col h-full bg-[#080812]"
                      onClick={() => setSelectedHologram(index)}
                    >
                      <div className="w-full h-72 relative overflow-hidden bg-black">
                        <img
                          src={hologramUrl}
                          alt={`Month ${prompt.milestoneMonth}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1024&q=80";
                          }}
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-400/50 text-xs font-black text-cyan-300 tracking-wider">
                            Chapter {index + 1} (Month {prompt.milestoneMonth || (index + 1) * 3})
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] text-cyan-400 font-mono font-bold uppercase tracking-wider block mb-1">
                            Holographic Blueprint
                          </span>
                          <p className="text-white text-sm font-semibold leading-relaxed line-clamp-3">
                            {prompt.sceneDescription}
                          </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
                          <span className="text-xs text-purple-300 font-bold">
                            Inspect 4K Blueprint →
                          </span>
                          <span className="text-xs text-zinc-500 font-mono">
                            8K Comic
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4K Hologram Inspector Modal */}
      <AnimatePresence>
        {selectedHologram !== null && currentHologram && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-2xl pointer-events-auto"
            onClick={() => setSelectedHologram(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0b0b14] border border-cyan-500/40 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-[0_0_100px_rgba(6,182,212,0.3)] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedHologram(null)}
                className="absolute top-6 right-6 text-zinc-400 hover:text-white text-xl font-bold w-9 h-9 rounded-full bg-white/5 flex items-center justify-center transition-colors"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-xs font-black text-cyan-300 uppercase">
                  Chapter {selectedHologram + 1} • Month {currentHologram.milestoneMonth || (selectedHologram + 1) * 3}
                </span>
                <span className="text-xs text-purple-300 font-mono font-bold">
                  Comic Roadmap Hologram
                </span>
              </div>

              <div className="w-full aspect-square sm:aspect-video relative rounded-2xl overflow-hidden mb-6 bg-black border border-zinc-800 shadow-2xl">
                <img
                  src={currentImageUrl}
                  alt={`Chapter ${selectedHologram + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-1">
                    Roadmap Milestone Blueprint
                  </h3>
                  <p className="text-white text-base font-semibold leading-relaxed">
                    {currentHologram.sceneDescription}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-800">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDownloadImage(currentImageUrl, `vibeforge_chapter_${selectedHologram + 1}`)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-xs font-bold"
                  >
                    💾 Download 4K Hologram
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopyPrompt(currentHologram.sceneDescription)}
                    className="text-xs border-zinc-700"
                  >
                    {copiedPrompt ? "✓ Blueprint Copied" : "📋 Copy Prompt"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
