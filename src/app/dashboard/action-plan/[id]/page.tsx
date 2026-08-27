"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, Scroll, useScroll, Float, Stars, Sparkles, MeshDistortMaterial } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { SimulationState } from "@/types/agents";
import * as THREE from "three";
import Button from "@/components/ui/Button";
import VibeCore from "@/components/three/VibeCore";
import { DEMO_SIMULATION } from "@/lib/demoSimulation";

// PDF styles to inject when printing
const printStyles = `
  @media print {
    body { background: white !important; color: black !important; }
    canvas { display: none !important; }
    .no-print { display: none !important; }
    .print-only { display: block !important; }
    .print-container { 
      padding: 20px; 
      max-width: 800px; 
      margin: 0 auto;
    }
    .print-week {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
  }
`;

// The Galaxy Stone that appears at 100% completion
function GalaxyStone() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.2;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y -= delta * 0.3;
      glowRef.current.scale.setScalar(1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={2} position={[0, 0, 0]}>
      <mesh ref={meshRef} castShadow>
        <octahedronGeometry args={[2, 0]} />
        <MeshDistortMaterial
          color="#8b5cf6"
          emissive="#6d28d9"
          emissiveIntensity={2}
          roughness={0.1}
          metalness={1}
          distort={0.4}
          speed={2}
        />
      </mesh>
      
      {/* Outer Glow / Energy Field */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.15} wireframe />
      </mesh>
      
      <Sparkles count={200} scale={8} size={4} speed={0.4} opacity={1} color="#c4b5fd" />
    </Float>
  );
}

function PremiumBackground({ progress }: { progress: number }) {
  const group = useRef<THREE.Group>(null);
  const scroll = useScroll();

  useFrame(() => {
    if (group.current) {
      group.current.position.y = scroll.offset * 10;
      group.current.rotation.y = scroll.offset * Math.PI;
    }
  });

  return (
    <group ref={group}>
      <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={0.5} />
      {/* Ambient floating geometry */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Float key={i} speed={0.5} rotationIntensity={0.5} floatIntensity={1} position={[(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 20 - 10]}>
          <mesh>
            <tetrahedronGeometry args={[Math.random() * 0.5 + 0.1]} />
            <meshStandardMaterial color="#4c1d95" emissive="#2e1065" emissiveIntensity={0.5} wireframe={Math.random() > 0.5} />
          </mesh>
        </Float>
      ))}
      {/* Mindset Alignment Stone */}
      <Float speed={1.5} rotationIntensity={1} floatIntensity={0.5} position={[0, -2, -6]}>
        <mesh castShadow receiveShadow>
          <icosahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={0.3} wireframe />
        </mesh>
      </Float>

      {progress >= 1 && <GalaxyStone />}
    </group>
  );
}

// Milestone Rewards Config
interface RewardTier {
  threshold: number; // percentage (0 - 100)
  name: string;
  badge: string;
  coupon: string;
  discount: number; // percentage off
  description: string;
}

const REWARD_TIERS: RewardTier[] = [
  {
    threshold: 25,
    name: "Bronze Executioner",
    badge: "🥉",
    coupon: "MILESTONE10",
    discount: 10,
    description: "Conquered 25% of your trajectory! Unlocked 10% OFF Pro plan.",
  },
  {
    threshold: 50,
    name: "Silver Architect",
    badge: "🥈",
    coupon: "EXECUTION25",
    discount: 25,
    description: "Halfway through your implementation plan! Unlocked 25% OFF Pro plan.",
  },
  {
    threshold: 75,
    name: "Gold Visionary",
    badge: "🥇",
    coupon: "GRIND35",
    discount: 35,
    description: "Top 5% execution velocity reached! Unlocked 35% OFF Pro plan.",
  },
  {
    threshold: 100,
    name: "Galactic Sovereign",
    badge: "👑",
    coupon: "MASTERY50",
    discount: 50,
    description: "100% roadmap mastery achieved! Maximum 50% LIFETIME Pro discount unlocked.",
  },
];

