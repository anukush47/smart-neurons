"use client";

import { useState, useEffect } from "react";
import ERPShell from "@/components/erp/ERPShell";
import { createClient } from "@/lib/supabase/client";
import { Clock, BookOpen, User, Calendar } from "lucide-react";

interface Period {
  time: string;
  subject: string;
  teacher: string;
}

interface DaySchedule {
  day: string;
  periods: Period[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SUBJECT_COLOR: Record<string, string> = {
  English: "#6BCB77", Hindi: "#FF6B6B", Maths: "#4D96FF",
  EVS: "#FFD93D", Drawing: "#FF922B", Music: "#CC5DE8",
  "Physical Education": "#20C997", Play: "#F06595",
};

function subjectColor(subject: string) {
  for (const key of Object.keys(SUBJECT_COLOR)) {
    if (subject?.toLowerCase().includes(key.toLowerCase())) return SUBJECT_COLOR[key];
  }
  return "#94a3b8";
}

export default function FacultyRoutinePage() {
  const [user, setUser] = useState<{ name: string; classAssigned?: string } | null>(null);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? "Monday" : d === 6 ? "Saturday" : DAYS[d - 1];
  });
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) { setLoading(false); return; }
      const u = data.user;
      setUser({
        name: u.app_metadata?.name || u.email || "Faculty",
        classAssigned: u.app_metadata?.class_assigned,
      });

      const res = await fetch("/api/timetable/my-class");
      const json = await res.json();
      if (json.error) {
        if (res.status !== 404) setError(json.error);
        setLoading(false);
        return;
      }

      const rows = json.timetable ?? [];
      const byDay: Record<string, Period[]> = {};
      for (const row of rows) {
        byDay[row.day] = row.periods ?? [];
      }
      const built = DAYS.map(day => ({ day, periods: byDay[day] ?? [] }));
      setSchedule(built);
      setLoading(false);
    }
    load();
  }, []);

  const todaySchedule = schedule.find(s => s.day === activeDay);

  return (
    <ERPShell role="faculty" userName={user?.name}>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Daily Routine</h1>
          {user?.classAssigned && (
            <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: "var(--font-nunito)" }}>
              Class: <span className="font-bold text-green-600">{user.classAssigned}</span>
            </p>
          )}
        </div>

        {/* Day tabs */}
        <div className="flex gap-2 flex-wrap">
          {DAYS.map(day => (
            <button key={day} onClick={() => setActiveDay(day)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              style={{
                fontFamily: "var(--font-nunito)",
                background: activeDay === day ? "#6BCB77" : "rgba(26,26,46,0.06)",
                color: activeDay === day ? "white" : "rgba(26,26,46,0.60)",
              }}>
              {day.slice(0, 3)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400" style={{ fontFamily: "var(--font-nunito)" }}>Loading timetable…</div>
        ) : error ? (
          <div className="bg-red-50 rounded-2xl p-6 text-center text-red-500 text-sm" style={{ fontFamily: "var(--font-nunito)" }}>{error}</div>
        ) : !todaySchedule || todaySchedule.periods.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <Calendar size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="font-bold text-gray-500" style={{ fontFamily: "var(--font-nunito)" }}>No schedule for {activeDay}</p>
            <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: "var(--font-nunito)" }}>Ask admin to set up the timetable</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todaySchedule.periods.map((p, i) => {
              const color = subjectColor(p.subject);
              return (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                    style={{ background: color, fontFamily: "var(--font-nunito)" }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-navy text-sm" style={{ fontFamily: "var(--font-nunito)" }}>{p.subject || "—"}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                        style={{ background: color, fontFamily: "var(--font-nunito)" }}>
                        Period {i + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {p.time && (
                        <span className="flex items-center gap-1 text-xs text-gray-500" style={{ fontFamily: "var(--font-nunito)" }}>
                          <Clock size={11} /> {p.time}
                        </span>
                      )}
                      {p.teacher && (
                        <span className="flex items-center gap-1 text-xs text-gray-500" style={{ fontFamily: "var(--font-nunito)" }}>
                          <User size={11} /> {p.teacher}
                        </span>
                      )}
                    </div>
                  </div>
                  <BookOpen size={16} className="text-gray-300 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {!loading && !error && todaySchedule && todaySchedule.periods.length > 0 && (
          <div className="bg-green-50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center font-bold" style={{ fontFamily: "var(--font-nunito)" }}>
              {todaySchedule.periods.length}
            </div>
            <div>
              <p className="text-sm font-bold text-green-800" style={{ fontFamily: "var(--font-nunito)" }}>
                {todaySchedule.periods.length} periods on {activeDay}
              </p>
              <p className="text-xs text-green-600 mt-0.5" style={{ fontFamily: "var(--font-nunito)" }}>
                {todaySchedule.periods.map(p => p.subject).filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
        )}
      </div>
    </ERPShell>
  );
}
