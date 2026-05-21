"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import {
  Users, GraduationCap, ClipboardList, CreditCard, TrendingUp,
  AlertCircle, Calendar, CheckCircle, Clock, ArrowRight, Bell
} from "lucide-react";

const todayStats = [
  { label: "Attendance Today", value: "87%", sub: "136 / 156 present", icon: <ClipboardList size={18} />, color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
  { label: "Fee Collected", value: "₹45,200", sub: "Today's collections", icon: <CreditCard size={18} />, color: "#FF6B6B", bg: "rgba(255,107,107,0.10)" },
  { label: "Total Students", value: "156", sub: "4 classes · 8 sections", icon: <Users size={18} />, color: "#7c3aed", bg: "rgba(167,139,250,0.10)" },
  { label: "Total Faculty", value: "18", sub: "2 on leave today", icon: <GraduationCap size={18} />, color: "#d97706", bg: "rgba(255,217,61,0.12)" },
];

const pendingActions = [
  { type: "Leave Request", detail: "Ms. Priya Sharma — Sick Leave (2 days)", urgent: true, color: "#FF6B6B" },
  { type: "Leave Request", detail: "Mr. Rahul Verma — Casual Leave (1 day)", urgent: true, color: "#FF6B6B" },
  { type: "Fee Defaulter", detail: "3 families with dues > 30 days", urgent: false, color: "#d97706" },
  { type: "Admission Query", detail: "Aarav Mehta — Playgroup enquiry", urgent: false, color: "#6BCB77" },
];

const dailyRoutineCompliance = [
  { name: "Ms. Priya Sharma", class: "Nursery A", presencePic: true, workPlan: true, workDone: false },
  { name: "Mr. Rahul Verma", class: "JKG B", presencePic: true, workPlan: false, workDone: false },
  { name: "Ms. Anita Patel", class: "SKG A", presencePic: true, workPlan: true, workDone: true },
  { name: "Ms. Kavita Singh", class: "Playgroup A", presencePic: true, workPlan: true, workDone: true },
  { name: "Mr. Suresh Yadav", class: "Nursery B", presencePic: false, workPlan: false, workDone: false },
];

const birthdays = [
  { name: "Ananya Sharma", class: "Nursery A", age: "4 today 🎂" },
  { name: "Dev Patel", class: "JKG B", age: "5 today 🎂" },
];

export default function AdminDashboard() {
  const [user, setUser] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUser(user.user_metadata?.name || "Admin");
    });
  }, []);

  return (
    <ERPShell role="admin" userName={user}>
      {/* Greeting */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>
            Good morning! 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>
            Smart Neurons Preschool · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full transition-all duration-200 hover:-translate-y-0.5"
            style={{ fontFamily: "var(--font-nunito)", background: "rgba(255,107,107,0.10)", color: "#FF6B6B" }}
          >
            <Bell size={13} /> Send Announcement
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {todayStats.map((s) => (
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
            <AlertCircle size={15} className="text-coral-500" />
            Pending Actions
            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,107,107,0.12)", color: "#FF6B6B" }}>{pendingActions.length}</span>
          </h2>
          <div className="space-y-2.5">
            {pendingActions.map((a, i) => (
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
            <Clock size={15} className="text-coral-500" /> Daily Routine Compliance — Today
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
                {dailyRoutineCompliance.map((f, i) => (
                  <tr
                    key={f.name}
                    className="transition-colors"
                    style={{ borderBottom: i < dailyRoutineCompliance.length - 1 ? "1px solid rgba(26,26,46,0.04)" : "none" }}
                  >
                    <td className="py-2.5 font-medium text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{f.name}</td>
                    <td className="py-2.5" style={{ color: "rgba(26,26,46,0.55)" }}>{f.class}</td>
                    {[f.presencePic, f.workPlan, f.workDone].map((v, j) => (
                      <td key={["pic","plan","done"][j]} className="py-2.5 text-center">
                        {v
                          ? <CheckCircle size={14} style={{ color: "#6BCB77", display: "inline" }} />
                          : <span className="w-4 h-4 rounded-full inline-flex items-center justify-center" style={{ background: "rgba(255,107,107,0.15)" }}>
                              <span style={{ color: "#FF6B6B", fontSize: 10, fontWeight: 700 }}>✕</span>
                            </span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Birthdays + Calendar */}
        <div className="glass-card p-6 lg:col-span-1" style={{ background: "rgba(255,217,61,0.06)" }}>
          <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
            🎂 Birthdays Today
          </h2>
          {birthdays.length > 0 ? (
            <div className="space-y-2.5">
              {birthdays.map((b) => (
                <div key={b.name} className="p-3.5 rounded-xl" style={{ background: "rgba(255,217,61,0.12)", border: "1px solid rgba(255,217,61,0.25)" }}>
                  <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{b.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>{b.class} · {b.age}</p>
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
              { label: "Mark Holiday", emoji: "🏖️", color: "#FF6B6B", bg: "rgba(255,107,107,0.08)" },
              { label: "Send Circular", emoji: "📢", color: "#6BCB77", bg: "rgba(107,203,119,0.08)" },
              { label: "New Admission", emoji: "📝", color: "#7c3aed", bg: "rgba(167,139,250,0.08)" },
              { label: "Fee Reminder", emoji: "💰", color: "#d97706", bg: "rgba(255,217,61,0.12)" },
              { label: "Download Report", emoji: "📊", color: "#FF6B6B", bg: "rgba(255,107,107,0.08)" },
              { label: "Add Faculty", emoji: "👩‍🏫", color: "#6BCB77", bg: "rgba(107,203,119,0.08)" },
            ].map((a) => (
              <button
                key={a.label}
                type="button"
                className="p-4 rounded-2xl text-left transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: a.bg, border: `1px solid ${a.color}20` }}
              >
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
