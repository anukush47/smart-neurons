"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, Award } from "lucide-react";

type DayStatus = "present" | "absent" | "late" | "holiday" | "weekend" | "future" | "none";

interface DayData {
  date: number;
  status: DayStatus;
}

const STATUS_STYLE: Record<DayStatus, { bg: string; color: string; label: string }> = {
  present: { bg: "rgba(107,203,119,0.18)", color: "#6BCB77",               label: "Present"  },
  absent:  { bg: "rgba(255,107,107,0.14)", color: "#FF6B6B",               label: "Absent"   },
  late:    { bg: "rgba(255,217,61,0.20)",  color: "#d97706",               label: "Late"     },
  holiday: { bg: "rgba(124,58,237,0.10)",  color: "#7c3aed",               label: "Holiday"  },
  weekend: { bg: "transparent",            color: "rgba(26,26,46,0.25)",   label: "Weekend"  },
  future:  { bg: "transparent",            color: "rgba(26,26,46,0.20)",   label: "—"        },
  none:    { bg: "transparent",            color: "rgba(26,26,46,0.20)",   label: "—"        },
};

function buildMonthData(year: number, month: number): DayData[] {
  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const result: DayData[] = [];

  // Fixed holiday dates (MP school calendar approximation)
  const holidays: Record<string, number[]> = {
    "2026-4":  [1, 14],       // April
    "2026-3":  [29],          // March — Holi
    "2026-2":  [],
    "2026-1":  [26],          // Republic Day
    "2026-0":  [1, 15],       // New Year, Makar Sankranti
  };
  const holidayDates = new Set(holidays[`${year}-${month}`] || []);

  // Deterministic "randomish" attendance based on date
  function syntheticStatus(d: number): DayStatus {
    const day = new Date(year, month, d).getDay();
    if (day === 0 || day === 6) return "weekend";
    if (holidayDates.has(d)) return "holiday";
    const seed = (year * 31 + month * 7 + d * 13) % 20;
    if (seed === 3) return "absent";
    if (seed === 9) return "late";
    return "present";
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const thisDate = new Date(year, month, d);
    if (thisDate > today) {
      result.push({ date: d, status: "future" });
    } else {
      result.push({ date: d, status: syntheticStatus(d) });
    }
  }
  return result;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ParentAttendancePage() {
  const [user, setUser] = useState("");
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [liveAttendance, setLiveAttendance] = useState<{ date: string; status: string }[]>([]);
  const [childName, setChildName] = useState<string | null>(null);
  const [childClass, setChildClass] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Auth once
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user.user_metadata?.name || "Parent");
    });
  }, []);

  // Re-fetch attendance whenever the displayed month changes
  useEffect(() => {
    const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
    fetch(`/api/attendance/my-child?month=${monthStr}`)
      .then(r => r.json())
      .then(data => {
        if (data.attendance) setLiveAttendance(data.attendance);
        if (data.student) {
          setChildName(data.student.name);
          setChildClass(`${data.student.class}-${data.student.section}`);
        }
      })
      .catch(() => setFetchError("Could not load live attendance."));
  }, [viewYear, viewMonth]);

  // Build calendar data: prefer live DB records over synthetic mock data
  const calendarData = useMemo(() => {
    const base = buildMonthData(viewYear, viewMonth);
    if (liveAttendance.length === 0) return base;

    // Create a lookup: "YYYY-MM-DD" → status
    const liveMap = new Map(
      liveAttendance.map(a => [a.date.split("T")[0], a.status as string])
    );

    return base.map(day => {
      if (!day.date) return day; // empty calendar slot
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day.date).padStart(2, "0")}`;
      const liveStatus = liveMap.get(dateStr);
      if (!liveStatus) return day;
      return {
        ...day,
        status: liveStatus === "present" ? "present"
               : liveStatus === "absent" ? "absent"
               : liveStatus === "late" ? "late"
               : day.status,
      } as DayData;
    });
  }, [liveAttendance, viewMonth, viewYear]);

  // First day of the month (0=Sun)
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  // Blank cells before day 1
  const blanks = Array.from({ length: firstDow });

  // Stats from calendar data (reflects live overrides when available)
  const schoolDays = calendarData.filter(d => !["weekend", "future", "none"].includes(d.status));
  const present    = calendarData.filter(d => d.status === "present").length;
  const absent     = calendarData.filter(d => d.status === "absent").length;
  const late       = calendarData.filter(d => d.status === "late").length;
  const holidays   = calendarData.filter(d => d.status === "holiday").length;
  const pct = schoolDays.length > 0 ? Math.round(((present + late) / schoolDays.length) * 100) : 0;

  // Live API data derived values
  const livePresent = liveAttendance.filter(a => a.status === "present").length;
  const liveAbsent = liveAttendance.filter(a => a.status === "absent").length;
  const liveLate = liveAttendance.filter(a => a.status === "late").length;

  // Use live counts in stats cards when live data is available
  const displayPresent = liveAttendance.length > 0 ? livePresent : present;
  const displayAbsent  = liveAttendance.length > 0 ? liveAbsent  : absent;
  const displayLate    = liveAttendance.length > 0 ? liveLate    : late;

  // Year-to-date (Apr–May 2026 mock)
  const ytdData = [
    { month: "Apr", present: 18, total: 21, pct: 86 },
    { month: "May", present: present + late, total: schoolDays.length, pct },
  ];

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    if (viewYear === currentYear && viewMonth >= currentMonth) return;
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const _today = new Date();
  const isCurrentOrFuture = viewYear > _today.getFullYear() || (viewYear === _today.getFullYear() && viewMonth >= _today.getMonth());

  return (
    <ERPShell role="parent" userName={user}>
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy flex items-center flex-wrap gap-1" style={{ fontFamily: "var(--font-playfair)" }}>
          {(childName ?? "Aarav")}&apos;s Attendance
          {liveAttendance.length > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full ml-2"
              style={{ background: "rgba(107,203,119,0.12)", color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
              Live Data
            </span>
          )}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          {childClass ?? "—"} · Academic Year 2025–26
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* === Calendar column === */}
        <div className="lg:col-span-2 space-y-5">
          {/* Month navigator */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-5">
              <button
                type="button"
                onClick={prevMonth}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 hover:scale-105"
                style={{ background: "rgba(26,26,46,0.06)" }}
              >
                <ChevronLeft size={16} style={{ color: "rgba(26,26,46,0.60)" }} />
              </button>

              <h2 className="text-base font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h2>

              <button
                type="button"
                onClick={nextMonth}
                disabled={isCurrentOrFuture}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: "rgba(26,26,46,0.06)" }}
              >
                <ChevronRight size={16} style={{ color: "rgba(26,26,46,0.60)" }} />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_LABELS.map(d => (
                <div
                  key={d}
                  className="text-center text-xs font-bold py-1"
                  style={{
                    color: d === "Sun" || d === "Sat" ? "rgba(26,26,46,0.30)" : "rgba(26,26,46,0.45)",
                    fontFamily: "var(--font-nunito)",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Blank leading cells */}
              {blanks.map((_, i) => (
                <div key={`blank-${i}`} />
              ))}

              {/* Day cells */}
              {calendarData.map(day => {
                const style = STATUS_STYLE[day.status];
                const isToday = viewYear === _today.getFullYear() && viewMonth === _today.getMonth() && day.date === _today.getDate();
                return (
                  <div
                    key={day.date}
                    className="aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs font-bold relative"
                    style={{
                      background: style.bg,
                      color: style.color,
                      fontFamily: "var(--font-nunito)",
                      outline: isToday ? "2px solid rgba(124,58,237,0.50)" : "none",
                      outlineOffset: isToday ? "1px" : undefined,
                    }}
                  >
                    {day.date}
                    {day.status === "present" && <div className="w-1 h-1 rounded-full" style={{ background: "#6BCB77" }} />}
                    {day.status === "absent"  && <div className="w-1 h-1 rounded-full" style={{ background: "#FF6B6B" }} />}
                    {day.status === "late"    && <div className="w-1 h-1 rounded-full" style={{ background: "#d97706" }} />}
                    {day.status === "holiday" && <div className="w-1 h-1 rounded-full" style={{ background: "#7c3aed" }} />}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-5 pt-4" style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
              {(["present", "absent", "late", "holiday"] as DayStatus[]).map(st => (
                <div key={st} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_STYLE[st].color }} />
                  <span className="text-xs" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
                    {STATUS_STYLE[st].label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly detail breakdown */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
              <Calendar size={14} className="text-coral-500" /> {MONTH_NAMES[viewMonth]} Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Present",   value: displayPresent, color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
                { label: "Absent",    value: displayAbsent,  color: "#FF6B6B", bg: "rgba(255,107,107,0.08)" },
                { label: "Late",      value: displayLate,    color: "#d97706", bg: "rgba(255,217,61,0.12)"  },
                { label: "Holidays",  value: holidays,       color: "#7c3aed", bg: "rgba(167,139,250,0.10)" },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-2xl text-center" style={{ background: s.bg }}>
                  <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>{s.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Attendance bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>
                  Attendance this month
                </p>
                <p className="text-sm font-bold" style={{ color: pct >= 75 ? "#6BCB77" : "#FF6B6B", fontFamily: "var(--font-nunito)" }}>
                  {pct}%
                </p>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(26,26,46,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: pct >= 85 ? "linear-gradient(90deg, #6BCB77, #4CAF50)"
                              : pct >= 75 ? "linear-gradient(90deg, #d97706, #f59e0b)"
                              : "linear-gradient(90deg, #FF6B6B, #ef4444)",
                  }}
                />
              </div>
              {pct < 75 && (
                <p className="text-xs mt-1.5" style={{ color: "#FF6B6B", fontFamily: "var(--font-inter)" }}>
                  ⚠ Below 75% — please ensure regular attendance.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* === Right column: YTD + streak === */}
        <div className="space-y-5">
          {/* Year-to-date */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
              <TrendingUp size={14} className="text-coral-500" /> Year to Date
            </h3>

            <div className="space-y-3">
              {ytdData.map(m => (
                <div key={m.month}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{m.month} 2026</p>
                    <p
                      className="text-xs font-bold"
                      style={{ color: m.pct >= 75 ? "#6BCB77" : "#FF6B6B", fontFamily: "var(--font-nunito)" }}
                    >
                      {m.pct}%
                    </p>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(26,26,46,0.06)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${m.pct}%`,
                        background: m.pct >= 85 ? "#6BCB77" : m.pct >= 75 ? "#d97706" : "#FF6B6B",
                      }}
                    />
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>
                    {m.present} / {m.total} school days
                  </p>
                </div>
              ))}
            </div>

            {/* Overall YTD */}
            <div
              className="mt-4 p-3 rounded-2xl text-center"
              style={{ background: "rgba(107,203,119,0.08)", border: "1px solid rgba(107,203,119,0.18)" }}
            >
              <p className="text-2xl font-bold" style={{ color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
                {Math.round(((ytdData.reduce((a, m) => a + m.present, 0)) / (ytdData.reduce((a, m) => a + m.total, 0) || 1)) * 100)}%
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>Overall YTD</p>
            </div>
          </div>

          {/* Streak & badge */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
              <Award size={14} style={{ color: "#d97706" }} /> Achievements
            </h3>

            <div className="space-y-3">
              {[
                {
                  emoji: "🔥",
                  label: "Current Streak",
                  value: "4 days",
                  sub: "Mon–Thu this week",
                  bg: "rgba(255,107,107,0.08)",
                },
                {
                  emoji: "⭐",
                  label: "Best Streak",
                  value: "12 days",
                  sub: "Apr 6 – Apr 23",
                  bg: "rgba(255,217,61,0.12)",
                },
                {
                  emoji: "🏆",
                  label: "Punctuality",
                  value: "92%",
                  sub: "On time this month",
                  bg: "rgba(107,203,119,0.08)",
                },
              ].map(item => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: item.bg }}
                >
                  <span className="text-xl flex-shrink-0">{item.emoji}</span>
                  <div>
                    <p className="text-xs font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{item.label}</p>
                    <p className="text-base font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{item.value}</p>
                    <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Absence note */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-navy mb-3" style={{ fontFamily: "var(--font-nunito)" }}>
              Leave / Absence Note
            </h3>
            <p className="text-xs mb-3" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
              Inform the school about a planned absence.
            </p>
            <div className="space-y-2 mb-3">
              <input
                type="date"
                className="w-full px-3 py-2 rounded-xl text-sm border"
                style={{
                  background: "rgba(255,255,255,0.70)",
                  border: "1px solid rgba(26,26,46,0.10)",
                  color: "rgba(26,26,46,0.80)",
                  fontFamily: "var(--font-inter)",
                  outline: "none",
                }}
              />
              <textarea
                rows={2}
                placeholder="Reason (optional)"
                className="w-full px-3 py-2 rounded-xl text-sm border resize-none"
                style={{
                  background: "rgba(255,255,255,0.70)",
                  border: "1px solid rgba(26,26,46,0.10)",
                  color: "rgba(26,26,46,0.80)",
                  fontFamily: "var(--font-inter)",
                  outline: "none",
                }}
              />
            </div>
            <button
              type="button"
              className="w-full py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #FF6B6B, #ff8e53)",
                boxShadow: "0 4px 14px rgba(255,107,107,0.25)",
                fontFamily: "var(--font-nunito)",
              }}
            >
              Submit Note
            </button>
          </div>
        </div>
      </div>
    </ERPShell>
  );
}
