import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = "INR", receipt } = await req.json();

    // If Razorpay keys are missing, placeholder, or unconfigured, return a mock order for seamless test checkout
    const hasKeys = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_ID !== "rzp_test_placeholder";

    if (!hasKeys) {
      return NextResponse.json({
        order: {
          id: "order_mock_" + Date.now(),
          amount: (amount || 0) * 100,
          currency: currency || "INR",
        },
        isMock: true,
        message: "Demo checkout mode active (no live Razorpay credentials configured)."
      }, { status: 200 });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const options = {
      amount: (amount || 0) * 100, // Razorpay works in smallest currency unit (paise)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);
    return NextResponse.json({ order, isMock: false }, { status: 200 });
  } catch (error: unknown) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create Razorpay order." },
      { status: 500 }
    );
  }
}
