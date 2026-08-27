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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Clean Professional PDF Print Stylesheet
const printStyles = `
  @media print {
    body { background: #ffffff !important; color: #000000 !important; }
    canvas { display: none !important; }
    .no-print { display: none !important; }
    .print-only { display: block !important; }
    .print-container { 
      padding: 24px; 
      max-width: 900px; 
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
  }
`;

// Galaxy Stone for 100% Completion
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
      {Array.from({ length: 8 }).map((_, i) => (
        <Float key={i} speed={0.5} rotationIntensity={0.5} floatIntensity={1} position={[(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 20 - 10]}>
          <mesh>
            <tetrahedronGeometry args={[Math.random() * 0.5 + 0.1]} />
            <meshStandardMaterial color="#4c1d95" emissive="#2e1065" emissiveIntensity={0.5} wireframe={Math.random() > 0.5} />
          </mesh>
        </Float>
      ))}
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
  threshold: number;
  name: string;
  badge: string;
  coupon: string;
  discount: number;
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
    name: "Silver Vanguard",
    badge: "🥈",
    coupon: "MILESTONE25",
    discount: 25,
    description: "Conquered 50% of your trajectory! Unlocked 25% OFF Pro plan.",
  },
  {
    threshold: 75,
    name: "Gold Dominator",
    badge: "🥇",
    coupon: "MILESTONE35",
    discount: 35,
    description: "Conquered 75% of your trajectory! Unlocked 35% OFF Pro plan.",
  },
  {
    threshold: 100,
    name: "Obsidian Sovereign",
    badge: "👑",
    coupon: "SOVEREIGN50",
    discount: 50,
    description: "100% Roadmap Completed! Unlocked maximum 50% Lifetime Pro discount.",
  },
];

