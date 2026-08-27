"use client";

import React, { useEffect, useState, Suspense, useRef, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { SimulationState, FuturePath, ImagePrompt } from "@/types/agents";
import * as THREE from "three";
import Button from "@/components/ui/Button";

export interface HologramItem {
  index: number;
  prompt: ImagePrompt;
  pathType: "optimistic" | "realistic" | "pessimistic";
  pathTitle: string;
  milestoneTitle: string;
  milestoneDesc: string;
  month: number;
  cleanPrompt: string;
}

// Curated high-aesthetic futuristic photography fallbacks
const FALLBACK_THEMES: Record<string, string[]> = {
  tech: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1024&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1024&q=80",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1024&q=80",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1024&q=80",
  ],
  speaking: [
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1024&q=80",
    "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1024&q=80",
  ],
  office: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1024&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1024&q=80",
  ],
  general: [
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1024&q=80",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1024&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1024&q=80",
  ],
};

function getAestheticFallback(prompt: string, seed: number = 0): string {
  const p = (prompt || "").toLowerCase();
  let pool = FALLBACK_THEMES.general;
  if (p.includes("speak") || p.includes("stage") || p.includes("conference") || p.includes("talk")) {
    pool = FALLBACK_THEMES.speaking;
  } else if (
    p.includes("code") ||
    p.includes("software") ||
    p.includes("ai") ||
    p.includes("developer") ||
    p.includes("system") ||
    p.includes("tech")
  ) {
    pool = FALLBACK_THEMES.tech;
  } else if (p.includes("office") || p.includes("company") || p.includes("startup") || p.includes("executive")) {
    pool = FALLBACK_THEMES.office;
  }
  return pool[Math.abs(seed) % pool.length];
}

// Clean and optimize prompt for high quality photorealistic generation
function cleanPromptText(rawDesc: string, milestoneTitle: string, pathType: string): string {
  let clean = rawDesc
    .replace(/CRITICAL INSTRUCTION:[^.]*(\.|$)/gi, "")
    .replace(/Context:[^.]*(\.|$)/gi, "")
    .replace(/Scene:[^.]*(\.|$)/gi, "")
    .replace(/No text or words in the image\.?/gi, "")
    .replace(/A person /gi, "A visionary professional ")
    .trim();

  if (!clean || clean.length < 15) {
    clean = `Photorealistic cinematic documentary shot of ${milestoneTitle}, depicting personal and career transformation`;
  }

  const moodKeywords =
    pathType === "optimistic"
      ? "radiant golden hour sunlight, ultra luxury modern environment, triumphant atmosphere, award-winning cinematography"
      : pathType === "realistic"
        ? "crisp modern executive interior, sharp focus, professional depth of field, authentic daylight"
        : "dramatic moody cinematic rim lighting, gritty determination, hyper-detailed textures, masterpiece";

  return `${clean}, ${moodKeywords}, 8k, photorealistic, Hasselblad photography`.substring(0, 450);
}

// Interactive 3D Hologram Pedestal & Light Beam Chamber
function HologramChamber3D({ activeColor }: { activeColor: string }) {
  const innerRingsRef = useRef<THREE.Group>(null);
  const outerRingsRef = useRef<THREE.Group>(null);
  const lightConeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (innerRingsRef.current) {
      innerRingsRef.current.rotation.y = t * 0.35;
    }
    if (outerRingsRef.current) {
      outerRingsRef.current.rotation.y = -t * 0.2;
    }
    if (lightConeRef.current) {
      const mat = lightConeRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.08 + Math.sin(t * 2) * 0.02;
    }
  });

  return (
    <group position={[0, -2.4, 0]}>
      {/* Outer Hologram Grid Base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[0.5, 6.5, 64]} />
        <meshBasicMaterial color={activeColor} wireframe transparent opacity={0.15} />
      </mesh>

      {/* Rotating Inner Glow Rings */}
      <group ref={innerRingsRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[1.6, 1.72, 48]} />
          <meshBasicMaterial color={activeColor} transparent opacity={0.7} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
          <ringGeometry args={[2.5, 2.58, 48]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Rotating Outer Ring */}
      <group ref={outerRingsRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
          <ringGeometry args={[3.8, 3.92, 64]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Vertical Glowing Hologram Beam / Light Emitter Cone */}
      <mesh ref={lightConeRef} position={[0, 2.6, 0]}>
        <cylinderGeometry args={[0.4, 3.2, 5.2, 32, 1, true]} />
        <meshBasicMaterial color={activeColor} transparent opacity={0.09} side={THREE.DoubleSide} />
      </mesh>

      {/* Ambient Floating Cyber Dust */}
      <Sparkles count={100} scale={[8, 5, 8]} size={2.5} speed={0.5} color={activeColor} />
    </group>
  );
}

