import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { emails, sendEmail } from "@/lib/emails";

export async function POST(req: NextRequest) {
  try {
    const { merchantId } = await req.json();
    if (!merchantId) return NextResponse.json({ error: "Missing merchantId" }, { status: 400 });

    const admin = createAdminClient();
    const { data: merchant } = await admin
      .from("merchants").select("user_id, shop_name, keyword").eq("id", merchantId).single();
    if (!merchant) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: { user } } = await admin.auth.admin.getUserById(merchant.user_id);
    if (!user?.email) return NextResponse.json({ ok: true });

    const welcomeEmail = emails.welcome(merchant.shop_name, merchant.keyword);
    await sendEmail(user.email, welcomeEmail);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
