import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { campaignId, merchantId } = await req.json();
    if (!campaignId || !merchantId) return NextResponse.json({ error: "Missing params" }, { status: 400 });

    const admin = createAdminClient();

    // Get campaign
    const { data: campaign } = await admin.from("campaigns")
      .select("*").eq("id", campaignId).eq("merchant_id", merchantId).single();
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    // Get merchant Twilio credentials
    const { data: merchant } = await admin.from("merchants")
      .select("twilio_account_sid, twilio_auth_token, twilio_phone_number, shop_name")
      .eq("id", merchantId).single();
    if (!merchant?.twilio_account_sid) return NextResponse.json({ error: "Twilio not configured" }, { status: 400 });

    // Get active customers
    const { data: customers } = await admin.from("customers")
      .select("id, phone, name").eq("merchant_id", merchantId).eq("status", "active");
    if (!customers?.length) return NextResponse.json({ sent: 0 });

    const twilio = (await import("twilio")).default;
    const client = twilio(merchant.twilio_account_sid, merchant.twilio_auth_token);

    let sent = 0;
    for (const customer of customers) {
      try {
        // Replace {name} placeholder and append mandatory opt-out suffix
        const OPT_OUT = " Reply STOP to opt out.";
        const body = campaign.message_body.replace(/\{name\}/gi, customer.name ?? "friend") + OPT_OUT;

        const msg = await client.messages.create({
          to: customer.phone,
          from: merchant.twilio_phone_number,
          body,
        });

        await admin.from("messages_log").insert({
          merchant_id: merchantId,
          customer_id: customer.id,
          direction: "outbound",
          body,
          twilio_message_sid: msg.sid,
          status: "sent",
          sent_at: new Date().toISOString(),
        });

        sent++;
      } catch {
        // Continue on individual send failure
      }
    }

    return NextResponse.json({ sent });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