export default function GalleryPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [state, setState] = useState<SimulationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterPath, setFilterPath] = useState<"all" | "optimistic" | "realistic" | "pessimistic">("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedHologram, setSelectedHologram] = useState<HologramItem | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, string>>({});

  // Load simulation data from localStorage
  useEffect(() => {
    async function loadData() {
      try {
        const localData = localStorage.getItem(`sim_${id}`);
        if (localData) {
          setState(JSON.parse(localData));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // Build list of hologram items from future paths and prompts
  const allHolograms = useMemo<HologramItem[]>(() => {
    if (!state || !state.futurePaths) return [];

    const items: HologramItem[] = [];
    let idx = 0;

    state.futurePaths.forEach((path: FuturePath) => {
      path.milestones.forEach((ms) => {
        const matchingPrompt = state.imagePrompts?.find(
          (p) => p.pathId === path.id && p.milestoneMonth === ms.month
        ) || {
          sceneDescription: ms.description,
          style: "Hyper-realistic cinematic photography",
          pathId: path.id,
          milestoneMonth: ms.month,
        };

        const clean = cleanPromptText(
          matchingPrompt.sceneDescription || ms.description,
          ms.title,
          path.type
        );

        items.push({
          index: idx++,
          prompt: matchingPrompt,
          pathType: path.type,
          pathTitle: path.title,
          milestoneTitle: ms.title,
          milestoneDesc: ms.description,
          month: ms.month,
          cleanPrompt: clean,
        });
      });
    });

    return items.sort((a, b) => a.month - b.month);
  }, [state]);

  // Filtered holograms based on user filter selection
  const filteredHolograms = useMemo(() => {
    if (filterPath === "all") return allHolograms;
    return allHolograms.filter((h) => h.pathType === filterPath);
  }, [allHolograms, filterPath]);

  // Reset index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [filterPath]);

  // Preload and resolve image for current & nearby holograms
  useEffect(() => {
    if (filteredHolograms.length === 0) return;

    const currentItem = filteredHolograms[currentIndex];
    if (!currentItem) return;

    const seed = (currentItem.month * 73 + currentItem.index * 137) % 99999;
    const fallback = getAestheticFallback(currentItem.cleanPrompt, seed);
    const key = `${currentItem.month}_${currentItem.pathType}_${currentItem.index}`;

    if (!loadedImages[key]) {
      // Immediately set fallback to ensure no blank display
      setLoadedImages((prev) => ({ ...prev, [key]: fallback }));

      // Attempt high-res AI generation via Pollinations
      const simplePrompt = encodeURIComponent(
        `${currentItem.milestoneTitle}, futuristic tech career, 8k cinematic photorealistic`.substring(0, 150)
      );
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${simplePrompt}?width=800&height=800&nologo=true&seed=${seed}`;

      const img = new Image();
      img.src = pollinationsUrl;
      img.onload = () => {
        setLoadedImages((prev) => ({ ...prev, [key]: pollinationsUrl }));
      };
    }
  }, [filteredHolograms, currentIndex, loadedImages]);

  // Auto-rotation timer
  useEffect(() => {
    if (!isAutoRotating || filteredHolograms.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredHolograms.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoRotating, filteredHolograms.length]);

  const handleNext = useCallback(() => {
    if (filteredHolograms.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredHolograms.length);
  }, [filteredHolograms.length]);

  const handlePrev = useCallback(() => {
    if (filteredHolograms.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + filteredHolograms.length) % filteredHolograms.length);
  }, [filteredHolograms.length]);

  // Keyboard navigation support (ArrowLeft, ArrowRight, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsAutoRotating((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050508] text-white">
        <div className="relative w-16 h-16 mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        </div>
        <p className="text-cyan-300 font-mono text-sm tracking-widest uppercase">
          Initializing Holographic Chamber...
        </p>
      </div>
    );
  }

  if (!state || allHolograms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050508] text-white p-6">
        <div className="text-4xl mb-4">🔮</div>
        <h2 className="text-2xl font-bold text-red-400 mb-2">Hologram Matrix Not Found</h2>
        <p className="text-zinc-400 text-sm mb-6 max-w-md text-center">
          No simulation paths or milestone visuals were detected for this timeline.
        </p>
        <Button onClick={() => router.push(`/dashboard/results/${id}`)} variant="primary">
          Return to Command Center
        </Button>
      </div>
    );
  }

  const activeHologram = filteredHolograms[currentIndex] || filteredHolograms[0];
  const activeKey = activeHologram
    ? `${activeHologram.month}_${activeHologram.pathType}_${activeHologram.index}`
    : "";
  const activeImageSrc =
    loadedImages[activeKey] ||
    (activeHologram
      ? getAestheticFallback(
          activeHologram.cleanPrompt,
          (activeHologram.month * 73 + activeHologram.index * 137) % 99999
        )
      : "");

  const activeGlowColor =
    activeHologram.pathType === "optimistic"
      ? "#f59e0b"
      : activeHologram.pathType === "realistic"
        ? "#06b6d4"
        : "#8b5cf6";

  const pathBadgeStyle =
    activeHologram.pathType === "optimistic"
      ? "bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
      : activeHologram.pathType === "realistic"
        ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        : "bg-purple-500/20 text-purple-300 border-purple-400/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-screen relative bg-[#040407] text-white overflow-hidden select-none flex flex-col justify-between"
    >
      {/* 3D WebGL Holographic Canvas in Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0.4, 7.5], fov: 48 }} dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
          <color attach="background" args={["#040407"]} />
          <fog attach="fog" args={["#040407", 6, 20]} />
          <ambientLight intensity={0.9} />
          <pointLight position={[0, 6, 4]} intensity={2.2} color={activeGlowColor} />
          <pointLight position={[0, -4, 4]} intensity={1.2} color="#06b6d4" />
          <Suspense fallback={null}>
            <HologramChamber3D activeColor={activeGlowColor} />
          </Suspense>
        </Canvas>
      </div>

      {/* Top Header Bar */}
      <header className="relative z-20 px-6 py-4 flex flex-wrap items-center justify-between gap-4 pointer-events-auto bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/results/${id}`)}
            className="border border-white/10 bg-black/50 backdrop-blur-md hover:bg-white/10 text-xs px-3.5 py-2 rounded-xl"
          >
            ← Back to Command Center
          </Button>
        </div>

        {/* Timeline Path Filter Pills */}
        <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl">
          {(["all", "optimistic", "realistic", "pessimistic"] as const).map((p) => {
            const isSel = filterPath === p;
            return (
              <button
                key={p}
                onClick={() => setFilterPath(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                  isSel
                    ? p === "optimistic"
                      ? "bg-amber-500/30 text-amber-300 border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                      : p === "realistic"
                        ? "bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                        : p === "pessimistic"
                          ? "bg-purple-500/30 text-purple-300 border border-purple-400/50 shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                          : "bg-white/20 text-white border border-white/30"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {p === "all" ? "All Timelines" : p}
              </button>
            );
          })}
        </div>

        {/* Right Info & Auto-Rotate Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all backdrop-blur-md ${
              isAutoRotating
                ? "bg-cyan-500/20 border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse"
                : "bg-black/50 border-white/10 text-zinc-400 hover:text-white"
            }`}
          >
            {isAutoRotating ? "⏸ Auto-Rotate: ON" : "▶ Auto-Rotate: OFF"}
          </button>
          <div className="hidden lg:block text-right">
            <h1 className="text-sm font-bold text-white tracking-wide">Future Holograms</h1>
            <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
              TIMELINE VISUALIZER // 3D CHAMBER
            </p>
          </div>
        </div>
      </header>

      {/* Main Holographic Centerpiece Display */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-2 pointer-events-none">
        {/* Left Arrow */}
        <div className="absolute left-6 pointer-events-auto z-20">
          <button
            onClick={handlePrev}
            className="w-13 h-13 md:w-14 md:h-14 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center text-2xl hover:bg-cyan-500/20 hover:border-cyan-400 hover:text-cyan-300 transition-all shadow-[0_0_25px_rgba(0,0,0,0.8)] hover:scale-110 active:scale-95 cursor-pointer"
            title="Previous Milestone (Left Arrow)"
          >
            ‹
          </button>
        </div>

        {/* Right Arrow */}
        <div className="absolute right-6 pointer-events-auto z-20">
          <button
            onClick={handleNext}
            className="w-13 h-13 md:w-14 md:h-14 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center text-2xl hover:bg-cyan-500/20 hover:border-cyan-400 hover:text-cyan-300 transition-all shadow-[0_0_25px_rgba(0,0,0,0.8)] hover:scale-110 active:scale-95 cursor-pointer"
            title="Next Milestone (Right Arrow)"
          >
            ›
          </button>
        </div>

        {/* Hologram Card with Holographic Glitch & Light Projection */}
        <AnimatePresence mode="wait">
          {activeHologram && (
            <motion.div
              key={`${activeHologram.month}_${activeHologram.pathType}_${currentIndex}`}
              initial={{ opacity: 0, scale: 0.88, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="pointer-events-auto relative w-full max-w-[420px] md:max-w-[460px] bg-black/65 backdrop-blur-2xl rounded-3xl p-4.5 border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.25)] flex flex-col justify-between"
              style={{
                boxShadow: `0 0 50px ${activeGlowColor}33, 0 20px 40px rgba(0,0,0,0.8)`,
                borderColor: `${activeGlowColor}66`,
              }}
            >
              {/* Corner Sci-Fi Tech Brackets */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400/80 pointer-events-none" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400/80 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400/80 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400/80 pointer-events-none" />

              {/* Holographic Card Header */}
              <div className="flex items-center justify-between z-10 bg-black/50 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
                  </span>
                  <span className="text-[11px] font-mono tracking-widest text-cyan-300 uppercase">
                    HOLOGRAM // M{activeHologram.month}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-400">
                    STEP {currentIndex + 1}/{filteredHolograms.length}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${pathBadgeStyle}`}
                  >
                    {activeHologram.pathType}
                  </span>
                </div>
              </div>

              {/* Holographic Projection Image Frame */}
              <div
                onClick={() => setSelectedHologram(activeHologram)}
                className="relative h-[250px] md:h-[290px] rounded-2xl overflow-hidden bg-zinc-950 border border-white/15 flex items-center justify-center group cursor-pointer"
              >
                <img
                  src={activeImageSrc}
                  alt={activeHologram.milestoneTitle}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getAestheticFallback(
                      activeHologram.cleanPrompt,
                      (activeHologram.month * 73 + activeHologram.index * 137) % 99999
                    );
                  }}
                />

                {/* Holographic Scanline Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-25"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, rgba(6,182,212,0.2) 0px, transparent 2px, transparent 4px)",
                  }}
                />

                {/* Hologram Vignette */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Expand Hover Hint */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md text-[11px] font-mono text-cyan-300 px-3 py-1.5 rounded-xl border border-cyan-400/40 shadow-lg">
                  🔍 Click to Inspect Full Hologram
                </div>

                {/* Holographic Timeline Badge */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="text-[10px] font-mono text-cyan-300 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-500/30">
                    {activeHologram.pathTitle}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-300 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                    Month {activeHologram.month}
                  </span>
                </div>
              </div>

              {/* Holographic Card Footer Info */}
              <div className="z-10 bg-black/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 mt-3">
                <h3 className="text-base font-bold text-white tracking-wide truncate mb-1">
                  {activeHologram.milestoneTitle}
                </h3>
                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                  {activeHologram.milestoneDesc}
                </p>

                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      className="text-[11px] text-zinc-400 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={handleNext}
                      className="text-[11px] text-zinc-400 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedHologram(activeHologram)}
                    className="text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-500/20 hover:bg-cyan-500/30 px-3 py-1 rounded-lg border border-cyan-400/40 transition-colors"
                  >
                    Expand ↗
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Timeline Step-by-Step Scrubber */}
      <footer className="relative z-20 px-6 py-4 flex flex-col items-center gap-2 pointer-events-auto bg-gradient-to-t from-black/90 via-black/60 to-transparent">
        {/* Step Indicator Text */}
        <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
          <span className="text-cyan-400 font-bold">MONTH {activeHologram.month}</span>
          <span>•</span>
          <span className="text-zinc-300 max-w-md truncate">{activeHologram.milestoneTitle}</span>
          <span>•</span>
          <span>Use ← → keys to navigate</span>
        </div>

        {/* Step Pills Bar */}
        <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/10 overflow-x-auto max-w-full shadow-2xl">
          {filteredHolograms.map((item, idx) => {
            const isCur = idx === currentIndex;
            const dotColor =
              item.pathType === "optimistic"
                ? "bg-amber-400"
                : item.pathType === "realistic"
                  ? "bg-cyan-400"
                  : "bg-purple-400";

            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
                  isCur
                    ? "bg-cyan-500 text-black font-bold shadow-[0_0_20px_rgba(6,182,212,0.8)] scale-105"
                    : "text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isCur ? "bg-black" : dotColor}`} />
                <span>M{item.month}</span>
                <span className="text-[10px] opacity-75">#{idx + 1}</span>
              </button>
            );
          })}
        </div>
      </footer>

      {/* Full-Screen Hologram Detailed Inspector Modal */}
      <AnimatePresence>
        {selectedHologram && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl"
            onClick={() => setSelectedHologram(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950/95 border border-cyan-500/40 rounded-3xl overflow-hidden shadow-[0_0_90px_rgba(6,182,212,0.3)] flex flex-col md:flex-row"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedHologram(null)}
                className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
              >
                ✕
              </button>

              {/* High-Res Image View */}
              <div className="relative md:w-1/2 min-h-[320px] md:min-h-[420px] bg-zinc-950 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
                <img
                  src={
                    loadedImages[
                      `${selectedHologram.month}_${selectedHologram.pathType}_${selectedHologram.index}`
                    ] ||
                    getAestheticFallback(
                      selectedHologram.cleanPrompt,
                      (selectedHologram.month * 73 + selectedHologram.index * 137) % 99999
                    )
                  }
                  alt={selectedHologram.milestoneTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-300 bg-black/75 px-3 py-1 rounded-full border border-cyan-400/30 backdrop-blur-md">
                    MONTH {selectedHologram.month} • {selectedHologram.pathType.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Hologram Details & Story */}
              <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
                      TIMELINE HOLOGRAM PROJECTION
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-white tracking-wide">
                    {selectedHologram.milestoneTitle}
                  </h2>

                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="text-[11px] font-mono text-zinc-400 uppercase mb-1">
                      Path Context: {selectedHologram.pathTitle}
                    </div>
                    <p className="text-sm text-zinc-200 leading-relaxed">
                      {selectedHologram.milestoneDesc}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono text-zinc-400 uppercase mb-1.5">
                      Synthesized Visual Prompt
                    </h4>
                    <p className="text-xs text-zinc-400 bg-black/50 p-3.5 rounded-xl border border-white/5 font-mono leading-relaxed line-clamp-4">
                      {selectedHologram.cleanPrompt}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-mono">
                    Hologram #{selectedHologram.index + 1} of {filteredHolograms.length}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedHologram(null)}
                      className="text-xs"
                    >
                      Close
                    </Button>
                    <a
                      href={
                        loadedImages[
                          `${selectedHologram.month}_${selectedHologram.pathType}_${selectedHologram.index}`
                        ] ||
                        getAestheticFallback(
                          selectedHologram.cleanPrompt,
                          (selectedHologram.month * 73 + selectedHologram.index * 137) % 99999
                        )
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="primary" className="text-xs">
                        Open Full HD ↗
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
