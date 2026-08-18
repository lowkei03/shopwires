"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Range = "7" | "30" | "90" | "all";

type DayStat = { date: string; count: number };

function getStartDate(range: Range): string | null {
  if (range === "all") return null;
  const d = new Date();
  d.setDate(d.getDate() - parseInt(range));
  return d.toISOString();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Simple bar chart using divs
function BarChart({ data, color = "bg-brand-500", label }: { data: DayStat[]; color?: string; label: string }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div>
      <div className="flex items-end gap-1 h-24">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
            <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
              {formatDate(d.date)}: {d.count}
            </div>
            <div
              className={`w-full rounded-t ${color} transition-all`}
              style={{ height: `${Math.max((d.count / max) * 96, d.count > 0 ? 4 : 0)}px` }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        {data.length > 0 && (
          <>
            <span className="text-xs text-slate-400">{formatDate(data[0].date)}</span>
            <span className="text-xs text-slate-400">{formatDate(data[data.length - 1].date)}</span>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [mid, setMid] = useState<string | null>(null);
  const [range, setRange] = useState<Range>("30");
  const [loading, setLoading] = useState(true);

  // Stats
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [activeCustomers, setActiveCustomers] = useState(0);
  const [unsubCustomers, setUnsubCustomers] = useState(0);
  const [newCustomers, setNewCustomers] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [outboundMessages, setOutboundMessages] = useState(0);
  const [inboundMessages, setInboundMessages] = useState(0);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [activeCampaigns, setActiveCampaigns] = useState(0);
  const [repeatCustomers, setRepeatCustomers] = useState(0);

  // Chart data
  const [customerGrowth, setCustomerGrowth] = useState<DayStat[]>([]);
  const [messageVolume, setMessageVolume] = useState<DayStat[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [campaignStats, setCampaignStats] = useState<any[]>([]);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: merchant } = await supabase.from("merchants").select("id").eq("user_id", user.id).single();
      if (!merchant) return;
      setMid(merchant.id);
      await loadData(merchant.id, range);
    }
    init();
  }, []);

  async function loadData(merchantId: string, r: Range) {
    setLoading(true);
    const supabase = createClient();
    const startDate = getStartDate(r);

    // All customers
    const { data: allCustomers } = await supabase.from("customers")
      .select("id, status, opted_in_at, visit_count, name, phone")
      .eq("merchant_id", merchantId);

    const all = allCustomers ?? [];
    setTotalCustomers(all.length);
    setActiveCustomers(all.filter(c => c.status === "active").length);
    setUnsubCustomers(all.filter(c => c.status === "unsubscribed").length);
    setRepeatCustomers(all.filter(c => c.visit_count >= 2).length);

    // New customers in range
    const newInRange = startDate
      ? all.filter(c => c.opted_in_at >= startDate)
      : all;
    setNewCustomers(newInRange.length);

    // Top customers by visit count
    const sorted = [...all].sort((a, b) => (b.visit_count ?? 0) - (a.visit_count ?? 0)).slice(0, 5);
    setTopCustomers(sorted);

    // Customer growth chart — group by day
    const growthMap: Record<string, number> = {};
    const days = r === "all" ? 90 : parseInt(r);
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      growthMap[d.toISOString().split("T")[0]] = 0;
    }
    newInRange.forEach(c => {
      const day = c.opted_in_at.split("T")[0];
      if (growthMap[day] !== undefined) growthMap[day]++;
    });
    setCustomerGrowth(Object.entries(growthMap).map(([date, count]) => ({ date, count })));

    // Messages
    const msgQuery = supabase.from("messages_log").select("id, direction, sent_at").eq("merchant_id", merchantId);
    const { data: allMessages } = startDate ? await msgQuery.gte("sent_at", startDate) : await msgQuery;
    const msgs = allMessages ?? [];
    setTotalMessages(msgs.length);
    setOutboundMessages(msgs.filter(m => m.direction === "outbound").length);
    setInboundMessages(msgs.filter(m => m.direction === "inbound").length);

    // Message volume chart
    const msgMap: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      msgMap[d.toISOString().split("T")[0]] = 0;
    }
    msgs.filter(m => m.direction === "outbound").forEach(m => {
      const day = m.sent_at.split("T")[0];
      if (msgMap[day] !== undefined) msgMap[day]++;
    });
    setMessageVolume(Object.entries(msgMap).map(([date, count]) => ({ date, count })));

    // Campaigns
    const { data: camps } = await supabase.from("campaigns").select("*").eq("merchant_id", merchantId);
    const campList = camps ?? [];
    setTotalCampaigns(campList.length);
    setActiveCampaigns(campList.filter(c => c.active).length);
    setCampaignStats(campList);

    setLoading(false);
  }

  async function changeRange(r: Range) {
    setRange(r);
    if (mid) await loadData(mid, r);
  }

  const retentionRate = totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0;
  const repeatRate    = activeCustomers > 0 ? Math.round((repeatCustomers / activeCustomers) * 100) : 0;

  const RANGES: { label: string; value: Range }[] = [
    { label: "7 days", value: "7" },
    { label: "30 days", value: "30" },
    { label: "90 days", value: "90" },
    { label: "All time", value: "all" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">How your loyalty program is performing</p>
        </div>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          {RANGES.map(r => (
            <button key={r.value} onClick={() => changeRange(r.value)}
              className={`px-3 py-2 text-sm transition-colors ${
                range === r.value ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card text-center py-16 text-slate-400 text-sm">Loading analytics…</div>
      ) : (
        <div className="space-y-6">

          {/* Top stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total customers" value={totalCustomers} sub={`${activeCustomers} active · ${unsubCustomers} opted out`} />
            <StatCard label="New this period" value={newCustomers} sub="customers joined" />
            <StatCard label="Retention rate" value={`${retentionRate}%`} sub="still subscribed" />
            <StatCard label="Repeat visitors" value={`${repeatRate}%`} sub="visited 2+ times" />
          </div>

          {/* Customer growth chart */}
          <div className="card">
            <h2 className="font-semibold text-slate-900 mb-1">Customer growth</h2>
            <p className="text-xs text-slate-400 mb-4">New opt-ins per day</p>
            {customerGrowth.every(d => d.count === 0) ? (
              <div className="h-24 flex items-center justify-center text-sm text-slate-400">No new customers in this period</div>
            ) : (
              <BarChart data={customerGrowth} color="bg-brand-500" label="New customers" />
            )}
          </div>

          {/* Message stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="Total messages" value={totalMessages} sub="in selected period" />
            <StatCard label="Messages sent" value={outboundMessages} sub="outbound to customers" />
            <StatCard label="Opt-in texts received" value={inboundMessages} sub="inbound from customers" />
          </div>

          {/* Message volume chart */}
          <div className="card">
            <h2 className="font-semibold text-slate-900 mb-1">Messages sent</h2>
            <p className="text-xs text-slate-400 mb-4">Outbound messages per day</p>
            {messageVolume.every(d => d.count === 0) ? (
              <div className="h-24 flex items-center justify-center text-sm text-slate-400">No messages sent in this period</div>
            ) : (
              <BarChart data={messageVolume} color="bg-green-500" label="Messages sent" />
            )}
          </div>

          {/* Campaigns + top customers side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Campaign summary */}
            <div className="card">
              <h2 className="font-semibold text-slate-900 mb-1">Campaigns</h2>
              <p className="text-xs text-slate-400 mb-4">{activeCampaigns} active of {totalCampaigns} total</p>
              {campaignStats.length === 0 ? (
                <p className="text-sm text-slate-400">No campaigns created yet</p>
              ) : (
                <div className="space-y-2">
                  {campaignStats.map(c => {
                    const typeIcon: Record<string, string> = {
                      broadcast: "📢", winback: "🔄", birthday: "🎂", scheduled: "🗓️"
                    };
                    return (
                      <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-2">
                          <span>{typeIcon[c.type] ?? "📣"}</span>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{c.name}</p>
                            <p className="text-xs text-slate-400 capitalize">{c.type}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          c.active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                          {c.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top customers by visits */}
            <div className="card">
              <h2 className="font-semibold text-slate-900 mb-1">Top customers</h2>
              <p className="text-xs text-slate-400 mb-4">By visit count</p>
              {topCustomers.length === 0 ? (
                <p className="text-sm text-slate-400">No visit data yet</p>
              ) : (
                <div className="space-y-2">
                  {topCustomers.map((c, i) => (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 w-4">{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{c.name ?? "Unknown"}</p>
                          <p className="text-xs font-mono text-slate-400">{c.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-brand-600">{c.visit_count}</p>
                        <p className="text-xs text-slate-400">visits</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Retention breakdown */}
          <div className="card">
            <h2 className="font-semibold text-slate-900 mb-4">Customer breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-slate-400 mb-2">Status</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm text-slate-600">Active</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">{activeCustomers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                      <span className="text-sm text-slate-600">Opted out</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">{unsubCustomers}</span>
                  </div>
                </div>
                {/* Visual bar */}
                <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${retentionRate}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{retentionRate}% retention rate</p>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-2">Visit frequency</p>
                <div className="space-y-2">
                  {[
                    { label: "First visit only", count: activeCustomers - repeatCustomers },
                    { label: "2+ visits", count: repeatCustomers },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{row.label}</span>
                      <span className="text-sm font-medium text-slate-900">{row.count}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${repeatRate}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{repeatRate}% repeat visitor rate</p>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-2">Birthday data</p>
                {(() => {
                  const withBirthday = topCustomers.filter(c => c.birthday).length;
                  return (
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{withBirthday}</p>
                      <p className="text-xs text-slate-400 mt-1">of top 5 customers have birthday saved</p>
                      <p className="text-xs text-slate-400 mt-2">Collect more birthdays to improve birthday campaign reach.</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
