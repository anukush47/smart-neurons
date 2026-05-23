"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { Download, Award, TrendingUp, BookOpen } from "lucide-react";

interface SubjectScore {
  subject: string;
  marks: number | null;
  max: number;
  grade: string;
}

interface ReportData {
  subjects: SubjectScore[];
  conduct: string;
  teacher_remark: string;
  promoted: boolean;
}

interface ChildInfo {
  name: string;
  class: string;
  section: string;
  roll_no: string;
}

const GRADE_COLOR: Record<string, string> = {
  "A+": "#6BCB77", A: "#6BCB77", B: "#d97706", C: "#FF6B6B", D: "#FF6B6B",
};
const GRADE_LABEL: Record<string, string> = {
  "A+": "Outstanding", A: "Excellent", B: "Good", C: "Satisfactory", D: "Needs Improvement",
};

function avg(subjects: SubjectScore[]) {
  const valid = subjects.filter(s => s.grade && s.marks !== null);
  if (!valid.length) return 0;
  return Math.round(valid.reduce((a, s) => a + ((s.marks as number) / s.max) * 100, 0) / valid.length);
}

function pct(s: SubjectScore) {
  if (s.marks === null) return 0;
  return Math.round((s.marks / s.max) * 100);
}

function performanceLabel(score: number) {
  if (score >= 90) return "Outstanding Performance";
  if (score >= 75) return "Excellent Performance";
  if (score >= 60) return "Good Performance";
  if (score >= 45) return "Satisfactory Performance";
  return "Needs Improvement";
}

export default function ParentReportsPage() {
  const [userName, setUserName] = useState("");
  const [child, setChild] = useState<ChildInfo | null>(null);
  const [term, setTerm] = useState<"Term 1" | "Term 2">("Term 1");
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserName(user.app_metadata?.name || user.user_metadata?.name || "Parent");
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    setReport(null);
    fetch(`/api/reports/my-child?term=${encodeURIComponent(term)}`)
      .then(r => r.json())
      .then(data => {
        if (data.student) {
          setChild({
            name: data.student.name,
            class: data.student.class,
            section: data.student.section,
            roll_no: data.student.roll_no,
          });
        }
        if (data.reports?.length) {
          setReport(data.reports[0] as ReportData);
        }
      })
      .finally(() => setLoading(false));
  }, [term]);

  const score = report ? avg(report.subjects) : 0;
  const childLabel = child
    ? `${child.name} · ${child.class}-${child.section} · Roll No. ${child.roll_no}`
    : "Loading…";

  function handleDownload() {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  }

  return (
    <ERPShell role="parent" userName={userName}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Progress Report</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          {childLabel}
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

      {loading ? (
        <div className="glass-card p-10 text-center">
          <p className="text-sm" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>Loading report…</p>
        </div>
      ) : !report ? (
        <div className="glass-card p-10 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
            style={{ background: "rgba(26,26,46,0.06)" }}>📋</div>
          <p className="text-sm font-semibold text-navy mb-1" style={{ fontFamily: "var(--font-nunito)" }}>Not yet published</p>
          <p className="text-xs" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>
            {term} report will be available after the class teacher submits it.
          </p>
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
                <p className="text-lg font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>{term} · 2025–26</p>
                <p className="text-sm font-semibold mt-0.5" style={{ color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
                  {performanceLabel(score)}
                </p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {report.conduct && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: "rgba(107,203,119,0.10)", color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
                      Conduct: {report.conduct}
                    </span>
                  )}
                  {report.promoted && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: "rgba(124,58,237,0.08)", color: "#7c3aed", fontFamily: "var(--font-nunito)" }}>
                      Promoted ✓
                    </span>
                  )}
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
              {report.subjects.map(s => (
                <div key={s.subject}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{s.subject}</span>
                      {s.grade && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${GRADE_COLOR[s.grade] ?? "#d97706"}18`, color: GRADE_COLOR[s.grade] ?? "#d97706", fontFamily: "var(--font-nunito)" }}>
                          {s.grade}
                        </span>
                      )}
                    </div>
                    {s.marks !== null && (
                      <div className="text-right">
                        <span className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{s.marks}/{s.max}</span>
                        <span className="text-xs ml-1" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>({pct(s)}%)</span>
                      </div>
                    )}
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(26,26,46,0.07)" }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct(s)}%`, background: GRADE_COLOR[s.grade] ?? "#d97706" }} />
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
          {report.teacher_remark && (
            <div className="glass-card p-5" style={{ border: "1.5px solid rgba(217,119,6,0.18)" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(107,203,119,0.12)" }}>👩‍🏫</div>
                <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Class Teacher's Remark</p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(26,26,46,0.70)", fontFamily: "var(--font-inter)", fontStyle: "italic" }}>
                "{report.teacher_remark}"
              </p>
            </div>
          )}

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Subjects",    value: report.subjects.length,                                          icon: <BookOpen size={16} />,  color: "#7c3aed" },
              { label: "A+ Grades",   value: report.subjects.filter(s => s.grade === "A+").length,            icon: <Award size={16} />,     color: "#d97706" },
              { label: "Class Avg",   value: `${score}%`,                                                     icon: <TrendingUp size={16} />, color: "#6BCB77" },
            ].map(card => (
              <div key={card.label} className="glass-card p-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2"
                  style={{ background: `${card.color}18`, color: card.color }}>{card.icon}</div>
                <p className="text-lg font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{card.value}</p>
                <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{card.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </ERPShell>
  );
}
