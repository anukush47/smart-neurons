"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { BookOpen, CheckCircle, AlertCircle, Users, ChevronDown, ChevronUp, Search } from "lucide-react";

type HWType = "Drawing" | "Activity" | "Oral" | "Written" | "Reading";

interface HWSummary {
  id: string;
  subject: string;
  title: string;
  class: string;
  section: string;
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

const CLASS_TEACHER: Record<string, string> = {
  Nursery: "Aarav Kumar",
  LKG:     "Neha Sharma",
  UKG:     "Rohan Singh",
  JKG:     "Priya Patel",
  SKG:     "Vikram Verma",
};

const CLASSES = ["All", "Nursery", "LKG", "UKG", "JKG", "SKG"];

function mapHW(hw: Record<string, unknown>): HWSummary {
  const subs = (hw.homework_submissions as Record<string, string>[]) ?? [];
  return {
    id: hw.id as string,
    subject: hw.subject as string,
    title: hw.title as string,
    class: hw.class as string,
    section: hw.section as string,
    teacher: CLASS_TEACHER[hw.class as string] || "—",
    dueDate: hw.due_date as string,
    type: hw.type as HWType,
    total: subs.length,
    submitted: subs.filter(s => s.status !== "pending").length,
    reviewed: subs.filter(s => s.status === "reviewed").length,
  };
}

export default function AdminHomeworkPage() {
  const [userName, setUserName] = useState("");
  const [allHW, setAllHW] = useState<HWSummary[]>([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserName(user.user_metadata?.name || user.app_metadata?.name || "Admin");
    });

    fetch("/api/homework")
      .then(r => r.json())
      .then(data => {
        if (data.homework) setAllHW((data.homework as Record<string, unknown>[]).map(mapHW));
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = allHW.filter(hw => {
    const matchClass = classFilter === "All" || hw.class === classFilter;
    const matchSearch = !search || hw.title.toLowerCase().includes(search.toLowerCase()) ||
      hw.subject.toLowerCase().includes(search.toLowerCase()) ||
      hw.teacher.toLowerCase().includes(search.toLowerCase());
    return matchClass && matchSearch;
  });

  const totalAssignments = filtered.length;
  const totalPending     = filtered.reduce((a, h) => a + (h.total - h.submitted), 0);
  const totalReviewed    = filtered.reduce((a, h) => a + h.reviewed, 0);
  const avgCompletion    = filtered.length > 0
    ? Math.round(filtered.reduce((a, h) => a + (h.total > 0 ? (h.submitted / h.total) * 100 : 0), 0) / filtered.length)
    : 0;

  return (
    <ERPShell role="admin" userName={userName}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Homework Overview</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          Monitor assignments and submission progress across all classes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Assignments",     value: totalAssignments, color: "#7c3aed", bg: "rgba(167,139,250,0.10)" },
          { label: "Pending Subs.",   value: totalPending,     color: "#FF6B6B", bg: "rgba(255,107,107,0.08)" },
          { label: "Reviewed",        value: totalReviewed,    color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
          { label: "Avg. Completion", value: `${avgCompletion}%`, color: "#d97706", bg: "rgba(255,217,61,0.12)" },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-48"
          style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.08)" }}>
          <Search size={14} style={{ color: "rgba(26,26,46,0.40)" }} />
          <input type="text" placeholder="Search assignments…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "rgba(26,26,46,0.75)", fontFamily: "var(--font-inter)" }}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CLASSES.map(c => (
            <button key={c} type="button" onClick={() => setClassFilter(c)}
              className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: classFilter === c ? "rgba(255,107,107,0.12)" : "rgba(26,26,46,0.05)",
                color: classFilter === c ? "#FF6B6B" : "rgba(26,26,46,0.50)",
                border: classFilter === c ? "1.5px solid rgba(255,107,107,0.28)" : "1.5px solid transparent",
                fontFamily: "var(--font-nunito)",
              }}>{c}</button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="glass-card p-10 text-center">
          <p className="text-sm" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>Loading assignments…</p>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="glass-card p-10 text-center">
          <p className="text-sm font-semibold text-navy mb-1" style={{ fontFamily: "var(--font-nunito)" }}>No assignments found</p>
          <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>Try changing the filter or search term.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(hw => {
          const isOpen = expanded === hw.id;
          const pending  = hw.total - hw.submitted;
          const pct = hw.total > 0 ? Math.round((hw.submitted / hw.total) * 100) : 0;
          const overdue = new Date(hw.dueDate) < new Date() && pending > 0;

          return (
            <div key={hw.id} className="glass-card overflow-hidden"
              style={{ border: overdue ? "1.5px solid rgba(255,107,107,0.20)" : "1.5px solid rgba(255,255,255,0.60)" }}>
              <button type="button" className="w-full flex items-center gap-4 p-4 text-left"
                onClick={() => setExpanded(isOpen ? null : hw.id)}>
                <span className="text-xs font-bold px-2.5 py-1.5 rounded-xl flex-shrink-0"
                  style={{ ...TYPE_STYLE[hw.type], fontFamily: "var(--font-nunito)", minWidth: 60, textAlign: "center" }}>
                  {hw.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-navy truncate" style={{ fontFamily: "var(--font-nunito)" }}>{hw.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
                    {hw.subject} · {hw.class} {hw.section} · {hw.teacher}
                    {overdue && <span className="ml-2 font-bold" style={{ color: "#FF6B6B" }}>Overdue</span>}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs flex-shrink-0">
                  <Users size={12} style={{ color: "rgba(26,26,46,0.40)" }} />
                  <span style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>
                    {hw.submitted}/{hw.total}
                  </span>
                  {hw.reviewed > 0 && (
                    <span style={{ color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>· {hw.reviewed} reviewed</span>
                  )}
                </div>
                {isOpen
                  ? <ChevronUp size={16} style={{ color: "rgba(26,26,46,0.40)", flexShrink: 0 }} />
                  : <ChevronDown size={16} style={{ color: "rgba(26,26,46,0.40)", flexShrink: 0 }} />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(26,26,46,0.06)" }}>
                  <div className="grid sm:grid-cols-3 gap-4 mt-4">
                    {[
                      { label: "Total Students",  value: hw.total,       icon: <Users size={14} />,         color: "#7c3aed" },
                      { label: "Submitted",        value: hw.submitted,   icon: <CheckCircle size={14} />,   color: "#d97706" },
                      { label: "Reviewed",         value: hw.reviewed,    icon: <AlertCircle size={14} />,   color: "#6BCB77" },
                    ].map(s => (
                      <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ background: `${s.color}08`, border: `1px solid ${s.color}18` }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${s.color}15`, color: s.color }}>
                          {s.icon}
                        </div>
                        <div>
                          <p className="text-lg font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>{s.value}</p>
                          <p className="text-xs" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>{s.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>Submission rate</p>
                      <span className="text-xs font-bold" style={{ color: pct >= 80 ? "#6BCB77" : pct >= 50 ? "#d97706" : "#FF6B6B", fontFamily: "var(--font-nunito)" }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(26,26,46,0.06)" }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: pct >= 80 ? "#6BCB77" : pct >= 50 ? "#d97706" : "#FF6B6B" }} />
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
                      Due {new Date(hw.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ERPShell>
  );
}
