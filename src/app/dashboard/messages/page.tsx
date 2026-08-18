"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  direction: string;
  body: string;
  status: string;
  sent_at: string;
  customer: { phone: string; name: string | null } | null;
};

export default function MessagesPage() {
  const [mid, setMid] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "inbound" | "outbound">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: merchant } = await supabase
        .from("merchants").select("id").eq("user_id", user.id).single();
      if (!merchant) { setLoading(false); return; }
      setMid(merchant.id);

      const { data } = await supabase
        .from("messages_log")
        .select("id, direction, body, status, sent_at, customer:customer_id(phone, name)")
        .eq("merchant_id", merchant.id)
        .order("sent_at", { ascending: false })
        .limit(200);

      const normalized = (data ?? []).map((m: any) => ({
        ...m,
        customer: Array.isArray(m.customer) ? m.customer[0] ?? null : m.customer ?? null,
      }));
      setMessages(normalized as Message[]);
      setLoading(false);
    }
    init();
  }, []);

  const filtered = messages.filter(m => {
    const matchDir = filter === "all" || m.direction === filter;
    const matchSearch = !search ||
      m.body.toLowerCase().includes(search.toLowerCase()) ||
      (m.customer?.phone ?? "").includes(search) ||
      (m.customer?.name ?? "").toLowerCase().includes(search.toLowerCase());
    return matchDir && matchSearch;
  });

  const inboundCount  = messages.filter(m => m.direction === "inbound").length;
  const outboundCount = messages.filter(m => m.direction === "outbound").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Message Log</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {inboundCount} received · {outboundCount} sent · last 200 messages
          </p>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <input className="input max-w-xs" placeholder="Search by phone, name, or message…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          {(["all", "inbound", "outbound"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 text-sm capitalize transition-colors ${
                filter === f ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card text-center py-12 text-slate-400 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">💬</div>
          <h2 className="font-semibold text-slate-900 mb-2">
            {messages.length === 0 ? "No messages yet" : "No results found"}
          </h2>
          <p className="text-slate-500 text-sm">
            {messages.length === 0
              ? "Messages will appear here once customers start texting your keyword."
              : "Try a different search or filter."}
          </p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-slate-500 font-medium w-32">Direction</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium w-36">From / To</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Message</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium w-28">Status</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium w-36">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                      m.direction === "inbound"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-green-50 text-green-700"}`}>
                      {m.direction === "inbound" ? "↓ Received" : "↑ Sent"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {m.customer ? (
                      <div>
                        <p className="font-mono text-xs text-slate-700">{m.customer.phone}</p>
                        {m.customer.name && <p className="text-xs text-slate-400">{m.customer.name}</p>}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-700 text-sm leading-snug max-w-md">{m.body}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs capitalize ${
                      m.status === "sent" || m.status === "received" ? "text-green-600" :
                      m.status === "failed" ? "text-red-500" : "text-slate-400"}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(m.sent_at).toLocaleDateString()}<br />
                    <span className="text-slate-400">{new Date(m.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-400">
            Showing {filtered.length} of {messages.length} messages
          </div>
        </div>
      )}
    </div>
  );
}
