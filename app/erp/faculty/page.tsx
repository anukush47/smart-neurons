"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { Clock, CheckCircle, AlertCircle, BookOpen, Users, Camera, FileText, CheckSquare, ChevronRight } from "lucide-react";

const todaySchedule = [
  { period: "P1", time: "8:30–9:15", class: "Nursery A", subject: "English & Phonics", status: "done" },
  { period: "P2", time: "9:15–10:00", class: "JKG B", subject: "Mathematics", status: "done" },
  { period: "P3", time: "10:30–11:15", class: "Nursery A", subject: "Creative Arts", status: "current" },
  { period: "P4", time: "11:15–12:00", class: "JKG B", subject: "Story Time & Hindi", status: "upcoming" },
];

const pendingHomework = [
  { student: "Ananya Sharma", class: "Nursery A", hw: "Draw your favourite animal", due: "Today", submitted: false },
  { student: "Dev Patel", class: "Nursery A", hw: "Draw your favourite animal", due: "Today", submitted: false },
  { student: "Riya Gupta", class: "JKG B", hw: "Count objects at home", due: "Yesterday", submitted: false },
  { student: "Arjun Singh", class: "JKG B", hw: "Count objects at home", due: "Yesterday", submitted: true },
];

export default function FacultyDashboard() {
  const router = useRouter();
  const [user, setUser] = useState("");

  const routineStatus = { presence: true, workPlan: true, workDone: false };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUser(user.user_metadata?.name || "Faculty");
    });
  }, []);

  const allDone = routineStatus.presence && routineStatus.workPlan && routineStatus.workDone;

  return (
    <ERPShell role="faculty" userName={user}>
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>
          Good morning! 🌻
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} · Nursery A + JKG B
        </p>
      </div>

      {/* Daily Routine Alert */}
      {!allDone && (
        <div
          className="mb-6 p-4 rounded-2xl flex items-start gap-3"
          style={{
            background: "linear-gradient(135deg, rgba(255,107,107,0.10), rgba(255,217,61,0.10))",
            border: "1.5px solid rgba(255,107,107,0.22)",
          }}
        >
          <AlertCircle size={18} className="text-coral-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>
              Complete your daily routine
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-inter)" }}>
              Your daily presence pic, work plan, and work done are pending. Complete before your first class.
            </p>
          </div>
          <button
            type="button"
            className="text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "#FF6B6B", color: "white", fontFamily: "var(--font-nunito)" }}
          >
            Complete Now
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Daily Routine */}
        <div className="glass-card p-6 lg:col-span-1">
          <h2 className="text-sm font-bold text-navy mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
            <Clock size={15} className="text-coral-500" /> Daily Routine
          </h2>
          <div className="space-y-3">
            {[
              {
                key: "presence",
                label: "Presence Photo",
                sub: "Geo-tagged selfie",
                done: routineStatus.presence,
                icon: <Camera size={16} />,
                color: "#FF6B6B",
                bg: "rgba(255,107,107,0.10)",
              },
              {
                key: "workPlan",
                label: "Daily Work Plan",
                sub: "Submit before 9 AM",
                done: routineStatus.workPlan,
                icon: <FileText size={16} />,
                color: "#6BCB77",
                bg: "rgba(107,203,119,0.10)",
              },
              {
                key: "workDone",
                label: "Work Done Report",
                sub: "Submit by 12:30 PM",
                done: routineStatus.workDone,
                icon: <CheckSquare size={16} />,
                color: "#7c3aed",
                bg: "rgba(167,139,250,0.10)",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: item.done ? item.bg : "rgba(255,255,255,0.60)",
                  border: `1.5px solid ${item.done ? item.color + "33" : "rgba(255,255,255,0.60)"}`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: item.bg, color: item.color }}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{item.label}</p>
                  <p className="text-xs" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>{item.sub}</p>
                </div>
                {item.done
                  ? <CheckCircle size={16} style={{ color: item.color, flexShrink: 0 }} />
                  : <div className="w-4 h-4 rounded-full border-2 flex-shrink-0" style={{ borderColor: "rgba(26,26,46,0.20)" }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="glass-card p-6 lg:col-span-2">
          <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
            <Clock size={15} className="text-coral-500" /> Today&apos;s Schedule
          </h2>
          <div className="space-y-2.5">
            {todaySchedule.map((p) => {
              const isCurrentPeriod = p.status === "current";
              const isDone = p.status === "done";
              return (
                <div
                  key={p.period}
                  className="flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200"
                  style={{
                    background: isCurrentPeriod
                      ? "rgba(255,107,107,0.08)"
                      : isDone
                      ? "rgba(107,203,119,0.06)"
                      : "rgba(255,255,255,0.55)",
                    border: isCurrentPeriod ? "1.5px solid rgba(255,107,107,0.22)" : "1px solid transparent",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: isCurrentPeriod ? "rgba(255,107,107,0.15)" : isDone ? "rgba(107,203,119,0.12)" : "rgba(26,26,46,0.06)",
                      color: isCurrentPeriod ? "#FF6B6B" : isDone ? "#6BCB77" : "rgba(26,26,46,0.50)",
                      fontFamily: "var(--font-nunito)",
                    }}
                  >
                    {p.period}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{p.class}</p>
                    <p className="text-xs" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>{p.subject}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>{p.time}</p>
                    {isCurrentPeriod && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#FF6B6B", color: "white", fontFamily: "var(--font-nunito)" }}>Now</span>
                    )}
                    {isDone && (
                      <CheckCircle size={13} style={{ color: "#6BCB77", display: "inline" }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
            type="button"
            onClick={() => router.push("/erp/faculty/attendance")}
            style={{
              fontFamily: "var(--font-nunito)",
              background: "linear-gradient(135deg, #FF6B6B, #ff8e53)",
              color: "white",
              boxShadow: "0 4px 16px rgba(255,107,107,0.25)",
            }}
          >
            <Users size={15} /> Mark Attendance for Period 3
          </button>
        </div>

        {/* Homework Pending */}
        <div className="glass-card p-6 lg:col-span-3">
          <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
            <BookOpen size={15} className="text-coral-500" /> Homework — Pending Submissions
            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,107,107,0.12)", color: "#FF6B6B" }}>
              {pendingHomework.filter(h => !h.submitted).length} pending
            </span>
          </h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {pendingHomework.map((h, i) => (
              <div
                key={h.student}
                className="p-4 rounded-2xl"
                style={{
                  background: h.submitted ? "rgba(107,203,119,0.07)" : "rgba(255,107,107,0.06)",
                  border: `1px solid ${h.submitted ? "rgba(107,203,119,0.20)" : "rgba(255,107,107,0.15)"}`,
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{h.student}</p>
                  {h.submitted
                    ? <CheckCircle size={13} style={{ color: "#6BCB77" }} />
                    : <AlertCircle size={13} style={{ color: "#FF6B6B" }} />}
                </div>
                <p className="text-xs mb-1" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>{h.class}</p>
                <p className="text-xs mb-2" style={{ color: "rgba(26,26,46,0.70)", fontFamily: "var(--font-inter)" }}>{h.hw}</p>
                <p className="text-xs font-semibold" style={{ color: h.submitted ? "#6BCB77" : "#FF6B6B", fontFamily: "var(--font-nunito)" }}>
                  {h.submitted ? "Submitted ✅" : `Due: ${h.due}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ERPShell>
  );
}
