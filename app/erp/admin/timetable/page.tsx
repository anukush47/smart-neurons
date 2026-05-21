"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { ChevronDown, ChevronUp, Save, Plus, Trash2 } from "lucide-react";

interface Period {
  id: string;
  time: string;
  subject: string;
  teacher: string;
  isBreak: boolean;
}

interface DaySchedule {
  day: string;
  periods: Period[];
}

interface ClassTimetable {
  classId: string;
  className: string;
  section: string;
  schedule: DaySchedule[];
  saved: boolean;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SUBJECTS = ["English", "Hindi", "Mathematics", "EVS", "Art & Craft", "GK", "Music", "Physical Education", "Free Play", "Break", "Assembly", "Story Time"];
const TEACHERS: Record<string, string> = {
  "English": "Ms. Priya Sharma",
  "Hindi": "Ms. Rekha Nair",
  "Mathematics": "Ms. Priya Sharma",
  "EVS": "Ms. Rekha Nair",
  "Art & Craft": "Ms. Deepa Iyer",
  "GK": "Ms. Priya Sharma",
  "Music": "Mr. Suresh Kumar",
  "Physical Education": "Mr. Arjun Menon",
  "Assembly": "",
  "Free Play": "",
  "Break": "",
  "Story Time": "Ms. Priya Sharma",
};

const SUBJECT_COLOR: Record<string, { color: string; bg: string }> = {
  "English":            { color: "#d97706", bg: "rgba(217,119,6,0.10)" },
  "Hindi":              { color: "#7c3aed", bg: "rgba(124,58,237,0.10)" },
  "Mathematics":        { color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
  "EVS":                { color: "#FF6B6B", bg: "rgba(255,107,107,0.10)" },
  "Art & Craft":        { color: "#d97706", bg: "rgba(255,217,61,0.15)" },
  "GK":                 { color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
  "Music":              { color: "#6BCB77", bg: "rgba(107,203,119,0.08)" },
  "Physical Education": { color: "#FF6B6B", bg: "rgba(255,107,107,0.08)" },
  "Break":              { color: "rgba(26,26,46,0.40)", bg: "rgba(26,26,46,0.05)" },
  "Assembly":           { color: "#d97706", bg: "rgba(217,119,6,0.08)" },
  "Free Play":          { color: "#6BCB77", bg: "rgba(107,203,119,0.08)" },
  "Story Time":         { color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
};

function makeSchedule(patterns: string[][]): DaySchedule[] {
  const times = ["8:00–8:30", "8:30–9:00", "9:00–9:30", "9:30–10:00", "10:00–10:20", "10:20–11:00", "11:00–11:40", "11:40–12:20"];
  return DAYS.map((day, di) => ({
    day,
    periods: times.map((time, pi) => {
      const subject = patterns[di % patterns.length][pi] || "Free Play";
      return {
        id: `${day}-P${pi}`,
        time,
        subject,
        teacher: TEACHERS[subject] || "",
        isBreak: subject === "Break",
      };
    }),
  }));
}

const JKG_A_PATTERN = [
  ["Assembly", "English", "Mathematics", "Hindi",      "Break", "EVS",   "Art & Craft", "Free Play"],
  ["Assembly", "Hindi",   "English",     "Mathematics","Break", "Music", "Story Time",  "Free Play"],
  ["Assembly", "English", "EVS",         "Hindi",      "Break", "Mathematics","Art & Craft","Free Play"],
  ["Assembly", "Mathematics","Hindi",    "English",    "Break", "GK",    "Story Time",  "Free Play"],
  ["Assembly", "English", "Hindi",       "EVS",        "Break", "Physical Education","Art & Craft","Free Play"],
];
const SKG_A_PATTERN = [
  ["Assembly", "English", "Mathematics", "Hindi",      "Break", "GK",   "Art & Craft", "Free Play"],
  ["Assembly", "Hindi",   "English",     "Mathematics","Break", "Music","Story Time",  "Free Play"],
  ["Assembly", "Mathematics","EVS",      "Hindi",      "Break", "English","Art & Craft","Free Play"],
  ["Assembly", "Hindi",   "Mathematics", "English",    "Break", "GK",   "Story Time",  "Free Play"],
  ["Assembly", "English", "Hindi",       "EVS",        "Break", "Physical Education","Music","Free Play"],
];

const INITIAL_TIMETABLES: ClassTimetable[] = [
  { classId: "JKG-A", className: "JKG", section: "A", saved: true,  schedule: makeSchedule(JKG_A_PATTERN) },
  { classId: "JKG-B", className: "JKG", section: "B", saved: true,  schedule: makeSchedule(JKG_A_PATTERN) },
  { classId: "SKG-A", className: "SKG", section: "A", saved: true,  schedule: makeSchedule(SKG_A_PATTERN) },
  { classId: "SKG-B", className: "SKG", section: "B", saved: true,  schedule: makeSchedule(SKG_A_PATTERN) },
  { classId: "NUR-A", className: "Nursery", section: "A", saved: true, schedule: makeSchedule(JKG_A_PATTERN) },
  { classId: "PG-A",  className: "Playgroup", section: "A", saved: true, schedule: makeSchedule(JKG_A_PATTERN) },
];

export default function AdminTimetablePage() {
  const [user, setUser] = useState("");
  const [timetables, setTimetables] = useState<ClassTimetable[]>(INITIAL_TIMETABLES);
  const [activeClass, setActiveClass] = useState("JKG-A");
  const [activeDay, setActiveDay] = useState("Monday");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUser(user.user_metadata?.name || "Admin");
    });
  }, []);

