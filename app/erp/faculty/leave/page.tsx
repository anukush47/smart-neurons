"use client";

import { useState, useEffect } from "react";
import ERPShell from "@/components/erp/ERPShell";
import { createClient } from "@/lib/supabase/client";
import { CalendarDays, Plus, CheckCircle, AlertCircle, Clock, X } from "lucide-react";

interface LeaveApp {
  id: string;
  from_date: string;
  to_date: string;
  days: number;
  type: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  applied_at: string;
}

const LEAVE_TYPES = ["Casual", "Sick", "Emergency", "Personal", "Other"];

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending:  { bg: "rgba(255,165,0,0.10)",  color: "#f59e0b", label: "Pending"  },
  approved: { bg: "rgba(107,203,119,0.12)", color: "#16a34a", label: "Approved" },
  rejected: { bg: "rgba(255,107,107,0.10)", color: "#dc2626", label: "Rejected" },
};

function daysBetween(from: string, to: string) {
  const a = new Date(from), b = new Date(to);
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000) + 1);
}

export default function FacultyLeavePage() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [leaves, setLeaves] = useState<LeaveApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState("Casual");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [flash, setFlash] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) setUser({ name: data.user.app_metadata?.name || data.user.email || "Faculty" });
    });
    loadLeaves();
  }, []);

  async function loadLeaves() {
    setLoading(true);
    const res = await fetch("/api/leave");
    const json = await res.json();
    setLeaves(json.applications ?? []);
    setLoading(false);
  }

  function showFlash(type: "ok" | "err", msg: string) {
    setFlash({ type, msg });
    setTimeout(() => setFlash(null), 3500);
  }

  async function handleSubmit() {
    if (!from || !to || !reason.trim()) return;
    if (new Date(to) < new Date(from)) { showFlash("err", "End date must be after start date"); return; }
    setSubmitting(true);
    const days = daysBetween(from, to);
    const res = await fetch("/api/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from_date: from, to_date: to, days, type, reason: reason.trim() }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (json.error) { showFlash("err", json.error); return; }
    showFlash("ok", "Leave application submitted");
    setShowForm(false); setFrom(""); setTo(""); setReason(""); setType("Casual");
    loadLeaves();
  }

  const pending  = leaves.filter(l => l.status === "pending").length;
  const approved = leaves.filter(l => l.status === "approved").length;
  const totalDays = leaves.filter(l => l.status === "approved").reduce((s, l) => s + l.days, 0);

  return (
    <ERPShell role="faculty" userName={user?.name}>
      <div className="max-w-2xl mx-auto space-y-5">
        {flash && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${flash.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
            style={{ fontFamily: "var(--font-nunito)" }}>
            {flash.type === "ok" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {flash.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Leave Applications</h1>
            <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: "var(--font-nunito)" }}>{leaves.length} applications</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
            <Plus size={16} /> Apply Leave
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Pending",  value: pending,   color: "#f59e0b" },
            { label: "Approved", value: approved,  color: "#16a34a" },
            { label: "Days Off", value: totalDays, color: "#6BCB77" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: "var(--font-nunito)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Apply Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-navy text-sm" style={{ fontFamily: "var(--font-nunito)" }}>New Application</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1" style={{ fontFamily: "var(--font-nunito)" }}>From</label>
                  <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm" style={{ fontFamily: "var(--font-nunito)" }} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1" style={{ fontFamily: "var(--font-nunito)" }}>To</label>
                  <input type="date" value={to} onChange={e => setTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm" style={{ fontFamily: "var(--font-nunito)" }} />
                </div>
              </div>
              {from && to && new Date(to) >= new Date(from) && (
                <p className="text-xs text-green-600 font-bold" style={{ fontFamily: "var(--font-nunito)" }}>
                  {daysBetween(from, to)} day(s)
                </p>
              )}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1" style={{ fontFamily: "var(--font-nunito)" }}>Leave Type</label>
                <select value={type} onChange={e => setType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm" style={{ fontFamily: "var(--font-nunito)" }}>
                  {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1" style={{ fontFamily: "var(--font-nunito)" }}>Reason</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                  className="w-full px-3 py-2 rounded-xl border text-sm resize-none" style={{ fontFamily: "var(--font-nunito)" }}
                  placeholder="Brief reason for leave…" />
              </div>
              <button onClick={handleSubmit} disabled={submitting || !from || !to || !reason.trim()}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ background: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
                {submitting ? "Submitting…" : "Submit Application"}
              </button>
            </div>
          </div>
        )}

        {/* History */}
        {loading ? (
          <div className="text-center py-12 text-gray-400" style={{ fontFamily: "var(--font-nunito)" }}>Loading…</div>
        ) : leaves.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <CalendarDays size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="font-bold text-gray-500" style={{ fontFamily: "var(--font-nunito)" }}>No applications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaves.map(l => {
              const s = STATUS_STYLE[l.status] ?? STATUS_STYLE.pending;
              return (
                <div key={l.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-navy text-sm" style={{ fontFamily: "var(--font-nunito)" }}>{l.type} Leave</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{ background: s.bg, color: s.color, fontFamily: "var(--font-nunito)" }}>
                          {s.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: "var(--font-nunito)" }}>
                        {new Date(l.from_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} –{" "}
                        {new Date(l.to_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        {" · "}<strong>{l.days} day{l.days > 1 ? "s" : ""}</strong>
                      </p>
                      {l.reason && <p className="text-xs text-gray-400 mt-1 truncate" style={{ fontFamily: "var(--font-nunito)" }}>{l.reason}</p>}
                      {l.admin_note && (
                        <p className="text-xs mt-1.5 px-2 py-1 rounded-lg" style={{ background: s.bg, color: s.color, fontFamily: "var(--font-nunito)" }}>
                          Admin: {l.admin_note}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {l.status === "pending" ? <Clock size={16} style={{ color: s.color }} /> :
                       l.status === "approved" ? <CheckCircle size={16} style={{ color: s.color }} /> :
                       <AlertCircle size={16} style={{ color: s.color }} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ERPShell>
  );
}
