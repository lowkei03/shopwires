import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const OPT_OUT = " Reply STOP to opt out.";
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  // Match birthday stored as 2000-MM-DD
  const birthdayPattern = `2000-${mm}-${dd}`;

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
    // Get active birthday campaigns
    const { data: campaigns } = await admin
      .from("campaigns")
      .select("*")
      .eq("merchant_id", merchant.id)
      .eq("type", "birthday")
      .eq("active", true);

    if (!campaigns?.length) continue;

    // Find customers whose birthday matches today
    const { data: customers } = await admin
      .from("customers")
      .select("id, phone, name, birthday")
      .eq("merchant_id", merchant.id)
      .eq("status", "active")
      .eq("birthday", birthdayPattern);

    if (!customers?.length) continue;

    const twilio = (await import("twilio")).default;
    const client = twilio(merchant.twilio_account_sid, merchant.twilio_auth_token);

    for (const campaign of campaigns) {
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
