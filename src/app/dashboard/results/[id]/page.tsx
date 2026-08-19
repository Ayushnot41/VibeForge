"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { SimulationState } from "@/types/agents";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ParticleTimeline from "@/components/three/ParticleTimeline";
import MotivationalHero from "@/components/three/MotivationalHero";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function ResultsHubPage() {
  const params = useParams();
  const id = params.id as string;
  const [state, setState] = useState<SimulationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulatingRisk, setSimulatingRisk] = useState(false);

  const handleTakeRisk = async () => {
    if (!state) return;
    setSimulatingRisk(true);
    
    // Simulate API delay for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const isSuccess = Math.random() > 0.3;
      const riskId = 'risk-' + Date.now();
      const goalStr = state.userInput?.goals || 'your goal';

      const newPath = {
        id: riskId,
        type: (isSuccess ? 'optimistic' : 'pessimistic') as 'optimistic' | 'realistic' | 'pessimistic',
        title: isSuccess ? 'The 100x Multiverse Path' : 'The Bankruptcy Path',
        summary: isSuccess
          ? 'You took a massive, uncalculated risk. The timeline shattered, and you achieved results 100x faster.'
          : 'The risk backfired catastrophically. Everything collapsed, but the lessons forged unbreakable resilience.',
        narrative: isSuccess
          ? 'You abandoned all safety nets and went all-in on ' + goalStr + '. Against all odds, exponential growth kicked in.'
          : 'The gamble failed spectacularly. You lost everything, hit rock bottom, but rebuilt stronger than ever.',
        milestones: isSuccess
          ? [
              { month: 3, title: 'The Leap of Faith', description: 'You burned the boats and committed fully.', achieved: false },
              { month: 6, title: 'The Breakpoint', description: 'Near-collapse followed by massive growth.', achieved: false },
              { month: 12, title: 'The Multiverse Empire', description: 'You achieved what most take decades to build.', achieved: false },
            ]
          : [
              { month: 3, title: 'The Fall', description: 'Everything collapsed. Total loss.', achieved: false },
              { month: 6, title: 'Rock Bottom', description: 'You hit the absolute lowest point.', achieved: false },
              { month: 12, title: 'The Phoenix', description: 'From the ashes, you rebuilt stronger.', achieved: false },
            ],
        dailyRoutines: [
          { timeOfDay: '6:00 AM', activity: 'Extreme focus work', purpose: 'Maximum output during peak hours' },
          { timeOfDay: '12:00 PM', activity: 'Strategic review', purpose: 'Assess risks and adjust course' },
        ],
        probabilityScore: isSuccess ? 0.01 : 0.05,
      };

      const updatedPaths = [...(state.futurePaths || []), newPath];
      const newState = { ...state, futurePaths: updatedPaths };
      setState(newState);
      localStorage.setItem('sim_' + id, JSON.stringify(newState));
    } finally {
      setSimulatingRisk(false);
    }
  };

  useEffect(() => {
    async function fetchSim() {
      try {
        const localData = localStorage.getItem(`sim_${id}`);
        if (localData) {
          setState(JSON.parse(localData));
        } else {
          console.error("No local data found for ID:", id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (id && id !== "sim-demo") {
      fetchSim();
    } else {
      setTimeout(() => setLoading(false), 0);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-[var(--accent-violet)]/30 border-t-[var(--accent-violet)] rounded-full animate-spin mb-4" />
        <p className="text-[var(--text-secondary)]">Loading Command Center...</p>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4 text-red-500">
          Simulation Not Found
        </h1>
        <p className="text-[var(--text-secondary)] mb-8">
          We couldn&apos;t find the simulation data you&apos;re looking for.
        </p>
      </div>
    );
  }

  const paths = state.futurePaths || [];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-10"
    >
      <motion.div variants={fadeIn}>
        <div className="text-center mb-8">
          <Badge color="violet" className="mb-4">Simulation Complete</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Command Center</h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
            Your {(state.userInput?.timeHorizon || "future").replace("_", " ")} has been forged. 
            Explore your timeline, dive into your action plan, listen to your narrative, and view your generated visuals.
          </p>

          {state.aggressivePitch && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 p-6 border border-red-500/30 bg-red-500/5 rounded-2xl max-w-3xl mx-auto shadow-[0_0_30px_rgba(239,68,68,0.15)] backdrop-blur-sm"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-red-400 font-bold uppercase tracking-[0.2em] text-xs">Incoming Transmission</p>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </div>
              <p className="text-white text-xl md:text-2xl font-bold italic leading-relaxed">
                "{state.aggressivePitch}"
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* 3D Motivational Hero Section */}
      <motion.div variants={fadeIn}>
        <MotivationalHero goals={state.userInput?.goals || "Your Future"} />
      </motion.div>

      {/* 3D Timeline Centerpiece */}
      <motion.div variants={fadeIn}>
        <Card noPadding noHover className="overflow-hidden relative" glowColor="#7C3AED">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[var(--accent-violet)] opacity-10 rounded-full blur-[80px] pointer-events-none" />
          <div className="p-6 pb-0 absolute top-0 left-0 z-10">
            <h2 className="text-xl font-bold">Branching Futures</h2>
            <p className="text-sm text-[var(--text-secondary)]">Interact with the timeline to see your potential paths.</p>
          </div>
          <Suspense
            fallback={
              <div className="w-full h-[500px] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[var(--accent-violet)]/30 border-t-[var(--accent-violet)] rounded-full animate-spin" />
              </div>
            }
          >
            {/* The ParticleTimeline provides an interactive visual of the paths */}
            <div className="h-[500px] w-full mt-4">
              <ParticleTimeline paths={paths} />
            </div>
          </Suspense>
          
          {/* Multiverse Branching Button */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <button 
              onClick={handleTakeRisk}
              disabled={simulatingRisk}
              className={`px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] ${simulatingRisk ? 'bg-red-900 text-red-500 cursor-wait' : 'bg-red-600 hover:bg-red-500 text-white hover:scale-105 hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]'}`}
            >
              {simulatingRisk ? "Splitting Timeline..." : "⚠️ Take a Massive Risk"}
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Exploration Portals */}
      <motion.div variants={fadeIn}>
        <h2 className="text-2xl font-bold mb-6 text-center">Execution & Visualization</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Link href={`/dashboard/action-plan/${id}`}>
            <Card className="h-full group hover:-translate-y-2 transition-all duration-300" glowColor="#10B981">
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  ⚡
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Execution Protocol</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Climb the 12-week 3D staircase of your personalized habits and tasks.
                </p>
              </div>
            </Card>
          </Link>

          <Link href={`/dashboard/narrative/${id}`}>
            <Card className="h-full group hover:-translate-y-2 transition-all duration-300" glowColor="#3B82F6">
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  🎙️
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Cinematic Overlook</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Listen to the AI voice narration in an immersive 3D text space.
                </p>
              </div>
            </Card>
          </Link>

          <Link href={`/dashboard/gallery/${id}`}>
            <Card className="h-full group hover:-translate-y-2 transition-all duration-300" glowColor="#F59E0B">
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  🔮
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Future Holograms</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Walk through a hyper-realistic 3D carousel of your generated future.
                </p>
              </div>
            </Card>
          </Link>

        </div>
      </motion.div>
    </motion.div>
  );
}
