import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
    }

    const { merchantId } = await req.json();
    if (!merchantId) return NextResponse.json({ error: "Merchant ID required" }, { status: 400 });

    const admin = createAdminClient();
    const { data: merchant } = await admin
      .from("merchants").select("stripe_customer_id").eq("id", merchantId).single();

    if (!merchant?.stripe_customer_id) {
      return NextResponse.json({ error: "No billing account found. Choose a plan first." }, { status: 400 });
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const session = await stripe.billingPortal.sessions.create({
      customer: merchant.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
