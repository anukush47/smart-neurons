"use client";

import { useState, useEffect } from "react";
import ERPShell from "@/components/erp/ERPShell";
import { createClient } from "@/lib/supabase/client";
import { Clock, BookOpen, Calendar } from "lucide-react";

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

export default function ParentTimetablePage() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [childInfo, setChildInfo] = useState<{ name: string; class: string; section: string } | null>(null);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeDay, setActiveDay] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? "Monday" : d === 6 ? "Saturday" : DAYS[d - 1];
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) { setLoading(false); return; }
      setUser({ name: data.user.app_metadata?.name || data.user.email || "Parent" });

      const res = await fetch("/api/timetable/my-child");
      const json = await res.json();

      if (json.error) {
        if (res.status !== 404) setError(json.error);
        setLoading(false);
        return;
      }

      if (json.student) {
        setChildInfo({
          name: json.student.name || "Your Child",
          class: json.student.class,
          section: json.student.section || "A",
        });
      }

      const rows = json.timetable ?? [];
      const byDay: Record<string, Period[]> = {};
      for (const row of rows) byDay[row.day] = row.periods ?? [];
      setSchedule(DAYS.map(day => ({ day, periods: byDay[day] ?? [] })));
      setLoading(false);
    }
    load();
  }, []);

  const todaySchedule = schedule.find(s => s.day === activeDay);

  return (
    <ERPShell role="parent" userName={user?.name}>
      <div className="max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Timetable</h1>
          {childInfo && (
            <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: "var(--font-nunito)" }}>
              {childInfo.name} · <span className="font-bold text-amber-600">{childInfo.class}-{childInfo.section}</span>
            </p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {DAYS.map(day => (
            <button key={day} onClick={() => setActiveDay(day)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              style={{
                fontFamily: "var(--font-nunito)",
                background: activeDay === day ? "#d97706" : "rgba(26,26,46,0.06)",
                color: activeDay === day ? "white" : "rgba(26,26,46,0.60)",
              }}>
              {day.slice(0, 3)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400" style={{ fontFamily: "var(--font-nunito)" }}>Loading timetable…</div>
        ) : error ? (
          <div className="bg-amber-50 rounded-2xl p-6 text-center text-amber-600 text-sm" style={{ fontFamily: "var(--font-nunito)" }}>
            {error || "No student linked to your account. Please contact admin."}
          </div>
        ) : !todaySchedule || todaySchedule.periods.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <Calendar size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="font-bold text-gray-500" style={{ fontFamily: "var(--font-nunito)" }}>No schedule for {activeDay}</p>
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
                    <p className="font-bold text-navy text-sm" style={{ fontFamily: "var(--font-nunito)" }}>{p.subject || "—"}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {p.time && (
                        <span className="flex items-center gap-1 text-xs text-gray-500" style={{ fontFamily: "var(--font-nunito)" }}>
                          <Clock size={11} /> {p.time}
                        </span>
                      )}
                      {p.teacher && (
                        <span className="text-xs text-gray-400" style={{ fontFamily: "var(--font-nunito)" }}>by {p.teacher}</span>
                      )}
                    </div>
                  </div>
                  <BookOpen size={16} className="text-gray-300 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && todaySchedule && todaySchedule.periods.length > 0 && (
          <div className="bg-amber-50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold"
              style={{ fontFamily: "var(--font-nunito)" }}>
              {todaySchedule.periods.length}
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800" style={{ fontFamily: "var(--font-nunito)" }}>
                {todaySchedule.periods.length} periods on {activeDay}
              </p>
              <p className="text-xs text-amber-600 mt-0.5" style={{ fontFamily: "var(--font-nunito)" }}>
                {todaySchedule.periods.map(p => p.subject).filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
        )}
      </div>
    </ERPShell>
  );
}
