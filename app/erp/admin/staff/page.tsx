"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import {
  Search, Users, CheckCircle, XCircle, Clock,
  Phone, Mail, ChevronDown, ChevronUp, X,
  GraduationCap, AlertCircle, Calendar,
} from "lucide-react";

type LeaveStatus = "pending" | "approved" | "rejected";
type LeaveType   = "Casual" | "Sick" | "Emergency" | "Personal";
type StaffRole   = "Teacher" | "Coordinator" | "Support";

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

interface StaffMember {
  id: number;
  name: string;
  role: StaffRole;
  designation: string;
  classes: string[];
  phone: string;
  email: string;
  joinDate: string;
  status: "active" | "on-leave";
  avatar: string;
  casualBalance: number;
  sickBalance: number;
  leaves: LeaveRequest[];
}

const LEAVE_TYPE_STYLE: Record<LeaveType, { bg: string; color: string }> = {
  Casual:    { bg: "rgba(107,203,119,0.12)", color: "#6BCB77" },
  Sick:      { bg: "rgba(255,107,107,0.10)", color: "#FF6B6B" },
  Emergency: { bg: "rgba(255,107,107,0.15)", color: "#dc2626" },
  Personal:  { bg: "rgba(255,217,61,0.15)",  color: "#d97706" },
};

const STATUS_STYLE: Record<LeaveStatus, { label: string; bg: string; color: string }> = {
  pending:  { label: "Pending",  bg: "rgba(255,217,61,0.15)",  color: "#d97706" },
  approved: { label: "Approved", bg: "rgba(107,203,119,0.12)", color: "#6BCB77" },
  rejected: { label: "Rejected", bg: "rgba(255,107,107,0.10)", color: "#FF6B6B" },
};

