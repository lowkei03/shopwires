"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-4xl mb-4">✉️</div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Check your inbox</h1>
          <p className="text-slate-500 text-sm">We sent a reset link to <strong>{email}</strong>.</p>
          <Link href="/auth/login" className="text-brand-600 hover:underline text-sm mt-4 inline-block">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-brand-600">ShopWires</span>
          <h1 className="text-xl font-bold text-slate-900 mt-4 mb-1">Reset your password</h1>
          <p className="text-sm text-slate-500">We&apos;ll send you a reset link</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email address</label>
            <input className="input" type="email" placeholder="you@yourshop.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {error && <p className="err">{error}</p>}
          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-6">
          <Link href="/auth/login" className="text-brand-600 hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
