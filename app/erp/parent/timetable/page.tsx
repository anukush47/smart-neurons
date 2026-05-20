"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ERPShell from "@/components/erp/ERPShell";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

interface Period {
  time: string;
  subject: string;
  teacher: string;
  isBreak: boolean;
}

const SUBJECT_COLOR: Record<string, { color: string; bg: string }> = {
  "English":            { color: "#d97706", bg: "rgba(217,119,6,0.10)" },
  "Hindi":              { color: "#7c3aed", bg: "rgba(124,58,237,0.10)" },
  "Mathematics":        { color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
  "EVS":                { color: "#FF6B6B", bg: "rgba(255,107,107,0.10)" },
  "Art & Craft":        { color: "#d97706", bg: "rgba(255,217,61,0.15)" },
  "GK":                 { color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
  "Music":              { color: "#6BCB77", bg: "rgba(107,203,119,0.08)" },
  "Physical Education": { color: "#FF6B6B", bg: "rgba(255,107,107,0.08)" },
  "Break":              { color: "rgba(26,26,46,0.35)", bg: "rgba(26,26,46,0.05)" },
  "Assembly":           { color: "#d97706", bg: "rgba(217,119,6,0.08)" },
  "Free Play":          { color: "#6BCB77", bg: "rgba(107,203,119,0.08)" },
  "Story Time":         { color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
};

const SUBJECT_EMOJI: Record<string, string> = {
  "English": "📖", "Hindi": "📝", "Mathematics": "🔢", "EVS": "🌿",
  "Art & Craft": "🎨", "GK": "🧠", "Music": "🎵",
  "Physical Education": "⚽", "Break": "🍎", "Assembly": "🏫",
  "Free Play": "🧸", "Story Time": "📚",
};

type DayKey = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

const SCHEDULE: Record<DayKey, Period[]> = {
  Monday: [
    { time: "8:00–8:30",  subject: "Assembly",    teacher: "",                  isBreak: false },
    { time: "8:30–9:00",  subject: "English",      teacher: "Ms. Priya Sharma",  isBreak: false },
    { time: "9:00–9:30",  subject: "Mathematics",  teacher: "Ms. Priya Sharma",  isBreak: false },
    { time: "9:30–10:00", subject: "Hindi",        teacher: "Ms. Rekha Nair",    isBreak: false },
    { time: "10:00–10:20",subject: "Break",        teacher: "",                  isBreak: true  },
    { time: "10:20–11:00",subject: "EVS",          teacher: "Ms. Rekha Nair",    isBreak: false },
    { time: "11:00–11:40",subject: "Art & Craft",  teacher: "Ms. Deepa Iyer",   isBreak: false },
    { time: "11:40–12:20",subject: "Free Play",    teacher: "",                  isBreak: false },
  ],
  Tuesday: [
    { time: "8:00–8:30",  subject: "Assembly",    teacher: "",                  isBreak: false },
    { time: "8:30–9:00",  subject: "Hindi",        teacher: "Ms. Rekha Nair",    isBreak: false },
    { time: "9:00–9:30",  subject: "English",      teacher: "Ms. Priya Sharma",  isBreak: false },
    { time: "9:30–10:00", subject: "Mathematics",  teacher: "Ms. Priya Sharma",  isBreak: false },
    { time: "10:00–10:20",subject: "Break",        teacher: "",                  isBreak: true  },
    { time: "10:20–11:00",subject: "Music",        teacher: "Mr. Suresh Kumar",  isBreak: false },
    { time: "11:00–11:40",subject: "Story Time",   teacher: "Ms. Priya Sharma",  isBreak: false },
    { time: "11:40–12:20",subject: "Free Play",    teacher: "",                  isBreak: false },
  ],
  Wednesday: [
    { time: "8:00–8:30",  subject: "Assembly",    teacher: "",                  isBreak: false },
    { time: "8:30–9:00",  subject: "English",      teacher: "Ms. Priya Sharma",  isBreak: false },
    { time: "9:00–9:30",  subject: "EVS",          teacher: "Ms. Rekha Nair",    isBreak: false },
    { time: "9:30–10:00", subject: "Hindi",        teacher: "Ms. Rekha Nair",    isBreak: false },
    { time: "10:00–10:20",subject: "Break",        teacher: "",                  isBreak: true  },
    { time: "10:20–11:00",subject: "Mathematics",  teacher: "Ms. Priya Sharma",  isBreak: false },
    { time: "11:00–11:40",subject: "Art & Craft",  teacher: "Ms. Deepa Iyer",   isBreak: false },
    { time: "11:40–12:20",subject: "Free Play",    teacher: "",                  isBreak: false },
  ],
  Thursday: [
    { time: "8:00–8:30",  subject: "Assembly",    teacher: "",                  isBreak: false },
    { time: "8:30–9:00",  subject: "Mathematics",  teacher: "Ms. Priya Sharma",  isBreak: false },
    { time: "9:00–9:30",  subject: "Hindi",        teacher: "Ms. Rekha Nair",    isBreak: false },
    { time: "9:30–10:00", subject: "English",      teacher: "Ms. Priya Sharma",  isBreak: false },
    { time: "10:00–10:20",subject: "Break",        teacher: "",                  isBreak: true  },
    { time: "10:20–11:00",subject: "GK",           teacher: "Ms. Priya Sharma",  isBreak: false },
    { time: "11:00–11:40",subject: "Story Time",   teacher: "Ms. Priya Sharma",  isBreak: false },
    { time: "11:40–12:20",subject: "Free Play",    teacher: "",                  isBreak: false },
  ],
  Friday: [
    { time: "8:00–8:30",  subject: "Assembly",    teacher: "",                  isBreak: false },
    { time: "8:30–9:00",  subject: "English",      teacher: "Ms. Priya Sharma",  isBreak: false },
    { time: "9:00–9:30",  subject: "Hindi",        teacher: "Ms. Rekha Nair",    isBreak: false },
    { time: "9:30–10:00", subject: "EVS",          teacher: "Ms. Rekha Nair",    isBreak: false },
    { time: "10:00–10:20",subject: "Break",        teacher: "",                  isBreak: true  },
    { time: "10:20–11:00",subject: "Physical Education", teacher: "Mr. Arjun Menon", isBreak: false },
    { time: "11:00–11:40",subject: "Art & Craft",  teacher: "Ms. Deepa Iyer",   isBreak: false },
    { time: "11:40–12:20",subject: "Free Play",    teacher: "",                  isBreak: false },
  ],
};

const TODAY_DAY = "Wednesday" as DayKey;

export default function ParentTimetablePage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [activeDay, setActiveDay] = useState<DayKey>(TODAY_DAY);

  useEffect(() => {
    const role = sessionStorage.getItem("erp_role");
    const u = sessionStorage.getItem("erp_user");
    if (role !== "parent") { router.replace("/erp/login"); return; }
    setUser(u || "+91 XXXXX XXXXX");
  }, []);

  const periods = SCHEDULE[activeDay];
  const subjectCounts: Record<string, number> = {};
  Object.values(SCHEDULE).forEach(day =>
    day.forEach(p => { if (!p.isBreak) subjectCounts[p.subject] = (subjectCounts[p.subject] || 0) + 1; })
  );

  return (
    <ERPShell role="parent" userName={user}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Timetable</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          Aarav Sharma · JKG-A · Academic Year 2026–27
        </p>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {DAYS.map(d => {
          const isToday = d === TODAY_DAY;
          const active = d === activeDay;
          return (
            <button key={d} type="button" onClick={() => setActiveDay(d as DayKey)}
              className="flex flex-col items-center px-4 py-2.5 rounded-xl flex-shrink-0 transition-all"
              style={{
                background: active ? "rgba(217,119,6,0.12)" : "rgba(26,26,46,0.05)",
                border: active ? "1.5px solid rgba(217,119,6,0.30)" : isToday ? "1.5px solid rgba(217,119,6,0.15)" : "1.5px solid transparent",
                minWidth: 68,
              }}>
              <span className="text-xs font-bold" style={{ color: active ? "#d97706" : "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>
                {d.slice(0, 3)}
              </span>
              {isToday && (
                <span className="text-xs mt-0.5 px-1.5 rounded-full"
                  style={{ background: "rgba(217,119,6,0.15)", color: "#d97706", fontSize: "0.6rem", fontFamily: "var(--font-nunito)", fontWeight: 700 }}>
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Day schedule */}
        <div className="lg:col-span-2 space-y-2">
          {periods.map((p, i) => {
            const sc = SUBJECT_COLOR[p.subject] || { color: "rgba(26,26,46,0.45)", bg: "rgba(26,26,46,0.05)" };
            const emoji = SUBJECT_EMOJI[p.subject] || "📌";
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{
                  background: p.isBreak ? "rgba(26,26,46,0.03)" : sc.bg,
                  border: `1.5px solid ${p.isBreak ? "rgba(26,26,46,0.06)" : sc.color + "28"}`,
                }}>
                <span className="text-xs w-24 flex-shrink-0 font-mono" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>
                  {p.time}
                </span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                  style={{ background: p.isBreak ? "rgba(26,26,46,0.06)" : `${sc.color}15` }}>
                  {emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: p.isBreak ? "rgba(26,26,46,0.40)" : sc.color, fontFamily: "var(--font-nunito)" }}>
                    {p.subject}
                  </p>
                  {p.teacher && (
                    <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>
                      {p.teacher}
                    </p>
                  )}
                </div>
                {p.isBreak && (
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: "rgba(26,26,46,0.07)", color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-nunito)" }}>
                    Break
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar: weekly subject frequency */}
        <div className="space-y-3">
          <div className="glass-card p-4">
            <p className="text-sm font-bold text-navy mb-3" style={{ fontFamily: "var(--font-nunito)" }}>Weekly Subject Load</p>
            <div className="space-y-2">
              {Object.entries(subjectCounts)
                .filter(([s]) => s !== "Assembly" && s !== "Free Play")
                .sort((a, b) => b[1] - a[1])
                .map(([subject, count]) => {
                  const sc = SUBJECT_COLOR[subject] || { color: "rgba(26,26,46,0.50)", bg: "rgba(26,26,46,0.05)" };
                  const emoji = SUBJECT_EMOJI[subject] || "📌";
                  return (
                    <div key={subject} className="flex items-center gap-2">
                      <span className="text-sm flex-shrink-0">{emoji}</span>
                      <p className="flex-1 text-xs font-semibold truncate" style={{ color: "rgba(26,26,46,0.65)", fontFamily: "var(--font-nunito)" }}>{subject}</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: count }).map((_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full" style={{ background: sc.color }} />
                        ))}
                      </div>
                      <span className="text-xs font-bold w-4 text-right" style={{ color: sc.color, fontFamily: "var(--font-nunito)" }}>{count}x</span>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="glass-card p-4" style={{ border: "1.5px solid rgba(217,119,6,0.18)" }}>
            <p className="text-sm font-bold text-navy mb-2" style={{ fontFamily: "var(--font-nunito)" }}>School Timings</p>
            <div className="space-y-1.5">
              {[
                { label: "School Opens", time: "8:00 AM" },
                { label: "Lunch / Break", time: "10:00 AM" },
                { label: "School Closes", time: "12:20 PM" },
                { label: "Bus Pickup (PM)", time: "12:30 PM" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>{item.label}</span>
                  <span className="text-xs font-bold" style={{ color: "#d97706", fontFamily: "var(--font-nunito)" }}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ERPShell>
  );
}
