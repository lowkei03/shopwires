import { NextRequest, NextResponse } from "next/server";

const PRICE_MAP: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  growth:  process.env.STRIPE_PRICE_GROWTH!,
  pro:     process.env.STRIPE_PRICE_PRO!,
};

export async function POST(req: NextRequest) {
  try {
    const { planId, merchantId } = await req.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured yet" }, { status: 400 });
    }

    const priceId = PRICE_MAP[planId];
    if (!priceId || priceId === "price_xxx") {
      return NextResponse.json({ error: "Stripe price not configured yet" }, { status: 400 });
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();

    const { data: merchant } = await supabase.from("merchants").select("*").eq("id", merchantId).single();
    if (!merchant) return NextResponse.json({ error: "Merchant not found" }, { status: 404 });

    let customerId = merchant.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ metadata: { merchant_id: merchantId } });
      customerId = customer.id;
      await supabase.from("merchants").update({ stripe_customer_id: customerId }).eq("id", merchantId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
      metadata: { merchant_id: merchantId, plan_id: planId },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Stripe error" }, { status: 500 });
  }
}
