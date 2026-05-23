"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Search, Users } from "lucide-react";

interface StaffMember {
  id: string; name: string; email: string; role: string;
  class_assigned: string | null; designation: string | null;
  phone: string | null; join_date: string | null;
  casual_balance: number; sick_balance: number;
  pending_leaves: number; approved_leaves: number;
}
interface LeaveRequest {
  id: string; faculty_id: string; faculty_name: string;
  from_date: string; to_date: string; days: number;
  type: string; reason: string; status: string;
  admin_note: string | null; applied_at: string;
}

const TYPE_COLOR: Record<string, { bg: string; color: string }> = {
  Casual:    { bg: "rgba(107,203,119,0.12)", color: "#6BCB77" },
  Sick:      { bg: "rgba(255,107,107,0.10)", color: "#FF6B6B" },
  Emergency: { bg: "rgba(255,107,107,0.16)", color: "#dc2626" },
  Personal:  { bg: "rgba(255,217,61,0.15)",  color: "#d97706" },
};
const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  pending:  { label: "Pending",  bg: "rgba(255,217,61,0.15)",  color: "#d97706" },
  approved: { label: "Approved", bg: "rgba(107,203,119,0.12)", color: "#6BCB77" },
  rejected: { label: "Rejected", bg: "rgba(255,107,107,0.10)", color: "#FF6B6B" },
};

