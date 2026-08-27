"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { SimulationState } from "@/types/agents";
import { DEMO_SIMULATION } from "@/lib/demoSimulation";

interface SavedSimulationItem {
  id: string;
  title: string;
  situation: string;
  date: string;
  timestamp: number;
  horizon: string;
  totalWeeks: number;
  data: SimulationState;
}

export default function MySimulationsPage() {
  const [simulations, setSimulations] = useState<SavedSimulationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [horizonFilter, setHorizonFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSimulations();
  }, []);

  const loadSimulations = async () => {
    setLoading(true);
    const simsMap = new Map<string, SavedSimulationItem>();

    // 1. Fetch from Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("simulations")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (!error && data) {
            data.forEach((row: any) => {
              const state = row.state as SimulationState;
              simsMap.set(row.id, {
                id: row.id,
                title: String(state?.userInput?.goals || "Career Transformation"),
                situation: String(state?.userInput?.currentSituation || ""),
                date: new Date(row.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
                timestamp: new Date(row.created_at).getTime(),
                horizon: state?.userInput?.timeHorizon ? state.userInput.timeHorizon.replace("_", " ") : "3 years",
                totalWeeks: state?.actionPlan?.weeklyActions?.length || 12,
                data: state,
              });
            });
          }
        }
      } catch (err) {
        console.error("Supabase fetch notice:", err);
      }
    }

    // 2. Read from Master Vault
    if (typeof window !== "undefined") {
      try {
        const vaultRaw = localStorage.getItem("vibeforge_vault_simulations");
        if (vaultRaw) {
          const vaultItems = JSON.parse(vaultRaw);
          if (Array.isArray(vaultItems)) {
            vaultItems.forEach((item: any) => {
              if (item.id) {
                const fullSimRaw = localStorage.getItem(`sim_${item.id}`);
                const fullData = fullSimRaw ? JSON.parse(fullSimRaw) : DEMO_SIMULATION;
                simsMap.set(item.id, {
                  id: item.id,
                  title: item.title || fullData.userInput?.goals || "Career Transformation",
                  situation: item.situation || fullData.userInput?.currentSituation || "",
                  date: new Date(item.createdAt || Date.now()).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }),
                  timestamp: item.createdAt || Date.now(),
                  horizon: item.timeHorizon ? item.timeHorizon.replace("_", " ") : "3 years",
                  totalWeeks: item.totalWeeks || fullData.actionPlan?.weeklyActions?.length || 12,
                  data: fullData,
                });
              }
            });
          }
        }
      } catch (vaultErr) {
        console.error("Vault read error:", vaultErr);
      }

      // 3. Scan all localStorage keys for any individual simulations
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("sim_") && key !== "sim_sim-demo") {
          const simId = key.replace("sim_", "");
          if (!simsMap.has(simId)) {
            try {
              const raw = localStorage.getItem(key);
              if (raw) {
                const parsed = JSON.parse(raw) as SimulationState & { localSavedAt?: number };
                simsMap.set(simId, {
                  id: simId,
                  title: parsed.userInput?.goals || "Saved Simulation",
                  situation: parsed.userInput?.currentSituation || "",
                  date: parsed.localSavedAt
                    ? new Date(parsed.localSavedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }),
                  timestamp: parsed.localSavedAt || Date.now(),
                  horizon: parsed.userInput?.timeHorizon
                    ? parsed.userInput.timeHorizon.replace("_", " ")
                    : "3 years",
                  totalWeeks: parsed.actionPlan?.weeklyActions?.length || 12,
                  data: parsed,
                });
              }
            } catch (e) {}
          }
        }
      }
    }

    const sortedSims = Array.from(simsMap.values()).sort((a, b) => b.timestamp - a.timestamp);
    setSimulations(sortedSims);
    setLoading(false);
  };

  const handleDeleteSimulation = (simId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to remove this simulation from your list?")) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(`sim_${simId}`);
        try {
          const vaultRaw = localStorage.getItem("vibeforge_vault_simulations");
          if (vaultRaw) {
            const vault = JSON.parse(vaultRaw);
            const filtered = vault.filter((v: any) => v.id !== simId);
            localStorage.setItem("vibeforge_vault_simulations", JSON.stringify(filtered));
          }
        } catch (e) {}
      }
      setSimulations((prev) => prev.filter((s) => s.id !== simId));
    }
  };

  // Export Vault Backup
  const handleExportVault = () => {
    const backupData = simulations.map((s) => ({
      id: s.id,
      timestamp: s.timestamp,
      data: s.data,
    }));
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vibeforge_vault_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import Vault Backup
  const handleImportVault = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          let count = 0;
          imported.forEach((item: any) => {
            if (item.id && item.data) {
              localStorage.setItem(`sim_${item.id}`, JSON.stringify(item.data));
              count++;
            }
          });
          setImportNotice(`✓ Successfully restored ${count} simulation(s) to your permanent vault!`);
          setTimeout(() => setImportNotice(null), 4000);
          loadSimulations();
        }
      } catch (err) {
        alert("Invalid JSON backup file.");
      }
    };
    reader.readAsText(file);
  };

  const filteredSimulations = simulations.filter((sim) => {
    const matchesSearch =
      sim.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sim.situation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHorizon =
      horizonFilter === "all" ||
      (sim.horizon && sim.horizon.toLowerCase().includes(horizonFilter.toLowerCase()));
    return matchesSearch && matchesHorizon;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4" />
        <p className="text-white/60 text-sm font-mono tracking-wider">Accessing Permanent Vault Archives...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-4 font-[var(--font-body)] text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
              Permanent Vault Subsystem
            </span>
            <h1 className="text-3xl font-black mt-1 text-white tracking-tight">
              My Simulations
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Your career transformations and execution protocols permanently secured.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportVault}
              accept=".json"
              className="hidden"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs border-white/15"
            >
              📥 Import Backup
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportVault}
              disabled={simulations.length === 0}
              className="text-xs border-white/15"
            >
              💾 Export Vault JSON
            </Button>
            <Link href="/dashboard/simulate">
              <Button variant="primary" size="sm" className="bg-purple-600 hover:bg-purple-500 text-xs font-bold">
                + New Simulation
              </Button>
            </Link>
          </div>
        </div>

        {/* Notice */}
        {importNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300">
            {importNotice}
          </div>
        )}

        {/* Search & Horizon Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search your saved simulations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-zinc-950/80 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 font-mono transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {["all", "week", "year"].map((f) => (
              <button
                key={f}
                onClick={() => setHorizonFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  horizonFilter === f
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm"
                    : "text-white/50 hover:text-white bg-zinc-950/60 border border-white/5"
                }`}
              >
                {f === "all" ? "All Timelines" : f === "week" ? "Sprint Weeks" : "Multi-Year"}
              </button>
            ))}
          </div>
        </div>

        {/* Simulations List */}
        {filteredSimulations.length === 0 ? (
          <div className="text-center py-16 bg-zinc-950/40 rounded-3xl border border-white/10 p-8">
            <div className="text-3xl mb-3">🔮</div>
            <h3 className="text-lg font-bold text-white mb-1">No Saved Simulations Found</h3>
            <p className="text-white/50 text-xs max-w-md mx-auto mb-6">
              Create your first career transformation protocol to start tracking your journey.
            </p>
            <Link href="/dashboard/simulate">
              <Button variant="primary" size="sm" className="bg-purple-600">
                Launch New Simulation
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSimulations.map((sim) => (
              <Card
                key={sim.id}
                elevated
                className="p-6 bg-zinc-950/80 border-white/10 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/30">
                        {sim.horizon}
                      </span>
                      <span className="text-[10px] text-white/40 font-mono">
                        {sim.totalWeeks} Weeks
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/40 font-mono">{sim.date}</span>
                      <button
                        onClick={(e) => handleDeleteSimulation(sim.id, e)}
                        className="text-white/30 hover:text-red-400 text-xs px-2 py-0.5 rounded hover:bg-white/5 transition-colors"
                        title="Delete simulation"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {sim.title}
                  </h3>

                  {sim.situation && (
                    <p className="text-xs text-white/60 line-clamp-2 leading-relaxed mb-4">
                      <strong className="text-white/80">From:</strong> {sim.situation}
                    </p>
                  )}
                </div>

                {/* Quick Navigation Links */}
                <div className="pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <Link
                    href={`/dashboard/results/${sim.id}`}
                    className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-white/80 hover:text-cyan-300 text-[11px] font-semibold border border-white/5 transition-all"
                  >
                    Command
                  </Link>
                  <Link
                    href={`/dashboard/action-plan/${sim.id}`}
                    className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-purple-500/20 text-white/80 hover:text-purple-300 text-[11px] font-semibold border border-white/5 transition-all"
                  >
                    Protocol
                  </Link>
                  <Link
                    href={`/dashboard/gallery/${sim.id}`}
                    className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500/20 text-white/80 hover:text-amber-300 text-[11px] font-semibold border border-white/5 transition-all"
                  >
                    Holograms
                  </Link>
                  <Link
                    href={`/dashboard/narrative/${sim.id}`}
                    className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-indigo-500/20 text-white/80 hover:text-indigo-300 text-[11px] font-semibold border border-white/5 transition-all"
                  >
                    Voice
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
