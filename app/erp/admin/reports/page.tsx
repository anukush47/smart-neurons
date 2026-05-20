"use client";

import { useState, useMemo } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ERPShell from "@/components/erp/ERPShell";
import { ChevronDown, ChevronUp, TrendingUp, Users, Award, BookOpen } from "lucide-react";

interface SubjectScore {
  subject: string;
  marks: number;
  max: number;
  grade: string;
}

interface StudentReport {
  id: string;
  name: string;
  roll: string;
  class: string;
  section: string;
  term: "Term 1" | "Term 2";
  subjects: SubjectScore[];
  attendance: number;
  conduct: string;
  teacherRemark: string;
  promoted: boolean;
}

const GRADE_COLOR: Record<string, string> = {
  "A+": "#6BCB77", A: "#6BCB77", B: "#d97706", C: "#FF6B6B", D: "#FF6B6B",
};

const REPORTS: StudentReport[] = [
  {
    id: "R1", name: "Aarav Sharma", roll: "JKG-A-01", class: "JKG", section: "A", term: "Term 1",
    attendance: 94, conduct: "Excellent", promoted: true,
    teacherRemark: "Aarav is a bright and enthusiastic learner. Excels in art and language.",
    subjects: [
      { subject: "English", marks: 48, max: 50, grade: "A+" },
      { subject: "Hindi", marks: 44, max: 50, grade: "A" },
      { subject: "Mathematics", marks: 46, max: 50, grade: "A+" },
      { subject: "EVS", marks: 42, max: 50, grade: "A" },
      { subject: "Art & Craft", marks: 50, max: 50, grade: "A+" },
    ],
  },
  {
    id: "R2", name: "Priya Gupta", roll: "JKG-A-02", class: "JKG", section: "A", term: "Term 1",
    attendance: 88, conduct: "Good", promoted: true,
    teacherRemark: "Priya shows good progress. Needs more practice with Hindi vowels.",
    subjects: [
      { subject: "English", marks: 40, max: 50, grade: "A" },
      { subject: "Hindi", marks: 34, max: 50, grade: "B" },
      { subject: "Mathematics", marks: 38, max: 50, grade: "A" },
      { subject: "EVS", marks: 36, max: 50, grade: "B" },
      { subject: "Art & Craft", marks: 44, max: 50, grade: "A" },
    ],
  },
  {
    id: "R3", name: "Rohan Singh", roll: "SKG-A-01", class: "SKG", section: "A", term: "Term 1",
    attendance: 96, conduct: "Excellent", promoted: true,
    teacherRemark: "Rohan is outstanding in all subjects. A natural leader in class.",
    subjects: [
      { subject: "English", marks: 49, max: 50, grade: "A+" },
      { subject: "Hindi", marks: 47, max: 50, grade: "A+" },
      { subject: "Mathematics", marks: 50, max: 50, grade: "A+" },
      { subject: "EVS", marks: 46, max: 50, grade: "A+" },
      { subject: "Art & Craft", marks: 48, max: 50, grade: "A+" },
      { subject: "GK", marks: 45, max: 50, grade: "A+" },
    ],
  },
  {
    id: "R4", name: "Ananya Patel", roll: "SKG-B-01", class: "SKG", section: "B", term: "Term 1",
    attendance: 78, conduct: "Satisfactory", promoted: true,
    teacherRemark: "Ananya needs more regularity. Good in art but should focus more on academics.",
    subjects: [
      { subject: "English", marks: 30, max: 50, grade: "C" },
      { subject: "Hindi", marks: 28, max: 50, grade: "C" },
      { subject: "Mathematics", marks: 32, max: 50, grade: "C" },
      { subject: "EVS", marks: 35, max: 50, grade: "B" },
      { subject: "Art & Craft", marks: 47, max: 50, grade: "A+" },
      { subject: "GK", marks: 30, max: 50, grade: "C" },
    ],
  },
  {
    id: "R5", name: "Kavya Iyer", roll: "NUR-A-01", class: "Nursery", section: "A", term: "Term 1",
    attendance: 91, conduct: "Very Good", promoted: true,
    teacherRemark: "Kavya is a quick learner with good communication skills.",
    subjects: [
      { subject: "English", marks: 43, max: 50, grade: "A" },
      { subject: "Hindi", marks: 41, max: 50, grade: "A" },
      { subject: "Mathematics", marks: 39, max: 50, grade: "A" },
      { subject: "Art & Craft", marks: 46, max: 50, grade: "A+" },
    ],
  },
  {
    id: "R6", name: "Dev Mehta", roll: "PG-A-01", class: "Playgroup", section: "A", term: "Term 1",
    attendance: 85, conduct: "Good", promoted: true,
    teacherRemark: "Dev is adapting well to school. Shows great curiosity and enthusiasm.",
    subjects: [
      { subject: "English", marks: 38, max: 50, grade: "A" },
      { subject: "Hindi", marks: 36, max: 50, grade: "B" },
      { subject: "Art & Craft", marks: 45, max: 50, grade: "A+" },
    ],
  },
];