export default function AdminStaffPage() {
  const [userName, setUserName] = useState("");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [noteInput, setNoteInput] = useState<Record<string, string>>({});
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserName(user.app_metadata?.name || user.user_metadata?.name || "Admin");
    });
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [sr, lr] = await Promise.all([
      fetch("/api/staff").then(r => r.json()),
      fetch("/api/leave").then(r => r.json()),
    ]);
    if (sr.staff) setStaff(sr.staff);
    if (lr.leaves) setLeaves(lr.leaves);
    setLoading(false);
  }

  async function handleLeaveAction(leaveId: string, status: "approved" | "rejected") {
    setActing(leaveId);
    await fetch("/api/leave", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: leaveId, status, admin_note: noteInput[leaveId] ?? "" }),
    });
    setActing(null);
    loadData();
  }

  const filtered = staff.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.class_assigned ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const pendingLeaves = leaves.filter(l => l.status === "pending");

  return (
    <ERPShell role="admin" userName={userName}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Staff & Leave</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          Manage faculty profiles and approve leave requests
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Staff",    value: loading ? "…" : staff.length,        color: "#7c3aed" },
          { label: "Pending Leaves", value: loading ? "…" : pendingLeaves.length, color: "#d97706" },
          { label: "Approved",       value: loading ? "…" : leaves.filter(l => l.status === "approved").length, color: "#6BCB77" },
        ].map(c => (
          <div key={c.label} className="glass-card p-4">
            <p className="text-2xl font-bold" style={{ color: c.color, fontFamily: "var(--font-nunito)" }}>{c.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{c.label}</p>
          </div>
        ))}
      </div>

      {pendingLeaves.length > 0 && (
        <div className="glass-card p-5 mb-6">
          <p className="text-sm font-bold text-navy mb-3" style={{ fontFamily: "var(--font-nunito)" }}>Pending Approvals ({pendingLeaves.length})</p>
          <div className="space-y-3">
            {pendingLeaves.map(l => (
              <div key={l.id} className="rounded-xl p-3" style={{ background: "rgba(255,217,61,0.08)", border: "1px solid rgba(255,217,61,0.20)" }}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{l.faculty_name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>
                      {l.type} · {l.from_date} → {l.to_date} · {l.days} day{l.days !== 1 ? "s" : ""}
                    </p>
                    {l.reason && <p className="text-xs mt-1 italic" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>"{l.reason}"</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button type="button" onClick={() => handleLeaveAction(l.id, "approved")} disabled={acting === l.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-60"
                      style={{ background: "rgba(107,203,119,0.15)", color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
                      <CheckCircle size={12} /> Approve
                    </button>
                    <button type="button" onClick={() => handleLeaveAction(l.id, "rejected")} disabled={acting === l.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-60"
                      style={{ background: "rgba(255,107,107,0.12)", color: "#FF6B6B", fontFamily: "var(--font-nunito)" }}>
                      <XCircle size={12} /> Reject
                    </button>
                  </div>
                </div>
                <input type="text" placeholder="Admin note (optional)…"
                  value={noteInput[l.id] ?? ""}
                  onChange={e => setNoteInput(p => ({ ...p, [l.id]: e.target.value }))}
                  className="w-full mt-2 px-3 py-1.5 rounded-lg text-xs"
                  style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.70)" }} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative mb-4">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(26,26,46,0.35)" }} />
        <input type="text" placeholder="Search by name or class…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 rounded-xl text-sm"
          style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }} />
      </div>

      {loading ? (
        <div className="glass-card p-10 text-center"><p className="text-sm" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>Loading staff…</p></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(s => {
            const open = expanded === s.id;
            const staffLeaves = leaves.filter(l => l.faculty_id === s.id);
            return (
              <div key={s.id} className="glass-card overflow-hidden">
                <button type="button" onClick={() => setExpanded(open ? null : s.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: s.role === "admin" ? "#FF6B6B" : "#6BCB77", fontFamily: "var(--font-nunito)" }}>
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{s.name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: s.role === "admin" ? "rgba(255,107,107,0.10)" : "rgba(107,203,119,0.10)", color: s.role === "admin" ? "#FF6B6B" : "#6BCB77", fontFamily: "var(--font-nunito)" }}>
                        {s.role === "admin" ? "Admin" : "Faculty"}
                      </span>
                      {s.pending_leaves > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: "rgba(255,217,61,0.15)", color: "#d97706", fontFamily: "var(--font-nunito)" }}>
                          {s.pending_leaves} pending
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
                      {s.designation ?? (s.class_assigned ? `Class Teacher — ${s.class_assigned}` : s.email)}
                    </p>
                  </div>
                  {open ? <ChevronUp size={16} style={{ color: "rgba(26,26,46,0.35)" }} /> : <ChevronDown size={16} style={{ color: "rgba(26,26,46,0.35)" }} />}
                </button>
                {open && (
                  <div className="px-4 pb-4" style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
                    <div className="grid sm:grid-cols-3 gap-3 pt-3 mb-4">
                      <div><p className="text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-nunito)" }}>EMAIL</p>
                        <p className="text-sm font-semibold text-navy truncate" style={{ fontFamily: "var(--font-inter)" }}>{s.email}</p></div>
                      {s.phone && <div><p className="text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-nunito)" }}>PHONE</p>
                        <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-inter)" }}>{s.phone}</p></div>}
                      <div><p className="text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-nunito)" }}>CASUAL</p>
                        <p className="text-sm font-bold" style={{ color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>{s.casual_balance} days</p></div>
                      <div><p className="text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-nunito)" }}>SICK</p>
                        <p className="text-sm font-bold" style={{ color: "#d97706", fontFamily: "var(--font-nunito)" }}>{s.sick_balance} days</p></div>
                    </div>
                    {staffLeaves.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-bold mb-2" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)", textTransform: "uppercase" }}>Leave History</p>
                        {staffLeaves.map(l => {
                          const ss = STATUS_STYLE[l.status] ?? STATUS_STYLE.pending;
                          const ts = TYPE_COLOR[l.type] ?? TYPE_COLOR.Personal;
                          return (
                            <div key={l.id} className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
                              style={{ background: "rgba(26,26,46,0.03)", border: "1px solid rgba(26,26,46,0.06)" }}>
                              <span className="font-bold px-2 py-0.5 rounded-md" style={{ background: ts.bg, color: ts.color, fontFamily: "var(--font-nunito)" }}>{l.type}</span>
                              <span style={{ color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-inter)" }}>{l.from_date} → {l.to_date} ({l.days}d)</span>
                              <span className="ml-auto font-bold px-2 py-0.5 rounded-md" style={{ background: ss.bg, color: ss.color, fontFamily: "var(--font-nunito)" }}>{ss.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="glass-card p-10 text-center">
              <Users size={32} className="mx-auto mb-3" style={{ color: "rgba(26,26,46,0.20)" }} />
              <p className="text-sm" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>No staff found.</p>
            </div>
          )}
        </div>
      )}
    </ERPShell>
  );
}
