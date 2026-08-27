"use client";

import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, Stars, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase (requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

function AuthBackground() {
  return (
    <div className="absolute inset-0 z-0 bg-[#05050A]">
      <Canvas camera={{ position: [0, 0, 8] }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#7C3AED" intensity={2} />
        <Stars radius={100} depth={50} count={2000} factor={4} fade speed={1} />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <Sphere args={[2, 64, 64]} position={[4, 0, -2]}>
            <MeshDistortMaterial
              color="#7C3AED"
              emissive="#4F46E5"
              emissiveIntensity={0.5}
              distort={0.3}
              speed={2}
              roughness={0.2}
              metalness={0.8}
            />
          </Sphere>
        </Float>
      </Canvas>
      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#05050A_100%)] pointer-events-none" />
    </div>
  );
}

export default function LoginPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('ayush@vibeforge.ai');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [demoCodeNotice, setDemoCodeNotice] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);

  // Countdown timer for resend
  React.useEffect(() => {
    let interval: any = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading('send-otp');
    setError(null);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setStep('otp');
      setTimer(60);
      if (data.demoCode) {
        setDemoCodeNotice(data.demoCode);
      }
    } catch (err: any) {
      setError(err.message || 'Error sending verification code.');
    } finally {
      setLoading(null);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-verify if all 6 digits entered
    if (newOtp.every((digit) => digit !== '')) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const fullCode = codeToVerify || otp.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setLoading('verify-otp');
    setError(null);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email, otp: fullCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code.');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('vibeforge_user', JSON.stringify(data.user));
      }

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
      setLoading(null);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <AuthBackground />
      
      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="text-2xl font-black text-white drop-shadow-md flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-indigo)]" />
          VibeForge
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-[rgba(15,15,20,0.7)] backdrop-blur-2xl border border-[var(--glass-border)] rounded-3xl shadow-[0_0_50px_rgba(124,58,237,0.2)] mx-4"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Access the Forge</h1>
          <p className="text-[var(--text-secondary)] text-sm">
            {step === 'email' ? 'Enter your email for live OTP authentication.' : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {demoCodeNotice && step === 'otp' && (
          <div className="mb-6 p-3.5 rounded-xl bg-purple-500/15 border border-purple-500/40 text-purple-200 text-xs text-center flex flex-col gap-1 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <span className="font-semibold text-white">Live Verification Code:</span>
            <span className="font-mono text-base font-black tracking-widest text-emerald-400">{demoCodeNotice}</span>
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@example.com"
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--accent-purple)] focus:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
              />
            </div>
            
            <Button className="w-full mt-3 shadow-xl" size="lg" disabled={loading === 'send-otp'}>
              {loading === 'send-otp' ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Dispatching Code...
                </span>
              ) : (
                "Send Verification Code →"
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  autoFocus={index === 0}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold bg-[rgba(255,255,255,0.06)] border border-white/15 rounded-xl text-white focus:outline-none focus:border-[var(--accent-purple)] focus:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all"
                />
              ))}
            </div>

            <Button
              className="w-full shadow-xl"
              size="lg"
              onClick={() => handleVerifyOtp()}
              disabled={loading === 'verify-otp' || otp.some((d) => !d)}
            >
              {loading === 'verify-otp' ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying & Launching...
                </span>
              ) : (
                "Verify & Enter Dashboard →"
              )}
            </Button>

            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                ← Change Email
              </button>

              {timer > 0 ? (
                <span>Resend code in {timer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="text-[var(--accent-purple)] font-semibold hover:text-white transition-colors cursor-pointer"
                >
                  Resend Code
                </button>
              )}
            </div>
          </div>
        )}

        <p className="text-center text-sm text-gray-400 mt-8">
          Don&apos;t have an account? <Link href="/signup" className="text-[var(--accent-purple)] font-semibold hover:text-white transition-colors">Create one now</Link>
        </p>
      </motion.div>
    </div>
  );
}