export default function ActionPlanPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [state, setState] = useState<SimulationState | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Interactive Progress State
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [glitchModal, setGlitchModal] = useState<{ isOpen: boolean; imageUrl: string | null }>({ isOpen: false, imageUrl: null });
  const [storeModal, setStoreModal] = useState(false);
  const [rewardModal, setRewardModal] = useState<{ isOpen: boolean; tier: RewardTier | null }>({ isOpen: false, tier: null });
  const [equippedSkin, setEquippedSkin] = useState<"default" | "quantum" | "infernal" | "chronos">("default");
  const [activeFilter, setActiveFilter] = useState<"all" | "p1" | "p2" | "p3" | "milestones">("all");
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  // Ego-Hurt & Massive Risk Gauntlet State
  const [massiveRiskModal, setMassiveRiskModal] = useState(false);
  const [gauntletActive, setGauntletActive] = useState(false);
  const [egoSprintActive, setEgoSprintActive] = useState(false);
  const [egoSprintSeconds, setEgoSprintSeconds] = useState(1500); // 25 minutes
  const [rivalTauntIndex, setRivalTauntIndex] = useState(0);
  const [rivalDrawerOpen, setRivalDrawerOpen] = useState(false);

  // Ego sprint timer tick
  useEffect(() => {
    let timer: any = null;
    if (egoSprintActive && egoSprintSeconds > 0) {
      timer = setInterval(() => {
        setEgoSprintSeconds((prev) => prev - 1);
      }, 1000);
    } else if (egoSprintSeconds === 0) {
      setEgoSprintActive(false);
      alert("⚔️ Focus Sprint Complete! Your adversary's lead has been reduced by 1 day!");
    }
    return () => clearInterval(timer);
  }, [egoSprintActive, egoSprintSeconds]);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-screen bg-black">
        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
        <p className="text-white/60 font-mono text-sm tracking-wider">Compiling AI Execution Protocol & Curriculum...</p>
      </div>
    );
  }

  if (!state || !state.actionPlan) {
    return (
      <div className="text-center py-20 min-h-screen bg-black flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-rose-400 mb-2">Execution Protocol Not Found</h2>
        <p className="text-white/50 text-sm mb-6">The requested simulation roadmap could not be loaded.</p>
        <Button onClick={() => router.push(`/dashboard/results/${id}`)}>
          ← Back to Command Center
        </Button>
      </div>
    );
  }

  const weeks = state.actionPlan.weeklyActions || [];
  const pages = Math.max(2, weeks.length / 1.1);
  
  const totalActions = weeks.reduce((acc: number, w: any) => acc + w.actions.length, 0);
  const progress = totalActions === 0 ? 0 : checkedItems.size / totalActions;
  const progressPercent = Math.round(progress * 100);

  // Highest unlocked reward tier
  const highestUnlockedTier = [...REWARD_TIERS].reverse().find((t) => progressPercent >= t.threshold) || null;

  const toggleCheck = (actionId: string) => {
    const newSet = new Set(checkedItems);
    const wasChecked = newSet.has(actionId);

    if (wasChecked) {
      newSet.delete(actionId);
    } else {
      newSet.add(actionId);
      
      // Check if newly crossed a reward threshold
      const newProgress = totalActions === 0 ? 0 : newSet.size / totalActions;
      const newPct = Math.round(newProgress * 100);
      const justUnlockedTier = REWARD_TIERS.find(
        (t) => newPct >= t.threshold && progressPercent < t.threshold
      );

      if (justUnlockedTier) {
        setRewardModal({ isOpen: true, tier: justUnlockedTier });
      }

      // 10% chance to drop a Reality Glitch
      if (Math.random() < 0.1 && !glitchModal.isOpen && state?.userInput?.goals) {
        const prmpt = `Hyper-realistic first-person POV success achievement of goal: ${state.userInput.goals}. Award-winning cinematography, cinematic 8k`;
        setGlitchModal({ 
          isOpen: true, 
          imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(prmpt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 10000)}&model=flux`
        });
      }
    }
    setCheckedItems(newSet);
  };

  // VibeCore Tamagotchi Health Calculation
  const daysElapsed = state?.localSavedAt ? (Date.now() - state.localSavedAt) / (1000 * 60 * 60 * 24) : 0;
  const expectedActions = Math.max(0, daysElapsed / 2);
  const health = expectedActions === 0 ? 1.0 : Math.max(0, 1 - Math.max(0, expectedActions - checkedItems.size) * 0.2);

  const exportToICS = () => {
    if (!weeks || weeks.length === 0) return;
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//VibeForge//ActionPlan//EN\n";
    const now = new Date();
    weeks.forEach((week: any, wIndex: number) => {
      const eventDate = new Date(now.getTime() + (wIndex * 7 * 24 * 60 * 60 * 1000));
      const dateString = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + "Z";
      icsContent += "BEGIN:VEVENT\n";
      icsContent += `DTSTART:${dateString}\n`;
      icsContent += `DTEND:${dateString}\n`;
      icsContent += `SUMMARY:VibeForge - Week ${week.week} Actions\n`;
      let description = `Milestone: ${week.milestone || 'N/A'}\\n\\nActions:\\n`;
      week.actions.forEach((a: string) => { description += `- ${a}\\n`; });
      icsContent += `DESCRIPTION:${description}\n`;
      icsContent += "END:VEVENT\n";
    });
    icsContent += "END:VCALENDAR";
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vibeforge_action_plan.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    window.print();
  };

  // Dynamic Phase Filtering based on actual total weeks count
  const totalWeeksCount = weeks.length;
  const phaseSize = Math.max(3, Math.ceil(totalWeeksCount / 3));

  const filterTabs = [
    { id: "all", label: `All Sprints (${totalWeeksCount}W)` },
    { id: "p1", label: `Phase 1 (W1-${Math.min(phaseSize, totalWeeksCount)})` },
    ...(totalWeeksCount > phaseSize ? [{ id: "p2", label: `Phase 2 (W${phaseSize + 1}-${Math.min(phaseSize * 2, totalWeeksCount)})` }] : []),
    ...(totalWeeksCount > phaseSize * 2 ? [{ id: "p3", label: `Phase 3 (W${phaseSize * 2 + 1}-${totalWeeksCount})` }] : []),
    { id: "milestones", label: "🎯 Key Milestones" },
  ];

  const filteredWeeks = weeks.filter((w) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "p1") return w.week <= phaseSize;
    if (activeFilter === "p2") return w.week > phaseSize && w.week <= phaseSize * 2;
    if (activeFilter === "p3") return w.week > phaseSize * 2;
    if (activeFilter === "milestones") return !!w.milestone;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full h-screen relative bg-[#030305] overflow-hidden select-none"
    >
      <style>{printStyles}</style>
      
      {/* Print Only Version */}
      <div className="hidden print-only print-container">
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>VibeForge Execution Protocol</h1>
        {weeks.map((week, index) => (
          <div key={index} className="print-week">
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Week {week.week} {week.milestone ? `- ${week.milestone}` : ''}</h2>
            <ul>
              {week.actions.map((action: string, i: number) => (
                <li key={i} style={{ marginBottom: '8px' }}>☐ {action}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Top Left Navigation & Export Controls */}
      <div className="absolute top-6 left-6 z-20 flex flex-wrap items-center gap-3 no-print">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/results/${id}`)}>
          ← Command Center
        </Button>
        <Button variant="secondary" size="sm" onClick={exportToICS}>
          📅 ICS Export
        </Button>
        <Button variant="secondary" size="sm" onClick={exportToPDF}>
          📄 PDF
        </Button>

        {/* Milestone Rewards Trigger Badge */}
        <button
          onClick={() => setRewardModal({ isOpen: true, tier: highestUnlockedTier || REWARD_TIERS[0] })}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-indigo-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] cursor-pointer"
        >
          <span>🎁</span>
          <span>
            {highestUnlockedTier
              ? `${highestUnlockedTier.badge} Claim ${highestUnlockedTier.discount}% Pro Discount`
              : `🎯 Earn Up to 50% Pro Discount`}
          </span>
        </button>
      </div>
      
      {/* Top Right Header & Live Sync Progress */}
      <div className="absolute top-6 right-6 z-20 text-right no-print">
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-1 tracking-tight drop-shadow-lg flex items-center justify-end gap-2">
          <span>Execution Protocol</span>
          <span className="text-amber-400">⚡</span>
        </h1>
        <div className="flex items-center justify-end gap-3">
          <span className="text-white/60 text-xs uppercase tracking-wider font-bold">
            {progress === 1 ? "Roadmap Completed" : `${progressPercent}% Synchronized (${checkedItems.size}/${totalActions} Actions)`}
          </span>
          <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Filter Navigation Bar */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 no-print shadow-xl">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
              activeFilter === tab.id
                ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.5)]"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 100% Interdimensional Store Trigger */}
      {progress === 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-auto">
          <Button 
            variant="primary" 
            onClick={() => setStoreModal(true)}
            className="animate-pulse shadow-[0_0_50px_rgba(139,92,246,0.8)] border border-purple-400 bg-purple-900/80 text-lg px-8 py-4"
          >
            🌌 ENTER INTERDIMENSIONAL STORE
          </Button>
        </div>
      )}

      {/* Milestone Completion Reward Modal */}
      <AnimatePresence>
        {rewardModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 pointer-events-auto no-print"
          >
            <div className="bg-[#0b0b14] border border-amber-400/40 p-6 sm:p-8 rounded-3xl max-w-lg w-full shadow-[0_0_80px_rgba(245,158,11,0.25)] relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-xs uppercase font-bold text-amber-400 tracking-widest bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full">
                    Roadmap Milestone Rewards
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                    Pro Discount Unlocked 🎁
                  </h2>
                </div>
                <button 
                  onClick={() => setRewardModal({ isOpen: false, tier: null })} 
                  className="text-white/40 hover:text-white text-xl font-bold w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Reward Tiers List */}
              <div className="space-y-3 mb-6">
                {REWARD_TIERS.map((tier) => {
                  const isUnlocked = progressPercent >= tier.threshold;
                  return (
                    <div
                      key={tier.coupon}
                      className={`p-4 rounded-2xl border transition-all ${
                        isUnlocked
                          ? "bg-gradient-to-r from-amber-500/10 to-purple-500/10 border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                          : "bg-white/[0.02] border-white/10 opacity-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{tier.badge}</span>
                          <span className="font-bold text-white text-sm">{tier.name}</span>
                          <span className="text-[10px] text-white/50">({tier.threshold}% tasks)</span>
                        </div>
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                          isUnlocked ? "bg-amber-400/20 text-amber-300 border border-amber-400/30" : "bg-white/5 text-white/40"
                        }`}>
                          {tier.discount}% OFF
                        </span>
                      </div>
                      <p className="text-xs text-white/60 mb-2">{tier.description}</p>
                      
                      {isUnlocked && (
                        <div className="flex items-center justify-between bg-black/60 rounded-xl p-2 border border-white/10">
                          <span className="text-xs font-mono text-amber-300 font-bold tracking-widest pl-2">
                            {tier.coupon}
                          </span>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              router.push(`/checkout/pro?coupon=${tier.coupon}&discount=${tier.discount}`);
                            }}
                            className="text-xs py-1 px-3 shadow-sm bg-gradient-to-r from-amber-500 to-purple-600 border-0"
                          >
                            Apply to Pro (₹{Math.round(799 * (100 - tier.discount) / 100)}/mo) →
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="text-center text-xs text-white/40">
                Complete more weekly actions to unlock higher discount tiers!
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Store Modal */}
      <AnimatePresence>
        {storeModal && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl pointer-events-auto no-print p-4"
          >
            <div className="bg-[#0a0a0f] border border-purple-500/30 p-8 rounded-3xl max-w-4xl w-full shadow-[0_0_100px_rgba(139,92,246,0.2)]">
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 uppercase tracking-widest">
                  Interdimensional Store
                </h2>
                <button onClick={() => setStoreModal(false)} className="text-white/50 hover:text-white text-2xl font-bold">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { id: "default", name: "Standard Alignment", desc: "The original VibeCore.", color: "border-blue-500", glow: "shadow-blue-500/50" },
                  { id: "quantum", name: "Quantum Core", desc: "Vibrating at a higher frequency.", color: "border-purple-500", glow: "shadow-purple-500/50" },
                  { id: "infernal", name: "Infernal Stone", desc: "Forged in the fires of extreme risk.", color: "border-red-500", glow: "shadow-red-500/50" },
                  { id: "chronos", name: "Chronos Crystal", desc: "Mastery over time itself.", color: "border-emerald-500", glow: "shadow-emerald-500/50" }
                ].map(item => (
                  <div key={item.id} className={`p-6 rounded-2xl border ${equippedSkin === item.id ? item.color + ' ' + item.glow + ' bg-white/5' : 'border-white/10 bg-black'} transition-all cursor-pointer hover:bg-white/5 flex flex-col justify-between`} onClick={() => setEquippedSkin(item.id as any)}>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                      <p className="text-white/60 text-sm mb-6">{item.desc}</p>
                    </div>
                    <Button variant={equippedSkin === item.id ? "primary" : "secondary"} className="w-full">
                      {equippedSkin === item.id ? "Equipped" : "Equip"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Adversary Rival & Ego-Hurt Matrix — Desktop Dock */}
      {state.actionPlan.rival && (
        <div className="hidden md:block fixed bottom-6 left-6 w-[320px] z-30 pointer-events-auto no-print">
          <div className="p-4 rounded-2xl bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h3 className="text-white font-bold text-xs uppercase tracking-wider">
                  Adversary Rival Matrix
                </h3>
              </div>
              <span className="text-[10px] bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full text-red-400 font-bold font-mono">
                +{state.actionPlan.rival.progressOffset || 7}d Lead
              </span>
            </div>

            <p className="text-zinc-400 text-xs mb-2 leading-relaxed">
              <strong className="text-zinc-200">{state.actionPlan.rival.name}</strong> is relentlessly executing.
            </p>

            {/* Dynamic Ego-Hurt Psychological Taunt */}
            <div 
              onClick={() => {
                const taunts = state.actionPlan?.rival?.taunts || [];
                if (taunts.length > 0) {
                  setRivalTauntIndex((prev) => (prev + 1) % taunts.length);
                }
              }}
              className="bg-black/60 p-2.5 rounded-xl border border-zinc-800 mb-2.5 cursor-pointer hover:border-zinc-700 transition-all group"
              title="Click to cycle adversary taunts"
            >
              <div className="flex items-center justify-between text-[10px] text-red-400 font-mono mb-1">
                <span>⚔️ EGO CHECK</span>
                <span className="text-zinc-500 group-hover:text-zinc-300">Tap ↻</span>
              </div>
              <p className="text-zinc-300 text-xs italic font-medium leading-snug">
                "{state.actionPlan.rival.taunts?.[rivalTauntIndex % (state.actionPlan.rival.taunts.length || 1)] || 'While you make excuses, your competition is executing.'}"
              </p>
            </div>

            {/* Estimated Laziness Slippage Loss */}
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 bg-white/[0.02] px-2.5 py-1.5 rounded-lg mb-2.5 border border-white/5">
              <span>Opportunity Loss:</span>
              <span className="text-red-400 font-bold">
                ₹{((state.actionPlan.rival.progressOffset || 7) * 12500).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Interactive Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEgoSprintActive(!egoSprintActive);
                  if (!egoSprintActive && egoSprintSeconds === 0) {
                    setEgoSprintSeconds(1500);
                  }
                }}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  egoSprintActive
                    ? "bg-red-600 text-white animate-pulse"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                }`}
              >
                {egoSprintActive ? (
                  <>
                    <span>⏱️</span>
                    <span>
                      {Math.floor(egoSprintSeconds / 60)}:
                      {(egoSprintSeconds % 60).toString().padStart(2, "0")}
                    </span>
                  </>
                ) : (
                  <>
                    <span>🔥</span>
                    <span>25m Sprint</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setMassiveRiskModal(true)}
                className="py-1.5 px-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white shadow-md transition-all"
              >
                ⚡ Massive Risk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Adversary Rival — Mobile Pill Button */}
      {state.actionPlan.rival && (
        <div className="md:hidden fixed bottom-6 left-6 z-30 pointer-events-auto no-print">
          <button
            onClick={() => setRivalDrawerOpen(true)}
            className="px-3.5 py-2 rounded-full bg-zinc-950/90 backdrop-blur-md border border-red-500/40 text-xs font-bold text-white shadow-xl flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>⚔️ Rival (+{state.actionPlan.rival.progressOffset || 7}d)</span>
          </button>
        </div>
      )}

      {/* AI Adversary Rival — Mobile Bottom Sheet Drawer */}
      <AnimatePresence>
        {rivalDrawerOpen && state.actionPlan.rival && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-50 flex items-end bg-black/80 backdrop-blur-sm pointer-events-auto"
            onClick={() => setRivalDrawerOpen(false)}
          >
            <motion.div
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
              className="w-full bg-zinc-950 border-t border-zinc-800 p-6 rounded-t-3xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>⚔️</span> Adversary Rival Matrix
                </h3>
                <button
                  onClick={() => setRivalDrawerOpen(false)}
                  className="text-zinc-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-zinc-400 text-xs">
                <strong className="text-zinc-200">{state.actionPlan.rival.name}</strong> is outworking you by +{state.actionPlan.rival.progressOffset || 7} days.
              </p>

              <div className="bg-black/60 p-3 rounded-xl border border-zinc-800">
                <p className="text-zinc-300 text-xs italic">
                  "{state.actionPlan.rival.taunts?.[rivalTauntIndex % (state.actionPlan.rival.taunts.length || 1)] || 'While you make excuses, your competition is executing.'}"
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setEgoSprintActive(!egoSprintActive);
                    if (!egoSprintActive && egoSprintSeconds === 0) {
                      setEgoSprintSeconds(1500);
                    }
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    egoSprintActive ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-200"
                  }`}
                >
                  {egoSprintActive ? `⏱️ ${Math.floor(egoSprintSeconds / 60)}m Left` : "🔥 25m Focus Sprint"}
                </button>
                <button
                  onClick={() => {
                    setRivalDrawerOpen(false);
                    setMassiveRiskModal(true);
                  }}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold bg-red-600 text-white"
                >
                  ⚡ Massive Risk
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Massive Risk Asymmetric Gauntlet Modal */}
      <AnimatePresence>
        {massiveRiskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 pointer-events-auto no-print"
            onClick={() => setMassiveRiskModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0e0712] border border-amber-500/50 p-6 sm:p-8 rounded-3xl max-w-lg w-full shadow-[0_0_100px_rgba(245,158,11,0.3)] relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-xs uppercase font-black text-amber-400 tracking-widest bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                    ⚡ Asymmetric Gauntlet Protocol
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
                    Take a Massive Risk 🔥
                  </h2>
                </div>
                <button
                  onClick={() => setMassiveRiskModal(false)}
                  className="text-white/40 hover:text-white text-xl font-bold w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 mb-6 text-sm text-white/80 leading-relaxed">
                <p>
                  You are activating <strong className="text-amber-300">Relentless Double-Velocity Mode</strong>. For the next 7 days, your task progress multiplier doubles (2x XP).
                </p>
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                  ⚠️ <strong>The High-Stakes Penalty:</strong> If you miss 2 consecutive daily actions, your adversary lead increases by +5 days, and your ego integrity drops to zero.
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  onClick={() => {
                    setGauntletActive(true);
                    setMassiveRiskModal(false);
                    alert("🔥 MASSIVE RISK GAUNTLET ACTIVATED! 2X XP & Zero-Excuses Mode is LIVE for the next 7 days!");
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:opacity-90 border-0 font-bold py-3 text-sm uppercase tracking-wider"
                >
                  {gauntletActive ? "✓ Gauntlet Active (7 Days)" : "⚔️ I Accept the Asymmetric Risk"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reality Glitch Modal */}
      <AnimatePresence>
        {glitchModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto no-print p-4"
            onClick={() => setGlitchModal({ isOpen: false, imageUrl: null })}
          >
            <div className="relative p-2 bg-gradient-to-br from-purple-600 via-red-500 to-black rounded-2xl p-[2px] animate-pulse max-w-lg w-full">
              <div className="bg-black p-5 rounded-2xl relative">
                <button 
                  className="absolute -top-3 -right-3 w-8 h-8 bg-red-600 rounded-full text-white font-bold hover:bg-red-500 shadow-lg flex items-center justify-center"
                  onClick={() => setGlitchModal({ isOpen: false, imageUrl: null })}
                >✕</button>
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-500 mb-1 font-mono uppercase tracking-widest text-center">
                  Reality Glitch Manifested!
                </h3>
                <p className="text-center text-white/60 mb-4 text-xs">A tangible glimpse of your future timeline materialized.</p>
                {glitchModal.imageUrl && (
                  <img src={glitchModal.imageUrl} alt="Future Reality" className="w-full aspect-square object-cover rounded-xl shadow-[0_0_50px_rgba(220,38,38,0.3)]" />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mindset Alignment Stone */}
      <div className="fixed bottom-10 right-10 w-48 h-48 md:w-64 md:h-64 z-30 pointer-events-auto no-print transition-all duration-1000 hidden md:block cursor-pointer hover:scale-105" onClick={() => progress === 1 && setStoreModal(true)}>
        <VibeCore progress={progress} health={health} skin={equippedSkin} />
        {health < 0.5 && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-red-600/80 text-white text-xs px-2 py-1 rounded border border-red-400/50 animate-pulse">
            CRITICAL INTEGRITY
          </div>
        )}
      </div>

      {/* Main 3D Canvas with Scrollable Weekly Action Staircase */}
      <div className="w-full h-full relative">
        <Canvas shadows camera={{ position: [0, 0, 10], fov: 60 }} dpr={[1, 2]}>
          <color attach="background" args={["#030305"]} />
          <fog attach="fog" args={["#030305", 5, 30]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 20, 10]} intensity={2} castShadow shadow-mapSize={2048} />
          <pointLight position={[-10, -10, -10]} color="#8b5cf6" intensity={5} distance={50} />
          <pointLight position={[10, 0, 10]} color="#3b82f6" intensity={3} distance={50} />
          
          <Suspense fallback={null}>
            <ScrollControls pages={pages} damping={0.2}>
              <PremiumBackground progress={progress} />
              
              <Scroll html style={{ width: "100%", height: "100%" }}>
                {progress < 1 && (
                  <div className="flex flex-col items-center px-4 sm:px-6 pt-36 pb-64 gap-12 sm:gap-16 pointer-events-none no-print max-w-3xl mx-auto">
                    
                    {/* Aggressive Motivation Pitch Header */}
                    {state.aggressivePitch && (
                      <div className="w-full pointer-events-auto">
                        <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950/40 via-purple-950/40 to-black border border-red-500/30 backdrop-blur-xl shadow-[0_0_40px_rgba(220,38,38,0.15)]">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-red-400 text-sm">🔥</span>
                            <span className="text-xs uppercase font-bold text-red-400 tracking-wider">
                              Executive Mandate
                            </span>
                          </div>
                          <p className="text-sm sm:text-base text-white/90 font-medium leading-relaxed italic">
                            "{state.aggressivePitch}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Weekly Sprints List */}
                    {filteredWeeks.map((week, index) => (
                      <div key={index} className="w-full pointer-events-auto">
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0.8 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          whileHover={{ scale: 1.02, y: -4 }}
                          className="will-change-transform"
                        >
                          <div
                            className="bg-black/50 backdrop-blur-2xl border border-white/15 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden group hover:border-purple-500/40 transition-all duration-500"
                          >
                            {/* Inner ambient glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            
                            <div className="flex items-center justify-between gap-4 mb-6 relative z-10">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-900 flex items-center justify-center text-xl sm:text-2xl font-bold text-white shadow-lg shadow-purple-900/50 border border-white/10 shrink-0">
                                  {week.week}
                                </div>
                                <div>
                                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                    Week {week.week} Implementation
                                  </h2>
                                  {week.milestone && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                                      <p className="text-cyan-400 text-xs sm:text-sm font-bold uppercase tracking-wider">
                                        🎯 {week.milestone}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <span className="text-xs text-purple-300 font-mono bg-purple-950/40 border border-purple-500/30 px-3 py-1 rounded-full font-bold hidden sm:inline-block">
                                {week.actions.filter((_, aIdx) => checkedItems.has(`w${week.week}-a${aIdx}`)).length}/{week.actions.length} Completed
                              </span>
                            </div>
                            
                            <ul className="space-y-4 relative z-10">
                              {week.actions.map((action: string, i: number) => {
                                const actionId = `w${week.week}-a${i}`;
                                const isChecked = checkedItems.has(actionId);
                                const isExpanded = expandedAction === actionId;
                                
                                // Parse out YouTube links for a clean interactive button
                                const linkMatch = action.match(/(.*)\[([^\]]+)\]\((https?:\/\/[^\)]+)\)(.*)/);
                                const textPart = linkMatch ? (linkMatch[1] + (linkMatch[4] || "")) : action;
                                const youtubeUrl = linkMatch ? linkMatch[3] : `https://www.youtube.com/results?search_query=${encodeURIComponent(textPart.slice(0, 50))}&sp=CAM%253D`;
                                const youtubeLabel = linkMatch ? linkMatch[2] : "Watch Top-Rated Tutorial ⭐";

                                return (
                                  <li 
                                    key={i} 
                                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 hover:bg-white/[0.04] transition-all cursor-pointer group/item"
                                    onClick={() => toggleCheck(actionId)}
                                  >
                                    <div className="flex items-start gap-3.5">
                                      <div className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center mt-0.5 border-2 transition-all duration-300 ${isChecked ? 'bg-purple-600 border-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'bg-black/60 border-white/20 group-hover/item:border-purple-400'}`}>
                                        {isChecked && <span className="text-white text-xs font-bold">✓</span>}
                                      </div>

                                      <div className="flex-1">
                                        <p className={`leading-relaxed text-sm sm:text-base font-medium transition-all duration-300 ${isChecked ? 'text-white/30 line-through' : 'text-white/95'}`}>
                                          {textPart.trim()}
                                        </p>

                                        {/* Action Meta & Live YouTube Resource */}
                                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                                          <a 
                                            href={youtubeUrl} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            onClick={(e) => e.stopPropagation()} 
                                            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs px-3 py-1 rounded-full border border-red-400/40 transition-all shadow-[0_0_15px_rgba(220,38,38,0.35)] font-bold tracking-wide"
                                          >
                                            <span className="text-xs">▶</span>
                                            <span>{youtubeLabel}</span>
                                            <span className="text-[10px] text-white/70 uppercase">↗</span>
                                          </a>

                                          {i === 0 && (
                                            <span className="text-[11px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-bold">
                                              🧠 Mindset Synchronization
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </motion.div>
                      </div>
                    ))}
                  </div>
                )}
              </Scroll>
            </ScrollControls>
          </Suspense>
        </Canvas>
      </div>
    </motion.div>
  );
}
