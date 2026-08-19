import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 md:p-20 font-[var(--font-body)]">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/">
          <Button variant="ghost">← Back to Home</Button>
        </Link>
        
        <h1 className="text-4xl font-bold font-[var(--font-heading)] text-[var(--accent-violet)]">Privacy Policy</h1>
        <p className="text-[var(--text-secondary)]">Last Updated: June 2026</p>
        
        <div className="space-y-6 text-lg leading-relaxed text-white/80">
          <section>
            <h2 className="text-2xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p>At VibeForge, we collect information you provide directly to us when simulating your future, including your goals, current situation, and risk tolerance. This data is strictly used to power the AI simulation engine.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">2. How We Use Information</h2>
            <p>Your data is processed locally and via secure AI APIs (like ElevenLabs and OpenAI/Llama) to generate your custom action plans, narratives, and 3D holograms. We do not sell your personal life goals to third-party data brokers.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">3. Security</h2>
            <p>Your payments are securely processed by Razorpay. We do not store your credit card or UPI details on our servers.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
