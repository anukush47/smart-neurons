"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import {
  Plus, BookOpen, CheckCircle, AlertCircle, Clock,
  ChevronDown, ChevronUp, X, Calendar, Users,
} from "lucide-react";

type HWStatus = "pending" | "submitted" | "reviewed";
type HWType = "Drawing" | "Activity" | "Oral" | "Written" | "Reading";

interface Submission {
  student: string;
  status: HWStatus;
  submittedOn?: string;
  remarks?: string;
}

interface Homework {
  id: number;
  subject: string;
  title: string;
  description: string;
  class: string;
  dueDate: string;
  type: HWType;
  assigned: string;
  submissions: Submission[];
}

const TYPE_STYLE: Record<HWType, { bg: string; color: string }> = {
  Drawing:  { bg: "rgba(124,58,237,0.10)", color: "#7c3aed" },
  Activity: { bg: "rgba(255,217,61,0.15)", color: "#d97706" },
  Oral:     { bg: "rgba(107,203,119,0.12)", color: "#6BCB77" },
  Written:  { bg: "rgba(255,107,107,0.10)", color: "#FF6B6B" },
  Reading:  { bg: "rgba(26,26,46,0.06)",    color: "rgba(26,26,46,0.55)" },
};

const SUB_STYLE: Record<HWStatus, { label: string; bg: string; color: string }> = {
  pending:   { label: "Pending",   bg: "rgba(255,107,107,0.10)", color: "#FF6B6B" },
  submitted: { label: "Submitted", bg: "rgba(255,217,61,0.15)",  color: "#d97706" },
  reviewed:  { label: "Reviewed",  bg: "rgba(107,203,119,0.12)", color: "#6BCB77" },
};

const INITIAL_HW: Homework[] = [
  {
    id: 1,
    subject: "English",
    title: "Draw your favourite animal",
    description: "Children should draw their favourite animal using crayons and label it.",
    class: "JKG-A",
    dueDate: "2026-05-20",
    type: "Drawing",
    assigned: "2026-05-17",
    submissions: [
      { student: "Ananya Joshi",  status: "submitted",  submittedOn: "2026-05-19" },
      { student: "Vivaan Saxena", status: "reviewed",   submittedOn: "2026-05-18", remarks: "Excellent colours!" },
      { student: "Ayaan Nair",    status: "pending" },
      { student: "Pari Kapoor",   status: "submitted",  submittedOn: "2026-05-20" },
      { student: "Dhruv Agarwal", status: "pending" },
      { student: "Kiara Pillai",  status: "reviewed",   submittedOn: "2026-05-19", remarks: "Good effort." },
      { student: "Navya Bose",    status: "submitted",  submittedOn: "2026-05-20" },
    ],
  },
  {
    id: 2,
    subject: "Maths",
    title: "Count objects around the house",
    description: "Count 5 different groups of objects at home and write/draw the numbers.",
    class: "SKG-A",
    dueDate: "2026-05-21",
    type: "Activity",
    assigned: "2026-05-19",
    submissions: [
      { student: "Saanvi Iyer",   status: "pending" },
      { student: "Krish Gupta",   status: "submitted",  submittedOn: "2026-05-20" },
      { student: "Tarini Bhatt",  status: "pending" },
      { student: "Advik Sahu",    status: "pending" },
      { student: "Yara Hashmi",   status: "submitted",  submittedOn: "2026-05-20" },
      { student: "Rudra Tripathi",status: "pending" },
    ],
  },
  {
    id: 3,
    subject: "Hindi",
    title: "Revise vowels (अ, आ, इ, ई)",
    description: "Practice saying and writing the first 4 Hindi vowels. Parents should listen.",
    class: "JKG-B",
    dueDate: "2026-05-22",
    type: "Oral",
    assigned: "2026-05-19",
    submissions: [
      { student: "Aadi Choudhary",status: "reviewed",   submittedOn: "2026-05-20", remarks: "Perfect recitation." },
      { student: "Riya Dwivedi",  status: "submitted",  submittedOn: "2026-05-20" },
      { student: "Zara Ahmed",    status: "pending" },
      { student: "Shiv Pandey",   status: "pending" },
      { student: "Mira Thakur",   status: "reviewed",   submittedOn: "2026-05-19", remarks: "Needs more practice on ई." },
      { student: "Arnav Dixit",   status: "submitted",  submittedOn: "2026-05-20" },
    ],
  },
  {
    id: 4,
    subject: "English",
    title: "Read a short story aloud",
    description: "Parents to record a 1-minute video of child reading the story from their textbook pg 12.",
    class: "JKG-A",
    dueDate: "2026-05-24",
    type: "Reading",
    assigned: "2026-05-20",
    submissions: [
      { student: "Ananya Joshi",  status: "pending" },
      { student: "Vivaan Saxena", status: "pending" },
      { student: "Ayaan Nair",    status: "pending" },
      { student: "Pari Kapoor",   status: "pending" },
      { student: "Dhruv Agarwal", status: "pending" },
      { student: "Kiara Pillai",  status: "pending" },
      { student: "Navya Bose",    status: "pending" },
    ],
  },
];

