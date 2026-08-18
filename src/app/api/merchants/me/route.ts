import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data: merchant } = await admin
      .from("merchants").select("id").eq("user_id", userId).single();

    if (!merchant) return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    return NextResponse.json({ merchantId: merchant.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
