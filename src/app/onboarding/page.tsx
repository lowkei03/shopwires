"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const STEPS = ["Business info", "Your keyword", "Twilio SMS", "All set"];
const CATEGORIES = ["Retail shop", "Cafe / coffee", "Salon / spa", "Restaurant", "Gym / fitness", "Bakery", "Florist", "Other"];

function fmtPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
}
function validPhone(v: string) { return v.replace(/\D/g, "").length === 10; }
function toE164(v: string) { return `+1${v.replace(/\D/g, "")}`; }

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mid, setMid] = useState<string | null>(null);

  // Step 1
  const [shopName, setShopName] = useState("");
  const [shopCat, setShopCat] = useState("");
  const [shopPhone, setShopPhone] = useState("");

  // Step 2
  const [keyword, setKeyword] = useState("");
  const [kwOk, setKwOk] = useState<boolean | null>(null);
  const [kwChecking, setKwChecking] = useState(false);

  // Step 3
  const [tSid, setTSid] = useState("");
  const [tToken, setTToken] = useState("");
  const [tPhone, setTPhone] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data } = await supabase.from("merchants").select("*").eq("user_id", user.id).single();
      if (data) {
        setMid(data.id);
        setStep(data.onboarding_step ?? 1);
        setShopName(data.shop_name ?? "");
        setShopCat(data.shop_category ?? "");
        const digits = (data.phone ?? "").replace(/\D/g, "").replace(/^1/, "");
        setShopPhone(fmtPhone(digits));
        setKeyword(data.keyword ?? "");
        setTSid(data.twilio_account_sid ?? "");
        setTToken(data.twilio_auth_token ?? "");
        setTPhone(data.twilio_phone_number ?? "");
      }
    }
    load();
  }, [router]);

  async function checkKw(kw: string) {
    if (kw.length < 3) { setKwOk(null); return; }
    setKwChecking(true);
    const supabase = createClient();
    const { data } = await supabase.from("merchants").select("id").eq("keyword", kw.toUpperCase()).single();
    setKwOk(!data);
    setKwChecking(false);
  }

  async function save(nextStep: number, extra: Record<string, unknown> = {}) {
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const payload = {
      shop_name: shopName,
      shop_category: shopCat,
      phone: validPhone(shopPhone) ? toE164(shopPhone) : shopPhone,
      keyword: keyword.toUpperCase(),
      onboarding_step: nextStep,
      onboarding_complete: false,
      ...extra,
    };

    if (!mid) {
      const { data, error: err } = await supabase.from("merchants")
        .insert({ user_id: user.id, ...payload }).select("id").single();
      if (err) { setError(err.message); setLoading(false); return; }
      setMid(data.id);
    } else {
      const { error: err } = await supabase.from("merchants").update(payload).eq("id", mid);
      if (err) { setError(err.message); setLoading(false); return; }
    }
    setStep(nextStep);
    setLoading(false);
  }

  async function skipToStep(nextStep: number) {
    setError("");
    setLoading(true);
    const supabase = createClient();
    if (mid) {
      await supabase.from("merchants").update({ onboarding_step: nextStep }).eq("id", mid);
    }
    setStep(nextStep);
    setLoading(false);
  }

  async function finish() {
    if (!mid) return;
    setLoading(true);
    const supabase = createClient();
    const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("merchants").update({
      onboarding_complete: true,
      onboarding_step: 4,
      trial_ends_at: trialEndsAt,
      account_status: "trial",
    }).eq("id", mid);

    // Send welcome email
    await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchantId: mid }),
    });

    router.push("/dashboard");
  }

  const SkipLink = ({ label, toStep }: { label: string; toStep: number }) => (
    <button
      onClick={() => skipToStep(toStep)}
      disabled={loading}
      className="w-full text-center text-sm text-slate-400 hover:text-slate-500 mt-3 transition-colors"
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-brand-600">ShopWires</span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 ${
                step > i + 1 ? "bg-brand-600 text-white" :
                step === i + 1 ? "bg-brand-600 text-white ring-4 ring-brand-100" :
                "bg-slate-100 text-slate-400"}`}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 ${step > i + 1 ? "bg-brand-600" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="card">

          {/* ── STEP 1 — Business info ── */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Tell us about your shop</h2>
              <p className="text-sm text-slate-500 mb-6">This shows up in your customer messages.</p>
              <div className="space-y-4">
                <div>
                  <label className="label">Shop name</label>
                  <input className="input" placeholder="Brew & Co. Coffee"
                    value={shopName} onChange={e => setShopName(e.target.value)} />
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
                    value={shopPhone}
                    onChange={e => setShopPhone(fmtPhone(e.target.value))}
                    maxLength={14} />
                  {shopPhone.length > 0 && (
                    <p className={`text-xs mt-1 ${validPhone(shopPhone) ? "text-green-600" : "text-amber-600"}`}>
                      {validPhone(shopPhone) ? "✓ Valid phone number" : "Enter all 10 digits"}
                    </p>
                  )}
                </div>
              </div>
              {error && <p className="err mt-3">{error}</p>}
              <button className="btn-primary w-full justify-center mt-6" disabled={loading}
                onClick={async () => {
                  if (!shopName) { setError("Shop name is required."); return; }
                  if (!shopCat) { setError("Select a business type."); return; }
                  if (!validPhone(shopPhone)) { setError("Enter a valid 10-digit phone number."); return; }
                  await save(2);
                }}>
                {loading ? "Saving…" : "Continue"}
              </button>
            </div>
          )}

          {/* ── STEP 2 — Keyword ── */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Choose your opt-in keyword</h2>
              <p className="text-sm text-slate-500 mb-6">
                Customers text this to join your list — like <strong>BREWS</strong>, <strong>CUTS</strong>, or <strong>BLOOMS</strong>.
              </p>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">Your keyword</label>
                  <span className={`text-xs ${keyword.length >= 18 ? "text-amber-500" : "text-slate-400"}`}>
                    {keyword.length}/20
                  </span>
                </div>
                <input className="input" style={{ textTransform: "uppercase" }} placeholder="BREWS"
                  value={keyword}
                  onChange={e => { setKeyword(e.target.value.replace(/[^a-zA-Z0-9]/g, "")); setKwOk(null); }}
                  onBlur={() => checkKw(keyword)}
                  maxLength={20} />
                {kwChecking && <p className="text-xs text-slate-400 mt-1">Checking availability…</p>}
                {kwOk === true  && <p className="text-xs text-green-600 mt-1">✓ Available</p>}
                {kwOk === false && <p className="text-xs text-red-600 mt-1">✗ Already taken — try another</p>}
                <p className="text-xs text-slate-400 mt-1">
                  One word only, letters and numbers — like BREWS, CUTS, or SHOP10. No spaces or symbols. Keep it short and easy to text.
                </p>
              </div>
              {error && <p className="err mt-3">{error}</p>}
              <div className="flex gap-3 mt-6">
                <button className="btn-secondary flex-1 justify-center" onClick={() => setStep(1)}>Back</button>
                <button className="btn-primary flex-1 justify-center" disabled={loading || kwChecking}
                  onClick={async () => {
                    if (!keyword || keyword.length < 3) { setError("Keyword must be at least 3 characters."); return; }
                    if (kwOk === false) { setError("That keyword is taken. Try another."); return; }
                    await save(3);
                  }}>
                  {loading ? "Saving…" : "Continue"}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3 — Twilio ── */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Connect Twilio for SMS</h2>
              <p className="text-sm text-slate-500 mb-2">
                ShopWires sends texts through your own Twilio account. You can skip this and set it up later.
              </p>
              <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer"
                className="text-xs text-brand-600 hover:underline mb-5 inline-block">
                Don&apos;t have Twilio? Sign up free →
              </a>
              <div className="space-y-4">
                <div>
                  <label className="label">Account SID</label>
                  <input className="input font-mono text-xs" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={tSid} onChange={e => setTSid(e.target.value.trim())} />
                </div>
                <div>
                  <label className="label">Auth token</label>
                  <input className="input font-mono text-xs" type="password" placeholder="Your auth token"
                    value={tToken} onChange={e => setTToken(e.target.value.trim())} />
                </div>
                <div>
                  <label className="label">Twilio phone number</label>
                  <input className="input" placeholder="+15550001234"
                    value={tPhone} onChange={e => setTPhone(e.target.value.trim())} />
                  <p className="text-xs text-slate-400 mt-1">Include + and country code e.g. +15550001234</p>
                </div>
              </div>
              {error && <p className="err mt-3">{error}</p>}
              <div className="flex gap-3 mt-6">
                <button className="btn-secondary flex-1 justify-center" onClick={() => setStep(2)}>Back</button>
                <button className="btn-primary flex-1 justify-center" disabled={loading}
                  onClick={async () => {
                    if (!tSid || !tToken || !tPhone) { setError("Fill in all fields or skip for now."); return; }
                    await save(4, {
                      twilio_account_sid: tSid,
                      twilio_auth_token: tToken,
                      twilio_phone_number: tPhone,
                    });
                  }}>
                  {loading ? "Saving…" : "Save & continue"}
                </button>
              </div>
              <SkipLink label="Skip for now — I'll add Twilio later" toStep={4} />
            </div>
          )}

          {/* ── STEP 4 — Done ── */}
          {step === 4 && (
            <div className="text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">You&apos;re all set!</h2>
              <p className="text-slate-500 text-sm mb-2">Your 30-day free trial has started.</p>
              <p className="text-slate-500 text-sm mb-6">No credit card needed — just start growing your customer list.</p>
              {keyword && (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-4">
                  <p className="text-xs text-slate-400 mb-1">Tell customers to text</p>
                  <p className="text-3xl font-bold text-brand-600 tracking-widest">{keyword.toUpperCase()}</p>
                  {tPhone && <p className="text-xs text-slate-400 mt-1">to {tPhone}</p>}
                </div>
              )}
              {!tPhone && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-left">
                  <p className="text-xs text-amber-700 font-medium">⚠ Twilio not connected yet</p>
                  <p className="text-xs text-amber-600 mt-0.5">Go to Settings to add your Twilio credentials so SMS opt-ins work.</p>
                </div>
              )}
              <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 mb-6 text-left">
                <p className="text-xs text-brand-700 font-medium">🎁 30-day free trial</p>
                <p className="text-xs text-brand-600 mt-0.5">Explore everything — no credit card required. Choose a plan anytime from the Billing page.</p>
              </div>
              <button className="btn-primary w-full justify-center" onClick={finish} disabled={loading}>
                {loading ? "Setting up…" : "Go to dashboard"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
