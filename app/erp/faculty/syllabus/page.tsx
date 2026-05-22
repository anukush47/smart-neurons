"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { ChevronDown, ChevronUp, Upload, CheckCircle, Plus, Trash2, FileText, BookOpen } from "lucide-react";

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

export default function FacultySyllabusPage() {
  const [userName, setUserName] = useState("");
  const [classLabel, setClassLabel] = useState("");
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [term, setTerm] = useState<"Term 1" | "Term 2">("Term 1");
  const [showAddTopic, setShowAddTopic] = useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicWeek, setNewTopicWeek] = useState("");
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const loadSyllabus = useCallback(async (t: string) => {
    const res = await fetch(`/api/syllabus?term=${encodeURIComponent(t)}`);
    const data = await res.json();
    if (data.syllabus) {
      setSyllabi(data.syllabus as Syllabus[]);
      if ((data.syllabus as Syllabus[]).length > 0) setExpanded((data.syllabus as Syllabus[])[0].id);
    }
  }, []);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserName(user.app_metadata?.name || user.user_metadata?.name || "Faculty");
      setClassLabel((user.app_metadata?.class_assigned || "").replace("-", " "));
    });
    loadSyllabus("Term 1");
  }, [loadSyllabus]);

  async function patchSyllabus(id: string, payload: Record<string, unknown>) {
    const res = await fetch(`/api/syllabus/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  }

  async function toggleTopic(syllabusId: string, topicId: string) {
    const syl = syllabi.find(s => s.id === syllabusId);
    if (!syl) return;
    const newTopics = syl.topics.map(t => t.id === topicId ? { ...t, done: !t.done } : t);
    setSyllabi(prev => prev.map(s => s.id !== syllabusId ? s : { ...s, topics: newTopics }));
    await patchSyllabus(syllabusId, { topics: newTopics });
  }

  async function addTopic(syllabusId: string) {
    if (!newTopicTitle.trim()) return;
    const syl = syllabi.find(s => s.id === syllabusId);
    if (!syl) return;
    const topic: Topic = {
      id: `t-${Date.now()}`, title: newTopicTitle.trim(),
      week: newTopicWeek.trim() || "TBD", done: false,
    };
    const newTopics = [...syl.topics, topic];
    setSyllabi(prev => prev.map(s => s.id !== syllabusId ? s : { ...s, topics: newTopics }));
    setNewTopicTitle(""); setNewTopicWeek(""); setShowAddTopic(null);
    await patchSyllabus(syllabusId, { topics: newTopics });
  }

  async function deleteTopic(syllabusId: string, topicId: string) {
    const syl = syllabi.find(s => s.id === syllabusId);
    if (!syl) return;
    const newTopics = syl.topics.filter(t => t.id !== topicId);
    setSyllabi(prev => prev.map(s => s.id !== syllabusId ? s : { ...s, topics: newTopics }));
    await patchSyllabus(syllabusId, { topics: newTopics });
  }

  async function updateNote(syllabusId: string, note: string) {
    setSyllabi(prev => prev.map(s => s.id !== syllabusId ? s : { ...s, note }));
    await patchSyllabus(syllabusId, { note });
  }

  function handleFileChange(syllabusId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSyllabi(prev => prev.map(s => s.id !== syllabusId ? s : { ...s, file_uploaded: true, file_name: file.name }));
    patchSyllabus(syllabusId, { file_uploaded: true, file_name: file.name });
  }

  function handleTermChange(t: "Term 1" | "Term 2") {
    setTerm(t);
    loadSyllabus(t);
  }

  const filtered = syllabi.filter(s => s.term === term);

  return (
    <ERPShell role="faculty" userName={userName}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Syllabus Manager</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          {classLabel || "Your class"} · Track topics, add notes, and upload syllabi for parents
        </p>
      </div>

      <div className="flex gap-2 mb-5">
        {(["Term 1", "Term 2"] as const).map(t => (
          <button key={t} type="button" onClick={() => handleTermChange(t)}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: term === t ? "rgba(107,203,119,0.12)" : "rgba(26,26,46,0.05)",
              color: term === t ? "#6BCB77" : "rgba(26,26,46,0.50)",
              border: term === t ? "1.5px solid rgba(107,203,119,0.28)" : "1.5px solid transparent",
              fontFamily: "var(--font-nunito)",
            }}>{t}</button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-10 text-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "rgba(107,203,119,0.10)" }}>
            <BookOpen size={18} style={{ color: "#6BCB77" }} />
          </div>
          <p className="text-sm text-navy font-semibold" style={{ fontFamily: "var(--font-nunito)" }}>No syllabus for {term} yet</p>
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
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden max-w-32" style={{ background: "rgba(26,26,46,0.08)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                    <span className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
                      {doneCount}/{s.topics.length} covered
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
                          <p className="text-xs font-semibold" style={{ color: t.done ? s.color : "rgba(26,26,46,0.75)", fontFamily: "var(--font-nunito)" }}>{t.title}</p>
                        </div>
                        <span className="text-xs flex-shrink-0" style={{ color: "rgba(26,26,46,0.35)", fontFamily: "var(--font-inter)" }}>{t.week}</span>
                        <button type="button" onClick={() => deleteTopic(s.id, t.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                          <Trash2 size={12} style={{ color: "#FF6B6B" }} />
                        </button>
                      </div>
                    ))}
                  </div>

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
                      className="flex items-center gap-1.5 text-xs font-bold mb-3 px-3 py-2 rounded-xl"
                      style={{ color: s.color, background: `${s.color}10`, fontFamily: "var(--font-nunito)" }}>
                      <Plus size={12} /> Add Topic
                    </button>
                  )}

                  <p className="text-xs font-bold mb-1 uppercase tracking-wide" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>Note for Parents</p>
                  <textarea rows={2} placeholder="Add a note visible to parents…"
                    value={s.note}
                    onChange={e => updateNote(s.id, e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs mb-3 resize-none"
                    style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.75)" }}
                  />

                  <div className="flex items-center gap-2">
                    <input ref={el => { fileRefs.current[s.id] = el; }} type="file" accept=".pdf,.doc,.docx" className="hidden"
                      onChange={e => handleFileChange(s.id, e)} />
                    <button type="button" onClick={() => fileRefs.current[s.id]?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                      style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}28`, fontFamily: "var(--font-nunito)" }}>
                      <Upload size={13} />
                      {s.file_uploaded ? "Replace PDF" : "Upload PDF Syllabus"}
                    </button>
                    {s.file_uploaded && (
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                        style={{ background: "rgba(107,203,119,0.08)", border: "1px solid rgba(107,203,119,0.20)" }}>
                        <FileText size={12} style={{ color: "#6BCB77" }} />
                        <span className="text-xs font-semibold truncate max-w-40" style={{ color: "#6BCB77", fontFamily: "var(--font-inter)" }}>{s.file_name}</span>
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
