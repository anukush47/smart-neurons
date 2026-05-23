"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import {
  Users, GraduationCap, TrendingUp, AlertCircle,
  CheckCircle, Clock, ArrowRight, Bell, BookOpen,
} from "lucide-react";

const FACULTY = [
  { name: "Aarav Kumar",  cls: "Nursery A" },
  { name: "Neha Sharma",  cls: "LKG A" },
  { name: "Rohan Singh",  cls: "UKG A" },
  { name: "Priya Patel",  cls: "JKG A" },
  { name: "Vikram Verma", cls: "SKG A" },
];

const PENDING_ACTIONS = [
  { type: "Fee Defaulter",   detail: "3 families with dues over 30 days", color: "#d97706" },
  { type: "Admission Query", detail: "New Playgroup enquiry received",    color: "#6BCB77" },
];

interface StudentRow { id: string; name: string; class: string; section: string; dob: string; }
interface HWSub { status: string; }
interface HWRow { homework_submissions: HWSub[]; }

export default function AdminDashboard() {
  const [userName, setUserName] = useState("");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [pendingHW, setPendingHW] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserName(user.user_metadata?.name || "Admin");
    });
    Promise.all([
      fetch("/api/students").then(r => r.json()),
      fetch("/api/homework").then(r => r.json()),
    ]).then(([sData, hwData]) => {
      if (sData.students) setStudents(sData.students as StudentRow[]);
      if (hwData.homework) {
        let cnt = 0;
        for (const hw of hwData.homework as HWRow[]) {
          cnt += hw.homework_submissions?.filter(s => s.status === "pending").length ?? 0;
        }
        setPendingHW(cnt);
      }
    }).finally(() => setLoading(false));
  }, []);

  const today = new Date();
  const birthdays = students.filter(s => {
    if (!s.dob) return false;
    const d = new Date(s.dob);
    return d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  });

  return (
    <ERPShell role="admin" userName={userName}>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Good morning!</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>
            Smart Neurons Preschool · {today.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full transition-all duration-200 hover:-translate-y-0.5"
          style={{ fontFamily: "var(--font-nunito)", background: "rgba(255,107,107,0.10)", color: "#FF6B6B" }}
        >
          <Bell size={13} /> Send Announcement
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Students",
            value: loading ? "…" : String(students.length),
            sub: "5 classes",
            icon: <Users size={18} />,
            color: "#7c3aed", bg: "rgba(167,139,250,0.10)",
          },
          {
            label: "Total Faculty",
            value: "5",
            sub: "Active teachers",
            icon: <GraduationCap size={18} />,
            color: "#d97706", bg: "rgba(255,217,61,0.12)",
          },
          {
            label: "Pending HW",
            value: loading ? "…" : String(pendingHW),
            sub: "Submissions awaited",
            icon: <BookOpen size={18} />,
            color: "#FF6B6B", bg: "rgba(255,107,107,0.10)",
          },
          {
            label: "Birthdays Today",
            value: loading ? "…" : String(birthdays.length),
            sub: birthdays.length > 0 ? birthdays.map(b => b.name.split(" ")[0]).join(", ") : "None today",
            icon: <span className="text-lg">🎂</span>,
            color: "#6BCB77", bg: "rgba(107,203,119,0.10)",
          },
        ].map(s => (
          <div key={s.label} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <TrendingUp size={13} style={{ color: "rgba(26,26,46,0.25)" }} />
            </div>
            <p className="text-2xl font-bold text-navy mb-0.5" style={{ fontFamily: "var(--font-nunito)" }}>{s.value}</p>
            <p className="text-xs font-semibold text-navy mb-0.5" style={{ fontFamily: "var(--font-nunito)" }}>{s.label}</p>
            <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Actions */}
        <div className="glass-card p-6 lg:col-span-1">
          <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
            <AlertCircle size={15} /> Pending Actions
            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,107,107,0.12)", color: "#FF6B6B" }}>
              {PENDING_ACTIONS.length}
            </span>
          </h2>
          <div className="space-y-2.5">
            {PENDING_ACTIONS.map((a, i) => (
              <div key={`${a.type}-${i}`} className="p-3.5 rounded-xl flex items-start gap-3" style={{ background: "rgba(255,255,255,0.55)" }}>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: a.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{a.type}</p>
                  <p className="text-xs leading-snug mt-0.5" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>{a.detail}</p>
                </div>
                <ArrowRight size={13} style={{ color: "rgba(26,26,46,0.30)", flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Daily Routine Compliance */}
        <div className="glass-card p-6 lg:col-span-2">
          <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
            <Clock size={15} /> Daily Routine Compliance — Today
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ fontFamily: "var(--font-inter)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(26,26,46,0.06)" }}>
                  <th className="text-left pb-2 font-semibold" style={{ color: "rgba(26,26,46,0.45)" }}>Faculty</th>
                  <th className="text-left pb-2 font-semibold" style={{ color: "rgba(26,26,46,0.45)" }}>Class</th>
                  <th className="text-center pb-2 font-semibold" style={{ color: "rgba(26,26,46,0.45)" }}>📸 Pic</th>
                  <th className="text-center pb-2 font-semibold" style={{ color: "rgba(26,26,46,0.45)" }}>📋 Plan</th>
                  <th className="text-center pb-2 font-semibold" style={{ color: "rgba(26,26,46,0.45)" }}>✅ Done</th>
                </tr>
              </thead>
              <tbody>
                {FACULTY.map((f, i) => (
                  <tr key={f.name} style={{ borderBottom: i < FACULTY.length - 1 ? "1px solid rgba(26,26,46,0.04)" : "none" }}>
                    <td className="py-2.5 font-medium text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{f.name}</td>
                    <td className="py-2.5" style={{ color: "rgba(26,26,46,0.55)" }}>{f.cls}</td>
                    {[false, false, false].map((_, j) => (
                      <td key={j} className="py-2.5 text-center">
                        <span className="w-4 h-4 rounded-full inline-flex items-center justify-center" style={{ background: "rgba(255,107,107,0.15)" }}>
                          <span style={{ color: "#FF6B6B", fontSize: 10, fontWeight: 700 }}>✕</span>
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Birthdays */}
        <div className="glass-card p-6 lg:col-span-1" style={{ background: "rgba(255,217,61,0.06)" }}>
          <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
            🎂 Birthdays Today
          </h2>
          {loading ? (
            <p className="text-sm" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>Loading…</p>
          ) : birthdays.length > 0 ? (
            <div className="space-y-2.5">
              {birthdays.map(b => (
                <div key={b.id} className="p-3.5 rounded-xl" style={{ background: "rgba(255,217,61,0.12)", border: "1px solid rgba(255,217,61,0.25)" }}>
                  <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{b.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>{b.class} {b.section} · Birthday today 🎂</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>No birthdays today</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6 lg:col-span-2">
          <h2 className="text-sm font-bold text-navy mb-4" style={{ fontFamily: "var(--font-nunito)" }}>Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Mark Holiday",    emoji: "🏖️", color: "#FF6B6B", bg: "rgba(255,107,107,0.08)" },
              { label: "Send Circular",   emoji: "📢", color: "#6BCB77", bg: "rgba(107,203,119,0.08)" },
              { label: "New Admission",   emoji: "📝", color: "#7c3aed", bg: "rgba(167,139,250,0.08)" },
              { label: "Fee Reminder",    emoji: "💰", color: "#d97706", bg: "rgba(255,217,61,0.12)" },
              { label: "Download Report", emoji: "📊", color: "#FF6B6B", bg: "rgba(255,107,107,0.08)" },
              { label: "Add Faculty",     emoji: "👩‍🏫", color: "#6BCB77", bg: "rgba(107,203,119,0.08)" },
            ].map(a => (
              <button key={a.label} type="button"
                className="p-4 rounded-2xl text-left transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: a.bg, border: `1px solid ${a.color}20` }}>
                <p className="text-xl mb-2">{a.emoji}</p>
                <p className="text-xs font-bold" style={{ color: a.color, fontFamily: "var(--font-nunito)" }}>{a.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ERPShell>
  );
}
