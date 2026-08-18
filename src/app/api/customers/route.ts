import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { phone, name, merchantId } = await req.json();
    if (!merchantId) return NextResponse.json({ error: "Merchant ID required" }, { status: 400 });
    if (!phone) return NextResponse.json({ error: "Phone number required" }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin.from("customers").insert({
      merchant_id: merchantId,
      phone,
      name: name || null,
      status: "active",
      opted_in_at: new Date().toISOString(),
      visit_count: 0,
    });

    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "That phone number is already in your list." }, { status: 409 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ added: 1, skipped: 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
