"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { Download, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

interface Topic {
  title: string;
  week: string;
  done: boolean;
}

interface SubjectSyllabus {
  id: string;
  subject: string;
  color: string;
  bg: string;
  topics: Topic[];
  fileAvailable: boolean;
  note: string;
}

const SYLLABI: SubjectSyllabus[] = [
  {
    id: "SS1", subject: "English", color: "#d97706", bg: "rgba(217,119,6,0.10)",
    fileAvailable: true, note: "Focus on phonics and basic sentence formation.",
    topics: [
      { title: "Alphabet Recognition (A–Z)", done: true,  week: "Week 1–2" },
      { title: "Phonics – CVC Words",        done: true,  week: "Week 3–4" },
      { title: "Simple Sentences",           done: true,  week: "Week 5–6" },
      { title: "Picture Reading",            done: false, week: "Week 7–8" },
      { title: "Basic Comprehension",        done: false, week: "Week 9–10" },
    ],
  },
  {
    id: "SS2", subject: "Hindi", color: "#7c3aed", bg: "rgba(124,58,237,0.10)",
    fileAvailable: true, note: "Emphasise vowels (swar) practice at home daily.",
    topics: [
      { title: "Swar (Vowels) — अ to अः",    done: true,  week: "Week 1–2" },
      { title: "Vyanjan (Consonants) Part 1", done: true,  week: "Week 3–4" },
      { title: "Vyanjan Part 2",              done: false, week: "Week 5–6" },
      { title: "Matra Practice",              done: false, week: "Week 7–8" },
      { title: "Simple Hindi Words",          done: false, week: "Week 9–10" },
    ],
  },
  {
    id: "SS3", subject: "Mathematics", color: "#6BCB77", bg: "rgba(107,203,119,0.10)",
    fileAvailable: false, note: "",
    topics: [
      { title: "Numbers 1–20 (Recognition)", done: true,  week: "Week 1–2" },
      { title: "Counting Objects",           done: true,  week: "Week 3–4" },
      { title: "Before & After Numbers",     done: true,  week: "Week 5–6" },
      { title: "Addition (single digit)",    done: false, week: "Week 7–8" },
      { title: "Subtraction (single digit)", done: false, week: "Week 9–10" },
    ],
  },
  {
    id: "SS4", subject: "EVS", color: "#FF6B6B", bg: "rgba(255,107,107,0.10)",
    fileAvailable: false, note: "",
    topics: [
      { title: "My Body",          done: true,  week: "Week 1–2" },
      { title: "My Family",        done: true,  week: "Week 3–4" },
      { title: "Animals & Birds",  done: false, week: "Week 5–6" },
      { title: "Plants & Trees",   done: false, week: "Week 7–8" },
      { title: "My Neighbourhood", done: false, week: "Week 9–10" },
    ],
  },
  {
    id: "SS5", subject: "Art & Craft", color: "#d97706", bg: "rgba(255,217,61,0.15)",
    fileAvailable: false, note: "",
    topics: [
      { title: "Colouring within Lines", done: true,  week: "Week 1–2" },
      { title: "Free Drawing",           done: true,  week: "Week 3–4" },
      { title: "Clay Modelling",         done: true,  week: "Week 5–6" },
      { title: "Paper Folding (Origami)",done: false, week: "Week 7–8" },
      { title: "Collage Making",         done: false, week: "Week 9–10" },
    ],
  },
];

