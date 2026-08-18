import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Vercel cron calls this daily — protected by CRON_SECRET
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const OPT_OUT = " Reply STOP to opt out.";
  let totalSent = 0;
  let totalErrors = 0;

  // Get all merchants with Twilio configured
  const { data: merchants } = await admin
    .from("merchants")
    .select("id, shop_name, twilio_account_sid, twilio_auth_token, twilio_phone_number")
    .not("twilio_account_sid", "is", null)
    .not("twilio_phone_number", "is", null);

  if (!merchants?.length) return NextResponse.json({ sent: 0, errors: 0 });

  for (const merchant of merchants) {
    // Get active win-back campaigns for this merchant
    const { data: campaigns } = await admin
      .from("campaigns")
      .select("*")
      .eq("merchant_id", merchant.id)
      .eq("type", "winback")
      .eq("active", true);

    if (!campaigns?.length) continue;

    const twilio = (await import("twilio")).default;
    const client = twilio(merchant.twilio_account_sid, merchant.twilio_auth_token);

    for (const campaign of campaigns) {
      const daysInactive = campaign.trigger_rules?.days_inactive ?? 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

      // Find active customers whose last_visit is before the cutoff
      // or who have never visited but opted in before the cutoff
      const { data: customers } = await admin
        .from("customers")
        .select("id, phone, name, last_visit, opted_in_at")
        .eq("merchant_id", merchant.id)
        .eq("status", "active")
        .or(`last_visit.lt.${cutoffDate.toISOString()},and(last_visit.is.null,opted_in_at.lt.${cutoffDate.toISOString()})`);

      if (!customers?.length) continue;

      for (const customer of customers) {
        try {
          const body = campaign.message_body.replace(/\{name\}/gi, customer.name ?? "friend") + OPT_OUT;

          const msg = await client.messages.create({
            to: customer.phone,
            from: merchant.twilio_phone_number,
            body,
          });

          await admin.from("messages_log").insert({
            merchant_id: merchant.id,
            customer_id: customer.id,
            direction: "outbound",
            body,
            twilio_message_sid: msg.sid,
            status: "sent",
            sent_at: new Date().toISOString(),
          });

          totalSent++;
        } catch {
          totalErrors++;
        }
      }
    }
  }

  return NextResponse.json({ sent: totalSent, errors: totalErrors });
}
