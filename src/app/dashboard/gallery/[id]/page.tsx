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

// Step-by-Step Growth Blueprint Infographic Generator
function getHologramUrl(prompt: ImagePrompt, index: number, userGoal?: string): string {
  if (prompt.sceneDescription && prompt.sceneDescription.startsWith("http")) {
    return prompt.sceneDescription;
  }
  const cleanDesc = prompt.sceneDescription
    .replace(/[^\w\s,.-]/g, "")
    .slice(0, 180);

  const goalContext = userGoal ? userGoal.slice(0, 40) : "career mastery";

  const infographicPrompt = encodeURIComponent(
    `Clean illustrated notebook infographic blueprint, showing real person growth step-by-step toward ${goalContext}, structured sketch notes with numbered growth milestones (Step 1, Step 2, Step 3), diagrammatic roadmap annotations on dark slate textured paper with glowing cyan and purple ink highlights, highly readable visual growth guide: ${cleanDesc}`
  );
  return `https://image.pollinations.ai/prompt/${infographicPrompt}?width=1024&height=1024&nologo=true&seed=${index * 179 + 5302}&model=flux`;
}

// Crisp High-Resolution SVG Infographic Engine (Renders in 0ms)
function getFallbackInfographicSvg(title: string, desc: string, stepIndex: number, userGoal?: string): string {
  const cleanTitle = title.replace(/[<>&"]/g, "");
  const cleanDesc = desc.replace(/[<>&"]/g, "").slice(0, 160);
  const phaseNum = Math.floor(stepIndex / 2) + 1;
  const goalClean = (userGoal || "Dream Career").replace(/[<>&"]/g, "").slice(0, 30);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#070714"/>
        <stop offset="100%" stop-color="#020208"/>
      </linearGradient>
      <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#06b6d4"/>
        <stop offset="100%" stop-color="#8b5cf6"/>
      </linearGradient>
    </defs>
    
    <rect width="600" height="850" fill="url(#bgGrad)" rx="28"/>
    <rect x="16" y="16" width="568" height="818" fill="none" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="6 6" rx="20" opacity="0.4"/>
    
    <!-- Top Header Bar -->
    <rect x="32" y="32" width="536" height="84" fill="#0f0f26" rx="16" stroke="#8b5cf6" stroke-width="1.5"/>
    <text x="52" y="62" fill="#06b6d4" font-size="12" font-family="monospace" font-weight="bold" letter-spacing="1">⚡ GROWTH BLUEPRINT • PHASE ${phaseNum}</text>
    <text x="52" y="94" fill="#ffffff" font-size="22" font-family="sans-serif" font-weight="bold">${cleanTitle}</text>
    
    <!-- 3-Step Flow Diagram -->
    <rect x="32" y="132" width="536" height="340" fill="#05050f" rx="18" stroke="#06b6d4" stroke-width="1.5" stroke-opacity="0.3"/>
    
    <!-- Step 1 -->
    <circle cx="78" cy="188" r="20" fill="#06b6d4" fill-opacity="0.2" stroke="#06b6d4" stroke-width="2"/>
    <text x="78" y="195" fill="#22d3ee" font-size="15" font-family="monospace" font-weight="bold" text-anchor="middle">01</text>
    <text x="114" y="184" fill="#ffffff" font-size="16" font-family="sans-serif" font-weight="bold">Core Foundation & Rules</text>
    <text x="114" y="206" fill="#94a3b8" font-size="13" font-family="sans-serif">Daily focus blocks & risk control architecture</text>
    
    <line x1="78" y1="214" x2="78" y2="258" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="4 4"/>
    
    <!-- Step 2 -->
    <circle cx="78" cy="286" r="20" fill="#8b5cf6" fill-opacity="0.2" stroke="#8b5cf6" stroke-width="2"/>
    <text x="78" y="293" fill="#c084fc" font-size="15" font-family="monospace" font-weight="bold" text-anchor="middle">02</text>
    <text x="114" y="282" fill="#ffffff" font-size="16" font-family="sans-serif" font-weight="bold">Simulated Drills & Edge Testing</text>
    <text x="114" y="304" fill="#94a3b8" font-size="13" font-family="sans-serif">Execute 50+ backtests & eliminate cognitive lag</text>
    
    <line x1="78" y1="312" x2="78" y2="356" stroke="#10b981" stroke-width="2" stroke-dasharray="4 4"/>
    
    <!-- Step 3 -->
    <circle cx="78" cy="384" r="20" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="2"/>
    <text x="78" y="391" fill="#34d399" font-size="15" font-family="monospace" font-weight="bold" text-anchor="middle">03</text>
    <text x="114" y="380" fill="#ffffff" font-size="16" font-family="sans-serif" font-weight="bold">Live Staking & Sovereign Scaling</text>
    <text x="114" y="402" fill="#94a3b8" font-size="13" font-family="sans-serif">Scale capital, authority & compound verified track record</text>
    
    <!-- Directive Text Block -->
    <rect x="32" y="490" width="536" height="316" fill="#0b0b1a" rx="18" stroke="#ffffff" stroke-opacity="0.1"/>
    <text x="56" y="528" fill="#06b6d4" font-size="13" font-family="monospace" font-weight="bold" letter-spacing="1">📋 ROADMAP DIRECTIVES FOR ${goalClean.toUpperCase()}:</text>
    <foreignObject x="56" y="546" width="488" height="236">
      <div xmlns="http://www.w3.org/1999/xhtml" style="color:#cbd5e1;font-size:14.5px;line-height:1.65;font-family:sans-serif;">
        ${cleanDesc}...
      </div>
    </foreignObject>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 3D Card for Device-Responsive Growth Cylinder
function CylinderCard3D({
  url,
  position,
  rotation,
  title,
  subtitle,
  onClick,
  index,
  distanceFactor,
  userGoal,
}: {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  title: string;
  subtitle: string;
  onClick: () => void;
  index: number;
  distanceFactor: number;
  userGoal?: string;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const fallbackSvg = getFallbackInfographicSvg(title, subtitle, index, userGoal);
  const [imgSrc, setImgSrc] = useState(fallbackSvg);
  const [isAiLoaded, setIsAiLoaded] = useState(false);

  // Preload AI Image in the background and smoothly swap
  useEffect(() => {
    if (!url || url.startsWith("data:")) return;
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImgSrc(url);
      setIsAiLoaded(true);
    };
    img.onerror = () => {
      setImgSrc(fallbackSvg);
    };
  }, [url, fallbackSvg]);

  // Silky-Smooth Gentle Float (Frequency reduced to 0.35 for calm, lag-free motion)
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.35 + index * 0.9) * 0.035;
    }
  });

  return (
    <group position={position} rotation={rotation} ref={meshRef}>
      <Html transform distanceFactor={distanceFactor} center className="pointer-events-none">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="w-[320px] h-[460px] flex flex-col justify-between p-3.5 rounded-3xl overflow-hidden bg-[#070714]/95 backdrop-blur-2xl border-2 border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.25)] transition-all duration-300 hover:scale-105 hover:border-cyan-300 cursor-pointer pointer-events-auto group select-none"
        >
          <div className="w-full h-full relative rounded-2xl overflow-hidden bg-black flex flex-col justify-between p-4">
            <img
              src={imgSrc}
              alt={title}
              className={`absolute inset-0 w-full h-full object-cover rounded-2xl transition-all duration-500 ${
                isAiLoaded ? "opacity-100 scale-100" : "opacity-95"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/40 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-cyan-950/90 backdrop-blur-md border border-cyan-400/50 text-[11px] font-black text-cyan-300 tracking-wider uppercase shadow-lg">
                📊 {title}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-950/90 border border-purple-400/50 text-[10px] font-bold text-purple-300 uppercase">
                Growth Blueprint
              </span>
            </div>

            <div className="relative z-10 text-left">
              <p className="text-white text-xs sm:text-sm font-semibold leading-snug line-clamp-2 drop-shadow-lg mb-1.5">
                {subtitle}
              </p>
              <span className="text-cyan-400 text-xs font-bold inline-flex items-center gap-1 group-hover:text-cyan-300">
                🔍 Inspect Blueprint Notes →
              </span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

// 3D Cylinder Orbit Group with Silky-Smooth Inertia Damping
function HologramCylinder3D({
  prompts,
  rotationY,
  onSelect,
  userGoal,
  distanceFactor,
}: {
  prompts: ImagePrompt[];
  rotationY: number;
  onSelect: (index: number) => void;
  userGoal?: string;
  distanceFactor: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const radius = Math.max(6.0, prompts.length * 1.02);

  // Silky Smooth Damping Physics (Factor 3.2 for luxurious, zero-jitter gliding)
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        rotationY,
        3.2,
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
        const primaryUrl = getHologramUrl(prompt, index, userGoal);

        return (
          <CylinderCard3D
            key={index}
            url={primaryUrl}
            position={[x, 0, z]}
            rotation={[0, rotY, 0]}
            title={`Month ${prompt.milestoneMonth || (index + 1) * 3}`}
            subtitle={prompt.sceneDescription}
            onClick={() => onSelect(index)}
            index={index}
            distanceFactor={distanceFactor}
            userGoal={userGoal}
          />
        );
      })}

      <pointLight position={[0, 0, 0]} color="#06b6d4" intensity={3.5} distance={16} />
      <pointLight position={[0, 3, 0]} color="#a855f7" intensity={2.8} distance={16} />
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
  const [autoRotate, setAutoRotate] = useState(true);

  // Machine & Viewport Auto-Detection
  const [deviceMetrics, setDeviceMetrics] = useState({
    isMobile: false,
    cameraZ: 9.6,
    fov: 46,
    cardDistanceFactor: 5.0,
  });
  const [activeMobileCard, setActiveMobileCard] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 768) {
        setDeviceMetrics({
          isMobile: true,
          cameraZ: 11.5,
          fov: 56,
          cardDistanceFactor: 6.0,
        });
      } else if (w < 1024) {
        setDeviceMetrics({
          isMobile: false,
          cameraZ: 10.0,
          fov: 48,
          cardDistanceFactor: 5.2,
        });
      } else {
        setDeviceMetrics({
          isMobile: false,
          cameraZ: 9.6,
          fov: 46,
          cardDistanceFactor: 5.0,
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Wheel / Touch Rotation Physics
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

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Gentle Wheel Sensitivity
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el || viewMode !== "3d") return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const sensitivity = 0.0012;
      setRotationY((prev) => prev - e.deltaY * sensitivity);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [viewMode]);

  // Gentle Mouse Drag Sensitivity
  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode !== "3d") return;
    isDragging.current = true;
    startX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || viewMode !== "3d") return;
    const deltaX = e.clientX - startX.current;
    startX.current = e.clientX;
    setRotationY((prev) => prev + deltaX * 0.0022);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const [activeCenterIndex, setActiveCenterIndex] = useState(0);

  const rotateToCard = (targetIndex: number) => {
    if (!prompts.length) return;
    const normalizedIndex = (targetIndex + prompts.length) % prompts.length;
    setActiveCenterIndex(normalizedIndex);
    const targetAngle = -(normalizedIndex / prompts.length) * Math.PI * 2;
    setRotationY(targetAngle);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#030308]">
        <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4" />
        <p className="text-white/60 text-sm font-mono tracking-wider">Generating Visual Growth Blueprints...</p>
      </div>
    );
  }

  const prompts: ImagePrompt[] =
    state?.imagePrompts && state.imagePrompts.length > 0
      ? state.imagePrompts
      : DEMO_SIMULATION.imagePrompts;

  const currentHologram = selectedHologram !== null ? prompts[selectedHologram] : null;
  const currentImageUrl =
    selectedHologram !== null ? getHologramUrl(prompts[selectedHologram], selectedHologram, state?.userInput?.goals) : "";

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
    <div className={`w-full relative bg-[#030308] text-white select-none font-[var(--font-body)] flex flex-col ${viewMode === "3d" ? "h-screen overflow-hidden" : "min-h-screen overflow-y-auto"}`}>
      {/* Top Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 px-4 sm:px-6 py-3.5 bg-[#030308]/95 backdrop-blur-xl border-b border-zinc-800 flex items-center justify-between pointer-events-auto">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/results/${id}`)}>
          ← Command Center
        </Button>

        {/* 3D / 2D View Switcher */}
        <div className="flex items-center gap-1.5 bg-zinc-950/90 border border-zinc-800 p-1 rounded-2xl shadow-xl">
          <button
            onClick={() => setViewMode("3d")}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === "3d"
                ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            🌀 3D Growth Holograms
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            📊 Step-by-Step Infographic Blueprints
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      {viewMode === "3d" ? (
        deviceMetrics.isMobile ? (
          /* Mobile Holographic 3D Interactive Card Deck */
          <div className="flex-1 w-full flex flex-col justify-between items-center px-4 py-6 overflow-hidden">
            <div className="text-center space-y-1">
              <span className="px-3 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[10px] font-mono font-bold text-cyan-300 uppercase">
                Milestone {activeMobileCard + 1} of {prompts.length}
              </span>
              <p className="text-xs text-zinc-400">Swipe or tap arrows to navigate growth timeline</p>
            </div>

            <div className="w-full max-w-sm my-auto relative">
              <AnimatePresence mode="wait">
                {(() => {
                  const prompt = prompts[activeMobileCard];
                  const monthTitle = `Month ${prompt.milestoneMonth || (activeMobileCard + 1) * 3}`;
                  const hologramUrl = getHologramUrl(prompt, activeMobileCard, state?.userInput?.goals);

                  return (
                    <motion.div
                      key={activeMobileCard}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{ duration: 0.25 }}
                      onClick={() => setSelectedHologram(activeMobileCard)}
                      className="w-full h-[460px] rounded-3xl overflow-hidden bg-[#070712] border-2 border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.3)] flex flex-col justify-between p-3.5 cursor-pointer relative"
                    >
                      <div className="w-full h-full relative rounded-2xl overflow-hidden bg-black flex flex-col justify-between p-4">
                        <img
                          src={getFallbackInfographicSvg(monthTitle, prompt.sceneDescription, activeMobileCard, state?.userInput?.goals)}
                          alt={monthTitle}
                          className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/50 pointer-events-none" />

                        <div className="relative z-10 flex items-center justify-between">
                          <span className="px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-400/50 text-[11px] font-black text-cyan-300 uppercase shadow-lg">
                            📊 {monthTitle}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-950/90 border border-purple-400/50 text-[10px] font-bold text-purple-300 uppercase">
                            Growth Blueprint
                          </span>
                        </div>

                        <div className="relative z-10 text-left">
                          <p className="text-white text-xs font-semibold leading-relaxed line-clamp-3 mb-2">
                            {prompt.sceneDescription}
                          </p>
                          <span className="text-cyan-400 text-xs font-bold inline-flex items-center gap-1">
                            🔍 Tap to Open Full Blueprint →
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>

            <div className="w-full max-w-sm flex items-center justify-between gap-4 pt-2">
              <button
                onClick={() => setActiveMobileCard((prev) => (prev > 0 ? prev - 1 : prompts.length - 1))}
                className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white text-lg font-bold hover:bg-zinc-800 active:scale-95 transition-all"
              >
                ‹
              </button>

              <div className="flex items-center gap-1.5">
                {prompts.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveMobileCard(i)}
                    className={`h-2 rounded-full transition-all ${
                      activeMobileCard === i ? "w-6 bg-cyan-400" : "w-2 bg-zinc-700"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setActiveMobileCard((prev) => (prev < prompts.length - 1 ? prev + 1 : 0))}
                className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white text-lg font-bold hover:bg-zinc-800 active:scale-95 transition-all"
              >
                ›
              </button>
            </div>
          </div>
        ) : (
          /* Laptop / Desktop Machine-Adaptive 3D Cylinder View */
          <div
            ref={canvasContainerRef}
            className="flex-1 w-full h-[calc(100vh-65px)] relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Centered Desktop 3D Navigation Dock */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 pointer-events-auto">
              <button
                onClick={() => rotateToCard(activeCenterIndex - 1)}
                className="px-4 py-2 rounded-2xl bg-black/85 backdrop-blur-md border border-zinc-700 text-xs font-bold text-white hover:border-cyan-400 hover:text-cyan-300 transition-all shadow-xl cursor-pointer"
              >
                ‹ Prev Milestone
              </button>
              <div className="px-5 py-2 rounded-2xl bg-black/90 backdrop-blur-md border border-cyan-500/50 text-xs font-bold text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                Milestone {activeCenterIndex + 1} of {prompts.length} (Drag or Use Arrows)
              </div>
              <button
                onClick={() => rotateToCard(activeCenterIndex + 1)}
                className="px-4 py-2 rounded-2xl bg-black/85 backdrop-blur-md border border-zinc-700 text-xs font-bold text-white hover:border-cyan-400 hover:text-cyan-300 transition-all shadow-xl cursor-pointer"
              >
                Next Milestone ›
              </button>
            </div>

            <Canvas
              camera={{ position: [0, 0, deviceMetrics.cameraZ], fov: deviceMetrics.fov }}
              dpr={[1, 2]}
            >
              <color attach="background" args={["#030308"]} />
              <fog attach="fog" args={["#030308", 4, 30]} />
              <ambientLight intensity={0.7} />
              <directionalLight position={[10, 10, 5]} intensity={1.5} />

              <Suspense fallback={null}>
                <HologramCylinder3D
                  prompts={prompts}
                  rotationY={rotationY}
                  onSelect={(idx) => setSelectedHologram(idx)}
                  userGoal={state?.userInput?.goals}
                  distanceFactor={deviceMetrics.cardDistanceFactor}
                />
              </Suspense>
            </Canvas>
          </div>
        )
      ) : (
        /* 2D Step-by-Step Infographic Blueprints View */
        <div className="flex-1 w-full overflow-y-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <Badge color="cyan" dot className="mb-2">
                Step-by-Step Growth Blueprints
              </Badge>
              <h1 className="text-2xl sm:text-5xl font-black text-white tracking-tight">
                Visual Growth <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-300">Blueprints</span>
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl mx-auto">
                Step-by-step illustrated roadmap infographics engineered from your implementation plan, showing your progression from{" "}
                <strong className="text-white">{state?.userInput?.currentSituation || "baseline"}</strong> to{" "}
                <strong className="text-cyan-300">{state?.userInput?.goals || "dream profession"}</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {prompts.map((prompt, index) => {
                const monthTitle = `Month ${prompt.milestoneMonth || (index + 1) * 3}`;
                const instantSvg = getFallbackInfographicSvg(monthTitle, prompt.sceneDescription, index, state?.userInput?.goals);
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
                      <div className="w-full aspect-[4/3] sm:h-72 relative overflow-hidden bg-black">
                        <img
                          src={instantSvg}
                          alt={monthTitle}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-3.5 left-3.5 flex gap-2">
                          <span className="px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-400/50 text-xs font-black text-cyan-300 tracking-wider">
                            Phase {Math.floor(index / 2) + 1} ({monthTitle})
                          </span>
                        </div>
                      </div>

                      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] text-cyan-400 font-mono font-bold uppercase tracking-wider block mb-1">
                            📊 Step-by-Step Blueprint
                          </span>
                          <p className="text-white text-xs sm:text-sm font-semibold leading-relaxed line-clamp-3">
                            {prompt.sceneDescription}
                          </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
                          <span className="text-xs text-purple-300 font-bold">
                            Inspect Blueprint Notes →
                          </span>
                          <span className="text-xs text-zinc-500 font-mono">
                            Infographic
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
              className="bg-[#0b0b14] border border-cyan-500/40 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 shadow-[0_0_100px_rgba(6,182,212,0.3)] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedHologram(null)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white text-xl font-bold w-9 h-9 rounded-full bg-white/5 flex items-center justify-center transition-colors"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 mb-5">
                <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-xs font-black text-cyan-300 uppercase">
                  Phase {Math.floor(selectedHologram / 2) + 1} • Month {currentHologram.milestoneMonth || (selectedHologram + 1) * 3}
                </span>
                <span className="text-xs text-purple-300 font-mono font-bold">
                  Step-by-Step Growth Blueprint
                </span>
              </div>

              <div className="w-full aspect-square sm:aspect-video relative rounded-2xl overflow-hidden mb-6 bg-black border border-zinc-800 shadow-2xl">
                <img
                  src={currentImageUrl}
                  alt={`Phase ${Math.floor(selectedHologram / 2) + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getFallbackInfographicSvg(`Phase ${Math.floor(selectedHologram / 2) + 1}`, currentHologram.sceneDescription, selectedHologram);
                  }}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-1">
                    Implementation Plan Growth Notes
                  </h3>
                  <p className="text-white text-sm sm:text-base font-semibold leading-relaxed">
                    {currentHologram.sceneDescription}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-800">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDownloadImage(currentImageUrl, `vibeforge_growth_blueprint_${selectedHologram + 1}`)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-xs font-bold"
                  >
                    💾 Download Blueprint
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopyPrompt(currentHologram.sceneDescription)}
                    className="text-xs border-zinc-700"
                  >
                    {copiedPrompt ? "✓ Notes Copied" : "📋 Copy Prompt"}
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
