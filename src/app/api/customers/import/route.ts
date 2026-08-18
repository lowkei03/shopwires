import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { rows, merchantId } = await req.json();
    if (!merchantId) return NextResponse.json({ error: "Merchant ID required" }, { status: 400 });
    if (!Array.isArray(rows) || rows.length === 0) return NextResponse.json({ added: 0, skipped: 0 });

    const admin = createAdminClient();
    let added = 0;
    let skipped = 0;

    for (const row of rows) {
      const { error } = await admin.from("customers").insert({
        merchant_id: merchantId,
        phone: row.phone,
        name: row.name || null,
        status: "active",
        opted_in_at: new Date().toISOString(),
        visit_count: 0,
      });
      if (error) skipped++;
      else added++;
    }

    return NextResponse.json({ added, skipped });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
