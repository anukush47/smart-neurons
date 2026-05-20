"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ERPShell from "@/components/erp/ERPShell";
import { ChevronDown, ChevronUp, Upload, CheckCircle, Plus, Trash2, FileText, BookOpen } from "lucide-react";

interface Topic {
  id: string;
  title: string;
  done: boolean;
  week: string;
}

interface SubjectSyllabus {
  id: string;
  subject: string;
  color: string;
  bg: string;
  term: "Term 1" | "Term 2";
  topics: Topic[];
  fileUploaded: boolean;
  fileName: string;
  note: string;
}

const INITIAL: SubjectSyllabus[] = [
  {
    id: "SS1", subject: "English", color: "#d97706", bg: "rgba(217,119,6,0.10)", term: "Term 1",
    fileUploaded: true, fileName: "English_JKG-A_Term1.pdf", note: "Focus on phonics and basic sentence formation.",
    topics: [
      { id: "T1", title: "Alphabet Recognition (A–Z)", done: true,  week: "Week 1–2" },
      { id: "T2", title: "Phonics – CVC Words",        done: true,  week: "Week 3–4" },
      { id: "T3", title: "Simple Sentences",           done: true,  week: "Week 5–6" },
      { id: "T4", title: "Picture Reading",            done: false, week: "Week 7–8" },
      { id: "T5", title: "Basic Comprehension",        done: false, week: "Week 9–10" },
    ],
  },
  {
    id: "SS2", subject: "Hindi", color: "#7c3aed", bg: "rgba(124,58,237,0.10)", term: "Term 1",
    fileUploaded: true, fileName: "Hindi_JKG-A_Term1.pdf", note: "Emphasise vowels (swar) practice at home daily.",
    topics: [
      { id: "T6",  title: "Swar (Vowels) — अ to अः",   done: true,  week: "Week 1–2" },
      { id: "T7",  title: "Vyanjan (Consonants) Part 1",done: true,  week: "Week 3–4" },
      { id: "T8",  title: "Vyanjan Part 2",             done: false, week: "Week 5–6" },
      { id: "T9",  title: "Matra Practice",             done: false, week: "Week 7–8" },
      { id: "T10", title: "Simple Hindi Words",         done: false, week: "Week 9–10" },
    ],
  },
  {
    id: "SS3", subject: "Mathematics", color: "#6BCB77", bg: "rgba(107,203,119,0.10)", term: "Term 1",
    fileUploaded: false, fileName: "", note: "",
    topics: [
      { id: "T11", title: "Numbers 1–20 (Recognition)", done: true,  week: "Week 1–2" },
      { id: "T12", title: "Counting Objects",           done: true,  week: "Week 3–4" },
      { id: "T13", title: "Before & After Numbers",     done: true,  week: "Week 5–6" },
      { id: "T14", title: "Addition (single digit)",    done: false, week: "Week 7–8" },
      { id: "T15", title: "Subtraction (single digit)", done: false, week: "Week 9–10" },
    ],
  },
  {
    id: "SS4", subject: "EVS", color: "#FF6B6B", bg: "rgba(255,107,107,0.10)", term: "Term 1",
    fileUploaded: false, fileName: "", note: "",
    topics: [
      { id: "T16", title: "My Body",          done: true,  week: "Week 1–2" },
      { id: "T17", title: "My Family",        done: true,  week: "Week 3–4" },
      { id: "T18", title: "Animals & Birds",  done: false, week: "Week 5–6" },
      { id: "T19", title: "Plants & Trees",   done: false, week: "Week 7–8" },
      { id: "T20", title: "My Neighbourhood", done: false, week: "Week 9–10" },
    ],
  },
  {
    id: "SS5", subject: "Art & Craft", color: "#d97706", bg: "rgba(255,217,61,0.15)", term: "Term 1",
    fileUploaded: false, fileName: "", note: "",
    topics: [
      { id: "T21", title: "Colouring within Lines", done: true,  week: "Week 1–2" },
      { id: "T22", title: "Free Drawing",           done: true,  week: "Week 3–4" },
      { id: "T23", title: "Clay Modelling",         done: true,  week: "Week 5–6" },
      { id: "T24", title: "Paper Folding (Origami)",done: false, week: "Week 7–8" },
      { id: "T25", title: "Collage Making",         done: false, week: "Week 9–10" },
    ],
  },
];

