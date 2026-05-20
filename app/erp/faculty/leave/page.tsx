"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ERPShell from "@/components/erp/ERPShell";
import {
  Plus, CheckCircle, XCircle, Clock,
  Calendar, ChevronDown, ChevronUp, X, AlertCircle,
} from "lucide-react";

type LeaveStatus = "pending" | "approved" | "rejected";
type LeaveType   = "Casual" | "Sick" | "Emergency" | "Personal";

interface LeaveRequest {
  id: string;
  from: string;
  to: string;
  days: number;
  type: LeaveType;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  adminNote?: string;
}

const TYPE_STYLE: Record<LeaveType, { bg: string; color: string }> = {
  Casual:    { bg: "rgba(107,203,119,0.12)", color: "#6BCB77" },
  Sick:      { bg: "rgba(255,107,107,0.10)", color: "#FF6B6B" },
  Emergency: { bg: "rgba(255,107,107,0.16)", color: "#dc2626" },
  Personal:  { bg: "rgba(255,217,61,0.15)",  color: "#d97706" },
};

const STATUS_STYLE: Record<LeaveStatus, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  pending:  { label: "Pending",  bg: "rgba(255,217,61,0.15)",  color: "#d97706", icon: <Clock size={14} /> },
  approved: { label: "Approved", bg: "rgba(107,203,119,0.12)", color: "#6BCB77", icon: <CheckCircle size={14} /> },
  rejected: { label: "Rejected", bg: "rgba(255,107,107,0.10)", color: "#FF6B6B", icon: <XCircle size={14} /> },
};

const INITIAL_LEAVES: LeaveRequest[] = [
  { id: "L001", from: "2026-05-05", to: "2026-05-05", days: 1, type: "Sick",     reason: "Fever and cold.",                          status: "approved", appliedOn: "2026-05-04", adminNote: "Get well soon." },
  { id: "L002", from: "2026-06-10", to: "2026-06-11", days: 2, type: "Personal", reason: "Family function in hometown.",              status: "pending",  appliedOn: "2026-05-18" },
  { id: "L003", from: "2026-04-14", to: "2026-04-14", days: 1, type: "Casual",   reason: "Personal errand.",                         status: "approved", appliedOn: "2026-04-12", adminNote: "Noted." },
  { id: "L004", from: "2026-03-20", to: "2026-03-20", days: 1, type: "Sick",     reason: "Migraine.",                                status: "approved", appliedOn: "2026-03-19" },
  { id: "L005", from: "2026-02-10", to: "2026-02-10", days: 1, type: "Emergency",reason: "Hospitalisation of a family member.",      status: "approved", appliedOn: "2026-02-10" },
  { id: "L006", from: "2026-01-08", to: "2026-01-09", days: 2, type: "Casual",   reason: "Short trip.",                             status: "rejected", appliedOn: "2025-12-30", adminNote: "Exams period — cannot approve." },
];

const BALANCES = { casual: 8, sick: 5, total: 13, used: 5 };

