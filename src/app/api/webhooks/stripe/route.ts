import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const { createAdminClient } = await import("@/lib/supabase/admin");

    const body = await req.text();
    const sig  = req.headers.get("stripe-signature");

    let event: any;

    // Try signature verification if secret is configured
    if (sig && process.env.STRIPE_WEBHOOK_SECRET) {
      try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
      } catch {
        // Signature failed — try parsing as plain JSON (Event Destinations v2 format)
        event = JSON.parse(body);
      }
    } else {
      event = JSON.parse(body);
    }

    const supabase = createAdminClient();

    // Handle both v1 and v2 event formats
    const eventType = event.type;
    const eventData = event.data?.object ?? event.data;

    if (eventType === "checkout.session.completed") {
      const session = eventData;
      const merchantId = session.metadata?.merchant_id;
      const planId     = session.metadata?.plan_id;
      if (merchantId && planId) {
        await supabase.from("merchants").update({
          plan: planId,
          stripe_subscription_id: session.subscription ?? null,
          onboarding_step: 5,
        }).eq("id", merchantId);
      }
    }

    if (eventType === "customer.subscription.deleted") {
      const sub = eventData;
      await supabase.from("merchants").update({ plan: null, stripe_subscription_id: null })
        .eq("stripe_subscription_id", sub.id);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
