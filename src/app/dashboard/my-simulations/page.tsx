"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { SimulationState } from "@/types/agents";
import { DEMO_SIMULATION } from "@/lib/demoSimulation";

export default function MySimulationsPage() {
  const [simulations, setSimulations] = useState<{ id: string; title: string; date: string; horizon?: string; isDemo?: boolean; data: SimulationState }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [horizonFilter, setHorizonFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSimulations();
  }, []);

  const loadSimulations = async () => {
    setLoading(true);
    const localSims = [];

    if (isSupabaseConfigured()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('simulations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && data) {
            setSimulations(data.map((row: any) => ({
              id: row.id,
              title: String(row.state?.userInput?.goals || row.state?.formState?.goal || "Simulation"),
              date: new Date(row.created_at).toLocaleDateString(),
              horizon: row.state?.userInput?.timeHorizon ? row.state.userInput.timeHorizon.replace("_", " ") : "3 years",
              data: row.state as SimulationState
            })));
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Supabase fetch failed", err);
      }
    }

    // Fallback to LocalStorage
    if (typeof window !== "undefined") {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sim_') && key !== 'sim_sim-demo') {
          try {
            const rawData = localStorage.getItem(key);
            if (rawData) {
              const parsed = JSON.parse(rawData) as SimulationState & { localSavedAt?: number };
              
              if (!parsed.userInput?.goals && !parsed.formState?.goal) {
                continue;
              }

              localSims.push({
                id: key.replace('sim_', ''),
                title: String(parsed.userInput?.goals || parsed.formState?.goal || "My Future Simulation"),
                date: parsed.localSavedAt ? new Date(parsed.localSavedAt).toLocaleDateString() : new Date().toLocaleDateString(),
                horizon: parsed.userInput?.timeHorizon ? parsed.userInput.timeHorizon.replace("_", " ") : "3 years",
                data: parsed
              });
            }
          } catch (e) {
            console.error("Failed to parse local simulation", e);
          }
        }
      }
    }

    setSimulations(localSims);
    setLoading(false);
  };

  const handleDeleteSimulation = (simId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this simulation?")) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(`sim_${simId}`);
      }
      setSimulations((prev) => prev.filter((s) => s.id !== simId));
    }
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all your saved simulations?")) {
      if (typeof window !== "undefined") {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sim_')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      }
      setSimulations([]);
    }
  };

  const filteredSimulations = simulations.filter((sim) => {
    const matchesSearch = sim.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHorizon = horizonFilter === "all" || (sim.horizon && sim.horizon.toLowerCase().includes(horizonFilter));
    return matchesSearch && matchesHorizon;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
        <p className="text-[var(--text-secondary)] text-sm">Accessing Multiverse Archives...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-4 font-[var(--font-body)]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 font-[var(--font-heading)] text-white">My Simulations</h1>
            <p className="text-[var(--text-secondary)] text-sm">
              Manage your active timelines, 120-week protocols, and 4K holographic milestones.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {simulations.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-3 py-2 rounded-xl hover:bg-rose-500/10 transition-colors"
              >
                Clear All
              </button>
            )}
            <Link href="/dashboard/simulate">
              <Button variant="primary" size="md">🚀 New Simulation</Button>
            </Link>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        {simulations.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search simulations by keyword or goal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--accent-purple)] transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={horizonFilter}
                onChange={(e) => setHorizonFilter(e.target.value)}
                className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-[var(--accent-purple)]"
              >
                <option value="all" className="bg-black text-white">All Horizons</option>
                <option value="1" className="bg-black text-white">1 Year</option>
                <option value="3" className="bg-black text-white">3 Years</option>
                <option value="5" className="bg-black text-white">5 Years</option>
                <option value="10" className="bg-black text-white">10 Years</option>
              </select>
            </div>
          </div>
        )}

        {/* Simulations Grid or Empty State */}
        {filteredSimulations.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-white/15 bg-white/[0.01]">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mx-auto mb-4">
              🔮
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Simulations Found</h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-6">
              {searchQuery ? "No simulations match your current search criteria." : "You haven't generated a custom simulation yet. Create one or test our live interactive demo."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/dashboard/simulate">
                <Button variant="primary" size="md">
                  🚀 Launch Simulation Wizard
                </Button>
              </Link>
              <Link href="/dashboard/results/sim-demo">
                <Button variant="secondary" size="md">
                  ⚡ Preview Sample Simulation
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSimulations.map((sim, i) => (
              <motion.div
                key={sim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="h-full flex flex-col justify-between hover:border-[var(--accent-purple)] transition-all duration-300 p-6 group shadow-lg">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <Badge color={sim.isDemo ? "cyan" : "violet"} dot>
                        {sim.isDemo ? "Interactive Demo" : "Completed"}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--text-muted)]">{sim.date}</span>
                        {!sim.isDemo && (
                          <button
                            onClick={(e) => handleDeleteSimulation(sim.id, e)}
                            className="text-gray-500 hover:text-rose-400 p-1 rounded transition-colors text-xs"
                            title="Delete Simulation"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                    <h3 className="text-base font-bold mb-2 line-clamp-2 text-white group-hover:text-[var(--accent-purple)] transition-colors">
                      {sim.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mb-6 line-clamp-3 leading-relaxed">
                      {String(sim.data?.userInput?.currentSituation || sim.data?.formState?.currentSituation || "Autonomous parallel life path model.")}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2 mt-auto pt-4 border-t border-white/5">
                    <span className="text-xs font-semibold text-cyan-300">
                      ⏱️ {sim.horizon}
                    </span>
                    <Link href={`/dashboard/results/${sim.id}`}>
                      <Button variant="primary" size="sm" className="shadow-md text-xs">
                        Command Center →
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
