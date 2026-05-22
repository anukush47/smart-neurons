"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { ChevronDown, ChevronUp, CheckCircle, BookOpen, Download } from "lucide-react";

interface Topic {
  id: string;
  title: string;
  done: boolean;
  week: string;
}

interface Syllabus {
  id: string;
  subject: string;
  color: string;
  bg: string;
  term: "Term 1" | "Term 2";
  topics: Topic[];
  file_uploaded: boolean;
  file_name: string;
  note: string;
}

interface Student {
  name: string;
  class: string;
  section: string;
}

export default function ParentSyllabusPage() {
  const [userName, setUserName] = useState("");
  const [student, setStudent] = useState<Student | null>(null);
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [term, setTerm] = useState<"Term 1" | "Term 2">("Term 1");
  const [loading, setLoading] = useState(true);

  const loadSyllabus = useCallback(async (t: string) => {
    setLoading(true);
    const res = await fetch(`/api/syllabus/my-child?term=${encodeURIComponent(t)}`);
    const data = await res.json();
    if (data.syllabus) {
      setSyllabi(data.syllabus as Syllabus[]);
      if ((data.syllabus as Syllabus[]).length > 0) setExpanded((data.syllabus as Syllabus[])[0].id);
    }
    if (data.student) setStudent(data.student as Student);
    setLoading(false);
  }, []);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserName(user.user_metadata?.name || "Parent");
    });
    loadSyllabus("Term 1");
  }, [loadSyllabus]);

  function handleTermChange(t: "Term 1" | "Term 2") {
    setTerm(t);
    loadSyllabus(t);
  }

  const filtered = syllabi.filter(s => s.term === term);
  const totalTopics = filtered.reduce((a, s) => a + s.topics.length, 0);
  const doneTopics  = filtered.reduce((a, s) => a + s.topics.filter(t => t.done).length, 0);
  const overallPct  = totalTopics > 0 ? Math.round((doneTopics / totalTopics) * 100) : 0;

  return (
    <ERPShell role="parent" userName={userName}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Syllabus</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          {student ? `${student.name} · ${student.class} ${student.section}` : "Your child's curriculum overview"}
        </p>
      </div>

      {/* Overall progress */}
      {!loading && filtered.length > 0 && (
        <div className="glass-card p-4 mb-5 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{term} Overall Progress</p>
              <span className="text-sm font-bold" style={{ color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>{overallPct}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(26,26,46,0.08)" }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${overallPct}%`, background: "linear-gradient(90deg,#6BCB77,#a0e8a0)" }} />
            </div>
            <p className="text-xs mt-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
              {doneTopics} of {totalTopics} topics covered across {filtered.length} subjects
            </p>
          </div>
        </div>
      )}

      {/* Term tabs */}
      <div className="flex gap-2 mb-5">
        {(["Term 1", "Term 2"] as const).map(t => (
          <button key={t} type="button" onClick={() => handleTermChange(t)}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: term === t ? "rgba(217,119,6,0.10)" : "rgba(26,26,46,0.05)",
              color: term === t ? "#d97706" : "rgba(26,26,46,0.50)",
              border: term === t ? "1.5px solid rgba(217,119,6,0.28)" : "1.5px solid transparent",
              fontFamily: "var(--font-nunito)",
            }}>{t}</button>
        ))}
      </div>

      {loading && (
        <div className="glass-card p-10 text-center">
          <p className="text-sm" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>Loading syllabus…</p>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "rgba(217,119,6,0.10)" }}>
            <BookOpen size={18} style={{ color: "#d97706" }} />
          </div>
          <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>No syllabus for {term} yet</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(s => {
          const open = expanded === s.id;
          const doneCount = s.topics.filter(t => t.done).length;
          const pct = s.topics.length ? Math.round((doneCount / s.topics.length) * 100) : 0;

          return (
            <div key={s.id} className="glass-card overflow-hidden">
              <button type="button" onClick={() => setExpanded(open ? null : s.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: s.bg, color: s.color }}>
                  <BookOpen size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{s.subject}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden max-w-28" style={{ background: "rgba(26,26,46,0.08)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                    <span className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
                      {doneCount}/{s.topics.length}
                    </span>
                    {s.file_uploaded && <CheckCircle size={12} style={{ color: "#6BCB77" }} />}
                  </div>
                </div>
                {open
                  ? <ChevronUp size={16} style={{ color: "rgba(26,26,46,0.40)" }} />
                  : <ChevronDown size={16} style={{ color: "rgba(26,26,46,0.40)" }} />}
              </button>

              {open && (
                <div className="px-4 pb-4" style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
                  <div className="space-y-1.5 mt-3 mb-3">
                    {s.topics.map(t => (
                      <div key={t.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                        style={{ background: t.done ? `${s.color}10` : "rgba(26,26,46,0.04)", border: `1px solid ${t.done ? s.color + "25" : "rgba(26,26,46,0.07)"}` }}>
                        <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                          style={{ background: t.done ? s.color : "transparent", border: `2px solid ${t.done ? s.color : "rgba(26,26,46,0.20)"}` }}>
                          {t.done && <span style={{ color: "white", fontSize: "0.55rem", fontWeight: 700 }}>✓</span>}
                        </div>
                        <p className="flex-1 text-xs font-semibold"
                          style={{ color: t.done ? s.color : "rgba(26,26,46,0.70)", fontFamily: "var(--font-nunito)" }}>{t.title}</p>
                        <span className="text-xs flex-shrink-0" style={{ color: "rgba(26,26,46,0.35)", fontFamily: "var(--font-inter)" }}>{t.week}</span>
                      </div>
                    ))}
                  </div>

                  {s.note && (
                    <div className="mb-3 px-3 py-2.5 rounded-xl"
                      style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                      <p className="text-xs font-bold mb-0.5" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>Teacher&apos;s Note</p>
                      <p className="text-xs" style={{ color: "rgba(26,26,46,0.65)", fontFamily: "var(--font-inter)" }}>{s.note}</p>
                    </div>
                  )}

                  {s.file_uploaded && s.file_name && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ background: "rgba(107,203,119,0.06)", border: "1px solid rgba(107,203,119,0.18)" }}>
                      <Download size={13} style={{ color: "#6BCB77" }} />
                      <span className="text-xs font-semibold" style={{ color: "#6BCB77", fontFamily: "var(--font-inter)" }}>{s.file_name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ERPShell>
  );
}
