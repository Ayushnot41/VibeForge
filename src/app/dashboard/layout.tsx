"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── Navigation SVG Icons ──────────────────────────────────── */

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="9" x="3" y="3" rx="1"/>
    <rect width="7" height="5" x="14" y="3" rx="1"/>
    <rect width="7" height="9" x="14" y="12" rx="1"/>
    <rect width="7" height="5" x="3" y="16" rx="1"/>
  </svg>
);

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

const FolderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const navItems = [
  { icon: DashboardIcon, label: "Overview", href: "/dashboard" },
  { icon: SparklesIcon, label: "New Simulation", href: "/dashboard/simulate" },
  { icon: FolderIcon, label: "My Simulations", href: "/dashboard/my-simulations" },
  { icon: SettingsIcon, label: "Settings", href: "/dashboard/settings" },
];

/* ─── Sidebar ───────────────────────────────────────────────── */

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-50",
          "w-[270px] flex flex-col",
          "bg-[rgba(10,10,15,0.95)] backdrop-blur-2xl",
          "border-r border-[var(--glass-border)]",
          "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-indigo)] flex items-center justify-center text-lg font-bold text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]">
              🔮
            </div>
            <span className="text-xl font-bold font-[var(--font-heading)] gradient-text tracking-tight">
              VibeForge
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "relative flex items-center gap-3.5 px-4 py-3 rounded-2xl",
                  "text-sm font-semibold transition-all duration-150",
                  isActive
                    ? "text-white bg-gradient-to-r from-purple-600/25 to-indigo-600/20 border border-purple-500/40 shadow-[0_0_20px_rgba(124,58,237,0.25)]"
                    : "text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.05] border border-transparent"
                )}
              >
                <span className={cn(isActive ? "text-[var(--accent-purple)]" : "text-[var(--text-muted)]")}>
                  <Icon />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-[var(--glass-border)] space-y-4">
          <Link
            href="/checkout/pro?billing=monthly&price=799"
            className="block w-full text-center px-4 py-3 rounded-2xl text-xs uppercase tracking-wider font-bold text-white bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-indigo)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all duration-300"
          >
            ⚡ Upgrade to Pro (₹799/mo)
          </Link>

          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent-violet)] via-[var(--accent-purple)] to-[var(--accent-indigo)] flex items-center justify-center text-sm font-bold text-white shadow-md">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Ayush</p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                Pro Architect
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

import CopilotDrawer from "@/components/dashboard/CopilotDrawer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[rgba(10,10,15,0.9)] backdrop-blur-xl border-b border-[var(--glass-border)] z-30 flex items-center justify-between px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-white/[0.06] text-white transition-colors"
            aria-label="Open sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12"/>
              <line x1="4" x2="20" y1="6" y2="6"/>
              <line x1="4" x2="20" y1="18" y2="18"/>
            </svg>
          </button>
          <span className="font-bold font-[var(--font-heading)] gradient-text text-lg">
            VibeForge
          </span>
        </div>
        <Link href="/dashboard/simulate" className="px-3 py-1.5 rounded-xl bg-purple-600 text-xs font-bold text-white shadow-md">
          + New Sim
        </Link>
      </header>

      {/* Main Content */}
      <main className="lg:pl-[270px] pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 md:p-10 max-w-6xl mx-auto">{children}</div>
      </main>

      {/* Global AI Oracle Career Copilot */}
      <CopilotDrawer />
    </div>
  );
}
