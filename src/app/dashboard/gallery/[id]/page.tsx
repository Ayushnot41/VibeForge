"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, useScroll, Html } from "@react-three/drei";
import { motion } from "framer-motion";
import { SimulationState } from "@/types/agents";
import * as THREE from "three";
import Button from "@/components/ui/Button";

// Individual gallery image using HTML overlay to bypass WebGL CORS limitations
function GalleryImageHTML({ url, error, position, rotation, title }: { url: string | null; error: string | null; position: [number, number, number]; rotation: [number, number, number]; title: string }) {
  const ref = useRef<any>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  return (
    <group position={position} rotation={rotation} ref={ref}>
      <Html transform distanceFactor={5} center className="pointer-events-none">
        <div className="w-[800px] h-[800px] flex flex-col items-center justify-center p-4 rounded-xl overflow-hidden bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl transition-transform duration-500 hover:scale-105 pointer-events-auto">
          {url ? (
            <img src={url} alt={title} className="w-full h-full object-cover rounded-lg shadow-2xl" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-lg">
              {error ? (
                <span className="text-red-400 text-2xl font-bold">{error}</span>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
                  <span className="text-white text-xl">Materializing Hologram...</span>
                </div>
              )}
            </div>
          )}
          <div className="absolute bottom-6 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
            <h3 className="text-2xl font-bold text-white tracking-widest uppercase">{title}</h3>
          </div>
        </div>
      </Html>
    </group>
  );
}

function CurvedGallery({ prompts }: { prompts: any[] }) {
  const scroll = useScroll();
  const group = useRef<THREE.Group>(null);

  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
  const [imageErrors, setImageErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    // Pollinations generates images instantly via GET requests using the prompt in the URL.
    // This provides the immediate web images the user requested.
    const urls: Record<number, string> = {};
    prompts.forEach((prompt, index) => {
      const fullPrompt = `${prompt.style} ${prompt.sceneDescription} - photorealistic, DSLR, professional, 4k`.substring(0, 800); // Pollinations has a URL length limit
      urls[index] = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=800&height=800&nologo=true&seed=${index}`;
    });
    setImageUrls(urls);
  }, [prompts]);

  useFrame(() => {
    if (group.current) {
      // scroll.offset goes from 0 to 1. 
      // We want scrolling down to rotate the circle so you see the images in sequence.
      // Negative rotation moves them clockwise.
      group.current.rotation.y = -(scroll.offset * Math.PI * 2.5); // Slightly more than 1 rotation to see the last image fully
    }
  });

  const radius = Math.max(4, prompts.length * 0.8);

  return (
    <group ref={group}>
      {prompts.map((prompt, index) => {
        const angle = (index / prompts.length) * Math.PI * 2;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        const rotY = angle;

        return (
          <GalleryImageHTML
            key={index}
            url={imageUrls[index] || null}
            error={imageErrors[index] || null}
            position={[x, 0, z]}
            rotation={[0, rotY, 0]}
            title={`Month ${prompt.milestoneMonth}`}
          />
        );
      })}
    </group>
  );
}

export default function GalleryPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [state, setState] = useState<SimulationState | null>(null);
  const [loading, setLoading] = useState(true);

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
        <p className="text-[var(--text-secondary)]">Initializing Gallery...</p>
      </div>
    );
  }

  if (!state || !state.imagePrompts) {
    return (
      <div className="text-center py-20 min-h-screen bg-black">
        <h2 className="text-2xl font-bold text-red-400">Visuals not found</h2>
        <Button onClick={() => router.push(`/dashboard/results/${id}`)} className="mt-4">
          Back to Hub
        </Button>
      </div>
    );
  }

  const prompts = state.imagePrompts || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full h-screen relative bg-[#050505] overflow-hidden"
    >
      <div className="absolute top-6 left-6 z-20">
        <Button variant="ghost" onClick={() => router.push(`/dashboard/results/${id}`)}>
          ← Back to Command Center
        </Button>
      </div>
      <div className="absolute top-6 right-6 z-20 text-right">
        <h1 className="text-2xl font-bold text-white mb-1">Visual Gallery</h1>
        <p className="text-white/50 text-sm tracking-wider uppercase">Scroll to rotate the holograms</p>
      </div>

      <Canvas camera={{ position: [0, 0, 10], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={["#050505"]} />
        <fog attach="fog" args={["#050505", 2, 25]} />
        <ambientLight intensity={0.5} />
        
        <Suspense fallback={null}>
          <ScrollControls pages={Math.max(3, prompts.length * 0.5)} damping={0.15} horizontal={false}>
            <CurvedGallery prompts={prompts} />
          </ScrollControls>
        </Suspense>
      </Canvas>
    </motion.div>
  );
}
