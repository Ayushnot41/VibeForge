"use client";

import React, { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { SimulationState } from "@/types/agents";
import * as THREE from "three";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { DEMO_SIMULATION } from "@/lib/demoSimulation";

// 3D Audio Visualizer Waveform Sphere
function AudioWaveformSphere({ isPlaying }: { isPlaying: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * (isPlaying ? 0.8 : 0.2);
      meshRef.current.rotation.x = t * (isPlaying ? 0.5 : 0.1);
      const scale = isPlaying ? 1 + Math.sin(t * 8) * 0.12 : 1;
      meshRef.current.scale.set(scale, scale, scale);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * (isPlaying ? 1.2 : 0.3);
      ringRef.current.rotation.x = Math.PI / 3;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[2.2, 3]} />
          <meshStandardMaterial
            color={isPlaying ? "#06b6d4" : "#4c1d95"}
            emissive={isPlaying ? "#3b82f6" : "#2e1065"}
            emissiveIntensity={isPlaying ? 1.5 : 0.4}
            wireframe
          />
        </mesh>
        <mesh ref={ringRef}>
          <torusGeometry args={[3.2, 0.04, 16, 100]} />
          <meshBasicMaterial color={isPlaying ? "#38bdf8" : "#8b5cf6"} />
        </mesh>
      </Float>
      <Stars radius={60} depth={30} count={1200} factor={4} fade speed={1} />
    </group>
  );
}