export default function FacultySyllabusPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [syllabi, setSyllabi] = useState<SubjectSyllabus[]>(INITIAL);
  const [expanded, setExpanded] = useState<string | null>("SS1");
  const [term, setTerm] = useState<"Term 1" | "Term 2">("Term 1");
  const [showAddTopic, setShowAddTopic] = useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicWeek, setNewTopicWeek] = useState("");
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const role = sessionStorage.getItem("erp_role");
    const u = sessionStorage.getItem("erp_user");
    if (role !== "faculty") { router.replace("/erp/login"); return; }
    setUser(u || "Ms. Priya Sharma");
  }, []);

  function toggleTopic(syllabusId: string, topicId: string) {
    setSyllabi(prev => prev.map(s =>
      s.id !== syllabusId ? s :
        { ...s, topics: s.topics.map(t => t.id === topicId ? { ...t, done: !t.done } : t) }
    ));
  }

  function addTopic(syllabusId: string) {
    if (!newTopicTitle.trim()) return;
    const topic: Topic = {
      id: `T${Date.now()}`, title: newTopicTitle.trim(),
      week: newTopicWeek.trim() || "TBD", done: false,
    };
    setSyllabi(prev => prev.map(s => s.id !== syllabusId ? s : { ...s, topics: [...s.topics, topic] }));
    setNewTopicTitle("");
    setNewTopicWeek("");
    setShowAddTopic(null);
  }

  function deleteTopic(syllabusId: string, topicId: string) {
    setSyllabi(prev => prev.map(s =>
      s.id !== syllabusId ? s : { ...s, topics: s.topics.filter(t => t.id !== topicId) }
    ));
  }

  function updateNote(syllabusId: string, note: string) {
    setSyllabi(prev => prev.map(s => s.id !== syllabusId ? s : { ...s, note }));
  }

  function handleFileChange(syllabusId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSyllabi(prev => prev.map(s => s.id !== syllabusId ? s : { ...s, fileUploaded: true, fileName: file.name }));
  }

  const filtered = syllabi.filter(s => s.term === term);

  return (
    <ERPShell role="faculty" userName={user}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Syllabus Manager</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          JKG-A · Manage topics, track coverage, and share PDF syllabi with parents
        </p>
      </div>

      {/* Term tabs */}
      <div className="flex gap-2 mb-5">
        {(["Term 1", "Term 2"] as const).map(t => (
          <button key={t} type="button" onClick={() => setTerm(t)}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: term === t ? "rgba(107,203,119,0.12)" : "rgba(26,26,46,0.05)",
              color: term === t ? "#6BCB77" : "rgba(26,26,46,0.50)",
              border: term === t ? "1.5px solid rgba(107,203,119,0.28)" : "1.5px solid transparent",
              fontFamily: "var(--font-nunito)",
            }}>{t}</button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(s => {
          const open = expanded === s.id;
          const doneCount = s.topics.filter(t => t.done).length;
          const pct = s.topics.length ? Math.round((doneCount / s.topics.length) * 100) : 0;

          return (
            <div key={s.id} className="glass-card overflow-hidden">
              {/* Header */}
              <button type="button" onClick={() => setExpanded(open ? null : s.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: s.bg, color: s.color }}>
                  <BookOpen size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{s.subject}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden max-w-32" style={{ background: "rgba(26,26,46,0.08)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                    <span className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
                      {doneCount}/{s.topics.length} topics covered
                    </span>
                    {s.fileUploaded && <CheckCircle size={12} style={{ color: "#6BCB77" }} />}
                  </div>
                </div>
                {open ? <ChevronUp size={16} style={{ color: "rgba(26,26,46,0.40)" }} /> : <ChevronDown size={16} style={{ color: "rgba(26,26,46,0.40)" }} />}
              </button>

              {open && (
                <div className="px-4 pb-4" style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
                  {/* Topics */}
                  <p className="text-xs font-bold mt-3 mb-2 uppercase tracking-wide" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>Topics</p>
                  <div className="space-y-1.5 mb-3">
                    {s.topics.map(t => (
                      <div key={t.id} className="flex items-center gap-2 px-3 py-2 rounded-xl group"
                        style={{ background: t.done ? `${s.color}10` : "rgba(26,26,46,0.04)", border: `1px solid ${t.done ? s.color + "25" : "rgba(26,26,46,0.07)"}` }}>
                        <button type="button" onClick={() => toggleTopic(s.id, t.id)}
                          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                          style={{ background: t.done ? s.color : "transparent", border: `2px solid ${t.done ? s.color : "rgba(26,26,46,0.25)"}` }}>
                          {t.done && <span style={{ color: "white", fontSize: "0.6rem", fontWeight: 700 }}>✓</span>}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold" style={{ color: t.done ? s.color : "rgba(26,26,46,0.75)", fontFamily: "var(--font-nunito)", textDecoration: t.done ? "none" : "none" }}>{t.title}</p>
                        </div>
                        <span className="text-xs flex-shrink-0" style={{ color: "rgba(26,26,46,0.35)", fontFamily: "var(--font-inter)" }}>{t.week}</span>
                        <button type="button" onClick={() => deleteTopic(s.id, t.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                          <Trash2 size={12} style={{ color: "#FF6B6B" }} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add topic */}
                  {showAddTopic === s.id ? (
                    <div className="flex gap-2 mb-3">
                      <input type="text" placeholder="Topic title" value={newTopicTitle}
                        onChange={e => setNewTopicTitle(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl text-xs"
                        style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.10)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }}
                      />
                      <input type="text" placeholder="Week" value={newTopicWeek}
                        onChange={e => setNewTopicWeek(e.target.value)}
                        className="w-24 px-3 py-2 rounded-xl text-xs"
                        style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.10)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }}
                      />
                      <button type="button" onClick={() => addTopic(s.id)}
                        className="px-3 py-2 rounded-xl text-xs font-bold"
                        style={{ background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}28`, fontFamily: "var(--font-nunito)" }}>Add</button>
                      <button type="button" onClick={() => setShowAddTopic(null)}
                        className="px-3 py-2 rounded-xl text-xs font-bold"
                        style={{ background: "rgba(26,26,46,0.05)", color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>Cancel</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setShowAddTopic(s.id)}
                      className="flex items-center gap-1.5 text-xs font-bold mb-3 px-3 py-2 rounded-xl transition-all"
                      style={{ color: s.color, background: `${s.color}10`, fontFamily: "var(--font-nunito)" }}>
                      <Plus size={12} /> Add Topic
                    </button>
                  )}

                  {/* Note */}
                  <p className="text-xs font-bold mb-1 uppercase tracking-wide" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>Note for Parents</p>
                  <textarea rows={2} placeholder="Add a note visible to parents about this subject…"
                    value={s.note}
                    onChange={e => updateNote(s.id, e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs mb-3 resize-none"
                    style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.75)" }}
                  />

                  {/* File upload */}
                  <div className="flex items-center gap-2">
                    <input ref={el => { fileRefs.current[s.id] = el; }} type="file" accept=".pdf,.doc,.docx" className="hidden"
                      onChange={e => handleFileChange(s.id, e)} />
                    <button type="button" onClick={() => fileRefs.current[s.id]?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                      style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}28`, fontFamily: "var(--font-nunito)" }}>
                      <Upload size={13} />
                      {s.fileUploaded ? "Replace PDF" : "Upload PDF Syllabus"}
                    </button>
                    {s.fileUploaded && (
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                        style={{ background: "rgba(107,203,119,0.08)", border: "1px solid rgba(107,203,119,0.20)" }}>
                        <FileText size={12} style={{ color: "#6BCB77" }} />
                        <span className="text-xs font-semibold truncate max-w-40" style={{ color: "#6BCB77", fontFamily: "var(--font-inter)" }}>{s.fileName}</span>
                        <CheckCircle size={12} style={{ color: "#6BCB77" }} />
                      </div>
                    )}
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