export default function ActionPlanPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [state, setState] = useState<SimulationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [equippedSkin, setEquippedSkin] = useState<"default" | "quantum" | "infernal" | "chronos">("default");
  const [storeModal, setStoreModal] = useState(false);
  const [rewardModal, setRewardModal] = useState<{ isOpen: boolean; tier: RewardTier | null }>({ isOpen: false, tier: null });
  const [activeFilter, setActiveFilter] = useState<"all" | "p1" | "p2" | "p3" | "milestones">("all");
  const [glitchModal, setGlitchModal] = useState<{ isOpen: boolean; imageUrl: string | null }>({ isOpen: false, imageUrl: null });
  const [rivalDrawerOpen, setRivalDrawerOpen] = useState(false);
  const [massiveRiskModal, setMassiveRiskModal] = useState(false);
  const [gauntletActive, setGauntletActive] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const localData = typeof window !== "undefined" ? localStorage.getItem(`sim_${id}`) : null;
        if (localData) {
          const parsed = JSON.parse(localData);
          setState(parsed);
          if (parsed.checkedActions) {
            setCheckedItems(new Set(parsed.checkedActions));
          }
          if (parsed.equippedSkin) {
            setEquippedSkin(parsed.equippedSkin);
          }
        } else {
          setState(DEMO_SIMULATION);
        }
      } catch (err) {
        console.error(err);
        setState(DEMO_SIMULATION);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const saveProgress = (newChecked: Set<string>, newSkin?: string) => {
    if (typeof window === "undefined" || !state) return;
    try {
      const updated = {
        ...state,
        checkedActions: Array.from(newChecked),
        equippedSkin: newSkin || equippedSkin,
        localSavedAt: Date.now(),
      };
      localStorage.setItem(`sim_${id}`, JSON.stringify(updated));
    } catch (e) {}
  };

  const toggleCheck = (actionId: string) => {
    const newSet = new Set(checkedItems);
    const wasChecked = newSet.has(actionId);

    if (wasChecked) {
      newSet.delete(actionId);
    } else {
      newSet.add(actionId);
      const totalActions = (state?.actionPlan?.weeklyActions || []).reduce((acc: number, w: any) => acc + w.actions.length, 0);
      const newProgress = totalActions === 0 ? 0 : newSet.size / totalActions;
      const newPct = Math.round(newProgress * 100);
      const justUnlockedTier = REWARD_TIERS.find(
        (t) => newPct >= t.threshold && Math.round((checkedItems.size / (totalActions || 1)) * 100) < t.threshold
      );

      if (justUnlockedTier) {
        setRewardModal({ isOpen: true, tier: justUnlockedTier });
      }
    }
    setCheckedItems(newSet);
    saveProgress(newSet);
  };

  const weeks = state?.actionPlan?.weeklyActions || [];
  const totalActions = weeks.reduce((acc: number, w: any) => acc + w.actions.length, 0);
  const progress = totalActions === 0 ? 0 : checkedItems.size / totalActions;
  const progressPercent = Math.round(progress * 100);

  // Dynamic Phase Filtering
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

  // Clamped page height calculation to prevent infinite scroll past the last week
  const pages = Math.max(1.2, (filteredWeeks.length * 0.45) + 0.6);

  const highestUnlockedTier = [...REWARD_TIERS].reverse().find((t) => progressPercent >= t.threshold) || null;

  // Direct Local PDF File Downloader
  const downloadLocalPDF = async () => {
    if (!pdfRef.current || pdfGenerating) return;
    setPdfGenerating(true);
    try {
      const element = pdfRef.current;
      element.style.display = "block";
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      element.style.display = "none";

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const safeGoalName = (state?.userInput?.goals || "Career_Roadmap").replace(/[^a-zA-Z0-9]/g, "_").slice(0, 25);
      pdf.save(`VibeForge_Execution_Protocol_${safeGoalName}.pdf`);
    } catch (err) {
      console.error(err);
      window.print();
    } finally {
      setPdfGenerating(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
        <p className="text-white/60 font-mono text-sm tracking-wider">Compiling AI Execution Protocol...</p>
      </div>
    );
  }

  if (!state || !state.actionPlan) {
    return (
      <div className="text-center py-20 min-h-screen bg-black flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-rose-400 mb-2">Execution Protocol Not Found</h2>
        <Button onClick={() => router.push(`/dashboard/results/${id}`)}>
          ← Back to Command Center
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full h-screen relative bg-[#030305] overflow-hidden select-none"
    >
      <style>{printStyles}</style>

      {/* Hidden Rich PDF Document for Local Download & Printing with Color Diagrams */}
      <div ref={pdfRef} style={{ display: "none" }} className="print-container bg-white text-zinc-900 p-8">
        <div className="border-b-2 border-purple-600 pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-purple-900 uppercase tracking-tight">VibeForge Execution Protocol</h1>
            <p className="text-sm font-semibold text-zinc-600">Personalized Career Transformation Blueprint</p>
          </div>
          <div className="text-right text-xs text-zinc-500 font-mono">
            Generated by Anthropic Claude 3.5 Sonnet Engine
          </div>
        </div>

        {/* Metadata Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-zinc-100 rounded-xl mb-6 text-xs">
          <div>
            <span className="font-bold text-zinc-500 block uppercase">Starting Baseline</span>
            <span className="font-bold text-zinc-900">{state.userInput.currentSituation}</span>
          </div>
          <div>
            <span className="font-bold text-zinc-500 block uppercase">Target Profession</span>
            <span className="font-bold text-purple-800">{state.userInput.goals}</span>
          </div>
          <div>
            <span className="font-bold text-zinc-500 block uppercase">Horizon & Sprints</span>
            <span className="font-bold text-zinc-900">{totalWeeksCount} Total Weeks</span>
          </div>
          <div>
            <span className="font-bold text-zinc-500 block uppercase">Risk Tolerance</span>
            <span className="font-bold text-amber-700 capitalize">{state.userInput.riskTolerance}</span>
          </div>
        </div>

        {/* COLOR DIAGRAM 1: Multi-Phase Milestone Progression Chart */}
        <div className="mb-6 p-4 border border-zinc-200 rounded-xl">
          <h2 className="text-sm font-bold uppercase text-purple-900 mb-3">1. Multi-Phase Progression Roadmap Diagram</h2>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <span className="font-bold text-purple-800 block">Phase 1: Foundation</span>
              <span className="text-[11px] text-zinc-600">Weeks 1 – {Math.min(phaseSize, totalWeeksCount)}</span>
              <div className="w-full bg-purple-200 h-1.5 rounded-full mt-2">
                <div className="bg-purple-600 h-1.5 rounded-full w-full" />
              </div>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <span className="font-bold text-indigo-800 block">Phase 2: Execution</span>
              <span className="text-[11px] text-zinc-600">Weeks {phaseSize + 1} – {Math.min(phaseSize * 2, totalWeeksCount)}</span>
              <div className="w-full bg-indigo-200 h-1.5 rounded-full mt-2">
                <div className="bg-indigo-600 h-1.5 rounded-full w-full" />
              </div>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span className="font-bold text-emerald-800 block">Phase 3: Scaling</span>
              <span className="text-[11px] text-zinc-600">Weeks {phaseSize * 2 + 1} – {totalWeeksCount}</span>
              <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-2">
                <div className="bg-emerald-600 h-1.5 rounded-full w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* COLOR DIAGRAM 2: 4-Quadrant Execution Matrix Diagram */}
        <div className="mb-6 p-4 border border-zinc-200 rounded-xl">
          <h2 className="text-sm font-bold uppercase text-purple-900 mb-3">2. Core Execution Quadrant Matrix</h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-zinc-50 border-l-4 border-cyan-500 rounded">
              <strong className="text-cyan-800 block">A. Deep Work Study Block (2h/day)</strong>
              <span className="text-zinc-600">Master fundamental mental models, charting, or codebases.</span>
            </div>
            <div className="p-2.5 bg-zinc-50 border-l-4 border-purple-500 rounded">
              <strong className="text-purple-800 block">B. Practical Execution & Backtesting</strong>
              <span className="text-zinc-600">Execute minimum 5 daily repetitions with journaled logs.</span>
            </div>
            <div className="p-2.5 bg-zinc-50 border-l-4 border-amber-500 rounded">
              <strong className="text-amber-800 block">C. Risk & Capital Protection</strong>
              <span className="text-zinc-600">Never risk over 1% per trade / protect portfolio health.</span>
            </div>
            <div className="p-2.5 bg-zinc-50 border-l-4 border-emerald-500 rounded">
              <strong className="text-emerald-800 block">D. Weekly Milestone Compounding</strong>
              <span className="text-zinc-600">Review mistakes every Sunday and calibrate sprint speed.</span>
            </div>
          </div>
        </div>

        {/* Weekly Action Sprints Checklist */}
        <h2 className="text-sm font-bold uppercase text-purple-900 mb-3">3. Weekly Sprints & Action Protocols</h2>
        <div className="space-y-4 text-xs">
          {weeks.map((w: any) => (
            <div key={w.week} className="p-3 border border-zinc-200 rounded-lg">
              <div className="font-bold text-zinc-900 mb-1 flex justify-between">
                <span>Week {w.week}: {w.milestone || "Sprint Actions"}</span>
                <span className="text-purple-700 font-mono">Sprint {w.week}</span>
              </div>
              <ul className="space-y-1 text-zinc-700 pl-2">
                {w.actions.map((act: string, idx: number) => (
                  <li key={idx}>☐ {act}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Top Left Navigation & Export Controls */}
      <div className="absolute top-6 left-6 z-20 flex flex-wrap items-center gap-2.5 no-print">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/results/${id}`)}>
          ← Command Center
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={downloadLocalPDF}
          disabled={pdfGenerating}
          className="bg-purple-600 hover:bg-purple-500 text-xs font-bold shadow-md"
        >
          {pdfGenerating ? "⏳ Saving PDF..." : "💾 Download PDF"}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => window.print()} className="text-xs">
          🖨️ Print
        </Button>
        <Button variant="secondary" size="sm" onClick={exportToICS} className="text-xs">
          📅 ICS
        </Button>

        {/* Milestone Rewards Trigger Badge */}
        <button
          onClick={() => setRewardModal({ isOpen: true, tier: highestUnlockedTier || REWARD_TIERS[0] })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold hover:scale-105 transition-all shadow-md cursor-pointer"
        >
          <span>🎁</span>
          <span>
            {highestUnlockedTier
              ? `${highestUnlockedTier.badge} Claim ${highestUnlockedTier.discount}% Discount`
              : `🎯 Earn Discounts`}
          </span>
        </button>
      </div>

      {/* Top Right Header & Live Sync Progress */}
      <div className="absolute top-6 right-6 z-20 text-right no-print">
        <h1 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tight flex items-center justify-end gap-2">
          <span>Execution Protocol</span>
          <span className="text-amber-400">⚡</span>
        </h1>
        <div className="flex items-center justify-end gap-3">
          <span className="text-white/60 text-xs font-mono">
            {progress === 1 ? "Roadmap Completed" : `${progressPercent}% Synchronized (${checkedItems.size}/${totalActions})`}
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

      {/* Main 3D Canvas with Strictly Clamped Scroll Bounds */}
      <div className="w-full h-full relative">
        <Canvas shadows camera={{ position: [0, 0, 10], fov: 60 }} dpr={[1, 2]}>
          <color attach="background" args={["#030305"]} />
          <fog attach="fog" args={["#030305", 5, 30]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 20, 10]} intensity={2} castShadow />
          <pointLight position={[-10, -10, -10]} color="#8b5cf6" intensity={5} distance={50} />
          <pointLight position={[10, 0, 10]} color="#3b82f6" intensity={3} distance={50} />
          
          <Suspense fallback={null}>
            <ScrollControls pages={pages} damping={0.25}>
              <PremiumBackground progress={progress} />
              
              <Scroll html style={{ width: "100%", height: "100%" }}>
                <div className="flex flex-col items-center px-4 sm:px-6 pt-36 pb-32 gap-8 sm:gap-12 pointer-events-none no-print max-w-3xl mx-auto">
                  
                  {/* Aggressive Motivation Pitch */}
                  {state.aggressivePitch && (
                    <div className="w-full pointer-events-auto">
                      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950/40 via-purple-950/40 to-black border border-red-500/30 backdrop-blur-xl shadow-lg">
                        <span className="text-xs uppercase font-bold text-red-400 tracking-wider block mb-1">
                          🔥 Executive Protocol Mandate
                        </span>
                        <p className="text-white text-sm sm:text-base font-semibold leading-relaxed">
                          "{state.aggressivePitch}"
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Weekly Action Cards */}
                  {filteredWeeks.map((week: any) => {
                    const allActionsDone = week.actions.every((_: any, i: number) =>
                      checkedItems.has(`w${week.week}_a${i}`)
                    );

                    return (
                      <div
                        key={week.week}
                        className={`w-full p-6 rounded-3xl border backdrop-blur-2xl pointer-events-auto transition-all duration-300 ${
                          allActionsDone
                            ? "bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                            : "bg-zinc-950/80 border-zinc-800 shadow-xl"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-400/40 text-xs font-mono font-bold text-purple-300">
                            Sprint {week.week}
                          </span>
                          {week.milestone && (
                            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-400/30">
                              🎯 {week.milestone}
                            </span>
                          )}
                        </div>

                        <div className="space-y-3">
                          {week.actions.map((action: string, actIdx: number) => {
                            const actId = `w${week.week}_a${actIdx}`;
                            const isDone = checkedItems.has(actId);

                            return (
                              <div
                                key={actIdx}
                                onClick={() => toggleCheck(actId)}
                                className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                                  isDone
                                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200 line-through opacity-75"
                                    : "bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-200"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isDone}
                                  onChange={() => {}}
                                  className="mt-1 w-4 h-4 rounded text-purple-600 focus:ring-0 cursor-pointer"
                                />
                                <span className="text-xs sm:text-sm font-medium leading-relaxed">
                                  {action}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Clean Horizon Clamping Footer Banner (Stops Infinite Scroll Past Last Week) */}
                  <div className="w-full text-center py-6 pointer-events-auto">
                    <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 inline-block">
                      <span className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                        🏁 <strong>Trajectory Horizon Reached</strong> — Week {filteredWeeks[filteredWeeks.length - 1]?.week || totalWeeksCount} of {totalWeeksCount} Sprints
                      </span>
                    </div>
                  </div>

                </div>
              </Scroll>
            </ScrollControls>
          </Suspense>
        </Canvas>
      </div>

      {/* Rewards Modal */}
      <AnimatePresence>
        {rewardModal.isOpen && rewardModal.tier && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl pointer-events-auto no-print"
          >
            <div className="bg-[#0b0b14] border border-amber-400/40 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl relative">
              <div className="text-center space-y-3">
                <span className="text-4xl">{rewardModal.tier.badge}</span>
                <h3 className="text-xl font-black text-white">{rewardModal.tier.name}</h3>
                <p className="text-xs text-zinc-400">{rewardModal.tier.description}</p>
                <div className="p-3 bg-amber-500/10 border border-amber-400/30 rounded-xl font-mono text-amber-300 font-bold">
                  Coupon: {rewardModal.tier.coupon} ({rewardModal.tier.discount}% OFF)
                </div>
                <Button variant="primary" size="sm" onClick={() => setRewardModal({ isOpen: false, tier: null })} className="w-full mt-2">
                  Claim Reward
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
