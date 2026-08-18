"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Clear fields on mount to prevent stale values
  useEffect(() => {
    setEmail("");
    setPassword("");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError("Incorrect email or password."); setLoading(false); return; }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-brand-600">ShopWires</span>
          <h1 className="text-xl font-bold text-slate-900 mt-4 mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500">Log in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label className="label">Email address</label>
            <input className="input" type="email" placeholder="you@yourshop.com"
              autoComplete="username"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="Your password"
              autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
            <div className="text-right mt-1">
              <Link href="/auth/reset-password" className="text-xs text-brand-600 hover:underline">Forgot password?</Link>
            </div>
          </div>
          {error && <p className="err">{error}</p>}
          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-brand-600 hover:underline font-medium">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
