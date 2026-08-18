import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { emails, sendEmail } from "@/lib/emails";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  let sent = 0;

  // Get all merchants on trial with their user email
  const { data: merchants } = await admin
    .from("merchants")
    .select("id, shop_name, keyword, trial_ends_at, account_status, created_at")
    .eq("account_status", "trial")
    .not("trial_ends_at", "is", null);

  if (!merchants?.length) return NextResponse.json({ sent: 0 });

  for (const merchant of merchants) {
    // Get user email
    const { data: userData } = await admin.auth.admin.getUserById(merchant.id);
    // Actually need to join through auth.users via user_id
    const { data: merchantFull } = await admin
      .from("merchants")
      .select("user_id")
      .eq("id", merchant.id)
      .single();

    if (!merchantFull) continue;

    const { data: { user } } = await admin.auth.admin.getUserById(merchantFull.user_id);
    if (!user?.email) continue;

    const trialEnd = new Date(merchant.trial_ends_at);
    const createdAt = new Date(merchant.created_at);
    const daysSinceSignup = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const daysUntilEnd = Math.floor((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Get customer count
    const { count: customerCount } = await admin
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("merchant_id", merchant.id)
      .eq("status", "active");

    const count = customerCount ?? 0;

    // Day 0 — welcome (sent on signup via onboarding API, skip here)
    // Day 7 check-in
    if (daysSinceSignup === 7) {
      const email = emails.day7(merchant.shop_name, count);
      const ok = await sendEmail(user.email, email);
      if (ok) sent++;
    }

    // Day 23 — 7 days left warning
    if (daysUntilEnd === 7) {
      const email = emails.day23(merchant.shop_name, count);
      const ok = await sendEmail(user.email, email);
      if (ok) sent++;
    }

    // Day 28 — 2 days left warning
    if (daysUntilEnd === 2) {
      const email = emails.day28(merchant.shop_name, count);
      const ok = await sendEmail(user.email, email);
      if (ok) sent++;
    }

    // Day 30 — trial ended, mark inactive
    if (daysUntilEnd <= 0) {
      const email = emails.day30(merchant.shop_name, count);
      await sendEmail(user.email, email);
      await admin.from("merchants").update({ account_status: "inactive" }).eq("id", merchant.id);
      sent++;
    }
  }

  return NextResponse.json({ sent });
}
