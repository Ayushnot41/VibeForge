"use client";

import React, { useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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

const VALID_COUPONS: Record<string, number> = {
  MASTERY50: 50,
  GRIND35: 35,
  EXECUTION25: 25,
  MILESTONE10: 10,
  PRO50: 50,
  STARTUP20: 20,
};

function CheckoutContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const plan = (params.plan as string) || "pro";
  const billing = searchParams.get("billing") || "monthly";
  const queryPrice = searchParams.get("price");
  const queryCoupon = searchParams.get("coupon") || "";
  const queryDiscount = searchParams.get("discount") ? parseInt(searchParams.get("discount")!) : 0;
  
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<"card" | "upi" | "razorpay" | "gpay" | "phonepe" | "paytm">("razorpay");
  
  // Coupon state
  const [couponCode, setCouponCode] = useState(queryCoupon);
  const [appliedDiscount, setAppliedDiscount] = useState<number>(
    queryDiscount > 0
      ? queryDiscount
      : queryCoupon && VALID_COUPONS[queryCoupon.toUpperCase()]
      ? VALID_COUPONS[queryCoupon.toUpperCase()]
      : 0
  );
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(
    appliedDiscount > 0 ? `🎉 ${appliedDiscount}% Milestone Discount Applied!` : ""
  );

  const planNames: Record<string, string> = {
    pro: "VibeForge Pro",
    enterprise: "VibeForge Enterprise",
  };

  // Base pricing in INR (₹) per month
  const baseMonthlyPrices: Record<string, number> = {
    pro: 799,
    enterprise: 4999,
  };

  const baseYearlyPrices: Record<string, number> = {
    pro: 599,
    enterprise: 3999,
  };

  const isAnnual = billing === "yearly";
  const rawMonthlyRate = queryPrice
    ? parseFloat(queryPrice)
    : isAnnual
    ? baseYearlyPrices[plan] || 599
    : baseMonthlyPrices[plan] || 799;

  // Calculate discount
  const discountMultiplier = appliedDiscount > 0 ? (100 - appliedDiscount) / 100 : 1;
  const monthlyRate = Math.round(rawMonthlyRate * discountMultiplier);

  // Actual amount billed (annual charges 12 months upfront, monthly charges 1 month)
  const rawBilledAmount = isAnnual ? rawMonthlyRate * 12 : rawMonthlyRate;
  const billedAmount = isAnnual ? monthlyRate * 12 : monthlyRate;

  const name = planNames[plan] || "VibeForge Pro";

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setAppliedDiscount(0);
      return;
    }

    if (VALID_COUPONS[code]) {
      const disc = VALID_COUPONS[code];
      setAppliedDiscount(disc);
      setCouponSuccess(`🎉 Milestone Reward Applied: ${disc}% Discount Active!`);
    } else {
      setCouponError("Invalid coupon code. Complete Action Plan milestones to earn discounts!");
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // 1. Create order on our backend
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: billedAmount, currency: "INR" }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error?.description || "Failed to initialize payment");
      }

      // 2. Mock payment if using placeholder keys or demo mode
      const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const isDemoMode = data.isMock || !rzpKey || rzpKey === "rzp_test_placeholder";
      
      if (isDemoMode) {
        setTimeout(() => {
          alert(`[PAYMENT VERIFIED] Upgraded to ${name} (${isAnnual ? "Annual" : "Monthly"}) for ₹${billedAmount}! ${appliedDiscount > 0 ? `(${appliedDiscount}% Milestone Discount Applied)` : ""} Welcome to VibeForge Pro.`);
          router.push("/dashboard");
        }, 1200);
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

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: data.order.amount,
        currency: "INR",
        name: "VibeForge",
        description: `${name} - ${isAnnual ? "Annual" : "Monthly"} Billing`,
        order_id: data.order.id,
        handler: function (response: any) {
          alert(`Payment Successful! Transaction ID: ${response.razorpay_payment_id}`);
          router.push("/dashboard");
        },
        prefill: {
          name: "VibeForge User",
          email: "ayush@vibeforge.ai",
          contact: "9999999999",
        },
        theme: {
          color: "#7C3AED",
        },
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
    <div className="min-h-screen bg-[#05050A] flex flex-col items-center justify-center p-6 text-white font-[var(--font-body)]">
      <div className="absolute top-8 left-8">
        <Button variant="ghost" size="sm" onClick={() => router.push("/pricing")}>
          ← Back to Pricing
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-[rgba(15,15,22,0.85)] backdrop-blur-2xl border border-white/15 rounded-3xl p-8 sm:p-10 shadow-[0_0_60px_rgba(124,58,237,0.25)]"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black font-[var(--font-heading)] mb-2">Upgrade Order Summary</h1>
          <p className="text-white/60 text-sm">Review your selected subscription tier (INR)</p>
        </div>

        {/* Selected Plan Details Card */}
        <div className="bg-black/60 rounded-2xl p-6 mb-6 border border-white/10 shadow-inner">
          <div className="flex justify-between items-start mb-4 pb-4 border-b border-white/10">
            <div>
              <h3 className="font-bold text-xl text-white flex items-center gap-2">
                {name}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--accent-purple)]/20 text-[var(--accent-purple)] border border-[var(--accent-purple)]/30 font-semibold uppercase">
                  {isAnnual ? "Annual (Save 25%)" : "Monthly"}
                </span>
              </h3>
              <p className="text-white/50 text-xs mt-1">
                {appliedDiscount > 0 ? (
                  <>
                    <span className="line-through text-white/30 mr-1.5">₹{rawMonthlyRate}/mo</span>
                    <span className="text-emerald-400 font-bold">₹{monthlyRate}/mo</span>
                    {isAnnual ? " billed annually" : " billed monthly"}
                  </>
                ) : (
                  isAnnual ? `₹${monthlyRate}/mo billed annually` : `₹${monthlyRate}/mo billed monthly`
                )}
              </p>
            </div>
            <div className="text-right">
              {appliedDiscount > 0 && (
                <div className="text-xs line-through text-white/40">₹{rawBilledAmount.toLocaleString("en-IN")}</div>
              )}
              <div className="text-3xl font-black text-emerald-400">₹{billedAmount.toLocaleString("en-IN")}</div>
              <span className="text-[11px] text-white/50 uppercase font-semibold">Total Due Now</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span> Unlimited parallel AI future simulations
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span> 4K Ultra-HD Visual Hologram generation
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span> 120-Week Action Protocol & 3D Interactive Timeline
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span> Milestone Completion Discount Rewards Engine
            </div>
          </div>
        </div>

        {/* Milestone Coupon Input */}
        <form onSubmit={handleApplyCoupon} className="mb-8 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎁</span> Milestone Reward / Coupon
            </span>
            {appliedDiscount > 0 && (
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                -{appliedDiscount}% OFF
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. MASTERY50, EXECUTION25"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="flex-1 bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500 uppercase font-mono"
            />
            <Button variant="secondary" size="sm" type="submit">
              Apply
            </Button>
          </div>
          {couponSuccess && (
            <p className="text-emerald-400 text-xs font-semibold mt-2">{couponSuccess}</p>
          )}
          {couponError && (
            <p className="text-rose-400 text-xs font-semibold mt-2">{couponError}</p>
          )}
        </form>

        {/* Payment Method Selector */}
        <div className="space-y-3 mb-8">
          <h3 className="font-bold text-sm text-white/90 uppercase tracking-wider mb-2">Select Payment Method (India)</h3>
          
          <button 
            onClick={() => setMethod("gpay")}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${method === "gpay" ? "border-[var(--accent-purple)] bg-[var(--accent-purple)]/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "border-white/10 bg-transparent hover:bg-white/5"}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 flex justify-center"><GPayIcon /></div>
              <span className="font-semibold text-sm">Google Pay UPI</span>
            </div>
            {method === "gpay" && <div className="w-4 h-4 rounded-full bg-[var(--accent-purple)]" />}
          </button>

          <button 
            onClick={() => setMethod("phonepe")}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${method === "phonepe" ? "border-[var(--accent-purple)] bg-[var(--accent-purple)]/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "border-white/10 bg-transparent hover:bg-white/5"}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 flex justify-center"><PhonePeIcon /></div>
              <span className="font-semibold text-sm">PhonePe UPI</span>
            </div>
            {method === "phonepe" && <div className="w-4 h-4 rounded-full bg-[var(--accent-purple)]" />}
          </button>

          <button 
            onClick={() => setMethod("paytm")}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${method === "paytm" ? "border-[var(--accent-purple)] bg-[var(--accent-purple)]/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "border-white/10 bg-transparent hover:bg-white/5"}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 flex justify-center bg-white rounded-md px-1 py-1"><PaytmIcon /></div>
              <span className="font-semibold text-sm">Paytm UPI / Wallet</span>
            </div>
            {method === "paytm" && <div className="w-4 h-4 rounded-full bg-[var(--accent-purple)]" />}
          </button>

          <button 
            onClick={() => setMethod("upi")}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${method === "upi" ? "border-[var(--accent-purple)] bg-[var(--accent-purple)]/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "border-white/10 bg-transparent hover:bg-white/5"}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 flex justify-center"><UpiIcon /></div>
              <span className="font-semibold text-sm">Any UPI App / ID (BHIM, CRED, Navi)</span>
            </div>
            {method === "upi" && <div className="w-4 h-4 rounded-full bg-[var(--accent-purple)]" />}
          </button>

          <button 
            onClick={() => setMethod("card")}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${method === "card" ? "border-[var(--accent-purple)] bg-[var(--accent-purple)]/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "border-white/10 bg-transparent hover:bg-white/5"}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 flex justify-center"><CardIcon /></div>
              <span className="font-semibold text-sm">Credit / Debit Cards / Net Banking</span>
            </div>
            {method === "card" && <div className="w-4 h-4 rounded-full bg-[var(--accent-purple)]" />}
          </button>
        </div>

        {/* Razorpay Secure Gateway Button */}
        <Button 
          variant="primary" 
          size="lg" 
          className="w-full text-base font-bold py-4 shadow-[0_0_30px_rgba(124,58,237,0.4)]"
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Securing Razorpay Session...
            </span>
          ) : (
            `Pay ₹${billedAmount.toLocaleString("en-IN")} & Unlock ${name}`
          )}
        </Button>

        <p className="text-center text-[11px] text-white/40 mt-4">
          🔒 256-Bit SSL Encrypted • Instant Activation • Cancel anytime from dashboard
        </p>
      </motion.div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#05050A] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