function pct(s: SubjectScore) { return Math.round((s.marks / s.max) * 100); }
function avg(subjects: SubjectScore[]) {
  return Math.round(subjects.reduce((a, s) => a + pct(s), 0) / subjects.length);
}
function avgColor(a: number) {
  if (a >= 85) return "#6BCB77";
  if (a >= 65) return "#d97706";
  return "#FF6B6B";
}

const CLASSES = ["All", "Playgroup", "Nursery", "JKG", "SKG"];
const TERMS = ["All", "Term 1", "Term 2"];

export default function AdminReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [termFilter, setTermFilter] = useState("Term 1");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const role = sessionStorage.getItem("erp_role");
    const u = sessionStorage.getItem("erp_user");
    if (role !== "admin") { router.replace("/erp/login"); return; }
    setUser(u || "Admin");
  }, []);

  const filtered = useMemo(() => REPORTS.filter(r => {
    if (classFilter !== "All" && r.class !== classFilter) return false;
    if (termFilter !== "All" && r.term !== termFilter) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.roll.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [classFilter, termFilter, search]);

  const overallAvg = Math.round(REPORTS.reduce((a, r) => a + avg(r.subjects), 0) / REPORTS.length);
  const topStudents = [...REPORTS].sort((a, b) => avg(b.subjects) - avg(a.subjects)).slice(0, 3);
  const classAvgs = CLASSES.slice(1).map(c => {
    const cls = REPORTS.filter(r => r.class === c);
    return { class: c, avg: cls.length ? Math.round(cls.reduce((a, r) => a + avg(r.subjects), 0) / cls.length) : 0, count: cls.length };
  });

  return (
    <ERPShell role="admin" userName={user}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Progress Reports</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          School-wide academic performance overview
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Students Assessed", value: REPORTS.length, icon: <Users size={18} />, color: "#FF6B6B" },
          { label: "School Average", value: `${overallAvg}%`, icon: <TrendingUp size={18} />, color: "#6BCB77" },
          { label: "A+ Grades", value: REPORTS.flatMap(r => r.subjects).filter(s => s.grade === "A+").length, icon: <Award size={18} />, color: "#d97706" },
          { label: "Subjects Tracked", value: new Set(REPORTS.flatMap(r => r.subjects.map(s => s.subject))).size, icon: <BookOpen size={18} />, color: "#7c3aed" },
        ].map(card => (
          <div key={card.label} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${card.color}18`, color: card.color }}>{card.icon}</div>
            </div>
            <p className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{card.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Class averages */}
        <div className="glass-card p-5 lg:col-span-2">
          <p className="text-sm font-bold text-navy mb-4" style={{ fontFamily: "var(--font-nunito)" }}>Class-wise Average Score</p>
          <div className="space-y-3">
            {classAvgs.map(c => (
              <div key={c.class}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{c.class}</span>
                  <span className="text-xs font-bold" style={{ color: avgColor(c.avg), fontFamily: "var(--font-nunito)" }}>{c.avg}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(26,26,46,0.07)" }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${c.avg}%`, background: avgColor(c.avg) }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top performers */}
        <div className="glass-card p-5">
          <p className="text-sm font-bold text-navy mb-4" style={{ fontFamily: "var(--font-nunito)" }}>Top Performers</p>
          <div className="space-y-3">
            {topStudents.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: i === 0 ? "rgba(217,119,6,0.15)" : "rgba(26,26,46,0.07)", color: i === 0 ? "#d97706" : "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-navy truncate" style={{ fontFamily: "var(--font-nunito)" }}>{s.name}</p>
                  <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{s.class}-{s.section}</p>
                </div>
                <span className="text-xs font-bold flex-shrink-0" style={{ color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>{avg(s.subjects)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input type="text" placeholder="Search student…" value={search} onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm flex-1 min-w-40"
          style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }} />
        <div className="flex gap-1 flex-wrap">
          {CLASSES.map(c => (
            <button key={c} type="button" onClick={() => setClassFilter(c)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: classFilter === c ? "rgba(255,107,107,0.12)" : "rgba(26,26,46,0.05)",
                color: classFilter === c ? "#FF6B6B" : "rgba(26,26,46,0.50)",
                border: classFilter === c ? "1px solid rgba(255,107,107,0.25)" : "1px solid transparent",
                fontFamily: "var(--font-nunito)",
              }}>{c}</button>
          ))}
        </div>
        <div className="flex gap-1">
          {TERMS.map(t => (
            <button key={t} type="button" onClick={() => setTermFilter(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: termFilter === t ? "rgba(124,58,237,0.10)" : "rgba(26,26,46,0.05)",
                color: termFilter === t ? "#7c3aed" : "rgba(26,26,46,0.50)",
                border: termFilter === t ? "1px solid rgba(124,58,237,0.22)" : "1px solid transparent",
                fontFamily: "var(--font-nunito)",
              }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Report cards */}
      <div className="space-y-2">
        {filtered.map(r => {
          const a = avg(r.subjects);
          const open = expanded === r.id;
          return (
            <div key={r.id} className="glass-card overflow-hidden">
              <button type="button" onClick={() => setExpanded(open ? null : r.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: `${avgColor(a)}18`, color: avgColor(a), fontFamily: "var(--font-nunito)" }}>
                  {a}%
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{r.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(26,26,46,0.07)", color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
                      {r.roll}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(124,58,237,0.08)", color: "#7c3aed", fontFamily: "var(--font-nunito)" }}>
                      {r.term}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
                    Attendance {r.attendance}% · Conduct: {r.conduct}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {open ? <ChevronUp size={16} style={{ color: "rgba(26,26,46,0.40)" }} /> : <ChevronDown size={16} style={{ color: "rgba(26,26,46,0.40)" }} />}
                </div>
              </button>

              {open && (
                <div className="px-4 pb-4" style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
                  <div className="pt-3 space-y-2 mb-3">
                    {r.subjects.map(s => (
                      <div key={s.subject} className="flex items-center gap-3">
                        <p className="text-xs w-28 flex-shrink-0" style={{ color: "rgba(26,26,46,0.65)", fontFamily: "var(--font-inter)" }}>{s.subject}</p>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(26,26,46,0.07)" }}>
                          <div className="h-full rounded-full" style={{ width: `${pct(s)}%`, background: GRADE_COLOR[s.grade] || "#d97706" }} />
                        </div>
                        <span className="text-xs w-10 text-right font-semibold" style={{ color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-inter)" }}>{s.marks}/{s.max}</span>
                        <span className="text-xs font-bold w-8 text-center px-1 py-0.5 rounded-md"
                          style={{ background: `${GRADE_COLOR[s.grade] || "#d97706"}18`, color: GRADE_COLOR[s.grade] || "#d97706", fontFamily: "var(--font-nunito)" }}>
                          {s.grade}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl p-3 mt-2" style={{ background: "rgba(107,203,119,0.07)", border: "1px solid rgba(107,203,119,0.18)" }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>Teacher's Remark</p>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(26,26,46,0.70)", fontFamily: "var(--font-inter)" }}>{r.teacherRemark}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="glass-card p-10 text-center">
            <p className="text-sm" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>No reports match your filters.</p>
          </div>
        )}
      </div>
    </ERPShell>
  );
}