  const current = timetables.find(t => t.classId === activeClass)!;
  const daySchedule = current?.schedule.find(d => d.day === activeDay);

  function updatePeriod(periodId: string, field: "subject" | "time", value: string) {
    setTimetables(prev => prev.map(tt => {
      if (tt.classId !== activeClass) return tt;
      return {
        ...tt,
        saved: false,
        schedule: tt.schedule.map(d => ({
          ...d,
          periods: d.periods.map(p => {
            if (p.id !== periodId) return p;
            if (field === "subject") {
              return { ...p, subject: value, teacher: TEACHERS[value] || "", isBreak: value === "Break" };
            }
            return { ...p, [field]: value };
          }),
        })),
      };
    }));
  }

  function saveTimetable() {
    setTimetables(prev => prev.map(tt => tt.classId === activeClass ? { ...tt, saved: true } : tt));
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <ERPShell role="admin" userName={user}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Timetable Manager</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          View and edit class schedules
        </p>
      </div>

      {/* Class selector */}
      <div className="flex gap-2 flex-wrap mb-5">
        {timetables.map(tt => (
          <button key={tt.classId} type="button"
            onClick={() => { setActiveClass(tt.classId); setEditing(false); }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={{
              background: activeClass === tt.classId ? "rgba(255,107,107,0.12)" : "rgba(26,26,46,0.05)",
              color: activeClass === tt.classId ? "#FF6B6B" : "rgba(26,26,46,0.50)",
              border: activeClass === tt.classId ? "1.5px solid rgba(255,107,107,0.28)" : "1.5px solid transparent",
              fontFamily: "var(--font-nunito)",
            }}>
            {tt.className}-{tt.section}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(26,26,46,0.07)" }}>
          <div>
            <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>
              {current?.className} – Section {current?.section}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
              Academic Year 2026–27 · {current?.schedule[0].periods.length} periods/day
            </p>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button type="button" onClick={() => setEditing(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{ background: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>
                  Cancel
                </button>
                <button type="button" onClick={saveTimetable}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#FF6B6B,#ff8e8e)", color: "white", boxShadow: "0 3px 10px rgba(255,107,107,0.28)", fontFamily: "var(--font-nunito)" }}>
                  <Save size={12} />
                  {saved ? "Saved!" : "Save"}
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setEditing(true)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                style={{ background: "rgba(255,107,107,0.10)", color: "#FF6B6B", border: "1px solid rgba(255,107,107,0.22)", fontFamily: "var(--font-nunito)" }}>
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Day tabs */}
        <div className="flex gap-1 px-5 pt-4 pb-1 overflow-x-auto">
          {DAYS.map(d => (
            <button key={d} type="button" onClick={() => setActiveDay(d)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 transition-all"
              style={{
                background: activeDay === d ? "rgba(255,107,107,0.12)" : "rgba(26,26,46,0.05)",
                color: activeDay === d ? "#FF6B6B" : "rgba(26,26,46,0.50)",
                border: activeDay === d ? "1px solid rgba(255,107,107,0.25)" : "1px solid transparent",
                fontFamily: "var(--font-nunito)",
              }}>{d.slice(0, 3)}</button>
          ))}
        </div>

        {/* Periods */}
        <div className="px-5 py-4 space-y-2">
          {daySchedule?.periods.map((p, idx) => {
            const sc = SUBJECT_COLOR[p.subject] || { color: "rgba(26,26,46,0.50)", bg: "rgba(26,26,46,0.05)" };
            return (
              <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: p.isBreak ? "rgba(26,26,46,0.04)" : sc.bg, border: `1px solid ${p.isBreak ? "rgba(26,26,46,0.07)" : sc.color + "25"}` }}>
                <span className="text-xs w-24 flex-shrink-0 font-mono" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>
                  {p.time}
                </span>
                {editing && !p.isBreak ? (
                  <select value={p.subject}
                    onChange={e => updatePeriod(p.id, "subject", e.target.value)}
                    className="flex-1 px-2 py-1 rounded-lg text-xs font-bold"
                    style={{ background: "rgba(255,255,255,0.80)", border: `1px solid ${sc.color}35`, outline: "none", color: sc.color, fontFamily: "var(--font-nunito)" }}>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <span className="flex-1 text-xs font-bold" style={{ color: sc.color, fontFamily: "var(--font-nunito)" }}>{p.subject}</span>
                )}
                {!p.isBreak && p.teacher && (
                  <span className="text-xs flex-shrink-0" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>{p.teacher}</span>
                )}
                {p.isBreak && (
                  <span className="text-xs flex-shrink-0 px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(26,26,46,0.08)", color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-nunito)" }}>Break</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly grid overview */}
      <div className="glass-card mt-4 overflow-hidden">
        <p className="text-sm font-bold text-navy px-5 pt-4 pb-3" style={{ fontFamily: "var(--font-nunito)" }}>
          Weekly Overview — {current?.className}-{current?.section}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(26,26,46,0.07)" }}>
                <th className="px-4 py-2 text-left font-semibold" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)", minWidth: 90 }}>Time</th>
                {DAYS.map(d => (
                  <th key={d} className="px-3 py-2 text-center font-semibold" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)", minWidth: 110 }}>{d.slice(0,3)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {current?.schedule[0].periods.map((p, pi) => (
                <tr key={pi} style={{ borderBottom: "1px solid rgba(26,26,46,0.05)" }}>
                  <td className="px-4 py-2 font-mono text-xs" style={{ color: "rgba(26,26,46,0.40)" }}>{p.time}</td>
                  {current.schedule.map(ds => {
                    const cell = ds.periods[pi];
                    const sc = SUBJECT_COLOR[cell.subject] || { color: "rgba(26,26,46,0.45)", bg: "rgba(26,26,46,0.04)" };
                    return (
                      <td key={ds.day} className="px-3 py-2 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-lg text-xs font-bold"
                          style={{ background: sc.bg, color: sc.color, fontFamily: "var(--font-nunito)" }}>
                          {cell.subject.length > 10 ? cell.subject.slice(0, 10) + "…" : cell.subject}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ERPShell>
  );
}
