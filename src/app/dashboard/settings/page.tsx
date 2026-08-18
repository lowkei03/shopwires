"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

function fmtPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
}
function validPhone(v: string) { return v.replace(/\D/g, "").length === 10; }
function toE164(v: string) { return `+1${v.replace(/\D/g, "")}`; }

const CATEGORIES = ["Retail shop","Cafe / coffee","Salon / spa","Restaurant","Gym / fitness","Bakery","Florist","Other"];

export default function SettingsPage() {
  const [mid, setMid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shopName, setShopName]   = useState("");
  const [shopCat, setShopCat]     = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [keyword, setKeyword]     = useState("");
  const [tSid, setTSid]     = useState("");
  const [tToken, setTToken] = useState("");
  const [tPhone, setTPhone] = useState("");
  const [tMasked, setTMasked] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("merchants").select("*").eq("user_id", user.id).single();
      if (data) {
        setMid(data.id);
        setShopName(data.shop_name ?? "");
        setShopCat(data.shop_category ?? "");
        const digits = (data.phone ?? "").replace(/\D/g, "").replace(/^1/, "");
        setShopPhone(fmtPhone(digits));
        setKeyword(data.keyword ?? "");
        setTSid(data.twilio_account_sid ?? "");
        setTMasked(!!data.twilio_auth_token);
        setTToken(data.twilio_auth_token ? "••••••••••••••••" : "");
        setTPhone(data.twilio_phone_number ?? "");
      }
      setLoading(false);
    }
    load();
  }, []);

  function flash(msg: string, isError = false) {
    if (isError) { setError(msg); setSuccess(null); }
    else { setSuccess(msg); setError(null); }
    setTimeout(() => { setSuccess(null); setError(null); }, 3000);
  }

  async function saveBusiness() {
    if (!mid) return;
    if (!shopName) { flash("Shop name is required.", true); return; }
    if (!validPhone(shopPhone)) { flash("Enter a valid 10-digit phone number.", true); return; }
    setSaving("biz");
    const supabase = createClient();
    const { error: err } = await supabase.from("merchants").update({
      shop_name: shopName, shop_category: shopCat, phone: toE164(shopPhone),
    }).eq("id", mid);
    setSaving(null);
    if (err) flash(err.message, true);
    else flash("Business info saved.");
  }

  async function saveTwilio() {
    if (!mid) return;
    if (!tSid || !tPhone) { flash("Account SID and phone number are required.", true); return; }
    setSaving("twilio");
    const supabase = createClient();
    const updates: Record<string, string> = {
      twilio_account_sid: tSid,
      twilio_phone_number: tPhone,
    };
    if (tToken && !tToken.startsWith("•")) {
      updates.twilio_auth_token = tToken;
    }
    const { error: err } = await supabase.from("merchants").update(updates).eq("id", mid);
    setSaving(null);
    if (err) flash(err.message, true);
    else { flash("Twilio credentials saved."); setTMasked(true); setTToken("••••••••••••••••"); }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-slate-400 text-sm">Loading…</p></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings</h1>

      {success && <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6 text-sm text-green-700">✓ {success}</div>}
      {error   && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 text-sm text-red-700">{error}</div>}

      <div className="card mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">Business info</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Shop name</label>
            <input className="input" value={shopName} onChange={e => setShopName(e.target.value)} />
          </div>
          <div>
            <label className="label">Business type</label>
            <select className="input" value={shopCat} onChange={e => setShopCat(e.target.value)}>
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Your phone number</label>
            <input className="input" placeholder="(555) 000-0000"
              value={shopPhone} onChange={e => setShopPhone(fmtPhone(e.target.value))} maxLength={14} />
            {shopPhone.length > 0 && (
              <p className={`text-xs mt-1 ${validPhone(shopPhone) ? "text-green-600" : "text-amber-600"}`}>
                {validPhone(shopPhone) ? "✓ Valid" : "Enter all 10 digits"}
              </p>
            )}
          </div>
          <div>
            <label className="label">Opt-in keyword</label>
            <input className="input bg-slate-50 text-slate-500 cursor-not-allowed" value={keyword} readOnly />
            <p className="text-xs text-slate-400 mt-1">
              One word, letters and numbers only — like BREWS, CUTS, or SHOP10. No spaces or symbols.
              Keywords are locked after setup to protect your existing opt-ins. Need to change it? Contact support.
            </p>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button className="btn-primary" onClick={saveBusiness} disabled={saving === "biz"}>
            {saving === "biz" ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-slate-900 mb-1">Twilio SMS</h2>
        <p className="text-sm text-slate-500 mb-4">
          ShopWires sends texts through your Twilio account.{" "}
          <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
            Open Twilio console →
          </a>
        </p>
        {!tPhone && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 text-xs text-amber-700">
            ⚠ Twilio not connected — customers can't opt in via SMS until you save credentials here.
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="label">Account SID</label>
            <input className="input font-mono text-xs" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={tSid} onChange={e => setTSid(e.target.value.trim())} />
          </div>
          <div>
            <label className="label">Auth token</label>
            <input className="input font-mono text-xs" type="password"
              placeholder="Enter new token to update"
              value={tToken}
              onFocus={() => { if (tToken.startsWith("•")) setTToken(""); }}
              onBlur={() => { if (!tToken && tMasked) setTToken("••••••••••••••••"); }}
              onChange={e => setTToken(e.target.value.trim())} />
            <p className="text-xs text-slate-400 mt-1">Leave blank to keep your existing token.</p>
          </div>
          <div>
            <label className="label">Twilio phone number</label>
            <input className="input" placeholder="+15550001234"
              value={tPhone} onChange={e => setTPhone(e.target.value.trim())} />
            <p className="text-xs text-slate-400 mt-1">Include + and country code e.g. +15550001234</p>
          </div>
        </div>

        {tPhone && (
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-xs font-medium text-slate-700 mb-1">Webhook URL</p>
            <p className="text-xs text-slate-500 mb-1">Set this as the webhook for incoming messages in your Twilio console:</p>
            <p className="text-xs font-mono bg-white border border-slate-200 rounded px-2 py-1.5 text-slate-700 break-all">
              {typeof window !== "undefined" ? `${window.location.origin}/api/webhooks/twilio` : "/api/webhooks/twilio"}
            </p>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button className="btn-primary" onClick={saveTwilio} disabled={saving === "twilio"}>
            {saving === "twilio" ? "Saving…" : "Save Twilio credentials"}
          </button>
        </div>
      </div>
    </div>
  );
}
