import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 md:p-20 font-[var(--font-body)]">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/">
          <Button variant="ghost">← Back to Home</Button>
        </Link>
        
        <h1 className="text-4xl font-bold font-[var(--font-heading)] text-[#10B981]">Terms of Service</h1>
        <p className="text-[var(--text-secondary)]">Last Updated: June 2026</p>
        
        <div className="space-y-6 text-lg leading-relaxed text-white/80">
          <section>
            <h2 className="text-2xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By using VibeForge, you agree to take extreme accountability for your future. The AI action plans are suggestions, but the execution relies entirely on you.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">2. AI-Generated Content</h2>
            <p>VibeForge utilizes generative AI to create routines, narratives, and visual holograms. While we strive for accuracy and powerful motivation, we cannot guarantee specific life outcomes based on these simulations.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">3. Subscriptions</h2>
            <p>Pro and Enterprise subscriptions are billed via Razorpay. Subscriptions unlock advanced AI paths and enhanced 3D visual processing capabilities.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