export default function ParentSyllabusPage() {
  const [user, setUser] = useState("");
  const [term, setTerm] = useState<"Term 1" | "Term 2">("Term 1");
  const [expanded, setExpanded] = useState<string | null>("SS1");
  const [downloaded, setDownloaded] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUser(user.user_metadata?.name || "Parent");
    });
  }, []);

  function handleDownload(id: string) {
    setDownloaded(id);
    setTimeout(() => setDownloaded(null), 2000);
  }

  const overallDone = SYLLABI.flatMap(s => s.topics).filter(t => t.done).length;
  const overallTotal = SYLLABI.flatMap(s => s.topics).length;
  const overallPct = Math.round((overallDone / overallTotal) * 100);

  return (
    <ERPShell role="parent" userName={user}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Syllabus</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          Aarav Sharma · JKG-A · Topic-wise coverage tracker
        </p>
      </div>

      {/* Term tabs */}
      <div className="flex gap-2 mb-5">
        {(["Term 1", "Term 2"] as const).map(t => (
          <button key={t} type="button" onClick={() => setTerm(t)}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: term === t ? "rgba(217,119,6,0.12)" : "rgba(26,26,46,0.05)",
              color: term === t ? "#d97706" : "rgba(26,26,46,0.50)",
              border: term === t ? "1.5px solid rgba(217,119,6,0.28)" : "1.5px solid transparent",
              fontFamily: "var(--font-nunito)",
            }}>{t}</button>
        ))}
      </div>

      {term === "Term 2" ? (
        <div className="glass-card p-10 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
            style={{ background: "rgba(26,26,46,0.05)" }}>📚</div>
          <p className="text-sm font-semibold text-navy mb-1" style={{ fontFamily: "var(--font-nunito)" }}>Term 2 syllabus not yet published</p>
          <p className="text-xs" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>The school will share it before Term 2 begins.</p>
        </div>
      ) : (
        <>
          {/* Overall progress */}
          <div className="glass-card p-5 mb-4" style={{ border: "1.5px solid rgba(217,119,6,0.18)" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Overall Coverage — Term 1</p>
              <span className="text-sm font-bold" style={{ color: "#d97706", fontFamily: "var(--font-nunito)" }}>{overallPct}%</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(26,26,46,0.08)" }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${overallPct}%`, background: "linear-gradient(90deg,#d97706,#f59e0b)" }} />
            </div>
            <p className="text-xs mt-2" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
              {overallDone} of {overallTotal} topics completed across all subjects
            </p>
          </div>

          {/* Subject cards */}
          <div className="space-y-2">
            {SYLLABI.map(s => {
              const open = expanded === s.id;
              const doneCount = s.topics.filter(t => t.done).length;
              const pct = Math.round((doneCount / s.topics.length) * 100);

              return (
                <div key={s.id} className="glass-card overflow-hidden">
                  <button type="button" onClick={() => setExpanded(open ? null : s.id)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                      style={{ background: s.bg }}>
                      📖
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{s.subject}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden max-w-28" style={{ background: "rgba(26,26,46,0.08)" }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                        </div>
                        <span className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
                          {doneCount}/{s.topics.length} done
                        </span>
                      </div>
                    </div>
                    {s.fileAvailable && (
                      <button type="button"
                        onClick={e => { e.stopPropagation(); handleDownload(s.id); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 transition-all hover:scale-105"
                        style={{
                          background: downloaded === s.id ? "rgba(107,203,119,0.12)" : `${s.color}12`,
                          color: downloaded === s.id ? "#6BCB77" : s.color,
                          border: `1px solid ${downloaded === s.id ? "rgba(107,203,119,0.25)" : s.color + "28"}`,
                          fontFamily: "var(--font-nunito)",
                        }}>
                        <Download size={11} />
                        {downloaded === s.id ? "Saved!" : "PDF"}
                      </button>
                    )}
                    {open ? <ChevronUp size={16} style={{ color: "rgba(26,26,46,0.40)" }} /> : <ChevronDown size={16} style={{ color: "rgba(26,26,46,0.40)" }} />}
                  </button>

                  {open && (
                    <div className="px-4 pb-4" style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
                      {/* Teacher note */}
                      {s.note && (
                        <div className="mt-3 mb-3 px-3 py-2.5 rounded-xl"
                          style={{ background: `${s.color}0D`, border: `1px solid ${s.color}25` }}>
                          <p className="text-xs font-semibold mb-0.5" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>👩‍🏫 Teacher's Note</p>
                          <p className="text-xs leading-relaxed" style={{ color: "rgba(26,26,46,0.65)", fontFamily: "var(--font-inter)" }}>{s.note}</p>
                        </div>
                      )}

                      {/* Topics list */}
                      <p className="text-xs font-bold mt-3 mb-2 uppercase tracking-wide" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-nunito)" }}>Topics</p>
                      <div className="space-y-1.5">
                        {s.topics.map((t, i) => (
                          <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                            style={{ background: t.done ? `${s.color}0C` : "rgba(26,26,46,0.03)", border: `1px solid ${t.done ? s.color + "20" : "rgba(26,26,46,0.06)"}` }}>
                            <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                              style={{ background: t.done ? s.color : "transparent", border: `2px solid ${t.done ? s.color : "rgba(26,26,46,0.20)"}` }}>
                              {t.done && <span style={{ color: "white", fontSize: "0.6rem", fontWeight: 700 }}>✓</span>}
                            </div>
                            <p className="flex-1 text-xs font-semibold"
                              style={{ color: t.done ? s.color : "rgba(26,26,46,0.65)", fontFamily: "var(--font-nunito)" }}>
                              {t.title}
                            </p>
                            <span className="text-xs flex-shrink-0" style={{ color: "rgba(26,26,46,0.35)", fontFamily: "var(--font-inter)" }}>{t.week}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </ERPShell>
  );
}
