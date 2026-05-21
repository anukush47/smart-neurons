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
  attendance: number;
  conduct: "Excellent" | "Very Good" | "Good" | "Satisfactory" | "Needs Improvement";
  teacherRemark: string;
  subjects: SubjectScore[];
  saved: boolean;
}

const CONDUCTS = ["Excellent", "Very Good", "Good", "Satisfactory", "Needs Improvement"] as const;

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

const INITIAL_REPORTS: StudentReport[] = [
  {
    id: "S1", name: "Aarav Sharma", roll: "JKG-A-01", attendance: 94, conduct: "Excellent", saved: true,
    teacherRemark: "Aarav is a bright and enthusiastic learner. Excels in art and language.",
    subjects: [
      { subject: "English",    marks: 48, max: 50, grade: "A+" },
      { subject: "Hindi",      marks: 44, max: 50, grade: "A"  },
      { subject: "Mathematics",marks: 46, max: 50, grade: "A+" },
      { subject: "EVS",        marks: 42, max: 50, grade: "A"  },
      { subject: "Art & Craft",marks: 50, max: 50, grade: "A+" },
    ],
  },
  {
    id: "S2", name: "Priya Gupta", roll: "JKG-A-02", attendance: 88, conduct: "Good", saved: true,
    teacherRemark: "Priya shows good progress. Needs more practice with Hindi vowels.",
    subjects: [
      { subject: "English",    marks: 40, max: 50, grade: "A" },
      { subject: "Hindi",      marks: 34, max: 50, grade: "B" },
      { subject: "Mathematics",marks: 38, max: 50, grade: "A" },
      { subject: "EVS",        marks: 36, max: 50, grade: "B" },
      { subject: "Art & Craft",marks: 44, max: 50, grade: "A" },
    ],
  },
  {
    id: "S3", name: "Manav Joshi", roll: "JKG-A-03", attendance: 80, conduct: "Good", saved: false,
    teacherRemark: "",
    subjects: [
      { subject: "English",    marks: "", max: 50, grade: "" },
      { subject: "Hindi",      marks: "", max: 50, grade: "" },
      { subject: "Mathematics",marks: "", max: 50, grade: "" },
      { subject: "EVS",        marks: "", max: 50, grade: "" },
      { subject: "Art & Craft",marks: "", max: 50, grade: "" },
    ],
  },
  {
    id: "S4", name: "Sneha Kapoor", roll: "JKG-A-04", attendance: 92, conduct: "Very Good", saved: false,
    teacherRemark: "",
    subjects: [
      { subject: "English",    marks: "", max: 50, grade: "" },
      { subject: "Hindi",      marks: "", max: 50, grade: "" },
      { subject: "Mathematics",marks: "", max: 50, grade: "" },
      { subject: "EVS",        marks: "", max: 50, grade: "" },
      { subject: "Art & Craft",marks: "", max: 50, grade: "" },
    ],
  },
  {
    id: "S5", name: "Arjun Verma", roll: "JKG-A-05", attendance: 85, conduct: "Satisfactory", saved: false,
    teacherRemark: "",
    subjects: [
      { subject: "English",    marks: "", max: 50, grade: "" },
      { subject: "Hindi",      marks: "", max: 50, grade: "" },
      { subject: "Mathematics",marks: "", max: 50, grade: "" },
      { subject: "EVS",        marks: "", max: 50, grade: "" },
      { subject: "Art & Craft",marks: "", max: 50, grade: "" },
    ],
  },
];

export default function FacultyProgressPage() {
  const [user, setUser] = useState("");
  const [reports, setReports] = useState<StudentReport[]>(INITIAL_REPORTS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [term, setTerm] = useState<"Term 1" | "Term 2">("Term 1");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUser(user.user_metadata?.name || "Faculty");
    });
  }, []);

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

  function saveReport(studentId: string) {
    setReports(prev => prev.map(r => r.id === studentId ? { ...r, saved: true } : r));
  }

  const savedCount = reports.filter(r => r.saved).length;

  return (
    <ERPShell role="faculty" userName={user}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Progress Reports</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          JKG-A · Enter marks and remarks for each student
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
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: "#6BCB77" }} />
            <span className="text-xs" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
              {savedCount}/{reports.length} saved
            </span>
          </div>
          <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: "rgba(26,26,46,0.07)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${(savedCount / reports.length) * 100}%`, background: "#6BCB77" }} />
          </div>
        </div>
      </div>

      {/* Student report cards */}
      <div className="space-y-2">
        {reports.map(r => {
          const open = expanded === r.id;
          const filledSubjects = r.subjects.filter(s => s.marks !== "");
          const avgScore = filledSubjects.length
            ? Math.round(filledSubjects.reduce((a, s) => a + ((typeof s.marks === 'number' ? s.marks : 0) / s.max) * 100, 0) / filledSubjects.length)
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
                      {r.roll} · Attendance {r.attendance}%
                      {avgScore !== null && ` · Avg ${avgScore}%`}
                    </p>
                  </div>
                </div>
                {open ? <ChevronUp size={16} style={{ color: "rgba(26,26,46,0.40)" }} /> : <ChevronDown size={16} style={{ color: "rgba(26,26,46,0.40)" }} />}
              </button>

              {open && (
                <div className="px-4 pb-4" style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
                  {/* Subject marks grid */}
                  <p className="text-xs font-bold mt-3 mb-2" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Marks (out of 50)</p>
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

                  {/* Conduct */}
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

                  {/* Remark */}
                  <p className="text-xs font-bold mb-2" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Teacher's Remark</p>
                  <textarea rows={2} placeholder="Write a remark for this student…"
                    value={r.teacherRemark}
                    onChange={e => updateRemark(r.id, e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm mb-3 resize-none"
                    style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }}
                  />

                  <button type="button" onClick={() => saveReport(r.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
                    style={{ background: "linear-gradient(135deg,#6BCB77,#4CAF50)", color: "white", boxShadow: "0 3px 10px rgba(107,203,119,0.30)", fontFamily: "var(--font-nunito)" }}>
                    <Save size={14} />
                    Save Report
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ERPShell>
  );
}
