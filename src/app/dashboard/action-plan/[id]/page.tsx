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
      {/* Ambient floating geometry for atmosphere - Reduced count for performance */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Float key={i} speed={0.5} rotationIntensity={0.5} floatIntensity={1} position={[(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 20 - 10]}>
          <mesh>
            <tetrahedronGeometry args={[Math.random() * 0.5 + 0.1]} />
            <meshStandardMaterial color="#4c1d95" emissive="#2e1065" emissiveIntensity={0.5} wireframe={Math.random() > 0.5} />
          </mesh>
        </Float>
      ))}
      {/* Mindset Alignment Stone (always visible, slowly rotating) */}
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
  const [equippedSkin, setEquippedSkin] = useState<"default" | "quantum" | "infernal" | "chronos">("default");

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-screen bg-black">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
        <p className="text-white/60">Loading Execution Protocol...</p>
      </div>
    );
  }

  if (!state || !state.actionPlan) {
    return (
      <div className="text-center py-20 min-h-screen bg-black">
        <h2 className="text-2xl font-bold text-red-400">Execution Protocol not found</h2>
        <Button onClick={() => router.push(`/dashboard/results/${id}`)} className="mt-4">
          Back to Command Center
        </Button>
      </div>
    );
  }

  const weeks = state.actionPlan.weeklyActions || [];
  const pages = Math.max(2, weeks.length / 1.2);
  
  const totalActions = weeks.reduce((acc: number, w: any) => acc + w.actions.length, 0);
  const progress = totalActions === 0 ? 0 : checkedItems.size / totalActions;

  const toggleCheck = (actionId: string) => {
    const newSet = new Set(checkedItems);
    if (newSet.has(actionId)) {
      newSet.delete(actionId);
    } else {
      newSet.add(actionId);
      // 10% chance to drop a Reality Glitch when completing an action
      if (Math.random() < 0.1 && !glitchModal.isOpen && state?.userInput?.goals) {
        const prmpt = `Hyper-realistic, first person POV, success, achieving goal: ${state.userInput.goals}. Award-winning photography, glitch art aesthetics`;
        setGlitchModal({ 
          isOpen: true, 
          imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(prmpt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 10000)}`
        });
      }
    }
    setCheckedItems(newSet);
  };

  // VibeCore Tamagotchi Health Calculation
  const daysElapsed = state?.localSavedAt ? (Date.now() - state.localSavedAt) / (1000 * 60 * 60 * 24) : 0;
  const expectedActions = Math.max(0, daysElapsed / 2); // Expect 1 action every 2 days
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full h-screen relative bg-[#030305] overflow-hidden"
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

      {/* Fixed UI Headers */}
      <div className="absolute top-6 left-6 z-20 flex gap-4 no-print">
        <Button variant="ghost" onClick={() => router.push(`/dashboard/results/${id}`)}>
          ← Back to Command Center
        </Button>
        <Button variant="secondary" onClick={exportToICS}>
          📅 ICS
        </Button>
        <Button variant="secondary" onClick={exportToPDF}>
          📄 PDF
        </Button>
      </div>
      
      <div className="absolute top-6 right-6 z-20 text-right no-print">
        <h1 className="text-3xl font-bold text-white mb-1 tracking-tight drop-shadow-lg">Execution Protocol ⚡</h1>
        <p className="text-white/60 text-sm uppercase tracking-wider font-bold">
          {progress === 1 ? "Protocol Completed" : `${Math.round(progress * 100)}% Synchronized`}
        </p>
      </div>

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

      {/* Store Modal */}
      <AnimatePresence>
        {storeModal && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl pointer-events-auto no-print"
          >
            <div className="bg-[#0a0a0f] border border-purple-500/30 p-8 rounded-3xl max-w-4xl w-full mx-4 shadow-[0_0_100px_rgba(139,92,246,0.2)]">
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

      {/* AI Rival Tracker */}
      {state.actionPlan.rival && (
        <div className="fixed bottom-10 left-10 w-80 z-30 pointer-events-auto no-print">
          <div className={`p-4 rounded-2xl backdrop-blur-md border ${health < 0.5 ? 'bg-red-900/40 border-red-500/50' : 'bg-black/60 border-white/10'}`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <span>⚠️</span> Rival Detected
              </h3>
              <span className="text-xs bg-red-600 px-2 py-1 rounded text-white font-bold">
                +{state.actionPlan.rival.progressOffset} Days Ahead
              </span>
            </div>
            <p className="text-white/80 text-sm mb-3"><strong>{state.actionPlan.rival.name}</strong> - {state.actionPlan.rival.bio}</p>
            <div className="bg-black/50 p-3 rounded-lg border border-red-500/30">
              <p className="text-red-400 text-xs italic font-mono">
                "{state.actionPlan.rival.taunts?.[0] || 'They are outworking you right now.'}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reality Glitch Modal */}
      <AnimatePresence>
        {glitchModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto no-print"
            onClick={() => setGlitchModal({ isOpen: false, imageUrl: null })}
          >
            <div className="relative p-2 bg-gradient-to-br from-purple-600 via-red-500 to-black rounded-xl p-[2px] animate-pulse">
              <div className="bg-black p-4 rounded-xl relative max-w-2xl w-full">
                <button 
                  className="absolute -top-4 -right-4 w-8 h-8 bg-red-600 rounded-full text-white font-bold hover:bg-red-500 shadow-lg"
                  onClick={() => setGlitchModal({ isOpen: false, imageUrl: null })}
                >✕</button>
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-500 mb-2 font-mono uppercase tracking-widest text-center">
                  Reality Glitch Found!
                </h3>
                <p className="text-center text-white/60 mb-4 text-sm">A glimpse of your future just materialized.</p>
                {glitchModal.imageUrl && (
                  <img src={glitchModal.imageUrl} alt="Future Reality" className="w-full aspect-square object-cover rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.3)]" />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mindset Alignment Stone (Cinematic Overlook) linked to Progress and Health */}
      <div className="fixed bottom-10 right-10 w-48 h-48 md:w-64 md:h-64 z-30 pointer-events-auto no-print transition-all duration-1000 hidden md:block cursor-pointer hover:scale-105" onClick={() => progress === 1 && setStoreModal(true)}>
        <VibeCore progress={progress} health={health} skin={equippedSkin} />
        {health < 0.5 && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-red-600/80 text-white text-xs px-2 py-1 rounded border border-red-400/50 animate-pulse">
            CRITICAL INTEGRITY
          </div>
        )}
      </div>

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
                  <div className="flex flex-col items-center px-6 pt-32 pb-64 gap-24 pointer-events-none no-print">
                    {weeks.map((week, index) => (
                      <div key={index} className="w-full max-w-2xl pointer-events-auto">
                        <motion.div
                          initial={{ scale: 0.9 }}
                          whileInView={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          whileHover={{ scale: 1.05, y: -8 }}
                          whileTap={{ scale: 0.98 }}
                          className="will-change-transform"
                        >
                          <div
                            className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden group hover:border-purple-500/30 transition-colors duration-500"
                          >
                            {/* Inner glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            
                            <div className="flex items-center gap-5 mb-8 relative z-10">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-900 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-900/50 border border-white/10 shrink-0">
                                {week.week}
                              </div>
                              <div>
                                <h2 className="text-3xl font-bold text-white tracking-tight">Week {week.week}</h2>
                                {week.milestone && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="w-6 h-6 rounded-sm bg-gradient-to-tr from-blue-500 to-cyan-300 animate-spin-slow shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ animationDuration: '4s' }} />
                                    <p className="text-cyan-400 text-sm font-bold uppercase tracking-widest">{week.milestone}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <ul className="space-y-4 relative z-10">
                              {week.actions.map((action: string, i: number) => {
                                const actionId = `w${week.week}-a${i}`;
                                const isChecked = checkedItems.has(actionId);
                                
                                // Parse out YouTube links for a clean button
                                const linkMatch = action.match(/(.*)\[([^\]]+)\]\((https?:\/\/[^\)]+)\)(.*)/);
                                const parsedAction = linkMatch ? (
                                  <>
                                    {linkMatch[1]}
                                    <a href={linkMatch[3]} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 bg-red-600/80 hover:bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2 border border-red-400/30 transition-colors shadow-[0_0_10px_rgba(220,38,38,0.3)]">
                                      ▶ {linkMatch[2]}
                                    </a>
                                    {linkMatch[4]}
                                  </>
                                ) : action;

                                return (
                                  <li 
                                    key={i} 
                                    className="flex items-start gap-4 cursor-pointer group/item"
                                    onClick={() => toggleCheck(actionId)}
                                  >
                                    <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-1 border-2 transition-all duration-300 ${isChecked ? 'bg-purple-600 border-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'bg-black/50 border-white/20 group-hover/item:border-purple-400'}`}>
                                      {isChecked && <span className="text-white text-sm font-bold">✓</span>}
                                    </div>
                                    <span className={`leading-relaxed text-lg transition-all duration-300 ${isChecked ? 'text-white/30 line-through' : 'text-white/90 group-hover/item:text-white'}`}>
                                      {parsedAction}
                                    </span>
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
