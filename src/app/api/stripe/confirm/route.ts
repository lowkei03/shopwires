import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
    }

    const { sessionId, merchantId } = await req.json();
    if (!sessionId || !merchantId) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    // Retrieve the checkout session from Stripe to verify it
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const planId = session.metadata?.plan_id;
    const verifiedMerchantId = session.metadata?.merchant_id;

    // Security check — make sure the session belongs to this merchant
    if (verifiedMerchantId !== merchantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!planId) {
      return NextResponse.json({ error: "No plan in session" }, { status: 400 });
    }

    const admin = createAdminClient();
    await admin.from("merchants").update({
      plan: planId,
      stripe_subscription_id: session.subscription as string ?? null,
      onboarding_step: 5,
    }).eq("id", merchantId);

    return NextResponse.json({ plan: planId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
