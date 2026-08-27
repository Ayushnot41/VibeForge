"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, useScroll, Html } from "@react-three/drei";
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
    `Graphic novel comic panel, stylized holographic neon overlays, glowing cyan and violet roadmap HUD, career transformation milestone: ${prompt.sceneDescription.slice(0, 200)} 8k resolution comic art`
  );
  return `https://image.pollinations.ai/prompt/${comicQuery}?width=1200&height=1200&nologo=true&seed=${index + 1042}&model=flux`;
}

// Individual 3D gallery card using HTML overlay
function GalleryImage3D({
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
  const ref = useRef<any>(null);
  const [imgSrc, setImgSrc] = useState(url);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  return (
    <group position={position} rotation={rotation} ref={ref}>
      <Html transform distanceFactor={5} center className="pointer-events-none">
        <div 
          onClick={onClick}
          className="w-[720px] h-[720px] flex flex-col items-center justify-between p-6 rounded-3xl overflow-hidden bg-[rgba(10,10,18,0.85)] backdrop-blur-2xl border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.25)] transition-all duration-500 hover:scale-105 hover:border-cyan-400 cursor-pointer pointer-events-auto group"
        >
          <div className="w-full h-full relative rounded-2xl overflow-hidden">
            <img
              src={imgSrc}
              alt={title}
              className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />
            
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-4 py-1.5 rounded-full bg-cyan-950/80 backdrop-blur-md border border-cyan-400/40 text-xs font-black text-cyan-300 tracking-widest uppercase shadow-lg">
                ⚡ {title}
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-400/40 text-[10px] font-bold text-purple-300 uppercase">
                Comic Hologram
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-left">
              <p className="text-white text-sm sm:text-base font-bold leading-snug line-clamp-2 drop-shadow-md">
                {subtitle}
              </p>
              <span className="text-cyan-400 text-xs font-bold mt-2 inline-flex items-center gap-1.5">
                <span>🔍</span> Inspect Hologram Panel & Blueprints →
              </span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

function CurvedGallery3D({ prompts, onSelect }: { prompts: ImagePrompt[]; onSelect: (index: number) => void }) {
  const scroll = useScroll();
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (group.current) {
      group.current.rotation.y = -(scroll.offset * Math.PI * 2.4);
    }
  });

  const radius = Math.max(4.5, prompts.length * 0.85);

  return (
    <group ref={group}>
      {prompts.map((prompt, index) => {
        const angle = (index / prompts.length) * Math.PI * 2;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        const rotY = angle;
        const primaryUrl = getHologramUrl(prompt, index);

        return (
          <GalleryImage3D
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#05050A]">
        <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4" />
        <p className="text-white/60 text-sm font-mono tracking-wider">Generating Comic-Type Roadmap Holograms...</p>
      </div>
    );
  }

  const prompts: ImagePrompt[] = state?.imagePrompts && state.imagePrompts.length > 0 ? state.imagePrompts : DEMO_SIMULATION.imagePrompts;

  const currentHologram = selectedHologram !== null ? prompts[selectedHologram] : null;
  const currentImageUrl = selectedHologram !== null ? getHologramUrl(prompts[selectedHologram], selectedHologram) : "";

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
    <div className="w-full min-h-screen relative bg-[#030308] text-white overflow-hidden select-none font-[var(--font-body)]">
      {/* Top Navigation Bar */}
      <div className="absolute top-6 left-6 right-6 z-30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pointer-events-none">
        <div className="pointer-events-auto">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/results/${id}`)}>
            ← Command Center
          </Button>
        </div>

        <div className="pointer-events-auto flex items-center gap-3 bg-[rgba(10,10,20,0.8)] backdrop-blur-xl border border-cyan-500/30 p-1.5 rounded-2xl shadow-2xl">
          <button
            onClick={() => setViewMode("3d")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === "3d"
                ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            🌀 3D Hologram Cylinder
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === "grid"
                ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            📖 Comic Roadmap Panels
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "3d" ? (
        <div className="w-full h-screen relative">
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center">
            <span className="px-6 py-2 rounded-full bg-black/70 backdrop-blur-md border border-cyan-500/30 text-xs font-semibold text-cyan-300 uppercase tracking-widest animate-pulse shadow-lg">
              ↕ Scroll to Rotate Comic Hologram Cylinders
            </span>
          </div>

          <Canvas camera={{ position: [0, 0, 10], fov: 55 }} dpr={[1, 2]}>
            <color attach="background" args={["#030308"]} />
            <fog attach="fog" args={["#030308", 3, 26]} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            
            <Suspense fallback={null}>
              <ScrollControls pages={Math.max(3, prompts.length * 0.6)} damping={0.15} horizontal={false}>
                <CurvedGallery3D prompts={prompts} onSelect={(idx) => setSelectedHologram(idx)} />
              </ScrollControls>
            </Suspense>
          </Canvas>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 pt-28 pb-20 overflow-y-auto min-h-screen">
          <div className="text-center mb-12">
            <Badge color="cyan" dot className="mb-3">
              Graphic Novel Timeline Visualizer
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-black mb-3 text-white tracking-tight">
              Comic Roadmap <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-300">Holograms</span>
            </h1>
            <p className="text-white/60 text-sm max-w-2xl mx-auto">
              Visualizing your step-by-step career transformation from <strong className="text-white">{state?.userInput?.currentSituation || "current starting point"}</strong> to <strong className="text-cyan-300">{state?.userInput?.goals || "your dream profession"}</strong>.
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
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    elevated
                    className="overflow-hidden p-0 border-white/10 hover:border-cyan-400/60 group cursor-pointer transition-all duration-300 flex flex-col h-full bg-[#080812]"
                    onClick={() => setSelectedHologram(index)}
                  >
                    <div className="w-full h-72 relative overflow-hidden bg-black">
                      <img
                        src={hologramUrl}
                        alt={`Month ${prompt.milestoneMonth}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-xs font-black text-cyan-300 tracking-wider">
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

                      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                        <span className="text-xs text-purple-300 font-bold">
                          Inspect Blueprint →
                        </span>
                        <span className="text-xs text-white/40 font-mono">
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
      )}

      {/* Hologram Inspector Modal */}
      <AnimatePresence>
        {selectedHologram !== null && currentHologram && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-2xl"
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
                className="absolute top-6 right-6 text-white/40 hover:text-white text-xl font-bold w-9 h-9 rounded-full bg-white/5 flex items-center justify-center"
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

              <div className="w-full aspect-square sm:aspect-video relative rounded-2xl overflow-hidden mb-6 bg-black border border-white/10 shadow-2xl">
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

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDownloadImage(currentImageUrl, `vibeforge_chapter_${selectedHologram + 1}`)}
                    className="bg-gradient-to-r from-cyan-600 to-purple-600 border-0"
                  >
                    💾 Download 4K Comic Artwork
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopyPrompt(currentHologram.sceneDescription)}
                  >
                    {copiedPrompt ? "✓ Blueprint Copied!" : "📋 Copy AI Visual Prompt"}
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
