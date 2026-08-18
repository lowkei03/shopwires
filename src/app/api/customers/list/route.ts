import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get("merchantId");
    if (!merchantId) return NextResponse.json({ error: "merchantId required" }, { status: 400 });

    const admin = createAdminClient();
    const { data: customers } = await admin
      .from("customers")
      .select("id, phone, name, status, opted_in_at, last_visit, visit_count")
      .eq("merchant_id", merchantId)
      .order("opted_in_at", { ascending: false });

    return NextResponse.json({ customers: customers ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
