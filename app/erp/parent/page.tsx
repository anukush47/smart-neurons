"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { CheckCircle, AlertCircle, CreditCard, BookOpen, Bell, Calendar, ChevronRight, MessageSquare } from "lucide-react";

interface StudentInfo { id: string; name: string; class: string; section: string; }
interface HWItem { id: string; subject: string; title: string; due_date: string; type: string; status: string; }
interface FeeItem { amount_due: number; amount_paid: number; status: string; due_date: string; paid_at: string | null; fee_structures: { name: string; term: string; }; }
interface AttItem { date: string; status: string; }

const ANNOUNCEMENTS = [
  { title: "Annual Sports Day — May 28", tag: "Event", time: "Yesterday", color: "#7c3aed" },
  { title: "Fee reminder: June installment due Jun 1", tag: "Fee", time: "2 days ago", color: "#FF6B6B" },
];

function getWeekDays() {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    return {
      day: dayNames[i],
      date: String(d.getDate()),
      iso,
      future: iso > today.toISOString().slice(0, 10),
    };
  });
}

export default function ParentDashboard() {
  const [userName, setUserName] = useState("");
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [homework, setHomework] = useState<HWItem[]>([]);
  const [fees, setFees] = useState<FeeItem[]>([]);
  const [attendance, setAttendance] = useState<AttItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserName(user.user_metadata?.name || "Parent");
    });

    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    Promise.all([
      fetch("/api/homework/my-child").then(r => r.json()),
      fetch("/api/fees/my-child").then(r => r.json()),
      fetch(`/api/attendance/my-child?month=${monthStr}`).then(r => r.json()),
    ]).then(([hwData, feesData, attData]) => {
      if (hwData.student) setStudent(hwData.student as StudentInfo);
      else if (feesData.student) setStudent(feesData.student as StudentInfo);
      if (hwData.homework) setHomework(hwData.homework as HWItem[]);
      if (feesData.fees) setFees(feesData.fees as FeeItem[]);
      if (attData.attendance) setAttendance(attData.attendance as AttItem[]);
    }).finally(() => setLoading(false));
  }, []);

  const weekDays = getWeekDays();
  const attByDate: Record<string, string> = Object.fromEntries(attendance.map(a => [a.date, a.status]));
  const todayIso = new Date().toISOString().slice(0, 10);
  const todayAtt = attByDate[todayIso];

  const presentCount = attendance.filter(a => a.status === "present").length;
  const totalCount   = attendance.filter(a => !["holiday", "weekend"].includes(a.status)).length;
  const pendingHW    = homework.filter(h => h.status === "pending").length;

  const nextFee = fees
    .filter(f => f.status !== "paid")
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];

  const feeAmount   = nextFee ? `₹${(nextFee.amount_due - nextFee.amount_paid).toLocaleString("en-IN")}` : "—";
  const feeDaysLeft = nextFee ? Math.ceil((new Date(nextFee.due_date).getTime() - Date.now()) / 86400000) : null;

  const lastPaidFee = fees
    .filter(f => f.status === "paid" && f.paid_at)
    .sort((a, b) => new Date(b.paid_at!).getTime() - new Date(a.paid_at!).getTime())[0];

  const childName  = student?.name?.split(" ")[0] ?? "Your child";
  const childClass = student ? `${student.class}-${student.section}` : "";

  return (
    <ERPShell role="parent" userName={userName}>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Hello!</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>
            {loading ? "Loading…" : `Here's what's happening with ${childName} today.`}
          </p>
        </div>

        {student && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: "rgba(255,217,61,0.12)", border: "1.5px solid rgba(255,217,61,0.30)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "rgba(255,217,61,0.20)" }}>🧒</div>
            <div>
              <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{childName}</p>
              <p className="text-xs" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>{childClass}</p>
            </div>
            <ChevronRight size={14} style={{ color: "rgba(26,26,46,0.30)" }} />
          </div>
        )}
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Today",
            value: loading ? "…" : todayAtt === "present" ? "Present ✅" : todayAtt === "absent" ? "Absent ❌" : "Not marked",
            sub:   todayAtt === "present" ? "Attendance marked" : "Check with school",
            color: todayAtt === "present" ? "#6BCB77" : "#FF6B6B",
            bg:    todayAtt === "present" ? "rgba(107,203,119,0.10)" : "rgba(255,107,107,0.08)",
          },
          {
            label: "This Month",
            value: loading ? "…" : `${presentCount}/${totalCount} days`,
            sub:   totalCount > 0 ? `${Math.round((presentCount / totalCount) * 100)}% attendance` : "No records yet",
            color: "#FF6B6B", bg: "rgba(255,107,107,0.08)",
          },
          {
            label: "Homework Due",
            value: loading ? "…" : `${pendingHW} pending`,
            sub:   pendingHW > 0 ? "Action needed" : "All submitted",
            color: "#d97706", bg: "rgba(255,217,61,0.12)",
          },
          {
            label: "Next Fee",
            value: loading ? "…" : feeAmount,
            sub:   feeDaysLeft !== null
              ? feeDaysLeft >= 0 ? `Due in ${feeDaysLeft} days` : `Overdue by ${-feeDaysLeft} days`
              : "No pending fees",
            color: "#7c3aed", bg: "rgba(167,139,250,0.10)",
          },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-xs font-semibold mb-2" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>{s.label}</p>
            <p className="text-sm font-bold text-navy mb-0.5" style={{ fontFamily: "var(--font-nunito)" }}>{s.value}</p>
            <p className="text-xs" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* This week attendance */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
            <Calendar size={15} /> This Week
          </h2>
          <div className="flex gap-2">
            {weekDays.map(d => {
              const status = d.future ? "upcoming" : (attByDate[d.iso] ?? "none");
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                  <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>{d.day}</p>
                  <div className="w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold"
                    style={{
                      fontFamily: "var(--font-nunito)",
                      background: status === "present" ? "rgba(107,203,119,0.15)" : status === "absent" ? "rgba(255,107,107,0.12)" : "rgba(26,26,46,0.05)",
                      color:      status === "present" ? "#6BCB77"                 : status === "absent" ? "#FF6B6B"                : "rgba(26,26,46,0.30)",
                    }}>
                    {status === "present" ? "✓" : status === "absent" ? "✗" : "–"}
                  </div>
                  <p className="text-xs" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-nunito)" }}>{d.date}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex gap-3">
            {([["#6BCB77", "Present"], ["#FF6B6B", "Absent"], ["rgba(26,26,46,0.20)", "Holiday"]] as const).map(([c, l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                <span className="text-xs" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Homework */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
            <BookOpen size={15} /> Homework
          </h2>
          {loading ? (
            <p className="text-sm" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>Loading…</p>
          ) : homework.length === 0 ? (
            <p className="text-sm" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>No homework assigned yet</p>
          ) : (
            <div className="space-y-2.5">
              {homework.slice(0, 3).map(h => (
                <div key={h.id} className="p-3.5 rounded-2xl"
                  style={{
                    background: h.status !== "pending" ? "rgba(107,203,119,0.07)" : "rgba(255,255,255,0.60)",
                    border: `1px solid ${h.status !== "pending" ? "rgba(107,203,119,0.20)" : "rgba(255,255,255,0.60)"}`,
                  }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{h.title}</p>
                    {h.status !== "pending"
                      ? <CheckCircle size={13} style={{ color: "#6BCB77", flexShrink: 0 }} />
                      : <AlertCircle size={13} style={{ color: "#d97706", flexShrink: 0 }} />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(255,107,107,0.10)", color: "#FF6B6B", fontFamily: "var(--font-nunito)" }}>
                      {h.subject}
                    </span>
                    <span className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
                      Due {new Date(h.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fee + Chat */}
        <div className="space-y-4">
          <div className="glass-card p-5" style={{ background: "rgba(167,139,250,0.06)" }}>
            <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
              <CreditCard size={15} style={{ color: "#7c3aed" }} /> Fee Due
            </h2>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{loading ? "…" : feeAmount}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
                  {nextFee
                    ? `Due: ${new Date(nextFee.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`
                    : "No pending fees"}
                </p>
              </div>
              <div className="text-2xl w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(167,139,250,0.12)" }}>💳</div>
            </div>
            <button type="button"
              className="w-full py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{ fontFamily: "var(--font-nunito)", background: "linear-gradient(135deg, #7c3aed, #a78bfa)", boxShadow: "0 4px 16px rgba(124,58,237,0.25)" }}>
              Pay Now via Razorpay
            </button>
            {lastPaidFee && (
              <p className="text-xs mt-2 text-center" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>
                Last paid: ₹{lastPaidFee.amount_paid.toLocaleString("en-IN")} on {new Date(lastPaidFee.paid_at!).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </p>
            )}
          </div>

          <div className="glass-card p-5">
            <h2 className="text-sm font-bold text-navy mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
              <MessageSquare size={15} /> Class Teacher
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "rgba(107,203,119,0.10)" }}>👩‍🏫</div>
              <div>
                <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Class Teacher</p>
                <p className="text-xs" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>{childClass || "Your class"}</p>
              </div>
            </div>
            <button type="button"
              className="w-full py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
              style={{ fontFamily: "var(--font-nunito)", background: "rgba(107,203,119,0.10)", color: "#6BCB77", border: "1.5px solid rgba(107,203,119,0.25)" }}>
              Send Message
            </button>
          </div>
        </div>

        {/* Announcements */}
        <div className="glass-card p-6 lg:col-span-3">
          <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
            <Bell size={15} /> Latest Announcements
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {ANNOUNCEMENTS.map(a => (
              <div key={a.title} className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.60)" }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${a.color}15`, color: a.color, fontFamily: "var(--font-nunito)" }}>
                    {a.tag}
                  </span>
                  <span className="text-xs" style={{ color: "rgba(26,26,46,0.35)", fontFamily: "var(--font-inter)" }}>{a.time}</span>
                </div>
                <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-inter)" }}>{a.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ERPShell>
  );
}
