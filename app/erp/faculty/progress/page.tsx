"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { ChevronDown, ChevronUp, Save, CheckCircle } from "lucide-react";

interface SubjectScore {
  subject: string;
  marks: number | "";
  max: number;
  grade: string;
}

interface StudentReport {
  id: string;
  name: string;
  roll: string;
  conduct: "Excellent" | "Very Good" | "Good" | "Satisfactory" | "Needs Improvement";
  teacherRemark: string;
  subjects: SubjectScore[];
  saved: boolean;
  saving: boolean;
  saveError: string | null;
}

interface DbStudent { id: string; name: string; roll_no: string; class: string; section: string; }

const CONDUCTS = ["Excellent", "Very Good", "Good", "Satisfactory", "Needs Improvement"] as const;

const CLASS_SUBJECTS: Record<string, string[]> = {
  Nursery: ["English", "Hindi", "Mathematics", "Art & Craft"],
  LKG:     ["English", "Hindi", "Mathematics", "EVS", "Art & Craft"],
  UKG:     ["English", "Hindi", "Mathematics", "EVS", "Art & Craft", "GK"],
  JKG:     ["English", "Hindi", "Mathematics", "EVS", "Art & Craft", "GK"],
  SKG:     ["English", "Hindi", "Mathematics", "EVS", "Art & Craft", "GK"],
};

function blankSubjects(cls: string): SubjectScore[] {
  const list = CLASS_SUBJECTS[cls] ?? CLASS_SUBJECTS["JKG"];
  return list.map(s => ({ subject: s, marks: "", max: 50, grade: "" }));
}

function calcGrade(marks: number, max: number): string {
  const p = (marks / max) * 100;
  if (p >= 90) return "A+";
  if (p >= 75) return "A";
  if (p >= 60) return "B";
  if (p >= 45) return "C";
  return "D";
}

const GRADE_COLOR: Record<string, string> = {
  "A+": "#6BCB77", A: "#6BCB77", B: "#d97706", C: "#FF6B6B", D: "#FF6B6B",
};

function buildReports(students: DbStudent[], saved: Record<string, any>, cls: string): StudentReport[] {
  return students.map(s => {
    const r = saved[s.id];
    const subjects: SubjectScore[] = r?.subjects?.length
      ? r.subjects.map((sub: any) => ({
          subject: sub.subject,
          marks: sub.marks === null ? "" : sub.marks,
          max: sub.max ?? 50,
          grade: sub.grade ?? "",
        }))
      : blankSubjects(cls);
    return {
      id: s.id,
      name: s.name,
      roll: s.roll_no,
      conduct: r?.conduct ?? "Good",
      teacherRemark: r?.teacher_remark ?? "",
      subjects,
      saved: !!r,
      saving: false,
      saveError: null,
    };
  });
}

