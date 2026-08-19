"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { SimulationState } from "@/types/agents";

export default function MySimulationsPage() {
  const [simulations, setSimulations] = useState<{ id: string; title: string; date: string; data: SimulationState }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSimulations() {
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

      // Fallback to LocalStorage if Supabase is not configured or failed
      const localSims = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sim_')) {
          try {
            const rawData = localStorage.getItem(key);
            if (rawData) {
              const parsed = JSON.parse(rawData) as SimulationState & { localSavedAt?: number };
              
              if (parsed.localSavedAt) {
                const ageHours = (Date.now() - parsed.localSavedAt) / (1000 * 60 * 60);
                if (ageHours > 24) {
                  localStorage.removeItem(key);
                  continue;
                }
              }

              // Only add if it's a valid simulation (has goals/situation)
              if (!parsed.userInput?.goals && !parsed.formState?.goal) {
                continue;
              }

              localSims.push({
                id: key.replace('sim_', ''),
                title: String(parsed.userInput?.goals || parsed.formState?.goal || "My Future Simulation"),
                date: parsed.localSavedAt ? new Date(parsed.localSavedAt).toLocaleDateString() : new Date().toLocaleDateString(),
                data: parsed
              });
            }
          } catch (e) {
            console.error("Failed to parse local simulation", e);
          }
        }
      }
      setSimulations(localSims);
      setLoading(false);
    }

    loadSimulations();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-screen bg-[var(--bg-primary)]">
        <div className="w-10 h-10 border-4 border-[var(--accent-violet)]/30 border-t-[var(--accent-violet)] rounded-full animate-spin mb-4" />
        <p className="text-[var(--text-secondary)]">Loading your futures...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Simulations</h1>
            <p className="text-[var(--text-secondary)]">
              {isSupabaseConfigured() 
                ? "Your permanently saved future simulations." 
                : "Your locally saved simulations (add Supabase keys to save permanently)."}
            </p>
          </div>
          <Link href="/dashboard/simulate">
            <Button variant="primary">🚀 New Simulation</Button>
          </Link>
        </div>

        {simulations.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[var(--glass-border)] rounded-2xl bg-[rgba(10,10,15,0.5)]">
            <div className="text-4xl mb-4">🌌</div>
            <h2 className="text-xl font-bold mb-2">No Simulations Yet</h2>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
              You haven't generated any future paths yet. Start a simulation to see your potential futures!
            </p>
            <Link href="/dashboard/simulate">
              <Button variant="primary">Start Free Simulation</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulations.map((sim, i) => (
              <motion.div
                key={sim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="h-full flex flex-col hover:border-[var(--accent-violet)] transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <Badge color="violet">Completed</Badge>
                    <span className="text-xs text-[var(--text-muted)]">{sim.date}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 line-clamp-2">{sim.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-6 flex-1 line-clamp-3">
                    {String(sim.data?.userInput?.currentSituation || sim.data?.formState?.currentSituation || "No current situation provided.")}
                  </p>
                  
                  <div className="flex gap-2 mt-auto">
                    <Link href={`/dashboard/results/${sim.id}`} className="flex-1">
                      <Button variant="primary" className="w-full justify-center">
                        View Command Center
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
