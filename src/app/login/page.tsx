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
  const [loading, setLoading] = useState<string | null>(null);

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setLoading(provider);
    try {
      if (supabaseUrl.includes("placeholder")) {
        // Mock login to prevent 404 errors for the user
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: unknown) {
      alert(`OAuth Error: ${(err as Error).message}`);
    } finally {
      // Keep loading state if redirecting
      if (!supabaseUrl.includes("placeholder")) {
        setLoading(null);
      }
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
        className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-[rgba(15,15,20,0.6)] backdrop-blur-2xl border border-[var(--glass-border)] rounded-3xl shadow-[0_0_50px_rgba(124,58,237,0.15)] mx-4"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Access the Forge</h1>
          <p className="text-[var(--text-secondary)]">Sign in to sync your future simulations.</p>
        </div>

        <div className="space-y-4 mb-8">
          <button 
            onClick={() => handleOAuth('google')}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {loading === 'google' ? (
              <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.73 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.8 15.71 17.58V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.58C14.73 18.24 13.48 18.64 12 18.64C9.14 18.64 6.71 16.71 5.84 14.12H2.17V16.97C3.98 20.57 7.71 23 12 23Z" fill="#34A853"/>
                <path d="M5.84 14.12C5.62 13.46 5.5 12.75 5.5 12C5.5 11.25 5.62 10.54 5.84 9.88V7.03H2.17C1.43 8.5 1 10.2 1 12C1 13.8 1.43 15.5 2.17 16.97L5.84 14.12Z" fill="#FBBC05"/>
                <path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.03L19.36 3.88C17.46 2.11 14.97 1 12 1C7.71 1 3.98 3.43 2.17 7.03L5.84 9.88C6.71 7.29 9.14 5.38 12 5.38Z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>
          <button 
            onClick={() => handleOAuth('apple')}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-3 bg-black text-white font-semibold py-3 px-4 rounded-xl border border-gray-800 hover:bg-gray-900 transition-colors disabled:opacity-50"
          >
            {loading === 'apple' ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.364 8.794c.032-1.748 1.437-3.411 2.96-4.045-.826-1.25-2.128-1.716-3.033-1.758-1.282-.14-2.54.764-3.197.764-.657 0-1.712-.733-2.766-.713-1.373.02-2.639.816-3.344 2.072-1.428 2.531-.365 6.275 1.026 8.337.677 1.003 1.47 2.122 2.534 2.081 1.026-.04 1.428-.67 2.65-.67 1.22 0 1.58.67 2.67.65 1.11-.02 1.8-.99 2.457-1.99.764-1.144 1.082-2.253 1.103-2.312-.02-.01-2.129-.838-2.06-3.416z"/>
                <path d="M15.405 5.228c.576-.713.963-1.706.857-2.69-.857.04-1.92.593-2.518 1.305-.536.63-.984 1.636-.857 2.61 1.02.08 1.94-.492 2.518-1.225z"/>
              </svg>
            )}
            Continue with Apple
          </button>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="h-px bg-gray-800 flex-1" />
          <span className="text-sm text-gray-500 font-medium">OR</span>
          <div className="h-px bg-gray-800 flex-1" />
        </div>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Authentication backend not yet linked.'); }}>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
            <input 
              type="email" 
              placeholder="future@example.com"
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--accent-violet)] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--accent-violet)] transition-colors"
            />
          </div>
          
          <Button className="w-full mt-2" size="lg">Sign In</Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Don&apos;t have an account? <Link href="/signup" className="text-[var(--accent-purple)] hover:text-white transition-colors">Create one now</Link>
        </p>
      </motion.div>
    </div>
  );
}
