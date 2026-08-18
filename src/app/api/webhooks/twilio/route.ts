import { NextRequest, NextResponse } from "next/server";

const XML = new NextResponse(`<?xml version="1.0"?><Response></Response>`, {
  headers: { "Content-Type": "text/xml" },
});

// Detect if a message looks like a birthday MMDD or MM/DD or MM-DD
function parseBirthday(msg: string): string | null {
  const clean = msg.replace(/\D/g, "");
  if (clean.length === 4) {
    const mm = parseInt(clean.slice(0, 2));
    const dd = parseInt(clean.slice(2, 4));
    if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      return `2000-${clean.slice(0,2)}-${clean.slice(2,4)}`;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const twilio = (await import("twilio")).default;

    const body   = await req.text();
    const params = new URLSearchParams(body);
    const from   = params.get("From") ?? "";
    const to     = params.get("To") ?? "";
    const msg    = (params.get("Body") ?? "").trim().toUpperCase();

    const supabase = createAdminClient();
    const { data: merchant } = await supabase
      .from("merchants").select("*").eq("twilio_phone_number", to).single();
    if (!merchant) return XML;

    const client = twilio(merchant.twilio_account_sid, merchant.twilio_auth_token);

    // Handle STOP
    if (msg === "STOP") {
      await supabase.from("customers").update({ status: "unsubscribed" })
        .eq("merchant_id", merchant.id).eq("phone", from);
      return XML;
    }

    // Handle HELP
    if (msg === "HELP") {
      await client.messages.create({
        to: from, from: to,
        body: `${merchant.shop_name} loyalty alerts. Text STOP to unsubscribe. Contact: ${merchant.phone}`,
      });
      return XML;
    }

    // Handle keyword opt-in
    if (msg === merchant.keyword.toUpperCase()) {
      const now = new Date().toISOString();
      const { data: existing } = await supabase.from("customers")
        .select("id, status, visit_count").eq("merchant_id", merchant.id).eq("phone", from).single();

      if (!existing) {
        await supabase.from("customers").insert({
          merchant_id: merchant.id, phone: from, status: "active",
          opted_in_at: now, last_visit: now, visit_count: 1,
        });
      } else if (existing.status === "unsubscribed") {
        await supabase.from("customers")
          .update({ status: "active", opted_in_at: now, last_visit: now, visit_count: (existing.visit_count ?? 0) + 1 })
          .eq("id", existing.id);
      } else {
        // Existing active customer re-texting keyword = another visit
        await supabase.from("customers")
          .update({ last_visit: now, visit_count: (existing.visit_count ?? 0) + 1 })
          .eq("id", existing.id);
      }

      await supabase.from("messages_log").insert({
        merchant_id: merchant.id, direction: "inbound", body: msg,
        status: "received", sent_at: new Date().toISOString(),
      });

      const reply = await client.messages.create({
        to: from, from: to,
        body: `Welcome to ${merchant.shop_name}! You're on our VIP list 🎉 Reply with your birthday in MMDD format (example: 0415 for April 15) to get a special gift on your big day! Reply STOP to opt out.`,
      });

      await supabase.from("messages_log").insert({
        merchant_id: merchant.id, direction: "outbound",
        body: `Welcome to ${merchant.shop_name}!`,
        twilio_message_sid: reply.sid, status: "sent", sent_at: new Date().toISOString(),
      });

      return XML;
    }

    // Handle birthday reply — any 4-digit MMDD from an existing customer
    const birthday = parseBirthday(msg);
    if (birthday) {
      const { data: customer } = await supabase.from("customers")
        .select("id, name, birthday").eq("merchant_id", merchant.id).eq("phone", from).single();

      if (customer && !customer.birthday) {
        await supabase.from("customers").update({ birthday }).eq("id", customer.id);

        const reply = await client.messages.create({
          to: from, from: to,
          body: `Thanks! We've got your birthday saved. Expect something special from ${merchant.shop_name} on your big day! 🎂`,
        });

        await supabase.from("messages_log").insert({
          merchant_id: merchant.id, direction: "outbound",
          body: `Thanks! We've got your birthday saved.`,
          twilio_message_sid: reply.sid, status: "sent", sent_at: new Date().toISOString(),
        });
      }
      return XML;
    }

    return XML;
  } catch {
    return XML;
  }
}
