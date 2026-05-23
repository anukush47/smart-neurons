"use client";

import { useState, useEffect, useMemo } from "react";
import ERPShell from "@/components/erp/ERPShell";
import { createClient } from "@/lib/supabase/client";
import {
  IndianRupee, Search, Filter, CheckCircle, AlertCircle,
  Clock, ChevronDown, ChevronUp, X, Users, TrendingUp,
} from "lucide-react";

/* ── Types ───────────────────────────────────────────────── */
interface FeePaymentRow {
  id: string;
  student_id: string;
  amount_due: number;
  amount_paid: number;
  status: "pending" | "paid" | "overdue";
  due_date: string;
  paid_at: string | null;
  receipt_no: string | null;
  students: {
    id: string; name: string; class: string;
    section: string; roll_no: string | null;
    parent_name: string | null; parent_phone: string | null;
  };
  fee_structures: {
    id: string; name: string; term: string;
    academic_year: string; amount: number; due_date: string;
  };
}

interface StudentSummary {
  studentId: string;
  name: string;
  class: string;
  section: string;
  rollNo: string | null;
  parentName: string | null;
  parentPhone: string | null;
  totalDue: number;
  totalPaid: number;
  outstanding: number;
  overallStatus: "paid" | "partial" | "due" | "overdue";
  instalments: FeePaymentRow[];
}

const STATUS_STYLE = {
  paid:    { label: "Paid",    bg: "rgba(107,203,119,0.12)", color: "#16a34a" },
  partial: { label: "Partial", bg: "rgba(255,217,61,0.15)",  color: "#d97706" },
  due:     { label: "Due",     bg: "rgba(255,107,107,0.10)", color: "#FF6B6B" },
  overdue: { label: "Overdue", bg: "rgba(220,38,38,0.12)",   color: "#dc2626" },
};

const CLASSES = ["All", "Nursery", "LKG", "UKG", "JKG", "SKG"];
const PAY_MODES = ["Cash", "UPI", "Cheque", "Online / NEFT"];

function fmt(n: number) { return "₹" + n.toLocaleString("en-IN"); }

function deriveStatus(rows: FeePaymentRow[]): StudentSummary["overallStatus"] {
  if (rows.every(r => r.status === "paid")) return "paid";
  if (rows.some(r => r.status === "overdue")) return "overdue";
  if (rows.some(r => r.amount_paid > 0)) return "partial";
  return "due";
}

