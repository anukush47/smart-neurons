"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { BookOpen, CheckCircle, AlertCircle, Users, ChevronDown, ChevronUp, Search } from "lucide-react";

type HWType = "Drawing" | "Activity" | "Oral" | "Written" | "Reading";

interface HWSummary {
  id: number;
  subject: string;
  title: string;
  class: string;
  teacher: string;
  dueDate: string;
  type: HWType;
  total: number;
  submitted: number;
  reviewed: number;
}

const TYPE_STYLE: Record<HWType, { bg: string; color: string }> = {
  Drawing:  { bg: "rgba(124,58,237,0.10)", color: "#7c3aed" },
  Activity: { bg: "rgba(255,217,61,0.15)", color: "#d97706" },
  Oral:     { bg: "rgba(107,203,119,0.12)", color: "#6BCB77" },
  Written:  { bg: "rgba(255,107,107,0.10)", color: "#FF6B6B" },
  Reading:  { bg: "rgba(26,26,46,0.06)",    color: "rgba(26,26,46,0.55)" },
};

const ALL_HW: HWSummary[] = [
  { id: 1, subject: "English",    title: "Draw your favourite animal",    class: "JKG-A",     teacher: "Ms. Priya Sharma",  dueDate: "2026-05-20", type: "Drawing",  total: 7,  submitted: 5, reviewed: 2 },
  { id: 2, subject: "Maths",      title: "Count objects around the house",class: "SKG-A",     teacher: "Ms. Priya Sharma",  dueDate: "2026-05-21", type: "Activity", total: 6,  submitted: 2, reviewed: 0 },
  { id: 3, subject: "Hindi",      title: "Revise vowels (अ, आ, इ, ई)",   class: "JKG-B",     teacher: "Ms. Priya Sharma",  dueDate: "2026-05-22", type: "Oral",     total: 6,  submitted: 4, reviewed: 2 },
  { id: 4, subject: "English",    title: "Read a short story aloud",       class: "JKG-A",    teacher: "Ms. Priya Sharma",  dueDate: "2026-05-24", type: "Reading",  total: 7,  submitted: 0, reviewed: 0 },
  { id: 5, subject: "EVS",        title: "Name 5 plants at home",          class: "Nursery-A", teacher: "Ms. Kavya Reddy",  dueDate: "2026-05-20", type: "Activity", total: 6,  submitted: 6, reviewed: 5 },
  { id: 6, subject: "Rhymes",     title: "Recite 'Twinkle Twinkle'",       class: "Nursery-B", teacher: "Ms. Kavya Reddy",  dueDate: "2026-05-21", type: "Oral",     total: 5,  submitted: 3, reviewed: 1 },
  { id: 7, subject: "Drawing",    title: "Colour the sunshine worksheet",  class: "Playgroup-A","teacher": "Ms. Sunita Patil",dueDate: "2026-05-23",type: "Drawing",  total: 5,  submitted: 4, reviewed: 3 },
  { id: 8, subject: "Maths",      title: "Trace numbers 1–10",             class: "Nursery-A", teacher: "Ms. Kavya Reddy",  dueDate: "2026-05-25", type: "Written",  total: 6,  submitted: 1, reviewed: 0 },
];

const CLASSES = ["All", "Playgroup-A", "Nursery-A", "Nursery-B", "JKG-A", "JKG-B", "SKG-A"];

