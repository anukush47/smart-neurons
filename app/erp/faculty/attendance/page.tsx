"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { CheckCircle, XCircle, Clock, BookOpen, ChevronDown, ChevronUp, Save, Lock, Users } from "lucide-react";

type AttStatus = "P" | "A" | "L" | "-";

interface Student {
  id: number;
  name: string;
  roll: number;
  status: AttStatus;
}

interface Period {
  id: number;
  time: string;
  subject: string;
  class: string;
  room: string;
  totalStudents: number;
  locked: boolean;
  students: Student[];
}

const INDIAN_NAMES = [
  "Aarav Sharma", "Diya Patel", "Ishaan Gupta", "Priya Singh", "Arjun Mehta",
  "Ananya Joshi", "Vihaan Verma", "Anika Tiwari", "Reyansh Kumar", "Saanvi Rao",
  "Kabir Malhotra", "Myra Saxena", "Ayaan Khan", "Pari Kapoor", "Dhruv Agarwal",
  "Kiara Nair", "Vivaan Bose", "Navya Pillai", "Aadi Mishra", "Riya Choudhary",
];

function makeStudents(count: number, offset = 0): Student[] {
  return Array.from({ length: count }, (_, i) => ({
    id: offset + i + 1,
    name: INDIAN_NAMES[(offset + i) % INDIAN_NAMES.length],
    roll: i + 1,
    status: "-" as AttStatus,
  }));
}

const initialPeriods: Period[] = [
  { id: 1, time: "8:00 – 8:40 AM",  subject: "English",   class: "JKG-A", room: "101", totalStudents: 18, locked: true,  students: makeStudents(18, 0) },
  { id: 2, time: "8:45 – 9:25 AM",  subject: "Maths",     class: "SKG-A", room: "103", totalStudents: 16, locked: false, students: makeStudents(16, 18) },
  { id: 3, time: "9:30 – 10:10 AM", subject: "English",   class: "JKG-B", room: "102", totalStudents: 17, locked: false, students: makeStudents(17, 34) },
  { id: 4, time: "10:30 – 11:10 AM",subject: "Rhymes",    class: "Nursery-A", room: "104", totalStudents: 15, locked: false, students: makeStudents(15, 51) },
  { id: 5, time: "11:15 – 11:55 AM",subject: "Drawing",   class: "JKG-A", room: "Art", totalStudents: 18, locked: false, students: makeStudents(18, 0) },
  { id: 6, time: "12:00 – 12:40 PM",subject: "English",   class: "SKG-A", room: "103", totalStudents: 16, locked: false, students: makeStudents(16, 18) },
];

const STATUS_CONFIG: Record<AttStatus, { label: string; bg: string; color: string; icon?: React.ReactNode }> = {
  "P": { label: "Present", bg: "rgba(107,203,119,0.15)", color: "#6BCB77" },
  "A": { label: "Absent",  bg: "rgba(255,107,107,0.12)", color: "#FF6B6B" },
  "L": { label: "Late",    bg: "rgba(255,217,61,0.15)",  color: "#d97706" },
  "-": { label: "—",       bg: "rgba(26,26,46,0.05)",    color: "rgba(26,26,46,0.30)" },
};

