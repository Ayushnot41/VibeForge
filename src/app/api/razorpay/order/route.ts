import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = "INR", receipt } = await req.json();

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Razorpay keys are not configured in the environment." },
        { status: 500 }
      );
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100, // Razorpay works in smallest currency unit (paise)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    // If using the placeholder test key, mock the order creation to prevent 401 errors
    if (process.env.RAZORPAY_KEY_ID === "rzp_test_placeholder") {
      return NextResponse.json({
        order: {
          id: "order_dummy_" + Date.now(),
          amount: options.amount,
          currency: options.currency,
        }
      }, { status: 200 });
    }

    const order = await instance.orders.create(options);
    return NextResponse.json({ order }, { status: 200 });
  } catch (error: unknown) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create Razorpay order." },
      { status: 500 }
    );
  }
}