export default function AdminHomeworkPage() {
  const [user, setUser] = useState("");
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUser(user.user_metadata?.name || "Admin");
    });
  }, []);

  const filtered = ALL_HW.filter(h => {
    if (classFilter !== "All" && h.class !== classFilter) return false;
    if (search && !h.title.toLowerCase().includes(search.toLowerCase()) &&
        !h.subject.toLowerCase().includes(search.toLowerCase()) &&
        !h.teacher.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalHW       = ALL_HW.length;
  const totalPending  = ALL_HW.reduce((a, h) => a + (h.total - h.submitted), 0);
  const totalReviewed = ALL_HW.reduce((a, h) => a + h.reviewed, 0);
  const overallPct    = ALL_HW.reduce((a, h) => a + h.submitted, 0) /
                        Math.max(ALL_HW.reduce((a, h) => a + h.total, 0), 1) * 100;

  // Submission by class
  const byClass = CLASSES.slice(1).map(c => {
    const hw = ALL_HW.filter(h => h.class === c);
    const sub = hw.reduce((a, h) => a + h.submitted, 0);
    const tot = hw.reduce((a, h) => a + h.total, 0);
    return { class: c, sub, tot, pct: tot > 0 ? Math.round(sub / tot * 100) : 0 };
  });

  return (
    <ERPShell role="admin" userName={user}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Homework Overview</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          School-wide homework tracking · {new Date("2026-05-20").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Assignments",       value: totalHW,              color: "#7c3aed", bg: "rgba(167,139,250,0.10)" },
          { label: "Pending Submissions",value: totalPending,         color: "#FF6B6B", bg: "rgba(255,107,107,0.08)" },
          { label: "Reviewed",          value: totalReviewed,         color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
          { label: "Overall Submission", value: `${Math.round(overallPct)}%`, color: "#d97706", bg: "rgba(255,217,61,0.12)" },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Class submission rates */}
      <div className="glass-card p-5 mb-6">
        <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
          <Users size={14} style={{ color: "#7c3aed" }} /> Submission Rate by Class
        </h2>
        <div className="space-y-3">
          {byClass.filter(c => c.tot > 0).map((c, i) => {
            const colors = ["#7c3aed","#FF6B6B","#d97706","#6BCB77","#7c3aed","#FF6B6B"];
            return (
              <div key={c.class}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{c.class}</p>
                    <button type="button" onClick={() => setClassFilter(c.class === classFilter ? "All" : c.class)}
                      className="text-xs font-semibold px-1.5 py-0.5 rounded-full transition-all duration-150"
                      style={{
                        background: classFilter === c.class ? `${colors[i]}15` : "rgba(26,26,46,0.05)",
                        color: classFilter === c.class ? colors[i] : "rgba(26,26,46,0.40)",
                        fontFamily: "var(--font-nunito)",
                      }}>
                      Filter
                    </button>
                  </div>
                  <p className="text-xs font-bold" style={{ color: c.pct >= 75 ? "#6BCB77" : "#FF6B6B", fontFamily: "var(--font-nunito)" }}>
                    {c.sub}/{c.tot} · {c.pct}%
                  </p>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(26,26,46,0.06)" }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${c.pct}%`, background: colors[i] }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter + search */}
      <div className="glass-card p-4 mb-4">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[160px] relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(26,26,46,0.35)" }} />
            <input type="text" placeholder="Search by title, subject, teacher…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm"
              style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.08)", color: "rgba(26,26,46,0.80)", fontFamily: "var(--font-inter)", outline: "none" }}
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {CLASSES.map(c => (
              <button key={c} type="button" onClick={() => setClassFilter(c)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150"
                style={{
                  background: classFilter === c ? "rgba(124,58,237,0.12)" : "rgba(26,26,46,0.05)",
                  color: classFilter === c ? "#7c3aed" : "rgba(26,26,46,0.55)",
                  fontFamily: "var(--font-nunito)",
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Homework list */}
      <div className="space-y-3">
        {filtered.map(hw => {
          const isOpen  = expanded === hw.id;
          const pending = hw.total - hw.submitted;
          const pct     = hw.total > 0 ? Math.round(hw.submitted / hw.total * 100) : 0;
          const overdue = new Date(hw.dueDate) < new Date("2026-05-20") && pending > 0;

          return (
            <div key={hw.id} className="glass-card overflow-hidden"
              style={{ border: overdue ? "1.5px solid rgba(255,107,107,0.25)" : "1.5px solid rgba(255,255,255,0.60)" }}>
              <button type="button" className="w-full flex items-center gap-4 p-4 text-left"
                onClick={() => setExpanded(isOpen ? null : hw.id)}>
                <span className="text-xs font-bold px-2.5 py-1.5 rounded-xl flex-shrink-0"
                  style={{ ...TYPE_STYLE[hw.type], fontFamily: "var(--font-nunito)", minWidth: 64, textAlign: "center" }}>
                  {hw.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-navy truncate" style={{ fontFamily: "var(--font-nunito)" }}>
                    {hw.title}
                    {overdue && <span className="ml-2 text-xs font-bold" style={{ color: "#FF6B6B" }}>Overdue</span>}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
                    {hw.subject} · {hw.class} · {hw.teacher} · Due {new Date(hw.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
                {/* Mini progress */}
                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                  <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(26,26,46,0.08)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 75 ? "#6BCB77" : "#d97706" }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: pct >= 75 ? "#6BCB77" : "#d97706", fontFamily: "var(--font-nunito)" }}>{pct}%</span>
                </div>
                {isOpen ? <ChevronUp size={16} style={{ color: "rgba(26,26,46,0.40)", flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: "rgba(26,26,46,0.40)", flexShrink: 0 }} />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(26,26,46,0.06)" }}>
                  <div className="h-1.5 rounded-full my-4 overflow-hidden" style={{ background: "rgba(26,26,46,0.06)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 75 ? "#6BCB77" : "#d97706" }} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "Total",     value: hw.total,     color: "#7c3aed" },
                      { label: "Submitted", value: hw.submitted, color: "#d97706" },
                      { label: "Reviewed",  value: hw.reviewed,  color: "#6BCB77" },
                    ].map(s => (
                      <div key={s.label} className="p-3 rounded-2xl text-center"
                        style={{ background: `${s.color}10` }}>
                        <p className="text-xl font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>{s.value}</p>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>
                    <span className="font-semibold text-navy">{pending}</span> student{pending !== 1 ? "s" : ""} yet to submit
                    {hw.reviewed < hw.submitted && (
                      <> · <span className="font-semibold text-navy">{hw.submitted - hw.reviewed}</span> submitted but not yet reviewed</>
                    )}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="glass-card p-10 text-center">
            <p className="text-2xl mb-2">📚</p>
            <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>No homework found</p>
            <p className="text-xs mt-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>Try adjusting filters</p>
          </div>
        )}
      </div>
    </ERPShell>
  );
}
