"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ERPShell from "@/components/erp/ERPShell";
import { Download, Award, TrendingUp, BookOpen, Star } from "lucide-react";

interface SubjectScore {
  subject: string;
  marks: number;
  max: number;
  grade: string;
}

const GRADE_COLOR: Record<string, string> = {
  "A+": "#6BCB77", A: "#6BCB77", B: "#d97706", C: "#FF6B6B", D: "#FF6B6B",
};
const GRADE_LABEL: Record<string, string> = {
  "A+": "Outstanding", A: "Excellent", B: "Good", C: "Satisfactory", D: "Needs Improvement",
};

const TERM1: SubjectScore[] = [
  { subject: "English",     marks: 48, max: 50, grade: "A+" },
  { subject: "Hindi",       marks: 44, max: 50, grade: "A"  },
  { subject: "Mathematics", marks: 46, max: 50, grade: "A+" },
  { subject: "EVS",         marks: 42, max: 50, grade: "A"  },
  { subject: "Art & Craft", marks: 50, max: 50, grade: "A+" },
];

const TERM2: SubjectScore[] = [
  { subject: "English",     marks: 0, max: 50, grade: "" },
  { subject: "Hindi",       marks: 0, max: 50, grade: "" },
  { subject: "Mathematics", marks: 0, max: 50, grade: "" },
  { subject: "EVS",         marks: 0, max: 50, grade: "" },
  { subject: "Art & Craft", marks: 0, max: 50, grade: "" },
];

function avg(subjects: SubjectScore[]) {
  const valid = subjects.filter(s => s.grade);
  if (!valid.length) return 0;
  return Math.round(valid.reduce((a, s) => a + (s.marks / s.max) * 100, 0) / valid.length);
}

function pct(s: SubjectScore) { return Math.round((s.marks / s.max) * 100); }

const ACHIEVEMENTS = [
  { label: "Perfect Score", desc: "100% in Art & Craft", icon: "🎨", color: "#d97706", bg: "rgba(217,119,6,0.10)" },
  { label: "Top 3 in Class", desc: "Term 1 overall rank", icon: "🏆", color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
  { label: "Star Student", desc: "Excellent conduct", icon: "⭐", color: "#7c3aed", bg: "rgba(124,58,237,0.10)" },
];

export default function ParentReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [term, setTerm] = useState<"Term 1" | "Term 2">("Term 1");
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const role = sessionStorage.getItem("erp_role");
    const u = sessionStorage.getItem("erp_user");
    if (role !== "parent") { router.replace("/erp/login"); return; }
    setUser(u || "+91 XXXXX XXXXX");
  }, []);

  const subjects = term === "Term 1" ? TERM1 : TERM2;
  const score = avg(subjects);
  const published = term === "Term 1";

  function handleDownload() {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  }

  return (
    <ERPShell role="parent" userName={user}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Progress Report</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          Aarav Sharma · JKG-A · Roll No. JKG-A-01
        </p>
      </div>

      {/* Term selector */}
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

      {!published ? (
        <div className="glass-card p-10 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
            style={{ background: "rgba(26,26,46,0.06)" }}>📋</div>
          <p className="text-sm font-semibold text-navy mb-1" style={{ fontFamily: "var(--font-nunito)" }}>Not yet published</p>
          <p className="text-xs" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>Term 2 report will be available after the exams.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Score card */}
          <div className="glass-card p-5"
            style={{ border: "1.5px solid rgba(107,203,119,0.25)", background: "linear-gradient(135deg, rgba(107,203,119,0.04), rgba(255,255,255,0.70))" }}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#6BCB77,#4CAF50)", boxShadow: "0 6px 20px rgba(107,203,119,0.35)" }}>
                <p className="text-2xl font-bold text-white leading-none" style={{ fontFamily: "var(--font-nunito)" }}>{score}%</p>
                <p className="text-xs text-white mt-0.5 opacity-80" style={{ fontFamily: "var(--font-inter)" }}>Average</p>
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Term 1 · 2025–26</p>
                <p className="text-sm font-semibold mt-0.5" style={{ color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>Outstanding Performance</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "rgba(26,26,46,0.07)", color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>
                    Attendance: 94%
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "rgba(107,203,119,0.10)", color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
                    Conduct: Excellent
                  </span>
                </div>
              </div>
              <button type="button" onClick={handleDownload}
                className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl flex-shrink-0 transition-all hover:scale-105"
                style={{ background: downloaded ? "rgba(107,203,119,0.15)" : "rgba(26,26,46,0.07)", border: "1px solid rgba(26,26,46,0.08)" }}>
                <Download size={16} style={{ color: downloaded ? "#6BCB77" : "rgba(26,26,46,0.55)" }} />
                <span className="text-xs font-semibold" style={{ color: downloaded ? "#6BCB77" : "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>
                  {downloaded ? "Saved!" : "PDF"}
                </span>
              </button>
            </div>
          </div>

          {/* Subject breakdown */}
          <div className="glass-card p-5">
            <p className="text-sm font-bold text-navy mb-4" style={{ fontFamily: "var(--font-nunito)" }}>Subject-wise Marks</p>
            <div className="space-y-3">
              {subjects.map(s => (
                <div key={s.subject}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{s.subject}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${GRADE_COLOR[s.grade]}18`, color: GRADE_COLOR[s.grade], fontFamily: "var(--font-nunito)" }}>
                        {s.grade}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{s.marks}/{s.max}</span>
                      <span className="text-xs ml-1" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>({pct(s)}%)</span>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(26,26,46,0.07)" }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct(s)}%`, background: GRADE_COLOR[s.grade] }} />
                  </div>
                  {s.grade && GRADE_LABEL[s.grade] && (
                    <p className="text-xs mt-0.5" style={{ color: GRADE_COLOR[s.grade], fontFamily: "var(--font-inter)" }}>
                      {GRADE_LABEL[s.grade]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Teacher's remark */}
          <div className="glass-card p-5" style={{ border: "1.5px solid rgba(217,119,6,0.18)" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(107,203,119,0.12)" }}>👩‍🏫</div>
              <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Ms. Priya Sharma</p>
              <span className="text-xs" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>Class Teacher · JKG-A</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(26,26,46,0.70)", fontFamily: "var(--font-inter)", fontStyle: "italic" }}>
              "Aarav is a bright and enthusiastic learner. He excels in art and language activities, and his curiosity in the classroom is truly commendable. Keep it up, Aarav!"
            </p>
          </div>

          {/* Achievements */}
          <div className="glass-card p-5">
            <p className="text-sm font-bold text-navy mb-3" style={{ fontFamily: "var(--font-nunito)" }}>Achievements this Term</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {ACHIEVEMENTS.map(a => (
                <div key={a.label} className="rounded-xl p-3 flex items-center gap-3"
                  style={{ background: a.bg, border: `1px solid ${a.color}28` }}>
                  <span className="text-2xl flex-shrink-0">{a.icon}</span>
                  <div>
                    <p className="text-xs font-bold" style={{ color: a.color, fontFamily: "var(--font-nunito)" }}>{a.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ERPShell>
  );
}