/* ── Component ───────────────────────────────────────────── */
export default function AdminFeesPage() {
  const [userName, setUserName] = useState("");
  const [rows, setRows] = useState<FeePaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  // Record payment modal
  const [recordFor, setRecordFor] = useState<FeePaymentRow | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("Cash");
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) setUserName(data.user.app_metadata?.name || data.user.email || "Admin");
    });
    loadFees();
  }, []);

  async function loadFees() {
    setLoading(true);
    const res = await fetch("/api/fees");
    const json = await res.json();
    if (json.error) { setError(json.error); setLoading(false); return; }
    setRows(json.fees ?? []);
    setLoading(false);
  }

  // Group fee rows by student
  const students = useMemo<StudentSummary[]>(() => {
    const map = new Map<string, StudentSummary>();
    for (const r of rows) {
      const sid = r.student_id;
      if (!map.has(sid)) {
        map.set(sid, {
          studentId: sid,
          name: r.students?.name ?? "Unknown",
          class: r.students?.class ?? "",
          section: r.students?.section ?? "A",
          rollNo: r.students?.roll_no ?? null,
          parentName: r.students?.parent_name ?? null,
          parentPhone: r.students?.parent_phone ?? null,
          totalDue: 0, totalPaid: 0, outstanding: 0,
          overallStatus: "due",
          instalments: [],
        });
      }
      const s = map.get(sid)!;
      s.totalDue += r.amount_due;
      s.totalPaid += r.amount_paid;
      s.instalments.push(r);
    }
    for (const s of map.values()) {
      s.outstanding = s.totalDue - s.totalPaid;
      s.overallStatus = deriveStatus(s.instalments);
      s.instalments.sort((a, b) => a.due_date.localeCompare(b.due_date));
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);

  const filtered = useMemo(() => students.filter(s => {
    const matchClass = classFilter === "All" || s.class === classFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) ||
      (s.parentName?.toLowerCase().includes(q) ?? false) ||
      (s.rollNo?.toLowerCase().includes(q) ?? false);
    return matchClass && matchSearch;
  }), [students, classFilter, search]);

  // Summary stats
  const totalDue = filtered.reduce((s, x) => s + x.totalDue, 0);
  const totalPaid = filtered.reduce((s, x) => s + x.totalPaid, 0);
  const totalOutstanding = filtered.reduce((s, x) => s + x.outstanding, 0);
  const fullyPaid = filtered.filter(s => s.overallStatus === "paid").length;

  function showFlash(type: "ok" | "err", msg: string) {
    setFlash({ type, msg });
    setTimeout(() => setFlash(null), 3500);
  }

  async function handleRecord() {
    if (!recordFor || !payAmount) return;
    setSaving(true);
    const res = await fetch("/api/fees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fee_payment_id: recordFor.id,
        amount_paid: Number(payAmount),
        mode: payMode,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (json.error) { showFlash("err", json.error); return; }
    showFlash("ok", `Payment recorded · Receipt: ${json.receipt_no}`);
    setRecordFor(null); setPayAmount("");
    await loadFees();
  }

  return (
    <ERPShell role="admin" userName={userName}>
      <div className="max-w-5xl mx-auto space-y-5">
        {flash && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${flash.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
            style={{ fontFamily: "var(--font-nunito)" }}>
            {flash.type === "ok" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {flash.msg}
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Fee Management</h1>
          <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: "var(--font-nunito)" }}>
            Academic Year 2026-27 · {filtered.length} students
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Billed",   value: fmt(totalDue),         color: "#4D96FF", icon: <IndianRupee size={16} /> },
            { label: "Collected",      value: fmt(totalPaid),        color: "#16a34a", icon: <TrendingUp size={16} /> },
            { label: "Outstanding",    value: fmt(totalOutstanding),  color: "#FF6B6B", icon: <AlertCircle size={16} /> },
            { label: "Fully Paid",     value: `${fullyPaid}/${filtered.length}`, color: "#6BCB77", icon: <Users size={16} /> },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1" style={{ color: s.color }}>
                {s.icon}
                <p className="text-xs font-bold" style={{ fontFamily: "var(--font-nunito)", color: "rgba(26,26,46,0.50)" }}>{s.label}</p>
              </div>
              <p className="text-lg font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm" style={{ fontFamily: "var(--font-nunito)" }}
              placeholder="Search student or parent…" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Filter size={14} className="text-gray-400 self-center" />
            {CLASSES.map(c => (
              <button key={c} onClick={() => setClassFilter(c)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                style={{
                  fontFamily: "var(--font-nunito)",
                  background: classFilter === c ? "#FF6B6B" : "rgba(26,26,46,0.06)",
                  color: classFilter === c ? "white" : "rgba(26,26,46,0.60)",
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Student list */}
        {loading ? (
          <div className="text-center py-16 text-gray-400" style={{ fontFamily: "var(--font-nunito)" }}>Loading fees…</div>
        ) : error ? (
          <div className="bg-red-50 rounded-2xl p-6 text-center text-red-500 text-sm" style={{ fontFamily: "var(--font-nunito)" }}>{error}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <p className="text-gray-400 font-semibold" style={{ fontFamily: "var(--font-nunito)" }}>No students found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(s => {
              const st = STATUS_STYLE[s.overallStatus];
              const isOpen = expanded === s.studentId;
              const pct = s.totalDue > 0 ? Math.round((s.totalPaid / s.totalDue) * 100) : 0;
              return (
                <div key={s.studentId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <button type="button" onClick={() => setExpanded(isOpen ? null : s.studentId)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: "#FF6B6B", fontFamily: "var(--font-nunito)" }}>
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-navy truncate" style={{ fontFamily: "var(--font-nunito)" }}>{s.name}</p>
                        <span className="text-xs text-gray-400" style={{ fontFamily: "var(--font-nunito)" }}>{s.class}-{s.section}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden max-w-32" style={{ background: "rgba(26,26,46,0.08)" }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#6BCB77" }} />
                        </div>
                        <span className="text-xs text-gray-400" style={{ fontFamily: "var(--font-nunito)" }}>{pct}%</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{fmt(s.totalPaid)}</p>
                      {s.outstanding > 0 && (
                        <p className="text-xs font-semibold" style={{ color: st.color, fontFamily: "var(--font-nunito)" }}>
                          {fmt(s.outstanding)} due
                        </p>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0"
                      style={{ background: st.bg, color: st.color, fontFamily: "var(--font-nunito)" }}>
                      {st.label}
                    </span>
                    {isOpen ? <ChevronUp size={14} className="flex-shrink-0 text-gray-400" /> : <ChevronDown size={14} className="flex-shrink-0 text-gray-400" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-gray-50">
                      {s.parentName && (
                        <p className="text-xs text-gray-400 mt-3 mb-2" style={{ fontFamily: "var(--font-nunito)" }}>
                          Parent: <span className="font-semibold text-navy">{s.parentName}</span>
                          {s.parentPhone && <> · {s.parentPhone}</>}
                        </p>
                      )}
                      <div className="space-y-2">
                        {s.instalments.map(inst => {
                          const ist = inst.status === "paid"
                            ? STATUS_STYLE.paid
                            : inst.status === "overdue"
                            ? STATUS_STYLE.overdue
                            : STATUS_STYLE.due;
                          return (
                            <div key={inst.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                              style={{ background: ist.bg }}>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>
                                  {inst.fee_structures?.name ?? "Instalment"}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: "var(--font-nunito)" }}>
                                  Due: {new Date(inst.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                  {inst.receipt_no && <> · <span className="font-semibold">{inst.receipt_no}</span></>}
                                </p>
                              </div>
                              <p className="text-sm font-bold flex-shrink-0" style={{ color: ist.color, fontFamily: "var(--font-nunito)" }}>
                                {fmt(inst.amount_due)}
                              </p>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                                style={{ background: "rgba(255,255,255,0.7)", color: ist.color, fontFamily: "var(--font-nunito)" }}>
                                {ist.label}
                              </span>
                              {inst.status !== "paid" && (
                                <button onClick={() => { setRecordFor(inst); setPayAmount(String(inst.amount_due)); }}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-white flex-shrink-0"
                                  style={{ background: "#FF6B6B", fontFamily: "var(--font-nunito)" }}>
                                  Record
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {recordFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Record Payment</h2>
              <button onClick={() => setRecordFor(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-1 mb-4 text-sm">
              <p style={{ fontFamily: "var(--font-nunito)" }}>
                <span className="text-gray-500">Student: </span>
                <span className="font-bold text-navy">{recordFor.students?.name}</span>
              </p>
              <p style={{ fontFamily: "var(--font-nunito)" }}>
                <span className="text-gray-500">For: </span>
                <span className="font-semibold text-navy">{recordFor.fee_structures?.name}</span>
              </p>
              <p style={{ fontFamily: "var(--font-nunito)" }}>
                <span className="text-gray-500">Amount Due: </span>
                <span className="font-bold text-red-500">{fmt(recordFor.amount_due)}</span>
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1" style={{ fontFamily: "var(--font-nunito)" }}>Amount Paid (₹)</label>
                <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm font-semibold"
                  style={{ fontFamily: "var(--font-nunito)" }} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1" style={{ fontFamily: "var(--font-nunito)" }}>Payment Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAY_MODES.map(m => (
                    <button key={m} onClick={() => setPayMode(m)}
                      className="py-2 rounded-xl text-xs font-bold transition-colors"
                      style={{
                        fontFamily: "var(--font-nunito)",
                        background: payMode === m ? "#FF6B6B" : "rgba(26,26,46,0.06)",
                        color: payMode === m ? "white" : "rgba(26,26,46,0.60)",
                      }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleRecord} disabled={saving || !payAmount}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ background: "#FF6B6B", fontFamily: "var(--font-nunito)" }}>
                {saving ? "Saving…" : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ERPShell>
  );
}
