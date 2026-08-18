"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Campaign = {
  id: string;
  name: string;
  type: string;
  trigger_rules: any;
  message_body: string;
  active: boolean;
  created_at: string;
};

type CampaignType = "broadcast" | "winback" | "scheduled" | "birthday";

const TYPE_INFO: Record<CampaignType, { label: string; icon: string; desc: string }> = {
  broadcast: { label: "Broadcast",  icon: "📢", desc: "Send to all active customers right now" },
  winback:   { label: "Win-back",   icon: "🔄", desc: "Auto-sends to customers who haven't visited in X days" },
  scheduled: { label: "Scheduled",  icon: "🗓️", desc: "Send a message at a specific date and time" },
  birthday:  { label: "Birthday",   icon: "🎂", desc: "Auto-sends on each customer's birthday" },
};

export default function CampaignsPage() {
  const [mid, setMid] = useState<string | null>(null);
  const [twilio, setTwilio] = useState<{ sid: string; token: string; phone: string } | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showing, setShowing] = useState<"list" | "create" | "send">("list");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [sending, setSending] = useState<string | null>(null);

  // Create form
  const [cType, setCType] = useState<CampaignType>("broadcast");
  const [cName, setCName] = useState("");
  const [cMsg, setCMsg] = useState("");
  const [cDays, setCDays] = useState("30");
  const [cDate, setCDate] = useState("");
  const [cTime, setCTime] = useState("");
  const [saving, setSaving] = useState(false);

  // Broadcast send modal
  const [sendCampaign, setSendCampaign] = useState<Campaign | null>(null);
  const [customerCount, setCustomerCount] = useState(0);
  const [sendConfirm, setSendConfirm] = useState(false);

  function flash(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: merchant } = await supabase
      .from("merchants").select("id, twilio_account_sid, twilio_auth_token, twilio_phone_number")
      .eq("user_id", user.id).single();
    if (!merchant) { setLoading(false); return; }
    setMid(merchant.id);
    if (merchant.twilio_account_sid) {
      setTwilio({ sid: merchant.twilio_account_sid, token: merchant.twilio_auth_token, phone: merchant.twilio_phone_number });
    }

    const { data: camps } = await supabase
      .from("campaigns").select("*").eq("merchant_id", merchant.id).order("created_at", { ascending: false });
    setCampaigns(camps ?? []);

    const { count } = await supabase.from("customers")
      .select("*", { count: "exact", head: true }).eq("merchant_id", merchant.id).eq("status", "active");
    setCustomerCount(count ?? 0);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createCampaign() {
    if (!mid) return;
    if (!cName.trim()) { flash("Campaign name is required.", false); return; }
    if (!cMsg.trim()) { flash("Message body is required.", false); return; }
    if (overLimit) { flash(`Message is too long — keep it under ${MAX_CHARS - OPT_OUT.length} characters.`, false); return; }
    if (cType === "winback" && (!cDays || parseInt(cDays) < 1)) { flash("Enter a valid number of days.", false); return; }
    if (cType === "scheduled" && (!cDate || !cTime)) { flash("Select a date and time.", false); return; }

    setSaving(true);
    const supabase = createClient();

    const trigger_rules: any = {};
    if (cType === "winback") trigger_rules.days_inactive = parseInt(cDays);
    if (cType === "scheduled") trigger_rules.send_at = `${cDate}T${cTime}`;

    const { error } = await supabase.from("campaigns").insert({
      merchant_id: mid,
      name: cName.trim(),
      type: cType,
      trigger_rules,
      message_body: cMsg.trim(),
      active: cType !== "broadcast", // broadcast starts inactive (must be manually sent)
    });

    setSaving(false);
    if (error) { flash(error.message, false); return; }
    setCName(""); setCMsg(""); setCDays("30"); setCDate(""); setCTime("");
    setShowing("list");
    flash("Campaign created.");
    load();
  }

  async function toggleActive(camp: Campaign) {
    const supabase = createClient();
    await supabase.from("campaigns").update({ active: !camp.active }).eq("id", camp.id);
    load();
  }

  async function deleteCampaign(id: string) {
    const supabase = createClient();
    await supabase.from("campaigns").delete().eq("id", id);
    flash("Campaign deleted.");
    load();
  }

  async function sendBroadcast(camp: Campaign) {
    if (!twilio) { flash("Connect Twilio in Settings first.", false); return; }
    setSending(camp.id);
    setSendConfirm(false);
    setSendCampaign(null);

    const res = await fetch("/api/campaigns/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId: camp.id, merchantId: mid }),
    });
    const result = await res.json();
    setSending(null);

    if (result.error) flash(result.error, false);
    else flash(`✓ Sent to ${result.sent} customers.`);
  }

  const OPT_OUT = " Reply STOP to opt out.";
  const MAX_CHARS = 160;
  const charCount = cMsg.length + OPT_OUT.length;
  const smsCount  = Math.ceil(charCount / 160) || 1;
  const overLimit = charCount > MAX_CHARS;

  return (
    <div>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toast.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* Broadcast confirm modal */}
      {sendCampaign && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-bold text-slate-900 mb-2">Send broadcast now?</h2>
            <p className="text-slate-500 text-sm mb-4">
              This will send <strong>{sendCampaign.name}</strong> to all{" "}
              <strong>{customerCount} active customers</strong> right now. This cannot be undone.
            </p>
            <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 mb-4 border border-slate-200">
              {sendCampaign.message_body}
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1 justify-center" onClick={() => setSendCampaign(null)}>Cancel</button>
              <button className="btn-primary flex-1 justify-center bg-green-600 hover:bg-green-700"
                onClick={() => sendBroadcast(sendCampaign)}>
                Send to {customerCount} customers
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {campaigns.filter(c => c.active).length} active · {customerCount} customers in your list
          </p>
        </div>
        {showing === "list" && (
          <button className="btn-primary" onClick={() => setShowing("create")}>+ New campaign</button>
        )}
        {showing === "create" && (
          <button className="btn-secondary" onClick={() => setShowing("list")}>← Back</button>
        )}
      </div>

      {!twilio && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
          <p className="text-sm text-amber-700">⚠ Twilio not connected — campaigns can be created but not sent</p>
          <a href="/dashboard/settings" className="text-xs text-amber-700 font-medium hover:underline">Set up →</a>
        </div>
      )}

      {/* Campaign list */}
      {showing === "list" && (
        <div>
          {loading ? (
            <div className="card text-center py-12 text-slate-400 text-sm">Loading…</div>
          ) : campaigns.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-4xl mb-4">📣</div>
              <h2 className="font-semibold text-slate-900 mb-2">No campaigns yet</h2>
              <p className="text-slate-500 text-sm mb-6">Create your first campaign to start bringing customers back.</p>
              <button className="btn-primary" onClick={() => setShowing("create")}>+ Create campaign</button>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map(camp => {
                const info = TYPE_INFO[camp.type as CampaignType];
                return (
                  <div key={camp.id} className="card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="text-2xl mt-0.5">{info?.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-semibold text-slate-900">{camp.name}</h3>
                            <span className="text-xs text-slate-400 capitalize">{info?.label}</span>
                          </div>
                          <p className="text-sm text-slate-500 truncate">{camp.message_body}</p>
                          {camp.type === "winback" && (
                            <p className="text-xs text-slate-400 mt-1">Triggers after {camp.trigger_rules?.days_inactive} days of inactivity</p>
                          )}
                          {camp.type === "scheduled" && camp.trigger_rules?.send_at && (
                            <p className="text-xs text-slate-400 mt-1">Scheduled: {new Date(camp.trigger_rules.send_at).toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {camp.type === "broadcast" && (
                          <button
                            className="btn-primary text-xs px-3 py-1.5"
                            disabled={sending === camp.id || !twilio}
                            onClick={() => setSendCampaign(camp)}>
                            {sending === camp.id ? "Sending…" : "Send now"}
                          </button>
                        )}
                        {camp.type !== "broadcast" && (
                          <button
                            onClick={() => toggleActive(camp)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              camp.active ? "bg-brand-600" : "bg-slate-200"}`}>
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                              camp.active ? "translate-x-4" : "translate-x-0.5"}`} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteCampaign(camp.id)}
                          className="text-xs text-slate-400 hover:text-red-600 transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create campaign form */}
      {showing === "create" && (
        <div className="card max-w-2xl">
          <h2 className="font-bold text-slate-900 mb-6">Create a campaign</h2>

          {/* Type picker */}
          <div className="mb-6">
            <label className="label">Campaign type</label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(TYPE_INFO) as [CampaignType, typeof TYPE_INFO[CampaignType]][]).map(([type, info]) => (
                <button key={type} onClick={() => setCType(type)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    cType === type ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{info.icon}</span>
                    <span className="font-medium text-slate-900 text-sm">{info.label}</span>
                  </div>
                  <p className="text-xs text-slate-500">{info.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Campaign name</label>
              <input className="input" placeholder="e.g. Summer win-back, Birthday special"
                value={cName} onChange={e => setCName(e.target.value)} />
            </div>

            {/* Win-back days */}
            {cType === "winback" && (
              <div>
                <label className="label">Send after how many days of inactivity?</label>
                <div className="flex items-center gap-3">
                  <input className="input max-w-[120px]" type="number" min="1" max="365"
                    value={cDays} onChange={e => setCDays(e.target.value)} />
                  <span className="text-sm text-slate-500">days</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Customer last visit is tracked when they text your keyword.</p>
              </div>
            )}

            {/* Scheduled date/time */}
            {cType === "scheduled" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date</label>
                  <input className="input" type="date" value={cDate} onChange={e => setCDate(e.target.value)} />
                </div>
                <div>
                  <label className="label">Time</label>
                  <input className="input" type="time" value={cTime} onChange={e => setCTime(e.target.value)} />
                </div>
              </div>
            )}

            {/* Birthday note */}
            {cType === "birthday" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                This message will be sent automatically on each customer&apos;s birthday. 
                Use <strong>{"{name}"}</strong> in your message to personalize it — e.g. "Happy birthday {"{name}"}! 🎂"
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Message</label>
                <span className={`text-xs font-medium ${overLimit ? "text-red-500" : charCount > 120 ? "text-amber-500" : "text-slate-400"}`}>
                  {charCount} / {MAX_CHARS} chars · {smsCount} SMS
                </span>
              </div>
              <textarea className={`input resize-none ${overLimit ? "border-red-400 focus:ring-red-400" : ""}`} rows={4}
                placeholder={cType === "birthday"
                  ? "Happy birthday {name}! 🎂 Stop by this week for a special treat on us."
                  : "We miss you! Come back and get 10% off your next visit."}
                value={cMsg} onChange={e => setCMsg(e.target.value)} />
              <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2">
                <span className="text-xs text-slate-400 shrink-0">Auto-appended:</span>
                <span className="text-xs text-slate-600 font-mono">{OPT_OUT}</span>
              </div>
              {overLimit ? (
                <p className="text-xs text-red-500 mt-1">
                  Message is too long — keep it under {MAX_CHARS - OPT_OUT.length} characters so the full message fits in one SMS.
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-1">
                  {cType === "birthday" ? "Use {name} to personalize — e.g. Happy birthday {name}! 🎂" : `Keep your message under ${MAX_CHARS - OPT_OUT.length} characters to fit in a single SMS.`}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button className="btn-secondary flex-1 justify-center" onClick={() => setShowing("list")}>Cancel</button>
            <button className="btn-primary flex-1 justify-center" onClick={createCampaign} disabled={saving || overLimit}>
              {saving ? "Saving…" : cType === "broadcast" ? "Save broadcast" : "Create campaign"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