function daysBetween(from: string, to: string) {
  const diff = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(1, Math.floor(diff / 86400000) + 1);
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function FacultyLeavePage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [leaves, setLeaves]           = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [showForm, setShowForm]       = useState(false);
  const [expanded, setExpanded]       = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | LeaveStatus>("all");

  // Form state
  const [form, setForm] = useState({
    type: "Casual" as LeaveType,
    from: "",
    to: "",
    reason: "",
  });
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const role = sessionStorage.getItem("erp_role");
    const u = sessionStorage.getItem("erp_user");
    if (role !== "faculty") { router.replace("/erp/login"); return; }
    setUser(u || "Ms. Priya Sharma");
  }, []);

  function handleSubmit() {
    if (!form.from || !form.to || !form.reason.trim()) {
      setFormError("Please fill in all fields.");
      return;
    }
    if (form.to < form.from) {
      setFormError("End date cannot be before start date.");
      return;
    }
    const days = daysBetween(form.from, form.to);
    const newLeave: LeaveRequest = {
      id: `L${String(Date.now()).slice(-4)}`,
      from: form.from,
      to: form.to,
      days,
      type: form.type,
      reason: form.reason.trim(),
      status: "pending",
      appliedOn: "2026-05-20",
    };
    setLeaves(prev => [newLeave, ...prev]);
    setForm({ type: "Casual", from: "", to: "", reason: "" });
    setFormError("");
    setShowForm(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  const filtered = leaves.filter(l => filterStatus === "all" || l.status === filterStatus);
  const pending  = leaves.filter(l => l.status === "pending").length;
  const approved = leaves.filter(l => l.status === "approved").length;
  const rejected = leaves.filter(l => l.status === "rejected").length;

  const computedDays = form.from && form.to && form.to >= form.from
    ? daysBetween(form.from, form.to) : 0;

  return (
    <ERPShell role="faculty" userName={user}>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Leave Management</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
            Ms. Priya Sharma · Academic Year 2026–27
          </p>
        </div>
        <button type="button" onClick={() => { setShowForm(v => !v); setFormError(""); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg,#FF6B6B,#ff8e53)", boxShadow: "0 4px 14px rgba(255,107,107,0.28)", fontFamily: "var(--font-nunito)" }}>
          <Plus size={15} /> Apply for Leave
        </button>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Casual Balance",  value: BALANCES.casual, color: "#6BCB77", bg: "rgba(107,203,119,0.10)", sub: "days remaining" },
          { label: "Sick Balance",    value: BALANCES.sick,   color: "#FF6B6B", bg: "rgba(255,107,107,0.08)", sub: "days remaining" },
          { label: "Leaves Used",     value: BALANCES.used,   color: "#d97706", bg: "rgba(255,217,61,0.12)",  sub: "this year" },
          { label: "Pending",         value: pending,          color: pending > 0 ? "#d97706" : "rgba(26,26,46,0.35)", bg: pending > 0 ? "rgba(255,217,61,0.12)" : "rgba(26,26,46,0.04)", sub: "awaiting approval" },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Annual balance bar */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Annual Leave Balance</p>
          <p className="text-xs font-semibold" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
            {BALANCES.used} used of {BALANCES.total} total
          </p>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(26,26,46,0.06)" }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${(BALANCES.used / BALANCES.total) * 100}%`, background: "linear-gradient(90deg,#FF6B6B,#ff8e53)" }} />
        </div>
        <div className="flex justify-between mt-1.5 text-xs" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>
          <span>{BALANCES.total - BALANCES.used} days remaining</span>
          <span>{Math.round((BALANCES.used / BALANCES.total) * 100)}% used</span>
        </div>
      </div>

      {/* Submission success */}
      {submitted && (
        <div className="mb-4 p-3.5 rounded-2xl flex items-center gap-2"
          style={{ background: "rgba(107,203,119,0.10)", border: "1.5px solid rgba(107,203,119,0.28)" }}>
          <CheckCircle size={16} style={{ color: "#6BCB77" }} />
          <p className="text-sm font-semibold" style={{ color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
            Leave request submitted! Admin will review shortly.
          </p>
        </div>
      )}

      {/* Apply form */}
      {showForm && (
        <div className="glass-card p-5 mb-5" style={{ border: "1.5px solid rgba(255,107,107,0.28)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>New Leave Application</h2>
            <button type="button" onClick={() => { setShowForm(false); setFormError(""); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(26,26,46,0.06)" }}>
              <X size={14} style={{ color: "rgba(26,26,46,0.50)" }} />
            </button>
          </div>

          {/* Leave type */}
          <div className="mb-3">
            <p className="text-xs font-semibold mb-2" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>Leave Type</p>
            <div className="flex gap-2 flex-wrap">
              {(["Casual","Sick","Emergency","Personal"] as LeaveType[]).map(t => (
                <button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t }))}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150"
                  style={{
                    background: form.type === t ? TYPE_STYLE[t].bg : "rgba(26,26,46,0.05)",
                    color: form.type === t ? TYPE_STYLE[t].color : "rgba(26,26,46,0.55)",
                    fontFamily: "var(--font-nunito)",
                    border: form.type === t ? `1px solid ${TYPE_STYLE[t].color}40` : "1px solid transparent",
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold mb-1" htmlFor="leave-from"
                style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>From</label>
              <input id="leave-from" type="date" value={form.from}
                onChange={e => setForm(p => ({ ...p, from: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm"
                style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" htmlFor="leave-to"
                style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>To</label>
              <input id="leave-to" type="date" value={form.to}
                onChange={e => setForm(p => ({ ...p, to: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm"
                style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }}
              />
            </div>
          </div>

          {computedDays > 0 && (
            <p className="text-xs mb-3 font-semibold" style={{ color: "#7c3aed", fontFamily: "var(--font-nunito)" }}>
              {computedDays} working day{computedDays > 1 ? "s" : ""} selected
            </p>
          )}

          <div className="mb-4">
            <label className="block text-xs font-semibold mb-1" htmlFor="leave-reason"
              style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>Reason</label>
            <textarea id="leave-reason" rows={3}
              placeholder="Briefly describe the reason for leave…"
              value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl text-sm resize-none"
              style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }}
            />
          </div>

          {formError && (
            <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: "#FF6B6B", fontFamily: "var(--font-inter)" }}>
              <AlertCircle size={14} /> {formError}
            </div>
          )}

          <button type="button" onClick={handleSubmit}
            className="w-full py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg,#FF6B6B,#ff8e53)", boxShadow: "0 4px 14px rgba(255,107,107,0.28)", fontFamily: "var(--font-nunito)" }}>
            Submit Application
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {([
          { key: "all",      label: `All (${leaves.length})` },
          { key: "pending",  label: `Pending (${pending})` },
          { key: "approved", label: `Approved (${approved})` },
          { key: "rejected", label: `Rejected (${rejected})` },
        ] as const).map(f => (
          <button key={f.key} type="button" onClick={() => setFilterStatus(f.key)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150"
            style={{
              background: filterStatus === f.key ? "rgba(124,58,237,0.12)" : "rgba(26,26,46,0.05)",
              color: filterStatus === f.key ? "#7c3aed" : "rgba(26,26,46,0.55)",
              fontFamily: "var(--font-nunito)",
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Leave history */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="glass-card p-10 text-center">
            <p className="text-2xl mb-2">📋</p>
            <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>No leaves found</p>
          </div>
        )}

        {filtered.map(l => {
          const isOpen = expanded === l.id;
          const st = STATUS_STYLE[l.status];
          const lt = TYPE_STYLE[l.type];
          return (
            <div key={l.id} className="glass-card overflow-hidden"
              style={{ border: l.status === "pending" ? "1.5px solid rgba(217,119,6,0.28)" : "1.5px solid rgba(255,255,255,0.60)" }}>
              <button type="button" className="w-full flex items-center gap-4 p-4 text-left"
                onClick={() => setExpanded(isOpen ? null : l.id)}>
                <span className="text-xs font-bold px-2 py-1 rounded-xl flex-shrink-0"
                  style={{ ...lt, fontFamily: "var(--font-nunito)" }}>
                  {l.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>
                    {fmt(l.from)}{l.days > 1 ? ` → ${fmt(l.to)}` : ""}
                    <span className="ml-2 text-xs font-semibold" style={{ color: "rgba(26,26,46,0.45)" }}>
                      {l.days} day{l.days > 1 ? "s" : ""}
                    </span>
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
                    {l.reason}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span style={{ color: st.color }}>{st.icon}</span>
                  <span className="text-xs font-bold hidden sm:block" style={{ color: st.color, fontFamily: "var(--font-nunito)" }}>
                    {st.label}
                  </span>
                </div>
                {isOpen ? <ChevronUp size={15} style={{ color: "rgba(26,26,46,0.40)", flexShrink: 0 }} /> : <ChevronDown size={15} style={{ color: "rgba(26,26,46,0.40)", flexShrink: 0 }} />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(26,26,46,0.06)" }}>
                  <div className="grid grid-cols-2 gap-3 my-4">
                    {[
                      { label: "Leave Type",   value: l.type },
                      { label: "Duration",     value: `${l.days} day${l.days > 1 ? "s" : ""}` },
                      { label: "Applied On",   value: fmt(l.appliedOn) },
                      { label: "Status",       value: st.label },
                    ].map(r => (
                      <div key={r.label}>
                        <p className="text-xs" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>{r.label}</p>
                        <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{r.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-2xl mb-3" style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.06)" }}>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>Your Reason</p>
                    <p className="text-sm" style={{ color: "rgba(26,26,46,0.70)", fontFamily: "var(--font-inter)" }}>{l.reason}</p>
                  </div>
                  {l.adminNote && (
                    <div className="p-3 rounded-2xl" style={{ background: st.bg, border: `1px solid ${st.color}30` }}>
                      <p className="text-xs font-semibold mb-0.5" style={{ color: st.color, fontFamily: "var(--font-nunito)" }}>Admin's Response</p>
                      <p className="text-sm" style={{ color: "rgba(26,26,46,0.70)", fontFamily: "var(--font-inter)" }}>{l.adminNote}</p>
                    </div>
                  )}
                  {l.status === "pending" && !l.adminNote && (
                    <p className="text-xs mt-2" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>
                      Awaiting admin review. You'll be notified once a decision is made.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ERPShell>
  );
}
