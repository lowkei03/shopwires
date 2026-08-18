"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Plan = "starter" | "growth" | "pro" | null;

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    features: ["500 customers", "1 active campaign", "SMS opt-in keyword", "Customer dashboard"],
  },
  {
    id: "growth",
    name: "Growth",
    price: 59,
    popular: true,
    features: ["2,500 customers", "Unlimited campaigns", "Analytics", "CSV import", "Win-back automation"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    features: ["Unlimited customers", "Everything in Growth", "White-label branding", "API access", "Priority support"],
  },
];

export default function BillingPage() {
  const [mid, setMid] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isSuccess = params.get("success") === "1";
    const sessionId = params.get("session_id");

    if (isSuccess) {
      setSuccessMsg("🎉 Subscription activated! Welcome to ShopWires.");
      window.history.replaceState({}, "", "/dashboard/billing");
    }

    async function loadMerchant() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: merchant } = await supabase
        .from("merchants").select("id, plan, stripe_customer_id").eq("user_id", user.id).single();
      if (!merchant) { setLoading(false); return; }
      setMid(merchant.id);

      // If returning from Stripe success, confirm the session to write the plan
      if (isSuccess && sessionId) {
        try {
          const res = await fetch("/api/stripe/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, merchantId: merchant.id }),
          });
          const result = await res.json();
          if (result.plan) {
            setPlan(result.plan as Plan);
            setLoading(false);
            return;
          }
        } catch {}
      }

      setPlan(merchant.plan as Plan);
      setLoading(false);
    }

    loadMerchant();
  }, []);

  async function startCheckout(planId: string) {
    if (!mid) {
      setError("Account not loaded yet — please refresh the page and try again.");
      return;
    }
    setCheckoutLoading(planId);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, merchantId: mid }),
      });
      const { url, error: err } = await res.json();
      if (url) window.location.href = url;
      else setError(err ?? "Could not start checkout. Try again.");
    } catch {
      setError("Something went wrong. Try again.");
    }
    setCheckoutLoading(null);
  }

  async function openPortal() {
    if (!mid) return;
    setPortalLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId: mid }),
      });
      const { url, error: err } = await res.json();
      if (url) window.location.href = url;
      else setError(err ?? "Could not open billing portal.");
    } catch {
      setError("Something went wrong. Try again.");
    }
    setPortalLoading(false);
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-slate-400 text-sm">Loading…</p></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {plan ? `Current plan: ${plan.charAt(0).toUpperCase() + plan.slice(1)}` : "No active plan — choose one below"}
          </p>
        </div>
        {plan && (
          <button className="btn-secondary" onClick={openPortal} disabled={portalLoading}>
            {portalLoading ? "Loading…" : "Manage subscription →"}
          </button>
        )}
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6 text-sm text-green-700 font-medium">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Current plan banner */}
      {plan && (
        <div className="bg-brand-50 border border-brand-200 rounded-lg px-4 py-4 mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-800">
              You're on the {plan.charAt(0).toUpperCase() + plan.slice(1)} plan
            </p>
            <p className="text-xs text-brand-600 mt-0.5">
              To upgrade, downgrade, or cancel — click "Manage subscription" above.
            </p>
          </div>
          <span className="text-2xl">✓</span>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((p) => {
          const isCurrent = plan === p.id;
          const isLoading = checkoutLoading === p.id;

          return (
            <div key={p.id} className={`card relative flex flex-col ${
              isCurrent ? "border-brand-500 ring-2 ring-brand-100" :
              p.popular ? "border-slate-300" : ""}`}>
              {p.popular && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most popular
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Current plan
                </div>
              )}

              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-1">{p.name}</h3>
                <div className="text-3xl font-bold text-slate-900 mb-4">
                  ${p.price}<span className="text-base font-normal text-slate-400">/mo</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="text-brand-500 font-bold">✓</span>{f}
                    </li>
                  ))}
                </ul>
              </div>

              {isCurrent ? (
                <button className="btn-secondary w-full justify-center" onClick={openPortal} disabled={portalLoading}>
                  {portalLoading ? "Loading…" : "Manage plan"}
                </button>
              ) : (
                <button
                  className={`w-full justify-center ${p.popular ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => startCheckout(p.id)}
                  disabled={!!checkoutLoading || loading || !mid}>
                  {isLoading ? "Loading…" : plan ? `Switch to ${p.name}` : `Choose ${p.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 text-center mt-8">
        All plans include a 30-day free trial. Cancel anytime — no questions asked.
        Billing is handled securely by Stripe.
      </p>
    </div>
  );
}