const STAFF_DATA: StaffMember[] = [
  {
    id: 1, name: "Aarav Kumar", role: "Teacher", designation: "Class Teacher — Nursery-A",
    classes: ["Nursery-A"], phone: "9876511111", email: "aarav@smartneurons.in",
    joinDate: "2023-04-01", status: "active", avatar: "👨‍🏫",
    casualBalance: 10, sickBalance: 7,
    leaves: [
      { id: "L001", from: "2026-04-22", to: "2026-04-22", days: 1, type: "Casual", reason: "Personal work.", status: "approved", appliedOn: "2026-04-20" },
      { id: "L002", from: "2026-06-10", to: "2026-06-11", days: 2, type: "Personal", reason: "Family function in hometown.", status: "pending", appliedOn: "2026-05-18" },
    ],
  },
  {
    id: 2, name: "Neha Sharma", role: "Teacher", designation: "Class Teacher — LKG-A",
    classes: ["LKG-A"], phone: "8765422222", email: "neha@smartneurons.in",
    joinDate: "2022-06-01", status: "active", avatar: "👩‍🏫",
    casualBalance: 8, sickBalance: 5,
    leaves: [
      { id: "L003", from: "2026-05-05", to: "2026-05-05", days: 1, type: "Sick", reason: "Fever and cold.", status: "approved", appliedOn: "2026-05-04", adminNote: "Get well soon." },
      { id: "L004", from: "2026-05-22", to: "2026-05-23", days: 2, type: "Casual", reason: "Attending a wedding.", status: "pending", appliedOn: "2026-05-19" },
    ],
  },
  {
    id: 3, name: "Rohan Singh", role: "Teacher", designation: "Class Teacher — UKG-A",
    classes: ["UKG-A"], phone: "7654333333", email: "rohan@smartneurons.in",
    joinDate: "2021-07-01", status: "active", avatar: "👨‍🏫",
    casualBalance: 6, sickBalance: 3,
    leaves: [
      { id: "L005", from: "2026-05-14", to: "2026-05-14", days: 1, type: "Sick", reason: "Doctor's appointment.", status: "approved", appliedOn: "2026-05-13" },
    ],
  },
  {
    id: 4, name: "Priya Patel", role: "Teacher", designation: "Class Teacher — JKG-A",
    classes: ["JKG-A"], phone: "6543244444", email: "priya@smartneurons.in",
    joinDate: "2022-08-01", status: "active", avatar: "👩‍🏫",
    casualBalance: 9, sickBalance: 8,
    leaves: [
      { id: "L006", from: "2026-04-15", to: "2026-04-16", days: 2, type: "Casual", reason: "Personal errands.", status: "approved", appliedOn: "2026-04-10" },
    ],
  },
  {
    id: 5, name: "Vikram Verma", role: "Teacher", designation: "Class Teacher — SKG-A",
    classes: ["SKG-A"], phone: "5432155555", email: "vikram@smartneurons.in",
    joinDate: "2020-03-15", status: "active", avatar: "👨‍🏫",
    casualBalance: 9, sickBalance: 8,
    leaves: [],
  },
  {
    id: 6, name: "Khushboo P", role: "Coordinator", designation: "School Administrator",
    classes: [], phone: "4321066666", email: "khushboo.p@smartneurons.in",
    joinDate: "2021-01-10", status: "active", avatar: "👩‍💼",
    casualBalance: 10, sickBalance: 10,
    leaves: [
      { id: "L007", from: "2026-05-19", to: "2026-05-21", days: 3, type: "Sick", reason: "Viral fever — doctor advised rest.", status: "pending", appliedOn: "2026-05-18" },
    ],
  },
  {
    id: 7, name: "Ms. Principal", role: "Coordinator", designation: "School Principal",
    classes: [], phone: "3210977777", email: "principal@smartneurons.in",
    joinDate: "2019-06-01", status: "active", avatar: "👩‍💼",
    casualBalance: 12, sickBalance: 10,
    leaves: [],
  },
];

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminStaffPage() {
  const [user, setUser] = useState("");
  const [staff, setStaff] = useState<StaffMember[]>(STAFF_DATA);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"staff" | "leaves">("staff");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [expandedLeave, setExpandedLeave] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUser(user.user_metadata?.name || "Admin");
    });
  }, []);

  const allPendingLeaves = useMemo(() =>
    staff.flatMap(s =>
      s.leaves
        .filter(l => l.status === "pending")
        .map(l => ({ ...l, staffName: s.name, staffId: s.id }))
    ),
  [staff]);

  const filteredStaff = useMemo(() => {
    const q = search.toLowerCase();
    return staff.filter(s =>
      !q || s.name.toLowerCase().includes(q) || s.designation.toLowerCase().includes(q)
    );
  }, [staff, search]);

  function updateLeave(staffId: number, leaveId: string, status: LeaveStatus, note: string) {
    setStaff(prev => prev.map(s => {
      if (s.id !== staffId) return s;
      const newLeaves = s.leaves.map(l =>
        l.id !== leaveId ? l : { ...l, status, adminNote: note || undefined }
      );
      const onLeave = newLeaves.some(l => {
        if (l.status !== "approved") return false;
        const today = new Date().toISOString().slice(0, 10);
        return l.from <= today && l.to >= today;
      });
      return { ...s, leaves: newLeaves, status: onLeave ? "on-leave" : "active" };
    }));
    setExpandedLeave(null);
    setNoteInput(prev => { const n = { ...prev }; delete n[leaveId]; return n; });
  }

  const activeCount   = staff.filter(s => s.status === "active").length;
  const onLeaveCount  = staff.filter(s => s.status === "on-leave").length;
  const pendingCount  = allPendingLeaves.length;

  return (
    <ERPShell role="admin" userName={user}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Staff & Leave</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          {staff.length} staff members · Academic Year 2026–27
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Staff",    value: staff.length,  color: "#7c3aed", bg: "rgba(167,139,250,0.10)" },
          { label: "Active Today",   value: activeCount,   color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
          { label: "On Leave",       value: onLeaveCount,  color: "#FF6B6B", bg: "rgba(255,107,107,0.08)" },
          { label: "Pending Leaves", value: pendingCount,  color: "#d97706", bg: "rgba(255,217,61,0.12)",
            highlight: pendingCount > 0 },
        ].map(s => (
          <div key={s.label} className="glass-card p-4"
            style={{ border: s.highlight ? "1.5px solid rgba(217,119,6,0.30)" : undefined }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && (
        <div className="mb-5 p-4 rounded-2xl flex items-center gap-3 cursor-pointer"
          onClick={() => setTab("leaves")}
          style={{ background: "rgba(255,217,61,0.10)", border: "1.5px solid rgba(217,119,6,0.25)" }}>
          <AlertCircle size={18} style={{ color: "#d97706", flexShrink: 0 }} />
          <div className="flex-1">
            <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>
              {pendingCount} leave request{pendingCount > 1 ? "s" : ""} awaiting approval
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>
              {allPendingLeaves.map(l => l.staffName.split(" ")[1]).join(", ")} · Click to review
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-xl flex-shrink-0"
            style={{ background: "#d97706", color: "white", fontFamily: "var(--font-nunito)" }}>
            Review →
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(["staff", "leaves"] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className="px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all duration-150"
            style={{
              background: tab === t ? "rgba(124,58,237,0.12)" : "rgba(26,26,46,0.05)",
              color: tab === t ? "#7c3aed" : "rgba(26,26,46,0.55)",
              fontFamily: "var(--font-nunito)",
              border: tab === t ? "1.5px solid rgba(124,58,237,0.25)" : "1.5px solid transparent",
            }}>
            {t === "staff" ? `Staff Directory (${staff.length})` : `Leave Requests (${allPendingLeaves.length} pending)`}
          </button>
        ))}
      </div>

      {/* ── STAFF DIRECTORY ── */}
      {tab === "staff" && (
        <div className={`grid gap-5 ${selectedStaff ? "lg:grid-cols-3" : "grid-cols-1"}`}>
          <div className={selectedStaff ? "lg:col-span-2" : ""}>
            {/* Search */}
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(26,26,46,0.35)" }} />
              <input type="text" placeholder="Search staff…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-sm"
                style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }}
              />
            </div>

            <div className="space-y-2">
              {filteredStaff.map(s => {
                const pending = s.leaves.filter(l => l.status === "pending").length;
                const isSelected = selectedStaff?.id === s.id;
                return (
                  <button key={s.id} type="button"
                    onClick={() => setSelectedStaff(isSelected ? null : s)}
                    className="w-full text-left glass-card"
                    style={{
                      borderRadius: "1.25rem",
                      border: isSelected ? "1.5px solid rgba(124,58,237,0.35)" : "1.5px solid rgba(255,255,255,0.60)",
                      background: isSelected ? "rgba(124,58,237,0.04)" : undefined,
                    }}>
                    <div className="flex items-center gap-3 p-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: s.status === "on-leave" ? "rgba(255,107,107,0.10)" : "rgba(107,203,119,0.10)" }}>
                        {s.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{s.name}</p>
                          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                            style={{
                              background: s.status === "on-leave" ? "rgba(255,107,107,0.10)" : "rgba(107,203,119,0.10)",
                              color: s.status === "on-leave" ? "#FF6B6B" : "#6BCB77",
                              fontFamily: "var(--font-nunito)",
                            }}>
                            {s.status === "on-leave" ? "On Leave" : "Active"}
                          </span>
                          {pending > 0 && (
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: "rgba(217,119,6,0.12)", color: "#d97706", fontFamily: "var(--font-nunito)" }}>
                              {pending} pending
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
                          {s.designation}{s.classes.length > 0 ? ` · ${s.classes.join(", ")}` : ""}
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                          style={{ background: "rgba(26,26,46,0.05)", color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>
                          {s.casualBalance}C · {s.sickBalance}S
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Staff profile panel */}
          {selectedStaff && (
            <div className="lg:col-span-1">
              <div className="glass-card p-5 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Staff Profile</h2>
                  <button type="button" onClick={() => setSelectedStaff(null)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(26,26,46,0.06)" }}>
                    <X size={14} style={{ color: "rgba(26,26,46,0.50)" }} />
                  </button>
                </div>

                <div className="text-center mb-5">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3"
                    style={{ background: "rgba(107,203,119,0.10)" }}>
                    {selectedStaff.avatar}
                  </div>
                  <p className="text-base font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{selectedStaff.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>{selectedStaff.designation}</p>
                  <span className="inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: selectedStaff.status === "on-leave" ? "rgba(255,107,107,0.10)" : "rgba(107,203,119,0.10)",
                      color: selectedStaff.status === "on-leave" ? "#FF6B6B" : "#6BCB77",
                      fontFamily: "var(--font-nunito)",
                    }}>
                    {selectedStaff.status === "on-leave" ? "On Leave Today" : "Active"}
                  </span>
                </div>

                {/* Leave balances */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { label: "Casual Leave",    value: selectedStaff.casualBalance, color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
                    { label: "Sick Leave",      value: selectedStaff.sickBalance,   color: "#FF6B6B", bg: "rgba(255,107,107,0.08)" },
                  ].map(b => (
                    <div key={b.label} className="p-3 rounded-2xl text-center" style={{ background: b.bg }}>
                      <p className="text-xl font-bold" style={{ color: b.color, fontFamily: "var(--font-nunito)" }}>{b.value}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>{b.label}</p>
                    </div>
                  ))}
                </div>

                {/* Contact */}
                {[
                  { icon: <Phone size={13} />,  label: "Phone",     value: selectedStaff.phone    },
                  { icon: <Mail size={13} />,   label: "Email",     value: selectedStaff.email    },
                  { icon: <Calendar size={13}/>, label: "Joined",   value: fmt(selectedStaff.joinDate) },
                  { icon: <GraduationCap size={13}/>, label: "Classes", value: selectedStaff.classes.join(", ") || "—" },
                ].map(r => (
                  <div key={r.label} className="flex gap-3 mb-2.5">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.40)" }}>
                      {r.icon}
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>{r.label}</p>
                      <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{r.value}</p>
                    </div>
                  </div>
                ))}

                {/* Leave history for this staff */}
                {selectedStaff.leaves.length > 0 && (
                  <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
                    <p className="text-xs font-bold text-navy mb-2" style={{ fontFamily: "var(--font-nunito)" }}>Leave History</p>
                    <div className="space-y-2">
                      {selectedStaff.leaves.map(l => (
                        <div key={l.id} className="p-2.5 rounded-xl"
                          style={{ background: STATUS_STYLE[l.status].bg, border: `1px solid ${STATUS_STYLE[l.status].color}25` }}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: LEAVE_TYPE_STYLE[l.type].bg, color: LEAVE_TYPE_STYLE[l.type].color, fontFamily: "var(--font-nunito)" }}>
                              {l.type}
                            </span>
                            <span className="text-xs font-bold" style={{ color: STATUS_STYLE[l.status].color, fontFamily: "var(--font-nunito)" }}>
                              {STATUS_STYLE[l.status].label}
                            </span>
                          </div>
                          <p className="text-xs text-navy font-semibold" style={{ fontFamily: "var(--font-nunito)" }}>
                            {fmt(l.from)}{l.days > 1 ? ` → ${fmt(l.to)}` : ""} · {l.days}d
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── LEAVE REQUESTS ── */}
      {tab === "leaves" && (
        <div className="space-y-3">
          {staff.flatMap(s =>
            s.leaves.map(l => ({ ...l, staffName: s.name, staffId: s.id, staffAvatar: s.avatar }))
          )
          .sort((a, b) => {
            const order: Record<LeaveStatus, number> = { pending: 0, approved: 1, rejected: 2 };
            return order[a.status] - order[b.status] || b.appliedOn.localeCompare(a.appliedOn);
          })
          .map(l => {
            const isOpen = expandedLeave === l.id;
            const st = STATUS_STYLE[l.status];
            const lt = LEAVE_TYPE_STYLE[l.type];
            return (
              <div key={l.id} className="glass-card overflow-hidden"
                style={{ border: l.status === "pending" ? "1.5px solid rgba(217,119,6,0.28)" : "1.5px solid rgba(255,255,255,0.60)" }}>
                <button type="button" className="w-full flex items-center gap-4 p-4 text-left"
                  onClick={() => setExpandedLeave(isOpen ? null : l.id)}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: "rgba(255,217,61,0.12)" }}>
                    {l.staffAvatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{l.staffName}</p>
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                        style={{ ...lt, fontFamily: "var(--font-nunito)" }}>{l.type}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
                      {fmt(l.from)}{l.days > 1 ? ` → ${fmt(l.to)}` : ""} · {l.days} day{l.days > 1 ? "s" : ""} · Applied {fmt(l.appliedOn)}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: st.bg, color: st.color, fontFamily: "var(--font-nunito)" }}>
                    {st.label}
                  </span>
                  {isOpen ? <ChevronUp size={15} style={{ color: "rgba(26,26,46,0.40)", flexShrink: 0 }} /> : <ChevronDown size={15} style={{ color: "rgba(26,26,46,0.40)", flexShrink: 0 }} />}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(26,26,46,0.06)" }}>
                    <p className="text-sm mt-3 mb-4 leading-relaxed"
                      style={{ color: "rgba(26,26,46,0.65)", fontFamily: "var(--font-inter)" }}>
                      <span className="font-semibold text-navy">Reason: </span>{l.reason}
                    </p>

                    {l.adminNote && (
                      <div className="p-3 rounded-2xl mb-4"
                        style={{ background: st.bg, border: `1px solid ${st.color}25` }}>
                        <p className="text-xs font-semibold mb-0.5" style={{ color: st.color, fontFamily: "var(--font-nunito)" }}>Admin Note</p>
                        <p className="text-sm" style={{ color: "rgba(26,26,46,0.70)", fontFamily: "var(--font-inter)" }}>{l.adminNote}</p>
                      </div>
                    )}

                    {l.status === "pending" && (
                      <>
                        <div className="mb-3">
                          <label className="block text-xs font-semibold mb-1"
                            style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}
                            htmlFor={`note-${l.id}`}>
                            Note to staff (optional)
                          </label>
                          <input id={`note-${l.id}`} type="text"
                            placeholder="e.g. Approved. Arrange substitute."
                            value={noteInput[l.id] ?? ""}
                            onChange={e => setNoteInput(p => ({ ...p, [l.id]: e.target.value }))}
                            className="w-full px-3 py-2 rounded-xl text-sm"
                            style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }}
                          />
                        </div>
                        <div className="flex gap-3">
                          <button type="button"
                            onClick={() => updateLeave(l.staffId, l.id, "approved", noteInput[l.id] ?? "")}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5"
                            style={{ background: "linear-gradient(135deg,#6BCB77,#4CAF50)", boxShadow: "0 4px 12px rgba(107,203,119,0.28)", fontFamily: "var(--font-nunito)" }}>
                            <CheckCircle size={15} /> Approve
                          </button>
                          <button type="button"
                            onClick={() => updateLeave(l.staffId, l.id, "rejected", noteInput[l.id] ?? "")}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5"
                            style={{ background: "linear-gradient(135deg,#FF6B6B,#ef4444)", boxShadow: "0 4px 12px rgba(255,107,107,0.25)", fontFamily: "var(--font-nunito)" }}>
                            <XCircle size={15} /> Reject
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </ERPShell>
  );
}