function isPast(dateStr: string) {
  return new Date(dateStr) < new Date("2026-05-20");
}

export default function FacultyHomeworkPage() {
  const [user, setUser] = useState("");
  const [homeworks, setHomeworks] = useState<Homework[]>(INITIAL_HW);
  const [expanded, setExpanded] = useState<number | null>(1);
  const [showNew, setShowNew] = useState(false);
  const [newHW, setNewHW] = useState({ subject: "", title: "", description: "", class: "JKG-A", dueDate: "", type: "Drawing" as HWType });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUser(user.user_metadata?.name || "Faculty");
    });
  }, []);

  function markReviewed(hwId: number, student: string, remarks: string) {
    setHomeworks(prev => prev.map(h =>
      h.id !== hwId ? h : {
        ...h,
        submissions: h.submissions.map(s =>
          s.student !== student ? s : { ...s, status: "reviewed", remarks: remarks || "Reviewed." }
        ),
      }
    ));
  }

  function assignHomework() {
    if (!newHW.subject || !newHW.title || !newHW.dueDate) return;
    const submissions: Submission[] = INITIAL_HW
      .find(h => h.class === newHW.class)?.submissions
      .map(s => ({ student: s.student, status: "pending" })) ?? [];
    const hw: Homework = {
      id: Date.now(),
      ...newHW,
      assigned: "2026-05-20",
      submissions,
    };
    setHomeworks(prev => [hw, ...prev]);
    setShowNew(false);
    setNewHW({ subject: "", title: "", description: "", class: "JKG-A", dueDate: "", type: "Drawing" });
    setExpanded(hw.id);
  }

  const totalPending = homeworks.reduce((a, h) => a + h.submissions.filter(s => s.status === "pending").length, 0);
  const totalReviewed = homeworks.reduce((a, h) => a + h.submissions.filter(s => s.status === "reviewed").length, 0);

  return (
    <ERPShell role="faculty" userName={user}>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Homework</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
            Manage assignments for your classes
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNew(v => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #6BCB77, #4CAF50)",
            boxShadow: "0 4px 14px rgba(107,203,119,0.28)",
            fontFamily: "var(--font-nunito)",
          }}
        >
          <Plus size={15} /> Assign Homework
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Assignments",    value: homeworks.length,  color: "#7c3aed", bg: "rgba(167,139,250,0.10)" },
          { label: "Pending Review", value: totalPending,      color: "#FF6B6B", bg: "rgba(255,107,107,0.08)" },
          { label: "Reviewed",       value: totalReviewed,     color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
          { label: "Classes",        value: [...new Set(homeworks.map(h => h.class))].length, color: "#d97706", bg: "rgba(255,217,61,0.12)" },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* New homework form */}
      {showNew && (
        <div className="glass-card p-5 mb-5" style={{ border: "1.5px solid rgba(107,203,119,0.30)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Assign New Homework</h2>
            <button type="button" onClick={() => setShowNew(false)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(26,26,46,0.06)" }}>
              <X size={14} style={{ color: "rgba(26,26,46,0.50)" }} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            {[
              { label: "Subject",     key: "subject",     type: "text",   placeholder: "e.g. English" },
              { label: "Title",       key: "title",       type: "text",   placeholder: "e.g. Draw your pet" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }} htmlFor={f.key}>{f.label}</label>
                <input id={f.key} type={f.type} placeholder={f.placeholder}
                  value={(newHW as any)[f.key]}
                  onChange={e => setNewHW(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm"
                  style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.08)", color: "rgba(26,26,46,0.80)", fontFamily: "var(--font-inter)", outline: "none" }}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }} htmlFor="hw-class">Class</label>
              <select id="hw-class" value={newHW.class} onChange={e => setNewHW(p => ({ ...p, class: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm"
                style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.08)", color: "rgba(26,26,46,0.80)", fontFamily: "var(--font-inter)", outline: "none" }}>
                {["JKG-A","JKG-B","SKG-A","Nursery-A"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }} htmlFor="hw-due">Due Date</label>
              <input id="hw-due" type="date" value={newHW.dueDate} onChange={e => setNewHW(p => ({ ...p, dueDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm"
                style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.08)", color: "rgba(26,26,46,0.80)", fontFamily: "var(--font-inter)", outline: "none" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }} htmlFor="hw-type">Type</label>
              <select id="hw-type" value={newHW.type} onChange={e => setNewHW(p => ({ ...p, type: e.target.value as HWType }))}
                className="w-full px-3 py-2 rounded-xl text-sm"
                style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.08)", color: "rgba(26,26,46,0.80)", fontFamily: "var(--font-inter)", outline: "none" }}>
                {(["Drawing","Activity","Oral","Written","Reading"] as HWType[]).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }} htmlFor="hw-desc">Instructions</label>
            <textarea id="hw-desc" rows={2} placeholder="Describe the task for parents…" value={newHW.description}
              onChange={e => setNewHW(p => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl text-sm resize-none"
              style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.08)", color: "rgba(26,26,46,0.80)", fontFamily: "var(--font-inter)", outline: "none" }}
            />
          </div>
          <button type="button" onClick={assignHomework}
            className="px-5 py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #6BCB77, #4CAF50)", boxShadow: "0 4px 14px rgba(107,203,119,0.25)", fontFamily: "var(--font-nunito)" }}>
            Assign to Class
          </button>
        </div>
      )}

      {/* Homework list */}
      <div className="space-y-3">
        {homeworks.map(hw => {
          const isOpen = expanded === hw.id;
          const submitted = hw.submissions.filter(s => s.status !== "pending").length;
          const reviewed  = hw.submissions.filter(s => s.status === "reviewed").length;
          const pending   = hw.submissions.filter(s => s.status === "pending").length;
          const pct = hw.submissions.length > 0 ? Math.round((submitted / hw.submissions.length) * 100) : 0;
          const overdue = isPast(hw.dueDate) && pending > 0;

          return (
            <div key={hw.id} className="glass-card overflow-hidden"
              style={{ border: overdue ? "1.5px solid rgba(255,107,107,0.25)" : "1.5px solid rgba(255,255,255,0.60)" }}>
              {/* Header */}
              <button type="button" className="w-full flex items-center gap-4 p-4 text-left"
                onClick={() => setExpanded(isOpen ? null : hw.id)}>
                <span className="text-xs font-bold px-2.5 py-1.5 rounded-xl flex-shrink-0"
                  style={{ ...TYPE_STYLE[hw.type], fontFamily: "var(--font-nunito)", minWidth: 64, textAlign: "center" }}>
                  {hw.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-navy truncate" style={{ fontFamily: "var(--font-nunito)" }}>
                    {hw.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
                    {hw.subject} · {hw.class} · Due {new Date(hw.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    {overdue && <span className="ml-2 text-xs font-bold" style={{ color: "#FF6B6B" }}>Overdue</span>}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-xs font-bold flex-shrink-0" style={{ fontFamily: "var(--font-nunito)" }}>
                  <span style={{ color: "#6BCB77" }}>{reviewed} ✓</span>
                  <span style={{ color: "#d97706" }}>{submitted - reviewed} ⟳</span>
                  <span style={{ color: "#FF6B6B" }}>{pending} ✗</span>
                </div>
                {isOpen ? <ChevronUp size={16} style={{ color: "rgba(26,26,46,0.40)", flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: "rgba(26,26,46,0.40)", flexShrink: 0 }} />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(26,26,46,0.06)" }}>
                  <p className="text-xs mt-3 mb-3 leading-relaxed" style={{ color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-inter)" }}>
                    {hw.description}
                  </p>
                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: "rgba(26,26,46,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: pct === 100 ? "#6BCB77" : pct >= 60 ? "#d97706" : "#FF6B6B" }} />
                  </div>

                  {/* Submissions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {hw.submissions.map(sub => (
                      <SubmissionRow key={sub.student} sub={sub} onReview={(remarks) => markReviewed(hw.id, sub.student, remarks)} />
                    ))}
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

function SubmissionRow({ sub, onReview }: { sub: Submission; onReview: (remarks: string) => void }) {
  const [showRemarks, setShowRemarks] = useState(false);
  const [remarks, setRemarks] = useState("");
  const style = SUB_STYLE[sub.status];

  return (
    <div className="p-3 rounded-2xl" style={{ background: style.bg + "66", border: `1px solid ${style.bg}` }}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-xs font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{sub.student}</p>
        <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={{ background: style.bg, color: style.color, fontFamily: "var(--font-nunito)" }}>
          {style.label}
        </span>
      </div>
      {sub.submittedOn && (
        <p className="text-xs mb-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
          {new Date(sub.submittedOn).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </p>
      )}
      {sub.remarks && (
        <p className="text-xs italic" style={{ color: "#6BCB77", fontFamily: "var(--font-inter)" }}>"{sub.remarks}"</p>
      )}
      {sub.status === "submitted" && !showRemarks && (
        <button type="button" onClick={() => setShowRemarks(true)}
          className="mt-1.5 text-xs font-semibold px-2 py-1 rounded-lg transition-all duration-150"
          style={{ background: "rgba(107,203,119,0.15)", color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
          Mark Reviewed
        </button>
      )}
      {showRemarks && (
        <div className="mt-1.5 flex gap-1.5">
          <input type="text" placeholder="Remarks (optional)" value={remarks}
            onChange={e => setRemarks(e.target.value)}
            className="flex-1 px-2 py-1 rounded-lg text-xs"
            style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(26,26,46,0.10)", outline: "none", fontFamily: "var(--font-inter)" }}
          />
          <button type="button"
            onClick={() => { onReview(remarks); setShowRemarks(false); }}
            className="px-2 py-1 rounded-lg text-xs font-bold text-white"
            style={{ background: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
            ✓
          </button>
          <button type="button" onClick={() => setShowRemarks(false)}
            className="px-2 py-1 rounded-lg text-xs font-bold"
            style={{ background: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
