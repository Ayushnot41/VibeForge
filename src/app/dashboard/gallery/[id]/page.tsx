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

// High-resolution curated visual fallbacks for startup/founder future milestones
const CURATED_VISUALS = [
  "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop", // Deep focus cyber work
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop", // Team collaboration
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop", // Executive boardroom
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop", // Global keynote
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop", // Tech lab
];

function getHologramUrl(prompt: ImagePrompt, index: number): string {
  // If prompt has a valid image url, use it
  if (prompt.sceneDescription && prompt.sceneDescription.startsWith("http")) {
    return prompt.sceneDescription;
  }
  // Try pollinations AI generation URL or fall back to high-res curated imagery
  const query = encodeURIComponent(`${prompt.style || "Cyberpunk photorealistic"} ${prompt.sceneDescription || "AI Founder executive"} 4k ultra detailed`);
  return `https://image.pollinations.ai/prompt/${query}?width=1200&height=1200&nologo=true&seed=${index + 42}&model=flux`;
}

// Individual 3D gallery card using HTML overlay
function GalleryImage3D({
  url,
  fallbackUrl,
  position,
  rotation,
  title,
  subtitle,
  onClick,
}: {
  url: string;
  fallbackUrl: string;
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
          className="w-[720px] h-[720px] flex flex-col items-center justify-between p-6 rounded-3xl overflow-hidden bg-[rgba(10,10,15,0.75)] backdrop-blur-2xl border border-white/20 shadow-[0_0_50px_rgba(124,58,237,0.3)] transition-all duration-500 hover:scale-105 hover:border-[var(--accent-purple)] cursor-pointer pointer-events-auto group"
        >
          <div className="w-full h-full relative rounded-2xl overflow-hidden">
            <img
              src={imgSrc}
              alt={title}
              onError={() => setImgSrc(fallbackUrl)}
              className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
            
            <div className="absolute top-4 left-4">
              <span className="px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold text-white tracking-widest uppercase">
                {title}
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-left">
              <p className="text-white text-base font-semibold line-clamp-2 drop-shadow-md">
                {subtitle}
              </p>
              <span className="text-[var(--accent-purple)] text-xs font-bold mt-2 inline-flex items-center gap-1">
                🔍 Click to inspect 4K Hologram →
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
        const fallback = CURATED_VISUALS[index % CURATED_VISUALS.length];
        const primaryUrl = getHologramUrl(prompt, index);

        return (
          <GalleryImage3D
            key={index}
            url={primaryUrl}
            fallbackUrl={fallback}
            position={[x, 0, z]}
            rotation={[0, rotY, 0]}
            title={`Month ${prompt.milestoneMonth}`}
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
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
        <p className="text-[var(--text-secondary)] text-sm">Materializing Holographic Gallery...</p>
      </div>
    );
  }

  const prompts: ImagePrompt[] = state?.imagePrompts && state.imagePrompts.length > 0 ? state.imagePrompts : DEMO_SIMULATION.imagePrompts;

  const currentHologram = selectedHologram !== null ? prompts[selectedHologram] : null;
  const currentImageUrl = selectedHologram !== null ? (CURATED_VISUALS[selectedHologram % CURATED_VISUALS.length]) : "";

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
    <div className="w-full min-h-screen relative bg-[#05050A] text-white overflow-hidden font-[var(--font-body)]">
      {/* Top Navigation Bar */}
      <div className="absolute top-6 left-6 right-6 z-30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pointer-events-none">
        <div className="pointer-events-auto">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/results/${id}`)}>
            ← Back to Command Center
          </Button>
        </div>

        <div className="pointer-events-auto flex items-center gap-3 bg-[rgba(10,10,15,0.7)] backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-xl">
          <button
            onClick={() => setViewMode("3d")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === "3d"
                ? "bg-[var(--accent-purple)] text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                : "text-[var(--text-muted)] hover:text-white"
            }`}
          >
            🌀 3D Curved Gallery
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === "grid"
                ? "bg-[var(--accent-purple)] text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                : "text-[var(--text-muted)] hover:text-white"
            }`}
          >
            🖼️ 2D Ultra Grid
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "3d" ? (
        <div className="w-full h-screen relative">
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center">
            <span className="px-6 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs font-semibold text-white/70 uppercase tracking-widest animate-pulse">
              ↕ Scroll to Rotate 3D Multiverse Cylinders
            </span>
          </div>

          <Canvas camera={{ position: [0, 0, 10], fov: 55 }} dpr={[1, 2]}>
            <color attach="background" args={["#05050A"]} />
            <fog attach="fog" args={["#05050A", 3, 26]} />
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
            <Badge color="violet" dot className="mb-3">
              Production Visual Archive
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-black mb-3 font-[var(--font-heading)]">
              Future Milestone <span className="gradient-text">Holograms</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-sm max-w-xl mx-auto">
              Photorealistic snapshots of key milestones along your optimal simulated horizon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {prompts.map((prompt, index) => {
              const fallback = CURATED_VISUALS[index % CURATED_VISUALS.length];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    elevated
                    className="overflow-hidden p-0 border-white/10 hover:border-[var(--accent-purple)] group cursor-pointer transition-all duration-300 flex flex-col h-full"
                    onClick={() => setSelectedHologram(index)}
                  >
                    <div className="w-full h-64 relative overflow-hidden bg-black">
                      <img
                        src={fallback}
                        alt={`Month ${prompt.milestoneMonth}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge color="cyan">Month {prompt.milestoneMonth}</Badge>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] text-[var(--accent-purple)] font-bold uppercase tracking-wider block mb-1">
                          {prompt.style}
                        </span>
                        <p className="text-white text-sm font-semibold leading-relaxed line-clamp-3">
                          {prompt.sceneDescription}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
                        <span>4K Photorealistic</span>
                        <span className="text-[var(--accent-purple)] font-semibold group-hover:translate-x-1 transition-transform">
                          Inspect →
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

      {/* Interactive 4K Lightbox Modal */}
      <AnimatePresence>
        {selectedHologram !== null && currentHologram && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-2xl"
          >
            <div className="relative w-full max-w-5xl bg-[#0A0A10] border border-white/20 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(124,58,237,0.35)] flex flex-col lg:flex-row max-h-[90vh]">
              {/* Close Button */}
              <button
                onClick={() => setSelectedHologram(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-colors"
                aria-label="Close Lightbox"
              >
                ✕
              </button>

              {/* Hologram Image Viewer */}
              <div className="w-full lg:w-3/5 relative bg-black flex items-center justify-center min-h-[350px] lg:min-h-[550px] overflow-hidden">
                <img
                  src={currentImageUrl}
                  alt={`Month ${currentHologram.milestoneMonth}`}
                  className="w-full h-full object-cover max-h-[550px]"
                />
                
                {/* Previous / Next Controls */}
                <button
                  onClick={() => setSelectedHologram((prev) => (prev! > 0 ? prev! - 1 : prompts.length - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all"
                >
                  ←
                </button>
                <button
                  onClick={() => setSelectedHologram((prev) => (prev! < prompts.length - 1 ? prev! + 1 : 0))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all"
                >
                  →
                </button>
              </div>

              {/* Prompt & Metadata Inspector */}
              <div className="w-full lg:w-2/5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto bg-[rgba(15,15,22,0.95)]">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge color="violet">Milestone Horizon</Badge>
                    <Badge color="emerald">Month {currentHologram.milestoneMonth}</Badge>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4 font-[var(--font-heading)]">
                    Simulated Reality Snapshot
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Scene Description
                      </span>
                      <p className="text-sm text-gray-200 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                        {currentHologram.sceneDescription}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Aesthetic Style Tokens
                      </span>
                      <p className="text-xs text-purple-300 font-mono bg-purple-950/40 p-2.5 rounded-xl border border-purple-800/40">
                        {currentHologram.style} • Ultra-HD • Octane Render • Cinematic Lighting
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => handleCopyPrompt(currentHologram.sceneDescription)}
                  >
                    {copiedPrompt ? "✓ Copied to Clipboard!" : "📋 Copy AI Prompt Tokens"}
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => handleDownloadImage(currentImageUrl, `vibeforge-month-${currentHologram.milestoneMonth}`)}
                  >
                    💾 Download 4K Hologram
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
