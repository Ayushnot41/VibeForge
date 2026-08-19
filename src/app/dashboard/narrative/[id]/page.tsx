"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, Float, Stars, ScrollControls, Scroll, useScroll } from "@react-three/drei";
import { motion } from "framer-motion";
import { SimulationState } from "@/types/agents";
import * as THREE from "three";
import Button from "@/components/ui/Button";
import VibeCore from "@/components/three/VibeCore";

function FloatingNarrative({ text }: { text: string }) {
  const paragraphs = text.split("\n").filter(p => p.trim().length > 0);
  const scroll = useScroll();
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (group.current) {
      // Move up as we scroll
      const totalHeight = paragraphs.length * 4;
      group.current.position.y = scroll.offset * totalHeight;
    }
  });

  return (
    <group ref={group}>
      {paragraphs.map((p, index) => {
        const yOffset = -index * 4;
        const zOffset = -index * 2;
        return (
          <Float key={index} speed={1.5} rotationIntensity={0.05} floatIntensity={0.2}>
            <Text
              position={[0, yOffset, zOffset]}
              fontSize={0.4}
              color="white"
              anchorX="center"
              anchorY="middle"
              maxWidth={8}
              textAlign="center"
            >
              {p}
            </Text>
          </Float>
        );
      })}
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

  // Gamification state
  const [insightsAbsorbed, setInsightsAbsorbed] = useState(0);

  useEffect(() => {
    async function fetchSim() {
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
    fetchSim();
  }, [id]);

  const fallbackToSpeechSynthesis = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 0.8;
      utterance.rate = 0.9;
      // Try to find a good male voice for "Jarvis" effect
      const voices = window.speechSynthesis.getVoices();
      const maleVoice = voices.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("uk") || v.name.toLowerCase().includes("english"));
      if (maleVoice) utterance.voice = maleVoice;
      
      utterance.onend = () => setIsPlaying(false);
      
      if (voiceEnabled) {
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
      setAudioError("ElevenLabs locked (Unusual Activity). Using browser fallback voice.");
    } else {
      setAudioError("ElevenLabs API failed and browser speech not supported.");
    }
  };

  useEffect(() => {
    if (state?.narrativeScript && !audioUrl && !audioError && !isPlaying) {
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
            const errData = await res.json();
            console.warn("API Error:", errData);
            fallbackToSpeechSynthesis(state.narrativeScript);
          }
        } catch (e) {
          console.error("Failed to fetch audio", e);
          fallbackToSpeechSynthesis(state.narrativeScript);
        }
      };
      fetchAudio();
    }
  }, [state, audioUrl, audioError, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      if (voiceEnabled) {
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
    
    // Handle SpeechSynthesis toggle
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (!voiceEnabled) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else if (!isPlaying && state?.narrativeScript && (audioError || !audioUrl)) {
        fallbackToSpeechSynthesis(state.narrativeScript);
      }
    }
  }, [voiceEnabled]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-screen">
        <div className="w-10 h-10 border-4 border-[var(--accent-violet)]/30 border-t-[var(--accent-violet)] rounded-full animate-spin mb-4" />
        <p className="text-[var(--text-secondary)]">Loading Narrative...</p>
      </div>
    );
  }

  if (!state || !state.narrativeScript) {
    return (
      <div className="text-center py-20 min-h-screen">
        <h2 className="text-2xl font-bold text-red-400">Narrative not found</h2>
        <Button onClick={() => router.push(`/dashboard/results/${id}`)} className="mt-4">
          Back to Hub
        </Button>
      </div>
    );
  }

  const paragraphs = state.narrativeScript.split("\n").filter(p => p.trim().length > 0);
  const maxInsights = Math.max(1, Math.floor(paragraphs.length / 2));
  const progress = Math.min(1, insightsAbsorbed / maxInsights);

  const absorbInsight = () => {
    if (insightsAbsorbed < maxInsights) {
      setInsightsAbsorbed(prev => prev + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      className="w-full h-screen relative bg-black overflow-hidden flex"
    >
      <div className="flex-1 relative">
        <div className="absolute top-6 left-6 z-20">
          <Button variant="ghost" onClick={() => router.push(`/dashboard/results/${id}`)}>
            ← Back to Command Center
          </Button>
        </div>
        
        <div className="absolute top-6 right-6 z-20 text-right">
          <h1 className="text-2xl font-bold text-white mb-2">Immersive Reader</h1>
          <div className="flex flex-col items-end gap-3">
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
            <button 
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold uppercase tracking-wider transition-all duration-300 ${voiceEnabled ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-[var(--accent-violet)] text-white border border-transparent shadow-[0_0_15px_rgba(124,58,237,0.5)]'}`}
            >
              {voiceEnabled ? '🔇 Turn Voice Off' : '🔊 Turn Voice On'}
            </button>
            {isPlaying && (
              <div className="flex gap-1 items-center mr-4 h-4">
                <div className="w-1 bg-[var(--accent-violet)] h-2 animate-[pulse_0.8s_ease-in-out_infinite]" />
                <div className="w-1 bg-[var(--accent-violet)] h-4 animate-[pulse_1.2s_ease-in-out_infinite]" />
                <div className="w-1 bg-[var(--accent-violet)] h-3 animate-[pulse_0.9s_ease-in-out_infinite]" />
                <div className="w-1 bg-[var(--accent-violet)] h-5 animate-[pulse_1.5s_ease-in-out_infinite]" />
                <div className="w-1 bg-[var(--accent-violet)] h-2 animate-[pulse_1.0s_ease-in-out_infinite]" />
              </div>
            )}
            
            {audioError && !isPlaying && (
              <p className="text-xs text-red-400 text-right mt-1">⚠️ High Quality Voice API Failed. Using Browser voice.</p>
            )}
            {!audioUrl && !audioError && !isPlaying && (
              <p className="text-xs text-[var(--accent-violet)] animate-pulse text-right mt-1">Generating AI Voice...</p>
            )}
          </div>
        </div>

        {/* Gamification Action Button */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20">
          {progress < 1 ? (
            <Button onClick={absorbInsight} variant="primary" className="animate-pulse shadow-[0_0_20px_rgba(124,58,237,0.5)]">
              ✨ Absorb Next Insight
            </Button>
          ) : (
            <p className="text-[var(--accent-violet)] font-bold uppercase tracking-wider">All Insights Absorbed</p>
          )}
        </div>

        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 60 }}>
          <color attach="background" args={["#0a0a15"]} />
          <fog attach="fog" args={["#0a0a15", 5, 20]} />
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#3B82F6" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#8B5CF6" />
          
          <Stars radius={100} depth={50} count={1500} factor={4} saturation={0} fade speed={1} />

          <Suspense fallback={null}>
            <ScrollControls pages={Math.max(2, paragraphs.length / 1.5)} damping={0.2}>
              <Scroll>
                <FloatingNarrative text={state.narrativeScript} />
              </Scroll>
            </ScrollControls>
          </Suspense>
        </Canvas>
      </div>

      {/* Gamification Panel (Right side) */}
      <div className="w-96 border-l border-[var(--glass-border)] bg-[rgba(10,10,15,0.8)] backdrop-blur-xl flex flex-col items-center justify-center p-8 z-10 hidden lg:flex">
        <h2 className="text-xl font-bold mb-2">Mental Synchronization</h2>
        <p className="text-sm text-[var(--text-secondary)] text-center mb-8">
          Absorb insights from the narrative to align your mindset with the future.
        </p>
        
        <VibeCore progress={progress} className="w-full h-64 mb-8" />
        
        <div className="w-full">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[var(--text-secondary)]">Mindset Alignment</span>
            <span className="text-white font-bold">{Math.round(progress * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
