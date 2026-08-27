"use client";

import React, { useEffect, useState, Suspense, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, Sparkles } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { SimulationState } from "@/types/agents";
import * as THREE from "three";
import Button from "@/components/ui/Button";
import VibeCore from "@/components/three/VibeCore";
import { DEMO_SIMULATION } from "@/lib/demoSimulation";

// Ambient 3D Cosmic Background
function CosmicSpaceScene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      groupRef.current.rotation.y = t * 0.02;
      groupRef.current.rotation.x = Math.sin(t * 0.01) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0.5} fade speed={0.8} />
      <Sparkles count={120} scale={[20, 20, 20]} size={2} speed={0.4} color="#a855f7" />
      
      {/* Floating Cyber Shards */}
      {Array.from({ length: 12 }).map((_, i) => (
        <Float
          key={i}
          speed={0.8}
          rotationIntensity={0.6}
          floatIntensity={1}
          position={[
            (Math.sin(i * 1.8)) * 12,
            (Math.cos(i * 1.5)) * 8,
            -6 - (i % 5) * 2,
          ]}
        >
          <mesh>
            <octahedronGeometry args={[0.25 + (i % 3) * 0.1, 0]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#8b5cf6" : "#06b6d4"}
              emissive={i % 2 === 0 ? "#6d28d9" : "#0891b2"}
              emissiveIntensity={0.6}
              wireframe={i % 3 === 0}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export default function NarrativePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [state, setState] = useState<SimulationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // Active reading paragraph index & auto-scroll
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<1 | 1.5 | 2>(1);
  const narrativeContainerRef = useRef<HTMLDivElement>(null);

  // Gamification state
  const [insightsAbsorbed, setInsightsAbsorbed] = useState(0);

  // Load simulation state
  useEffect(() => {
    async function fetchSim() {
      try {
        const localData = typeof window !== "undefined" ? localStorage.getItem(`sim_${id}`) : null;
        if (localData) {
          setState(JSON.parse(localData));
        } else {
          setState(DEMO_SIMULATION);
          if (typeof window !== "undefined") {
            localStorage.setItem(`sim_${id}`, JSON.stringify(DEMO_SIMULATION));
          }
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

  // Clean split paragraphs
  const paragraphs = useMemo(() => {
    if (!state?.narrativeScript) return [];
    return state.narrativeScript
      .split(/\n\s*\n|\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [state?.narrativeScript]);

  const maxInsights = Math.max(1, Math.min(paragraphs.length, 6));
  const progress = Math.min(1, insightsAbsorbed / maxInsights);

  const absorbInsight = () => {
    if (insightsAbsorbed < maxInsights) {
      setInsightsAbsorbed((prev) => prev + 1);
    }
  };

  // Browser Web Speech Synthesis fallback
  const speakWithBrowserSpeech = (textToSpeak: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setAudioError("Browser speech synthesis not supported.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.pitch = 0.95;
    utterance.rate = 1.0 * scrollSpeed;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Natural") ||
            v.name.includes("Google") ||
            v.name.includes("Daniel") ||
            v.name.includes("Arthur") ||
            v.name.includes("Male"))
      ) || voices.find((v) => v.lang.startsWith("en"));

    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
      setIsPlaying(false);
      setVoiceEnabled(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setVoiceEnabled(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  // Toggle voice playback
  const handleToggleVoice = () => {
    if (voiceEnabled) {
      setVoiceEnabled(false);
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      setVoiceEnabled(true);
      if (audioUrl && audioRef.current) {
        audioRef.current.play().catch(() => {
          speakWithBrowserSpeech(state?.narrativeScript || "");
        });
        setIsPlaying(true);
      } else {
        speakWithBrowserSpeech(state?.narrativeScript || "");
      }
    }
  };

  // Fetch ElevenLabs audio if available
  useEffect(() => {
    if (state?.narrativeScript && !audioUrl && !audioError) {
      const fetchAudio = async () => {
        try {
          const res = await fetch("/api/voice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: state.narrativeScript }),
          });

          if (res.ok) {
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
          } else {
            setAudioError("Standard Audio Stream Active");
          }
        } catch {
          setAudioError("Standard Audio Stream Active");
        }
      };
      fetchAudio();
    }
  }, [state?.narrativeScript, audioUrl, audioError]);

  // Teleprompter Auto-Scroll Effect
  useEffect(() => {
    if (!isAutoScrolling || !narrativeContainerRef.current) return;

    const interval = setInterval(() => {
      if (narrativeContainerRef.current) {
        narrativeContainerRef.current.scrollTop += 1.5 * scrollSpeed;
        const currentScroll = narrativeContainerRef.current.scrollTop;
        const totalScroll = narrativeContainerRef.current.scrollHeight - narrativeContainerRef.current.clientHeight;
        if (currentScroll >= totalScroll - 5) {
          setIsAutoScrolling(false);
        }
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isAutoScrolling, scrollSpeed]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#030305] text-white">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mb-4" />
        <p className="text-purple-300 font-mono text-sm tracking-widest uppercase">
          Synthesizing Cinematic Narrative...
        </p>
      </div>
    );
  }

  if (!state || !state.narrativeScript) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#030305] text-white p-6">
        <h2 className="text-2xl font-bold text-red-400 mb-2">Narrative Transmission Not Found</h2>
        <p className="text-zinc-400 text-sm mb-6">No cinematic script was generated for this simulation.</p>
        <Button onClick={() => router.push(`/dashboard/results/${id}`)} variant="primary">
          Return to Command Center
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full h-screen relative bg-[#040408] text-white overflow-hidden flex select-none"
    >
      {/* 3D WebGL Background Canvas */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }} dpr={[1, 2]}>
          <color attach="background" args={["#040408"]} />
          <fog attach="fog" args={["#040408", 6, 25]} />
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#8b5cf6" />
          <pointLight position={[-10, -10, 10]} intensity={1.2} color="#06b6d4" />
          <Suspense fallback={null}>
            <CosmicSpaceScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Main Narrative Stage */}
      <div className="flex-1 relative flex flex-col h-full z-10">
        {/* Top Header Navigation Bar */}
        <header className="relative z-30 px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent border-b border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/results/${id}`)}
              className="border border-white/10 bg-black/50 hover:bg-white/10 text-xs px-3.5 py-2 rounded-xl"
            >
              ← Command Center
            </Button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span>TRANSMISSION // CINEMATIC OVERLOOK</span>
            </div>
          </div>

          {/* Voice & Teleprompter Controls */}
          <div className="flex items-center gap-2.5">
            {/* Teleprompter Toggle */}
            <button
              onClick={() => setIsAutoScrolling(!isAutoScrolling)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                isAutoScrolling
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  : "bg-black/50 border-white/10 text-zinc-400 hover:text-white"
              }`}
              title="Toggle Auto-Scroll Teleprompter"
            >
              <span>{isAutoScrolling ? "⏸" : "▶"}</span>
              <span className="hidden sm:inline">Teleprompter</span>
            </button>

            {/* Speed Toggle */}
            {isAutoScrolling && (
              <button
                onClick={() => setScrollSpeed((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1))}
                className="px-2.5 py-1.5 rounded-xl text-xs font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-300"
              >
                {scrollSpeed}x
              </button>
            )}

            {/* Voice Audio Toggle Button */}
            <button
              onClick={handleToggleVoice}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                voiceEnabled
                  ? "bg-red-500/20 text-red-300 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse"
                  : "bg-purple-600 hover:bg-purple-500 text-white border border-purple-400/50 shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:scale-105"
              }`}
            >
              <span>{voiceEnabled ? "🔇 Stop Voice" : "🔊 Narrate AI Voice"}</span>
            </button>
          </div>
        </header>

        {/* Audio Element for ElevenLabs stream */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            className="hidden"
            onEnded={() => {
              setIsPlaying(false);
              setVoiceEnabled(false);
            }}
          />
        )}

        {/* Center Scrollable Narrative Container */}
        <div
          ref={narrativeContainerRef}
          className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 py-8 flex flex-col items-center scroll-smooth"
        >
          <div className="w-full max-w-3xl space-y-6 pb-36">
            {/* Narrative Header Card */}
            <div className="relative p-6 sm:p-8 rounded-3xl bg-black/60 backdrop-blur-2xl border border-purple-500/30 shadow-[0_0_50px_rgba(139,92,246,0.15)] overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="text-xs font-mono text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30">
                  Synthesized Future Narrative
                </span>
                <span className="text-xs font-mono text-zinc-500">
                  {paragraphs.length} Paragraphs
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug mb-3">
                {state.userInput?.goals || "Your Multiverse Breakthrough"}
              </h1>

              <p className="text-sm text-zinc-400 leading-relaxed font-mono">
                Listen, read, and absorb every insight to align your subconscious focus with your chosen trajectory.
              </p>
            </div>

            {/* Structured Paragraph Cards with Clear Typography & Spacing */}
            {paragraphs.map((para, idx) => {
              const isActive = activeParagraphIndex === idx;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.5), duration: 0.4 }}
                  onClick={() => {
                    setActiveParagraphIndex(idx);
                    if (voiceEnabled) {
                      speakWithBrowserSpeech(para);
                    }
                  }}
                  className={`group relative p-6 sm:p-7 rounded-3xl transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-purple-950/40 border border-purple-400/60 shadow-[0_0_40px_rgba(139,92,246,0.3)] scale-[1.01]"
                      : "bg-black/50 hover:bg-black/70 border border-white/10 hover:border-purple-500/30"
                  } backdrop-blur-xl`}
                >
                  {/* Left Accent Bar */}
                  <div
                    className={`absolute left-0 top-6 bottom-6 w-1 rounded-r transition-all duration-300 ${
                      isActive ? "bg-purple-400 shadow-[0_0_10px_#c084fc]" : "bg-transparent group-hover:bg-white/20"
                    }`}
                  />

                  {/* Paragraph Header Meta */}
                  <div className="flex items-center justify-between mb-3 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-bold">ACT {idx + 1}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-400 text-[11px]">
                        {idx === 0 ? "Initial Ignition" : idx === paragraphs.length - 1 ? "Ultimate Realization" : "Evolutionary Sprint"}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWithBrowserSpeech(para);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-300 hover:text-white text-[11px] flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md"
                    >
                      <span>🔊</span>
                      <span>Play Segment</span>
                    </button>
                  </div>

                  {/* Narrative Body Text - Clean, Spacious, Highly Readable */}
                  <p className="text-base sm:text-lg md:text-xl text-zinc-100 font-normal leading-relaxed tracking-normal font-sans">
                    {para}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Floating Bottom Action Dock */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 pointer-events-auto">
          {progress < 1 ? (
            <Button
              onClick={absorbInsight}
              variant="primary"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border border-purple-400/50 shadow-[0_0_35px_rgba(139,92,246,0.6)] text-sm font-bold tracking-wide flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
            >
              <span>✨ Absorb Insight</span>
              <span className="bg-black/40 px-2 py-0.5 rounded-lg text-xs font-mono">
                {insightsAbsorbed}/{maxInsights}
              </span>
            </Button>
          ) : (
            <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600/30 to-cyan-600/30 border border-emerald-400/50 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.4)] text-emerald-300 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <span>🌟</span>
              <span>100% Mental Synchronization Achieved</span>
            </div>
          )}
        </div>
      </div>

      {/* Gamification Panel (Right side) */}
      <aside className="w-80 lg:w-96 border-l border-white/10 bg-black/60 backdrop-blur-2xl flex flex-col items-center justify-between p-6 sm:p-8 z-20 hidden lg:flex">
        <div className="w-full text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-mono mb-2 uppercase">
            <span>🧠 Neurological Sync</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Mental Synchronization</h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
            Absorb insights from the narrative to align your subconscious mindset with your future goals.
          </p>
        </div>

        {/* 3D VibeCore Mindset Stone */}
        <div className="w-full h-56 relative flex items-center justify-center my-4">
          <VibeCore progress={progress} className="w-full h-full" />
        </div>

        {/* Progress Bar & Insights Summary */}
        <div className="w-full space-y-4">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-400">Mindset Alignment</span>
              <span className="text-purple-300 font-bold">{Math.round(progress * 100)}%</span>
            </div>
            <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="text-center">
            <p className="text-[11px] font-mono text-zinc-500">
              {progress === 1
                ? "Your trajectory has been permanently encoded."
                : `${maxInsights - insightsAbsorbed} more insight${maxInsights - insightsAbsorbed > 1 ? "s" : ""} required for full lock-in.`}
            </p>
          </div>
        </div>
      </aside>
    </motion.div>
  );
}
