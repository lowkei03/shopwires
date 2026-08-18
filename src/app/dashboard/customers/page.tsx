"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type Customer = {
  id: string;
  phone: string;
  name: string | null;
  status: string;
  opted_in_at: string;
  last_visit: string | null;
  visit_count: number;
  birthday: string | null;
  notes: string | null;
};

function fmtPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
}
function validPhone(v: string) { return v.replace(/\D/g, "").length === 10; }
function toE164(v: string) { return `+1${v.replace(/\D/g, "")}`; }

// Detect birthday in a CSV cell — accepts MM/DD, MM-DD, MMDD, or YYYY-MM-DD
function parseBirthdayFromCSV(v: string): string | null {
  if (!v) return null;
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  // MM/DD or MM-DD
  const slashMatch = v.match(/^(\d{1,2})[\/\-](\d{1,2})$/);
  if (slashMatch) {
    const mm = slashMatch[1].padStart(2, "0");
    const dd = slashMatch[2].padStart(2, "0");
    return `2000-${mm}-${dd}`;
  }
  // MMDD
  if (/^\d{4}$/.test(v)) {
    const mm = v.slice(0,2);
    const dd = v.slice(2,4);
    if (parseInt(mm) >= 1 && parseInt(mm) <= 12 && parseInt(dd) >= 1 && parseInt(dd) <= 31) {
      return `2000-${mm}-${dd}`;
    }
  }
  return null;
}

// Auto-format birthday as MM/DD while typing
function fmtBirthdayInput(v: string): string {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0,2)}/${digits.slice(2)}`;
}

function fmtBirthday(v: string | null): string {
  if (!v) return "—";
  const [, mm, dd] = v.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(mm)-1]} ${parseInt(dd)}`;
}

