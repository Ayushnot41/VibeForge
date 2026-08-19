"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

// Add Razorpay window type
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Payment SVG Icons
const GPayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.3c-.2 1.4-.9 2.5-2 3.3v2.7h3.3c1.9-1.8 3-4.4 3-7z" fill="#4285F4"/>
    <path d="M12 21.9c2.7 0 4.9-.9 6.5-2.4l-3.3-2.7c-.9.6-2 .9-3.2.9-2.5 0-4.5-1.7-5.3-3.9H3.4v2.8c1.6 3.1 4.8 5.3 8.6 5.3z" fill="#34A853"/>
    <path d="M6.7 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.4H3.4C2.7 8.8 2.3 10.4 2.3 12s.4 3.2 1.1 4.6l3.3-2.8z" fill="#FBBC05"/>
    <path d="M12 6.5c1.4 0 2.7.5 3.7 1.5l2.8-2.8C16.9 3.6 14.6 2.6 12 2.6c-3.8 0-7 2.1-8.6 5.3l3.3 2.8c.8-2.2 2.8-4.2 5.3-4.2z" fill="#EA4335"/>
  </svg>
);

const PhonePeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#5f259f"/>
    <path d="M16.5 12.5c0 1.2-.8 2.2-2 2.4l-1.5.2v2.9h-2v-3l-2.5-.2v-2h2.5v-3.5c0-1.8 1.2-3.3 3-3.3h1v2h-1c-.8 0-1.5.7-1.5 1.5v3.3l1.5-.2c1.2-.1 2 .8 2 2v.2l.5-.3v-.5z" fill="#fff"/>
  </svg>
);

const PaytmIcon = () => (
  <svg width="40" height="16" viewBox="0 0 40 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 14V2h3.5c1.5 0 2.5.3 3.3 1s1.1 1.7 1.1 2.8c0 1.1-.4 2.1-1.1 2.8-.8.7-1.8 1-3.3 1H6v4.4H4zM6 7.6h1.5c.8 0 1.4-.2 1.8-.6.4-.4.6-1 .6-1.5 0-.6-.2-1.1-.6-1.5-.4-.4-1-.6-1.8-.6H6v4.2z" fill="#00b9f5"/>
    <path d="M14.5 14v-9h1.9v1.2c.4-.5.9-.9 1.4-1.1.5-.2 1.1-.3 1.7-.3 1.3 0 2.3.4 3 1.2.7.8 1.1 1.9 1.1 3.2 0 1.3-.4 2.4-1.1 3.2-.7.8-1.7 1.2-3 1.2-.6 0-1.2-.1-1.7-.3-.5-.2-1-.6-1.4-1V14h-1.9zm4-1.6c.9 0 1.5-.3 2-.8.4-.5.7-1.3.7-2.3s-.2-1.8-.7-2.3c-.5-.5-1.1-.8-2-.8s-1.5.3-2 .8c-.4.5-.7 1.3-.7 2.3s.2 1.8.7 2.3c.5.5 1.1.8 2 .8z" fill="#002e6e"/>
  </svg>
);

const UpiIcon = () => (
  <svg width="30" height="12" viewBox="0 0 30 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h2.5v7.5C2.5 9.4 3.6 10.5 5 10.5s2.5-1.1 2.5-2.5V0H10v7.5C10 10.5 7.8 12.5 5 12.5S0 10.5 0 7.5V0z" fill="#2d2d2d" className="fill-white"/>
    <path d="M12.5 0H18c2.8 0 5 2.2 5 5 0 2.4-1.7 4.4-4 4.9v2.6h-2.5V10H15v2.5h-2.5V0zm2.5 7.5h3c1.4 0 2.5-1.1 2.5-2.5S19.4 2.5 18 2.5h-3v5z" fill="#2d2d2d" className="fill-white"/>
    <path d="M25 0h2.5v12.5H25V0z" fill="#2d2d2d" className="fill-white"/>
  </svg>
);

const CardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const plan = params.plan as string;
  
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<"card" | "upi" | "razorpay" | "gpay" | "phonepe" | "paytm">("razorpay");

  const planNames: Record<string, string> = {
    pro: "Pro Subscription",
    enterprise: "Enterprise Access"
  };

  const planPrices: Record<string, number> = {
    pro: 2900, // $29
    enterprise: 9900 // $99
  };

  const name = planNames[plan] || "Subscription";
  const price = planPrices[plan] || 2900;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // 1. Create order on our backend
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: price, currency: "USD" }), // Razorpay expects amount in smallest currency unit, backend handles this
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error?.description || "Failed to initialize payment");
      }

      // 2. Mock payment if using placeholder keys
      const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder";
      
      if (rzpKey === "rzp_test_placeholder" || rzpKey === "") {
        console.warn("Using Razorpay Placeholder. Mocking successful payment in 2 seconds...");
        setTimeout(() => {
          alert(`[MOCK SUCCESS] Payment Completed via ${method.toUpperCase()}! Please add real NEXT_PUBLIC_RAZORPAY_KEY_ID to .env.local to process real payments.`);
          router.push("/dashboard");
        }, 2000);
        return;
      }

      // 3. Load Razorpay script dynamically if not loaded
      if (!window.Razorpay) {
        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      // 3. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: data.order.amount,
        currency: data.order.currency,
        name: "VibeForge",
        description: name,
        order_id: data.order.id,
        handler: function (response: any) {
          alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
          router.push("/dashboard");
        },
        prefill: {
          name: "User",
          email: "user@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#7C3AED" // VibeForge Violet
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay using UPI App",
                instruments: [{ method: "upi" }]
              },
              card: {
                name: "Pay using Card",
                instruments: [{ method: "card" }]
              }
            },
            sequence: ["upi", "card"].includes(method) || method === "gpay" || method === "phonepe" || method === "paytm" 
              ? ["block.upi", "block.card"] 
              : ["block.card", "block.upi"],
            preferences: { show_default_blocks: true }
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (error: any) {
      console.error(error);
      alert(error.message || "Payment gateway is currently offline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-white font-[var(--font-body)]">
      <div className="absolute top-8 left-8">
        <Button variant="ghost" onClick={() => router.push("/pricing")}>
          ← Back to Pricing
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-[#0A0A0F] border border-white/10 rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold font-[var(--font-heading)] mb-2">Complete Your Purchase</h1>
          <p className="text-white/60">You are upgrading to the <span className="text-[#7C3AED] font-bold">{name}</span></p>
        </div>

        <div className="bg-black/50 rounded-xl p-6 mb-8 flex justify-between items-center border border-white/5">
          <div>
            <h3 className="font-bold text-lg">{name}</h3>
            <p className="text-white/50 text-sm">Billed instantly</p>
          </div>
          <div className="text-2xl font-bold">${price / 100}</div>
        </div>

        <div className="space-y-4 mb-8">
          <h3 className="font-bold mb-4">Select Payment Method</h3>
          
          <button 
            onClick={() => setMethod("gpay")}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${method === "gpay" ? "border-[#7C3AED] bg-[#7C3AED]/10" : "border-white/10 bg-transparent hover:bg-white/5"}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 flex justify-center"><GPayIcon /></div>
              <span className="font-medium">Google Pay</span>
            </div>
            {method === "gpay" && <div className="w-4 h-4 rounded-full bg-[#7C3AED]" />}
          </button>

          <button 
            onClick={() => setMethod("phonepe")}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${method === "phonepe" ? "border-[#7C3AED] bg-[#7C3AED]/10" : "border-white/10 bg-transparent hover:bg-white/5"}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 flex justify-center"><PhonePeIcon /></div>
              <span className="font-medium">PhonePe</span>
            </div>
            {method === "phonepe" && <div className="w-4 h-4 rounded-full bg-[#7C3AED]" />}
          </button>

          <button 
            onClick={() => setMethod("paytm")}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${method === "paytm" ? "border-[#7C3AED] bg-[#7C3AED]/10" : "border-white/10 bg-transparent hover:bg-white/5"}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 flex justify-center bg-white rounded-md px-1 py-1"><PaytmIcon /></div>
              <span className="font-medium">Paytm</span>
            </div>
            {method === "paytm" && <div className="w-4 h-4 rounded-full bg-[#7C3AED]" />}
          </button>

          <button 
            onClick={() => setMethod("upi")}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${method === "upi" ? "border-[#7C3AED] bg-[#7C3AED]/10" : "border-white/10 bg-transparent hover:bg-white/5"}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 flex justify-center"><UpiIcon /></div>
              <span className="font-medium">Other UPI Apps / QR</span>
            </div>
            {method === "upi" && <div className="w-4 h-4 rounded-full bg-[#7C3AED]" />}
          </button>

          <button 
            onClick={() => setMethod("card")}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${method === "card" ? "border-[#7C3AED] bg-[#7C3AED]/10" : "border-white/10 bg-transparent hover:bg-white/5"}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 flex justify-center"><CardIcon /></div>
              <span className="font-medium">Credit / Debit Card</span>
            </div>
            {method === "card" && <div className="w-4 h-4 rounded-full bg-[#7C3AED]" />}
          </button>
        </div>

        <Button 
          variant="primary" 
          size="lg" 
          className="w-full text-lg py-6"
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? "Initializing Secure Checkout..." : `Pay $${price / 100} Securely`}
        </Button>
        <p className="text-center text-white/40 text-xs mt-4">
          Secured by Razorpay. 256-bit encryption.
        </p>
      </motion.div>
    </div>
  );
}
