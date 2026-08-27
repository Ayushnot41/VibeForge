"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import { SimulationState } from "@/types/agents";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function CopilotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);

  const getActiveSimulation = (): SimulationState | null => {
    if (typeof window === "undefined") return null;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("sim_") && key !== "sim_sim-demo") {
          const raw = localStorage.getItem(key);
          if (raw) return JSON.parse(raw);
        }
      }
    } catch (e) {}
    return null;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = "en-US";

        recog.onresult = (e: any) => {
          const transcript = e.results[0][0].transcript;
          setInputValue(transcript);
          setIsListening(false);
          sendMessage(transcript);
        };

        recog.onerror = () => setIsListening(false);
        recog.onend = () => setIsListening(false);

        recognitionRef.current = recog;
      }
    }

    setMessages([
      {
        id: "msg-init",
        role: "assistant",
        content:
          "Greetings! I am the VibeForge Oracle — your AI Career & Execution Copilot.\n\nI am here to guide you step-by-step in very simple, clear language. You can ask me any question about your career roadmap, programming, trading, business, or daily habits. How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your query.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (synthRef.current) synthRef.current.cancel();
      setSpeakingMsgId(null);
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speakMessage = async (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      if (synthRef.current) synthRef.current.cancel();
      setSpeakingMsgId(null);
      return;
    }

    setSpeakingMsgId(msgId);

    try {
      const cleanText = text.replace(/\[.*?\]\(.*?\)/g, "").replace(/[*_#`]/g, "");
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText.slice(0, 450) }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        audio.onended = () => setSpeakingMsgId(null);
        audio.onerror = () => fallbackSpeak(cleanText);
        audio.play();
        return;
      }
    } catch (e) {}

    fallbackSpeak(text);
  };

  const fallbackSpeak = (text: string) => {
    if (!synthRef.current) {
      setSpeakingMsgId(null);
      return;
    }
    synthRef.current.cancel();
    const cleanText = text.replace(/\[.*?\]\(.*?\)/g, "").replace(/[*_#`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    synthRef.current.speak(utterance);
  };

  const copyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "New conversation initiated with VibeForge Oracle. Ask me anything in simple, clear language!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const simState = getActiveSimulation();
      const payloadMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          simulationState: simState,
        }),
      });

      const data = await res.json();
      const assistantReply =
        data?.message?.content ||
        "I am ready. Ask me any question on your roadmap, coding, business, or daily strategy.";

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: assistantReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "I encountered a momentary connection notice. Please ask again and I will explain it immediately.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Explain Week 1 step-by-step in very simple words",
    "How can I stay disciplined when I feel lazy?",
    "Give me 3 simple daily habits for consistent growth",
    "What is the easiest way to start learning my dream skill?",
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 no-print pointer-events-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.7)] transition-all duration-300 flex items-center gap-2.5 hover:scale-105"
        >
          <span className="text-base animate-pulse">✨</span>
          <span className="tracking-wider uppercase font-mono">VibeForge Oracle</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      </div>

      {/* Auto-Resizable Chatbot Drawer across Mobile, Tablet, Laptop, PC */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className={`fixed inset-y-0 right-0 z-50 flex flex-col justify-between bg-zinc-950/95 backdrop-blur-2xl border-l border-zinc-800 shadow-2xl font-[var(--font-body)] text-white pointer-events-auto transition-all duration-300
              w-full sm:w-[480px] ${isExpanded ? "lg:w-[760px] lg:max-w-[60vw]" : "lg:w-[480px]"}
            `}
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-black/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center text-white font-black shadow-md">
                  🔮
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    VibeForge Oracle
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                      Claude 3.5 Sonnet
                    </span>
                  </h2>
                  <p className="text-[11px] text-zinc-400">Universal AI Career Copilot</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Expand / Collapse width on desktop */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="hidden lg:block p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs transition-colors"
                  title={isExpanded ? "Collapse width" : "Expand width"}
                >
                  {isExpanded ? "🗗" : "🗖"}
                </button>
                <button
                  onClick={handleClearChat}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs transition-colors"
                  title="Clear conversation"
                >
                  🔄
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs transition-colors"
                  title="Close Assistant"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[92%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none shadow-md font-medium"
                        : "bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 px-1">
                    <span className="text-[10px] text-zinc-500 font-mono">{m.timestamp}</span>
                    <button
                      onClick={() => copyMessage(m.id, m.content)}
                      className="text-[10px] text-zinc-400 hover:text-white font-mono"
                    >
                      {copiedMsgId === m.id ? "✓ Copied" : "📋 Copy"}
                    </button>
                    {m.role === "assistant" && (
                      <button
                        onClick={() => speakMessage(m.id, m.content)}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
                      >
                        {speakingMsgId === m.id ? "⏹ Stop Voice" : "🔊 Listen"}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 w-fit">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  <span className="text-xs text-zinc-400 font-mono">Claude is thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="p-3 border-t border-zinc-800/60 bg-black/40 overflow-x-auto">
              <div className="flex items-center gap-2 whitespace-nowrap">
                {quickPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(p)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-purple-600/20 hover:border-purple-500/40 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white transition-all font-mono"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-zinc-800 bg-black/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`p-2.5 rounded-xl transition-all ${
                    isListening
                      ? "bg-red-600 text-white animate-pulse"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  }`}
                  title="Speak query into microphone"
                >
                  🎤
                </button>

                <input
                  type="text"
                  placeholder="Ask any question in simple words..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400 font-mono"
                />

                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={loading || !inputValue.trim()}
                  className="bg-purple-600 hover:bg-purple-500 px-4 py-2.5 text-xs font-bold"
                >
                  Send
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
