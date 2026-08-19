"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/* ─── Navigation Items ──────────────────────────────────────── */

const navItems = [
  { emoji: "🏠", label: "Dashboard", href: "/dashboard" },
  { emoji: "✨", label: "New Simulation", href: "/dashboard/simulate" },
  { emoji: "📂", label: "My Simulations", href: "/dashboard/my-simulations" },
  { emoji: "⚙️", label: "Settings", href: "/dashboard/settings" },
];

/* ─── Sidebar ───────────────────────────────────────────────── */

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-50",
          "w-[260px] flex flex-col",
          "bg-[rgba(10,10,15,0.95)] backdrop-blur-xl",
          "border-r border-[var(--glass-border)]",
          "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[var(--glass-border)]">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🔮</span>
            <span className="text-xl font-bold font-[var(--font-heading)] gradient-text">
              VibeForge
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl",
                  "text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[rgba(124,58,237,0.15)] text-white border border-[rgba(124,58,237,0.3)]"
                    : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--glass-bg)]"
                )}
              >
                <span className="text-lg">{item.emoji}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-[var(--glass-border)] space-y-4">
          {/* Upgrade Button */}
          <Link
            href="/pricing"
            className="block w-full text-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-indigo)] hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all duration-300"
          >
            ⚡ Upgrade to Pro
          </Link>

          {/* User Info */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-indigo)] flex items-center justify-center text-sm font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Ayush</p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                Free Plan
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ─── Layout ────────────────────────────────────────────────── */

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
      <header className="fixed top-0 left-0 right-0 h-14 bg-[rgba(10,10,15,0.9)] backdrop-blur-xl border-b border-[var(--glass-border)] z-30 flex items-center px-4 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors"
          aria-label="Open sidebar"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="ml-3 font-bold font-[var(--font-heading)] gradient-text">
          VibeForge
        </span>
      </header>

      {/* Main Content */}
      <main className="lg:pl-[260px] pt-14 lg:pt-0 min-h-screen">
        <div className="p-6 md:p-10 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
