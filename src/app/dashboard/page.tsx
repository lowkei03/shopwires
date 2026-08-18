import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: merchant } = await supabase.from("merchants").select("*").eq("user_id", user.id).single();
  const { count: customerCount } = await supabase.from("customers")
    .select("*", { count: "exact", head: true }).eq("merchant_id", merchant?.id).eq("status", "active");
  const { count: messageCount } = await supabase.from("messages_log")
    .select("*", { count: "exact", head: true }).eq("merchant_id", merchant?.id);

  // Calculate trial days remaining
  let trialDaysLeft: number | null = null;
  if (merchant?.account_status === "trial" && merchant?.trial_ends_at) {
    const daysLeft = Math.ceil((new Date(merchant.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    trialDaysLeft = Math.max(0, daysLeft);
  }

  const stats = [
    { label: "Active customers", value: customerCount ?? 0 },
    { label: "Messages sent",    value: messageCount ?? 0 },
    { label: "Your keyword",     value: merchant?.keyword ?? "—" },
    { label: "Plan",             value: merchant?.plan ? merchant.plan.charAt(0).toUpperCase() + merchant.plan.slice(1) : "Trial" },
  ];

  const twilioMissing = !merchant?.twilio_account_sid;
  const planMissing   = !merchant?.plan;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">
        Welcome back{merchant?.shop_name ? `, ${merchant.shop_name}` : ""}
      </h1>
      <p className="text-slate-500 text-sm mb-6">Here&apos;s how your loyalty program is doing.</p>

      {/* Inactive account banner */}
      {merchant?.account_status === "inactive" && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-red-800">Your trial has ended</p>
            <p className="text-xs text-red-600 mt-0.5">Choose a plan to reactivate your account and keep your customers.</p>
          </div>
          <a href="/dashboard/billing" className="btn-primary text-xs px-4 py-2 bg-red-600 hover:bg-red-700">Choose a plan →</a>
        </div>
      )}

      {/* Trial banner */}
      {merchant?.account_status === "trial" && trialDaysLeft !== null && (
        <div className={`border rounded-lg px-4 py-3 mb-6 flex items-center justify-between ${
          trialDaysLeft <= 7 ? "bg-amber-50 border-amber-200" : "bg-brand-50 border-brand-200"}`}>
          <p className={`text-sm ${trialDaysLeft <= 7 ? "text-amber-700" : "text-brand-700"}`}>
            {trialDaysLeft === 0
              ? "⚠ Your trial ends today"
              : `🎁 Free trial — ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} remaining`}
          </p>
          <a href="/dashboard/billing" className={`text-xs font-medium hover:underline ${
            trialDaysLeft <= 7 ? "text-amber-700" : "text-brand-600"}`}>
            Choose a plan →
          </a>
        </div>
      )}
      {(twilioMissing || planMissing) && (
        <div className="space-y-2 mb-6">
          {twilioMissing && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between">
              <p className="text-sm text-amber-700">⚠ Twilio not connected — SMS opt-ins won&apos;t work yet</p>
              <a href="/dashboard/settings" className="text-xs text-amber-700 font-medium hover:underline">Set up →</a>
            </div>
          )}
          {planMissing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between">
              <p className="text-sm text-blue-700">💳 No billing plan — choose a plan to keep access after trial</p>
              <a href="/dashboard/billing" className="text-xs text-blue-700 font-medium hover:underline">Choose plan →</a>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold text-slate-900 mb-1">Your opt-in keyword</h2>
        <p className="text-slate-500 text-sm mb-4">Share this — customers text it to join your loyalty list.</p>
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex items-center gap-4">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Customers text</p>
            <p className="text-2xl font-bold text-brand-600 tracking-wide">{merchant?.keyword ?? "—"}</p>
          </div>
          {merchant?.twilio_phone_number && (
            <>
              <div className="text-slate-300 text-2xl">→</div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">To your number</p>
                <p className="text-lg font-semibold text-slate-700">{merchant.twilio_phone_number}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