export default function FacultyProgressPage() {
  const [userName, setUserName] = useState("");
  const [classAssigned, setClassAssigned] = useState("");
  const [classLabel, setClassLabel] = useState("");

  const [students, setStudents] = useState<DbStudent[]>([]);
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [term, setTerm] = useState<"Term 1" | "Term 2">("Term 1");

  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Load auth + students once
  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserName(user.app_metadata?.name || user.user_metadata?.name || "Faculty");
      const ca: string = user.app_metadata?.class_assigned ?? "";
      setClassAssigned(ca);
      setClassLabel(ca.replace("-", " "));
      if (!ca) { setLoading(false); return; }

      const res = await fetch(`/api/students?class=${encodeURIComponent(ca)}`);
      const data = await res.json();
      if (data.students) setStudents(data.students as DbStudent[]);
      setLoading(false);
    });
  }, []);

  // Reload saved reports whenever term or students change
  useEffect(() => {
    if (!classAssigned || students.length === 0) return;
    setReportsLoading(true);
    const cls = classAssigned.split("-")[0] ?? classAssigned;
    fetch(`/api/reports?class=${encodeURIComponent(classAssigned)}&term=${encodeURIComponent(term)}`)
      .then(r => r.json())
      .then(data => {
        const savedMap: Record<string, any> = {};
        for (const r of data.reports ?? []) savedMap[r.student_id] = r;
        setReports(buildReports(students, savedMap, cls));
      })
      .finally(() => setReportsLoading(false));
  }, [term, classAssigned, students.length]);

  function updateMarks(studentId: string, subjectIdx: number, value: string) {
    const num: number | "" = value === "" ? "" : Math.min(Number(value), 50);
    setReports(prev => prev.map(r => {
      if (r.id !== studentId) return r;
      const subjects = r.subjects.map((s, i) => {
        if (i !== subjectIdx) return s;
        const grade = num !== "" ? calcGrade(num as number, s.max) : "";
        return { ...s, marks: num, grade };
      });
      return { ...r, subjects, saved: false };
    }));
  }

  function updateConduct(studentId: string, conduct: typeof CONDUCTS[number]) {
    setReports(prev => prev.map(r => r.id === studentId ? { ...r, conduct, saved: false } : r));
  }

  function updateRemark(studentId: string, remark: string) {
    setReports(prev => prev.map(r => r.id === studentId ? { ...r, teacherRemark: remark, saved: false } : r));
  }

  async function saveReport(studentId: string) {
    const report = reports.find(r => r.id === studentId);
    if (!report) return;

    setReports(prev => prev.map(r => r.id === studentId ? { ...r, saving: true, saveError: null } : r));
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          term,
          subjects: report.subjects.map(s => ({
            subject: s.subject,
            marks: s.marks === "" ? null : s.marks,
            max: s.max,
            grade: s.grade,
          })),
          conduct: report.conduct,
          teacher_remark: report.teacherRemark,
          promoted: true,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setReports(prev => prev.map(r => r.id === studentId ? { ...r, saving: false, saveError: err.error || "Save failed" } : r));
        return;
      }
      setReports(prev => prev.map(r => r.id === studentId ? { ...r, saving: false, saved: true } : r));
    } catch {
      setReports(prev => prev.map(r => r.id === studentId ? { ...r, saving: false, saveError: "Network error" } : r));
    }
  }

  const savedCount = reports.filter(r => r.saved).length;

  return (
    <ERPShell role="faculty" userName={userName}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Progress Reports</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          {classLabel ? `${classLabel} · ` : ""}Enter marks and remarks for each student
        </p>
      </div>

      {/* Term selector + progress */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex gap-1">
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
        {reports.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
              {savedCount}/{reports.length} saved
            </span>
            <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: "rgba(26,26,46,0.07)" }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${reports.length ? (savedCount / reports.length) * 100 : 0}%`, background: "#6BCB77" }} />
            </div>
          </div>
        )}
      </div>

      {loading || reportsLoading ? (
        <div className="glass-card p-10 text-center">
          <p className="text-sm" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
            {loading ? "Loading students…" : "Loading reports…"}
          </p>
        </div>
      ) : students.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>No class assigned</p>
          <p className="text-xs mt-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
            Contact admin to assign your class.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map(r => {
            const open = expanded === r.id;
            const filledSubjects = r.subjects.filter(s => s.marks !== "");
            const avgScore = filledSubjects.length
              ? Math.round(filledSubjects.reduce((a, s) => a + ((typeof s.marks === "number" ? s.marks : 0) / s.max) * 100, 0) / filledSubjects.length)
              : null;

            return (
              <div key={r.id} className="glass-card overflow-hidden">
                <button type="button" onClick={() => setExpanded(open ? null : r.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: r.saved ? "rgba(107,203,119,0.12)" : "rgba(26,26,46,0.07)", color: r.saved ? "#6BCB77" : "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>
                      {r.roll.split("-").pop()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{r.name}</p>
                        {r.saved && <CheckCircle size={13} style={{ color: "#6BCB77" }} />}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
                        {r.roll}{avgScore !== null ? ` · Avg ${avgScore}%` : ""}
                      </p>
                    </div>
                  </div>
                  {open ? <ChevronUp size={16} style={{ color: "rgba(26,26,46,0.40)" }} /> : <ChevronDown size={16} style={{ color: "rgba(26,26,46,0.40)" }} />}
                </button>

                {open && (
                  <div className="px-4 pb-4" style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
                    <p className="text-xs font-bold mt-3 mb-2" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Marks (out of 50)
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                      {r.subjects.map((s, i) => (
                        <div key={s.subject} className="rounded-xl p-3"
                          style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.07)" }}>
                          <p className="text-xs font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-nunito)" }}>{s.subject}</p>
                          <div className="flex items-center gap-2">
                            <input type="number" min={0} max={50} placeholder="—"
                              value={s.marks}
                              onChange={e => updateMarks(r.id, i, e.target.value)}
                              className="w-14 px-2 py-1.5 rounded-lg text-sm font-bold text-center"
                              style={{ background: "rgba(255,255,255,0.80)", border: "1px solid rgba(26,26,46,0.10)", outline: "none", fontFamily: "var(--font-nunito)", color: "rgba(26,26,46,0.80)" }}
                            />
                            {s.grade && (
                              <span className="text-xs font-bold px-2 py-1 rounded-lg"
                                style={{ background: `${GRADE_COLOR[s.grade]}18`, color: GRADE_COLOR[s.grade], fontFamily: "var(--font-nunito)" }}>
                                {s.grade}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs font-bold mb-2" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Conduct</p>
                    <div className="flex gap-1.5 flex-wrap mb-4">
                      {CONDUCTS.map(c => (
                        <button key={c} type="button" onClick={() => updateConduct(r.id, c)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{
                            background: r.conduct === c ? "rgba(107,203,119,0.12)" : "rgba(26,26,46,0.05)",
                            color: r.conduct === c ? "#6BCB77" : "rgba(26,26,46,0.50)",
                            border: r.conduct === c ? "1px solid rgba(107,203,119,0.28)" : "1px solid transparent",
                            fontFamily: "var(--font-nunito)",
                          }}>{c}</button>
                      ))}
                    </div>

                    <p className="text-xs font-bold mb-2" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Teacher's Remark</p>
                    <textarea rows={2} placeholder="Write a remark for this student…"
                      value={r.teacherRemark}
                      onChange={e => updateRemark(r.id, e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm mb-3 resize-none"
                      style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }}
                    />

                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => saveReport(r.id)} disabled={r.saving}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ background: "linear-gradient(135deg,#6BCB77,#4CAF50)", color: "white", boxShadow: "0 3px 10px rgba(107,203,119,0.30)", fontFamily: "var(--font-nunito)" }}>
                        <Save size={14} />
                        {r.saving ? "Saving…" : "Save Report"}
                      </button>
                      {r.saveError && (
                        <p className="text-xs" style={{ color: "#FF6B6B", fontFamily: "var(--font-inter)" }}>{r.saveError}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </ERPShell>
  );
}