export default function FacultyAttendancePage() {
  const [user, setUser] = useState("");
  const [periods, setPeriods] = useState<Period[]>(initialPeriods);
  const [expanded, setExpanded] = useState<number | null>(2);
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dbStudents, setDbStudents] = useState<Record<string, { id: string; name: string; roll_no: string }[]>>({});
  const [studentsLoading, setStudentsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user.user_metadata?.name || "Faculty");

      setStudentsLoading(true);
      const classes = [...new Set(initialPeriods.map(p => p.class))];
      const results: Record<string, { id: string; name: string; roll_no: string }[]> = {};
      await Promise.all(
        classes.map(async cls => {
          try {
            const res = await fetch(`/api/students?class=${encodeURIComponent(cls)}`);
            if (res.ok) {
              const { students } = await res.json() as { students: { id: string; name: string; roll_no: string }[] };
              results[cls] = students;
            }
          } catch { /* keep empty */ }
        })
      );
      setDbStudents(results);
      setStudentsLoading(false);
    })();
  }, []);

  function setStatus(periodId: number, studentId: number, status: AttStatus) {
    setPeriods(prev =>
      prev.map(p =>
        p.id !== periodId ? p : {
          ...p,
          students: p.students.map(s =>
            s.id !== studentId ? s : { ...s, status }
          ),
        }
      )
    );
  }

  function markAll(periodId: number, status: "P" | "A") {
    setPeriods(prev =>
      prev.map(p =>
        p.id !== periodId ? p : {
          ...p,
          students: p.students.map(s => ({ ...s, status })),
        }
      )
    );
  }

  async function handleSave(periodId: number, lock = true) {
    const period = periods.find(p => p.id === periodId);
    if (!period) return;
    const unmarked = period.students.filter(s => s.status === "-");
    if (unmarked.length > 0) {
      setSaveError(`${unmarked.length} student(s) not marked in ${period.class}`);
      return;
    }
    setSaving(periodId);
    setSaveError(null);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          class: period.class,
          records: period.students.map((s, idx) => {
            // Use real DB UUID if available for this class, else fall back to mock id
            const dbStudent = (dbStudents[period.class] ?? [])[idx];
            return {
              student_id: dbStudent?.id ?? String(s.id),
              status: s.status === "P" ? "present" : s.status === "A" ? "absent" : "late",
            };
          }),
        }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        setSaveError(error || "Failed to save");
        return;
      }
      if (lock) {
        setPeriods(prev => prev.map(p => p.id === periodId ? { ...p, locked: true } : p));
      }
      setSaved(prev => ({ ...prev, [periodId]: true }));
      setTimeout(() => setSaved(prev => ({ ...prev, [periodId]: false })), 2500);
    } finally {
      setSaving(null);
    }
  }

  const todayLabel = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <ERPShell role="faculty" userName={user}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>
          Attendance — My Classes
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          {todayLabel}
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Periods Today",   value: initialPeriods.length,                     color: "#7c3aed", bg: "rgba(167,139,250,0.10)" },
          { label: "Submitted",       value: periods.filter(p => p.locked).length,       color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
          { label: "Pending",         value: periods.filter(p => !p.locked).length,      color: "#d97706", bg: "rgba(255,217,61,0.12)"  },
          { label: "Total Students",  value: periods.reduce((a, p) => a + p.totalStudents, 0), color: "#FF6B6B", bg: "rgba(255,107,107,0.08)" },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Period list */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-xs font-semibold" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>Date</label>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm"
          style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.09)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }} />
      </div>
      <div className="space-y-3">
        {periods.map(period => {
          const isOpen = expanded === period.id;
          const present = period.students.filter(s => s.status === "P").length;
          const absent  = period.students.filter(s => s.status === "A").length;
          const late    = period.students.filter(s => s.status === "L").length;
          const unmarked = period.students.filter(s => s.status === "-").length;
          const pct = period.students.length > 0 ? Math.round((present / period.students.length) * 100) : 0;

          return (
            <div
              key={period.id}
              className="glass-card overflow-hidden"
              style={{ border: period.locked ? "1.5px solid rgba(107,203,119,0.25)" : "1.5px solid rgba(255,255,255,0.60)" }}
            >
              {/* Period header row */}
              <button
                type="button"
                className="w-full flex items-center gap-4 p-4 text-left"
                onClick={() => setExpanded(isOpen ? null : period.id)}
              >
                {/* Time chip */}
                <div
                  className="flex-shrink-0 text-xs font-bold px-2.5 py-1.5 rounded-xl"
                  style={{
                    background: "rgba(124,58,237,0.08)",
                    color: "#7c3aed",
                    fontFamily: "var(--font-nunito)",
                    minWidth: 96,
                    textAlign: "center",
                  }}
                >
                  {period.time}
                </div>

                {/* Subject + class */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-navy truncate" style={{ fontFamily: "var(--font-nunito)" }}>
                    {period.subject}
                    {period.locked && (
                      <span className="ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(107,203,119,0.12)", color: "#6BCB77" }}>
                        Submitted
                      </span>
                    )}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
                    {period.class} · Room {period.room} · {period.totalStudents} students
                  </p>
                </div>

                {/* Mini stats */}
                <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                  {[
                    { v: present, c: "#6BCB77" },
                    { v: absent,  c: "#FF6B6B" },
                    { v: late,    c: "#d97706" },
                  ].map((x, i) => (
                    <span key={i} className="text-xs font-bold" style={{ color: x.c, fontFamily: "var(--font-nunito)" }}>{x.v}</span>
                  ))}
                  {unmarked > 0 && (
                    <span className="text-xs font-bold" style={{ color: "rgba(26,26,46,0.35)", fontFamily: "var(--font-nunito)" }}>
                      {unmarked} left
                    </span>
                  )}
                </div>

                {isOpen ? <ChevronUp size={16} style={{ color: "rgba(26,26,46,0.40)", flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: "rgba(26,26,46,0.40)", flexShrink: 0 }} />}
              </button>

              {/* Expanded body */}
              {isOpen && (
                <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(26,26,46,0.06)" }}>
                  {!period.locked && (
                    <div className="flex items-center justify-between flex-wrap gap-3 pt-4 pb-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => markAll(period.id, "P")}
                          className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-150 hover:-translate-y-0.5"
                          style={{ background: "rgba(107,203,119,0.12)", color: "#6BCB77", fontFamily: "var(--font-nunito)" }}
                        >
                          All Present
                        </button>
                        <button
                          type="button"
                          onClick={() => markAll(period.id, "A")}
                          className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-150 hover:-translate-y-0.5"
                          style={{ background: "rgba(255,107,107,0.10)", color: "#FF6B6B", fontFamily: "var(--font-nunito)" }}
                        >
                          All Absent
                        </button>
                      </div>
                      <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
                        {present}P · {absent}A · {late}L · {unmarked} unmarked
                      </p>
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: "rgba(26,26,46,0.06)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: pct >= 80 ? "#6BCB77" : pct >= 60 ? "#d97706" : "#FF6B6B",
                      }}
                    />
                  </div>

                  {/* Student grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {period.students.map(student => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl"
                        style={{ background: STATUS_CONFIG[student.status].bg }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}
                          >
                            {student.roll}
                          </span>
                          <p className="text-sm font-semibold text-navy truncate" style={{ fontFamily: "var(--font-nunito)" }}>
                            {student.name}
                          </p>
                        </div>

                        {period.locked ? (
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0"
                            style={{ background: STATUS_CONFIG[student.status].bg, color: STATUS_CONFIG[student.status].color, fontFamily: "var(--font-nunito)" }}
                          >
                            {student.status === "-" ? "—" : student.status}
                          </span>
                        ) : (
                          <div className="flex gap-1 flex-shrink-0">
                            {(["P", "A", "L"] as const).map(st => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => setStatus(period.id, student.id, student.status === st ? "-" : st)}
                                className="w-7 h-7 rounded-lg text-xs font-bold transition-all duration-150 hover:scale-105"
                                style={{
                                  background: student.status === st ? STATUS_CONFIG[st].bg : "rgba(26,26,46,0.05)",
                                  color: student.status === st ? STATUS_CONFIG[st].color : "rgba(26,26,46,0.35)",
                                  fontFamily: "var(--font-nunito)",
                                  border: student.status === st ? `1px solid ${STATUS_CONFIG[st].color}40` : "1px solid transparent",
                                }}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  {!period.locked && (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleSave(period.id, false)}
                        disabled={saving === period.id}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                          background: saved[period.id] ? "rgba(107,203,119,0.15)" : "rgba(26,26,46,0.06)",
                          color: saved[period.id] ? "#6BCB77" : "rgba(26,26,46,0.70)",
                          fontFamily: "var(--font-nunito)",
                        }}
                      >
                        <Save size={14} />
                        {saving === period.id ? "Saving…" : saved[period.id] ? "Saved!" : "Save Draft"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(period.id)}
                        disabled={unmarked > 0 || saving === period.id}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        style={{
                          background: "linear-gradient(135deg, #6BCB77, #4CAF50)",
                          boxShadow: "0 4px 14px rgba(107,203,119,0.30)",
                          fontFamily: "var(--font-nunito)",
                        }}
                      >
                        <Lock size={14} />
                        {saving === period.id ? "Saving…" : `Submit & Lock${unmarked > 0 ? ` (${unmarked} left)` : ""}`}
                      </button>
                    </div>
                  )}

                  {period.locked && (
                    <div
                      className="flex items-center gap-2 text-sm font-semibold"
                      style={{ color: "#6BCB77", fontFamily: "var(--font-nunito)" }}
                    >
                      <CheckCircle size={15} />
                      Attendance submitted and locked for this period.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {saveError && (
        <p className="text-xs mt-2" style={{ color: "#FF6B6B", fontFamily: "var(--font-inter)" }}>{saveError}</p>
      )}
    </ERPShell>
  );
}