export default function CustomersPage() {
  const [mid, setMid] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "unsubscribed">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [noteModal, setNoteModal] = useState<Customer | null>(null);

  // Add form
  const [addPhone, setAddPhone] = useState("");
  const [addName, setAddName] = useState("");
  const [addBirthday, setAddBirthday] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Edit form
  const [editName, setEditName] = useState("");
  const [editBirthday, setEditBirthday] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Import
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ added: number; skipped: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function flash(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  async function loadCustomers(merchantId: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from("customers")
      .select("id, phone, name, status, opted_in_at, last_visit, visit_count, birthday, notes")
      .eq("merchant_id", merchantId)
      .order("opted_in_at", { ascending: false });
    setCustomers(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: merchant } = await supabase
        .from("merchants").select("id").eq("user_id", user.id).single();
      if (!merchant) { setLoading(false); return; }
      setMid(merchant.id);
      await loadCustomers(merchant.id);
    }
    init();
  }, []);

  async function addCustomer() {
    if (!mid) { flash("Still loading — try again.", false); return; }
    if (!validPhone(addPhone)) { flash("Enter a valid 10-digit phone number.", false); return; }
    setAddLoading(true);
    const supabase = createClient();
    const birthday = addBirthday ? parseBirthdayFromCSV(addBirthday) : null;
    const { error } = await supabase.from("customers").insert({
      merchant_id: mid,
      phone: toE164(addPhone),
      name: addName.trim() || null,
      birthday,
      status: "active",
      opted_in_at: new Date().toISOString(),
      visit_count: 0,
    });
    setAddLoading(false);
    if (error) {
      if (error.code === "23505") flash("That phone number is already in your list.", false);
      else flash(error.message, false);
      return;
    }
    setAddPhone(""); setAddName(""); setAddBirthday("");
    setShowAdd(false);
    flash("Customer added.");
    loadCustomers(mid);
  }

  async function saveEdit() {
    if (!selected || !mid) return;
    setEditLoading(true);
    const supabase = createClient();
    const birthday = editBirthday ? parseBirthdayFromCSV(editBirthday) : null;
    const { error } = await supabase.from("customers").update({
      name: editName.trim() || null,
      birthday,
      notes: editNotes.trim() || null,
    }).eq("id", selected.id);
    setEditLoading(false);
    if (error) { flash(error.message, false); return; }
    setSelected(null);
    flash("Customer updated.");
    loadCustomers(mid);
  }

  async function logVisit() {
    if (!selected || !mid) return;
    setEditLoading(true);
    const supabase = createClient();
    const now = new Date().toISOString();
    const { error } = await supabase.from("customers").update({
      last_visit: now,
      visit_count: (selected.visit_count ?? 0) + 1,
    }).eq("id", selected.id);
    setEditLoading(false);
    if (error) { flash(error.message, false); return; }
    setSelected(null);
    flash(`Visit logged for ${selected.name ?? selected.phone}.`);
    loadCustomers(mid);
  }

  async function logVisitDirect(c: Customer) {
    if (!mid) return;
    const supabase = createClient();
    const now = new Date().toISOString();
    const { error } = await supabase.from("customers").update({
      last_visit: now,
      visit_count: (c.visit_count ?? 0) + 1,
    }).eq("id", c.id);
    if (error) { flash(error.message, false); return; }
    flash(`Visit logged for ${c.name ?? c.phone}.`);
    loadCustomers(mid);
  }

  async function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !mid) return;
    setImporting(true);
    setImportResult(null);

    const text = await file.text();
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    let parseSkipped = 0;
    const rows: { phone: string; name: string | null; birthday: string | null }[] = [];

    // Detect header row
    let startIdx = 0;
    if (lines.length > 0 && !/\d{7,}/.test(lines[0].replace(/[^0-9]/g, ""))) {
      startIdx = 1;
    }

    for (let i = startIdx; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.replace(/['"]/g, "").trim());
      let phone = "";
      let name = "";
      let birthday: string | null = null;

      for (const col of cols) {
        const digits = col.replace(/\D/g, "");
        if (!phone && digits.length === 10) { phone = `+1${digits}`; continue; }
        if (!phone && digits.length === 11 && digits.startsWith("1")) { phone = `+${digits}`; continue; }
        const bd = parseBirthdayFromCSV(col);
        if (bd && !birthday) { birthday = bd; continue; }
        if (!name && /[a-zA-Z]/.test(col) && col.length > 1) { name = col; }
      }

      if (!phone) { parseSkipped++; continue; }
      rows.push({ phone, name: name || null, birthday });
    }

    if (!rows.length) {
      setImporting(false);
      setImportResult({ added: 0, skipped: parseSkipped });
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const supabase = createClient();
    let added = 0;
    let skipped = 0;

    for (const row of rows) {
      const { error } = await supabase.from("customers").insert({
        merchant_id: mid,
        phone: row.phone,
        name: row.name,
        birthday: row.birthday,
        status: "active",
        opted_in_at: new Date().toISOString(),
        visit_count: 0,
      });
      if (error) skipped++;
      else added++;
    }

    setImporting(false);
    setImportResult({ added, skipped: skipped + parseSkipped });
    if (fileRef.current) fileRef.current.value = "";
    loadCustomers(mid);
  }

  const filtered = customers.filter(c => {
    const matchFilter = filter === "all" || c.status === filter;
    const matchSearch = !search ||
      c.phone.includes(search) ||
      (c.name ?? "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const activeCount = customers.filter(c => c.status === "active").length;
  const unsubCount  = customers.filter(c => c.status === "unsubscribed").length;

  return (
    <div>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toast.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.ok ? "✓ " : "✗ "}{toast.msg}
        </div>
      )}

      {/* Note modal */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center px-4" onClick={() => setNoteModal(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-slate-900">Note</h2>
                <p className="text-xs text-slate-400 mt-0.5">{noteModal.name ?? noteModal.phone}</p>
              </div>
              <button onClick={() => setNoteModal(null)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{noteModal.notes}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => { setNoteModal(null); setSelected(noteModal); setEditName(noteModal.name ?? ""); setEditBirthday(noteModal.birthday ? `${noteModal.birthday.slice(5,7)}/${noteModal.birthday.slice(8,10)}` : ""); setEditNotes(noteModal.notes ?? ""); }}>
                Edit note
              </button>
              <button className="btn-primary" onClick={() => setNoteModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Customer detail / edit modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">Edit customer</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <p className="text-xs text-slate-400 font-mono mb-4">{selected.phone}</p>
            <div className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input className="input" placeholder="Jane Smith"
                  value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div>
                <label className="label">Birthday</label>
                <input className="input" placeholder="MM/DD e.g. 04/15"
                  value={editBirthday}
                  onChange={e => setEditBirthday(fmtBirthdayInput(e.target.value))}
                  maxLength={5} />
                {editBirthday && parseBirthdayFromCSV(editBirthday) && (
                  <p className="text-xs text-green-600 mt-1">✓ {fmtBirthday(parseBirthdayFromCSV(editBirthday))}</p>
                )}
                {editBirthday && editBirthday.length === 5 && !parseBirthdayFromCSV(editBirthday) && (
                  <p className="text-xs text-amber-600 mt-1">Invalid date — try MM/DD e.g. 04/15</p>
                )}
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea className="input resize-none" rows={3} placeholder="Any notes about this customer…"
                  value={editNotes} onChange={e => setEditNotes(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn-secondary flex-1 justify-center" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn-primary flex-1 justify-center" onClick={saveEdit} disabled={editLoading}>
                {editLoading ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500 mt-0.5">{activeCount} active · {unsubCount} unsubscribed</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => { setShowImport(!showImport); setShowAdd(false); }}>
            Import CSV
          </button>
          <button className="btn-primary" onClick={() => { setShowAdd(!showAdd); setShowImport(false); }}>
            + Add customer
          </button>
        </div>
      </div>

      {/* Add customer panel */}
      {showAdd && (
        <div className="card mb-6">
          <h2 className="font-semibold text-slate-900 mb-4">Add a customer manually</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Phone <span className="text-red-500">*</span></label>
              <input className="input" placeholder="(555) 000-0000"
                value={addPhone} onChange={e => setAddPhone(fmtPhone(e.target.value))} maxLength={14} />
              {addPhone.length > 0 && (
                <p className={`text-xs mt-1 ${validPhone(addPhone) ? "text-green-600" : "text-amber-600"}`}>
                  {validPhone(addPhone) ? "✓ Valid" : "Enter all 10 digits"}
                </p>
              )}
            </div>
            <div>
              <label className="label">Name <span className="text-slate-400 font-normal">(optional)</span></label>
              <input className="input" placeholder="Jane Smith"
                value={addName} onChange={e => setAddName(e.target.value)} />
            </div>
            <div>
              <label className="label">Birthday <span className="text-slate-400 font-normal">(optional)</span></label>
              <input className="input" placeholder="MM/DD e.g. 04/15"
                value={addBirthday}
                onChange={e => setAddBirthday(fmtBirthdayInput(e.target.value))}
                maxLength={5} />
              {addBirthday && parseBirthdayFromCSV(addBirthday) && (
                <p className="text-xs text-green-600 mt-1">✓ {fmtBirthday(parseBirthdayFromCSV(addBirthday))}</p>
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn-secondary" onClick={() => { setShowAdd(false); setAddPhone(""); setAddName(""); setAddBirthday(""); }}>Cancel</button>
            <button className="btn-primary" onClick={addCustomer} disabled={addLoading}>
              {addLoading ? "Adding…" : "Add customer"}
            </button>
          </div>
        </div>
      )}

      {/* CSV import panel */}
      {showImport && (
        <div className="card mb-6">
          <h2 className="font-semibold text-slate-900 mb-1">Import from CSV</h2>
          <p className="text-sm text-slate-500 mb-2">
            Upload a CSV with phone numbers. Auto-detects phone, name, and birthday columns.
            Accepts birthdays in MM/DD, MM-DD, MMDD, or YYYY-MM-DD format. Duplicates are skipped.
          </p>
          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 mb-4 font-mono">
            Example columns: Phone, Name, Birthday<br />
            5551234567, Jane Smith, 04/15
          </div>
          <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleCSV}
            className="block text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                       file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700
                       hover:file:bg-brand-100 cursor-pointer" />
          {importing && <p className="text-sm text-slate-500 mt-3">Importing…</p>}
          {importResult && (
            <div className="mt-3 bg-slate-50 rounded-lg p-3 text-sm">
              <p className="text-green-700 font-medium">✓ {importResult.added} customers imported</p>
              {importResult.skipped > 0 && (
                <p className="text-slate-500 mt-0.5">{importResult.skipped} rows skipped (no valid phone or duplicate)</p>
              )}
            </div>
          )}
          <button className="btn-secondary mt-4" onClick={() => { setShowImport(false); setImportResult(null); }}>Close</button>
        </div>
      )}

      {/* Search and filter */}
      <div className="flex gap-3 mb-4">
        <input className="input max-w-xs" placeholder="Search by name or phone…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          {(["all", "active", "unsubscribed"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 text-sm capitalize transition-colors ${
                filter === f ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card text-center py-12 text-slate-400 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">👥</div>
          <h2 className="font-semibold text-slate-900 mb-2">
            {customers.length === 0 ? "No customers yet" : "No results found"}
          </h2>
          <p className="text-slate-500 text-sm">
            {customers.length === 0 ? "Share your keyword or import a CSV to get started." : "Try a different search or filter."}
          </p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Phone</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Birthday</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Joined</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Visits</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-700">{c.phone}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span>{c.name ?? "—"}</span>
                      {c.notes && (
                        <button
                          onClick={() => setNoteModal(c)}
                          className="text-amber-400 hover:text-amber-500 transition-colors leading-none"
                          title="View note">
                          📝
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{fmtBirthday(c.birthday)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.status === "active" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(c.opted_in_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span>{c.visit_count}</span>
                      <button
                        onClick={() => logVisitDirect(c)}
                        className="text-green-500 hover:text-green-600 transition-colors leading-none"
                        title={`Log a visit${c.last_visit ? ` (last: ${new Date(c.last_visit).toLocaleDateString()})` : " (never visited)"}`}>
                        ✅
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setSelected(c);
                        setEditName(c.name ?? "");
                        setEditBirthday(c.birthday ? `${c.birthday.slice(5,7)}/${c.birthday.slice(8,10)}` : "");
                        setEditNotes(c.notes ?? "");
                      }}
                      className="text-xs text-brand-600 hover:underline">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-400">
            Showing {filtered.length} of {customers.length} customers
          </div>
        </div>
      )}
    </div>
  );
}