export default function NarrativePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [state, setState] = useState<SimulationState | null>(null);
  const [loading, setLoading] = useState(true);

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSpeechText, setActiveSpeechText] = useState<string>("");
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(0);

  // Interactive Voice Q&A State
  const [userQuestion, setUserQuestion] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [mentorAnswer, setMentorAnswer] = useState<string | null>(null);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);

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

    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;

      // Web Speech Recognition setup
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = "en-US";

        recog.onresult = (e: any) => {
          const transcript = e.results[0][0].transcript;
          setUserQuestion(transcript);
          setIsListening(false);
          handleAskMentor(transcript);
        };

        recog.onerror = () => {
          setIsListening(false);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recog;
      }
    }
  }, [id]);

  // High-Definition Human-Like Speech Synthesizer
  const speakText = useCallback((textToSpeak: string) => {
    if (!synthRef.current) return;

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = synthRef.current.getVoices();
    // Prefer natural English voices (Google US English, Samantha, Daniel, Natural)
    const naturalVoice = voices.find(
      (v) =>
        v.name.includes("Natural") ||
        v.name.includes("Google US") ||
        v.name.includes("Daniel") ||
        v.name.includes("Samantha") ||
        v.lang === "en-US"
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setActiveSpeechText(textToSpeak);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    synthRef.current.speak(utterance);
  }, []);

  const stopSpeech = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
  };

  // Trigger Voice Input
  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your doubt below!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeech();
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Submit Doubt to Voice AI Mentor
  const handleAskMentor = async (questionText?: string) => {
    const q = (questionText || userQuestion).trim();
    if (!q) return;

    setIsAnswering(true);
    stopSpeech();

    try {
      const res = await fetch("/api/voice-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          context: state?.aggressivePitch || "Career execution plan",
          goals: state?.userInput?.goals || "Dream career",
        }),
      });

      const data = await res.json();
      const answer = data.explanation || "Focus on your daily habits today, and your goal is guaranteed.";
      setMentorAnswer(answer);
      speakText(answer);
    } catch (err) {
      console.error(err);
      const fallback = "Take it one step at a time. Conquering today's action item is all that matters!";
      setMentorAnswer(fallback);
      speakText(fallback);
    } finally {
      setIsAnswering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#030308]">
        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
        <p className="text-white/60 text-sm font-mono tracking-wider">Tuning Audio Frequencies...</p>
      </div>
    );
  }

  const weeklyActions = state?.actionPlan?.weeklyActions || [];
  const currentWeek = weeklyActions[selectedWeekIndex] || weeklyActions[0];

  const fullNarrative =
    state?.narrativeScript ||
    `Welcome to your personalized career transformation. From "${state?.userInput?.currentSituation || "your baseline"}" to achieving "${state?.userInput?.goals || "your goal"}", every single week is broken down into simple, high-impact actions. Stay disciplined, practice daily, and you will achieve full sovereignty.`;

  return (
    <div className="w-full min-h-screen relative bg-[#030308] text-white overflow-y-auto font-[var(--font-body)] select-none">
      {/* Top Header */}
      <div className="sticky top-0 z-30 px-6 py-4 bg-black/75 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/results/${id}`)}>
          ← Command Center
        </Button>

        <div className="flex items-center gap-3">
          <Badge color="violet" dot>
            {isPlaying ? "🎙️ Voice Mentor Speaking" : "Human Voice Engine Active"}
          </Badge>
          {isPlaying && (
            <button
              onClick={stopSpeech}
              className="px-3 py-1 rounded-xl bg-red-600/80 hover:bg-red-600 text-xs font-bold text-white transition-all shadow-md"
            >
              ⏹ Stop Audio
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Hero Section with 3D Waveform */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#0b0b18] to-[#04040a] border border-cyan-500/30 shadow-[0_0_80px_rgba(6,182,212,0.15)] p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Narrative Script & Main Voice Player */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="px-3.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-xs font-black text-cyan-300 uppercase tracking-widest">
                  Cinematic Overlook & Voice Mentor
                </span>
                <h1 className="text-3xl sm:text-5xl font-black text-white mt-3 tracking-tight">
                  Your Future in <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-300">Human Voice</span>
                </h1>
                <p className="text-white/70 text-sm sm:text-base mt-2 leading-relaxed">
                  Listen to the clear, power-basis explanation of your week-by-week career transformation.
                </p>
              </div>

              {/* Master Narrative Audio Controller */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  variant="primary"
                  onClick={() => (isPlaying ? stopSpeech() : speakText(fullNarrative))}
                  className="bg-gradient-to-r from-cyan-500 via-purple-600 to-indigo-600 hover:opacity-95 border-0 px-6 py-3 font-bold text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                >
                  {isPlaying ? "⏸ Pause Full Narrative" : "▶ Listen to Full Strategy"}
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => {
                    if (currentWeek) {
                      const weekExplanation = `Week ${currentWeek.week}: ${currentWeek.milestone || 'Execution Phase'}. In this week, your main tasks are: ${currentWeek.actions.slice(0, 3).join('. ')}. Focus on completing this step by step.`;
                      speakText(weekExplanation);
                    }
                  }}
                  className="border-white/20 text-xs"
                >
                  🔊 Explain Week {currentWeek ? currentWeek.week : 1}
                </Button>
              </div>

              {/* Executive Mandate Box */}
              {state?.aggressivePitch && (
                <div className="p-4 rounded-2xl bg-black/60 border border-red-500/30 text-xs text-white/80 italic leading-relaxed">
                  <strong className="text-red-400 font-bold uppercase tracking-wider block mb-1">
                    🔥 Executive Mandate:
                  </strong>
                  "{state.aggressivePitch}"
                </div>
              )}
            </div>

            {/* Right: 3D Waveform Canvas */}
            <div className="lg:col-span-5 h-[280px] sm:h-[340px] relative rounded-2xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center">
              <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={2} color="#06b6d4" />
                <pointLight position={[-10, -10, -10]} intensity={1.5} color="#a855f7" />
                <Suspense fallback={null}>
                  <AudioWaveformSphere isPlaying={isPlaying} />
                </Suspense>
              </Canvas>

              <div className="absolute bottom-3 left-3 right-3 text-center">
                <span className="text-[11px] font-mono text-cyan-300/80 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-500/30">
                  {isPlaying ? "🔊 Audio Synthesizer Active" : "Click Play or Ask in Voice"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Voice Q&A / Ask Mentor Section */}
        <Card elevated className="p-6 sm:p-8 bg-[#070712] border-cyan-500/30 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🎙️</span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Ask AI Mentor in Voice (Instant Simple Explanation)
                </h2>
              </div>
              <p className="text-white/60 text-xs sm:text-sm mt-1">
                Have a doubt or need clarity on any week? Ask in voice or text — the mentor explains in simple terms a child can understand!
              </p>
            </div>

            <button
              onClick={toggleSpeechRecognition}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                isListening
                  ? "bg-red-600 text-white animate-pulse shadow-[0_0_25px_rgba(239,68,68,0.6)]"
                  : "bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:scale-105"
              }`}
            >
              <span>{isListening ? "🔴 Listening..." : "🎤 Speak Your Doubt"}</span>
            </button>
          </div>

          {/* Voice Input & Question Box */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="e.g. How do I start Week 1 if I have zero prior experience? What is risk-to-reward?"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAskMentor()}
              className="flex-1 px-4 py-3 rounded-2xl bg-black/60 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 transition-all font-mono"
            />
            <Button
              variant="primary"
              onClick={() => handleAskMentor()}
              disabled={isAnswering || !userQuestion.trim()}
              className="bg-purple-600 hover:bg-purple-500 text-xs px-5 py-3"
            >
              {isAnswering ? "Synthesizing..." : "Ask Mentor"}
            </Button>
          </div>

          {/* Mentor Voice Response Display */}
          {mentorAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-black border border-cyan-400/40 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
                  💡 AI Voice Mentor Answer:
                </span>
                <button
                  onClick={() => speakText(mentorAnswer)}
                  className="text-xs text-purple-300 hover:text-white font-bold flex items-center gap-1"
                >
                  <span>🔊 Repeat Audio</span>
                </button>
              </div>
              <p className="text-white text-base font-semibold leading-relaxed">
                "{mentorAnswer}"
              </p>
            </motion.div>
          )}
        </Card>

        {/* Week-by-Week Breakdown Audio Navigator */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Weekly Step-by-Step Audio Navigator
            </h2>
            <span className="text-xs text-white/50 font-mono">
              Total Sprints: {weeklyActions.length} Weeks
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeklyActions.map((week, idx) => {
              const isSelected = selectedWeekIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedWeekIndex(idx);
                    const speech = `Week ${week.week}: ${week.milestone || 'Execution Step'}. Focus tasks: ${week.actions.slice(0, 2).join('. ')}`;
                    speakText(speech);
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-br from-cyan-950/80 to-purple-950/80 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-[1.02]"
                      : "bg-[#080812] border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30">
                      Week {week.week}
                    </span>
                    <span className="text-xs text-purple-300 font-bold">🔊 Play Voice</span>
                  </div>

                  <h3 className="text-sm font-bold text-white truncate mb-2">
                    {week.milestone || `Sprint ${week.week} Roadmap`}
                  </h3>

                  <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                    {week.actions[0]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
