"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import {
  Plus, CheckCircle, ChevronDown, ChevronUp, X, Calendar,
} from "lucide-react";

type HWStatus = "pending" | "submitted" | "reviewed";
type HWType = "Drawing" | "Activity" | "Oral" | "Written" | "Reading";

interface Submission {
  id: string;
  student_id: string;
  student: string;
  status: HWStatus;
  submittedOn?: string;
  remarks?: string;
}

interface Homework {
  id: string;
  subject: string;
  title: string;
  description: string;
  classLabel: string;
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

function mapHW(hw: Record<string, unknown>): Homework {
  const subs = hw.homework_submissions as Record<string, unknown>[];
  return {
    id: hw.id as string,
    subject: hw.subject as string,
    title: hw.title as string,
    description: (hw.description as string) || "",
    classLabel: `${hw.class} ${hw.section}`,
    dueDate: hw.due_date as string,
    type: hw.type as HWType,
    assigned: (hw.created_at as string).split("T")[0],
    submissions: (subs ?? []).map((s) => ({
      id: s.id as string,
      student_id: s.student_id as string,
      student: ((s.students as Record<string, string>)?.name) || "—",
      status: s.status as HWStatus,
      submittedOn: s.submitted_at ? (s.submitted_at as string).split("T")[0] : undefined,
      remarks: (s.remarks as string) || undefined,
    })),
  };
}

export default function FacultyHomeworkPage() {
  const [userName, setUserName] = useState("");
  const [classAssigned, setClassAssigned] = useState("");
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newHW, setNewHW] = useState({
    subject: "", title: "", description: "", dueDate: "", type: "Drawing" as HWType,
  });

  const loadHomework = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/homework");
      if (!res.ok) return;
      const data = await res.json();
      if (data.homework) {
        const mapped = (data.homework as Record<string, unknown>[]).map(mapHW);
        setHomeworks(mapped);
        if (mapped.length > 0) setExpanded(prev => prev ?? mapped[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserName(user.app_metadata?.name || user.user_metadata?.name || "Faculty");
      setClassAssigned(user.app_metadata?.class_assigned || "");
    });
    loadHomework();
  }, [loadHomework]);

  async function markReviewed(hwId: string, submissionId: string, remarks: string) {
    setHomeworks(prev => prev.map(h =>
      h.id !== hwId ? h : {
        ...h,
        submissions: h.submissions.map(s =>
          s.id !== submissionId ? s : { ...s, status: "reviewed", remarks: remarks || "Reviewed." }
        ),
      }
    ));
    await fetch(`/api/homework/${hwId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submission_id: submissionId, status: "reviewed", remarks }),
    });
  }

  async function assignHomework() {
    if (!newHW.subject || !newHW.title || !newHW.dueDate) return;
    setSaving(true);
    try {
    const lastDash = classAssigned.lastIndexOf("-");
    const sec = lastDash !== -1 ? classAssigned.slice(lastDash + 1) : "A";
    const cls = lastDash !== -1 ? classAssigned.slice(0, lastDash) : classAssigned;

      const res = await fetch("/api/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newHW, due_date: newHW.dueDate, class: cls, section: sec }),
      });
      if (res.ok) {
        await loadHomework();
        setShowNew(false);
        setNewHW({ subject: "", title: "", description: "", dueDate: "", type: "Drawing" });
      }
    } finally {
      setSaving(false);
    }
  }

  const classLabel = classAssigned.replace("-", " ");
  const totalPending  = homeworks.reduce((a, h) => a + h.submissions.filter(s => s.status === "pending").length, 0);
  const totalReviewed = homeworks.reduce((a, h) => a + h.submissions.filter(s => s.status === "reviewed").length, 0);

  return (
    <ERPShell role="faculty" userName={userName}>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Homework</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
            {classLabel || "Your class"} · Assign and review student work
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNew(v => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg,#6BCB77,#4CAF50)", boxShadow: "0 4px 14px rgba(107,203,119,0.28)", fontFamily: "var(--font-nunito)" }}
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
          { label: "Class",          value: classLabel || "—", color: "#d97706", bg: "rgba(255,217,61,0.12)" },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>{s.label}</p>
            <p className="text-xl font-bold truncate" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* New homework form */}
      {showNew && (
        <div className="glass-card p-5 mb-5" style={{ border: "1.5px solid rgba(107,203,119,0.30)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>
              Assign to {classLabel}
            </h2>
            <button type="button" onClick={() => setShowNew(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(26,26,46,0.06)" }}>
              <X size={14} style={{ color: "rgba(26,26,46,0.50)" }} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            {[
              { label: "Subject", key: "subject", placeholder: "e.g. English" },
              { label: "Title",   key: "title",   placeholder: "e.g. Draw your pet" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }} htmlFor={f.key}>{f.label}</label>
                <input id={f.key} type="text" placeholder={f.placeholder}
                  value={(newHW as Record<string, string>)[f.key]}
                  onChange={e => setNewHW(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm"
                  style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.08)", color: "rgba(26,26,46,0.80)", fontFamily: "var(--font-inter)", outline: "none" }}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }} htmlFor="hw-due">Due Date</label>
              <input id="hw-due" type="date" value={newHW.dueDate}
                onChange={e => setNewHW(p => ({ ...p, dueDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm"
                style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.08)", color: "rgba(26,26,46,0.80)", fontFamily: "var(--font-inter)", outline: "none" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }} htmlFor="hw-type">Type</label>
              <select id="hw-type" value={newHW.type}
                onChange={e => setNewHW(p => ({ ...p, type: e.target.value as HWType }))}
                className="w-full px-3 py-2 rounded-xl text-sm"
                style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.08)", color: "rgba(26,26,46,0.80)", fontFamily: "var(--font-inter)", outline: "none" }}>
                {(["Drawing","Activity","Oral","Written","Reading"] as HWType[]).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }} htmlFor="hw-desc">Instructions</label>
            <textarea id="hw-desc" rows={2} placeholder="Describe the task for parents…"
              value={newHW.description}
              onChange={e => setNewHW(p => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl text-sm resize-none"
              style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.08)", color: "rgba(26,26,46,0.80)", fontFamily: "var(--font-inter)", outline: "none" }}
            />
          </div>
          <button type="button" onClick={assignHomework} disabled={saving}
            className="px-5 py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#6BCB77,#4CAF50)", boxShadow: "0 4px 14px rgba(107,203,119,0.25)", fontFamily: "var(--font-nunito)" }}>
            {saving ? "Assigning…" : "Assign to Class"}
          </button>
        </div>
      )}

      {/* Homework list */}
      {loading && (
        <div className="glass-card p-10 text-center">
          <p className="text-sm" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>Loading assignments…</p>
        </div>
      )}

      {!loading && homeworks.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "rgba(107,203,119,0.10)" }}>
            <CheckCircle size={22} style={{ color: "#6BCB77" }} />
          </div>
          <p className="text-sm font-semibold text-navy mb-1" style={{ fontFamily: "var(--font-nunito)" }}>No homework yet</p>
          <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
            Click &ldquo;Assign Homework&rdquo; to create the first assignment.
          </p>
        </div>
      ) : !loading && (
        <div className="space-y-3">
          {homeworks.map(hw => {
            const isOpen = expanded === hw.id;
            const submitted = hw.submissions.filter(s => s.status !== "pending").length;
            const reviewed  = hw.submissions.filter(s => s.status === "reviewed").length;
            const pending   = hw.submissions.filter(s => s.status === "pending").length;
            const pct = hw.submissions.length > 0 ? Math.round((submitted / hw.submissions.length) * 100) : 0;
            const overdue = new Date(hw.dueDate) < new Date() && pending > 0;

            return (
              <div key={hw.id} className="glass-card overflow-hidden"
                style={{ border: overdue ? "1.5px solid rgba(255,107,107,0.25)" : "1.5px solid rgba(255,255,255,0.60)" }}>
                <button type="button" className="w-full flex items-center gap-4 p-4 text-left"
                  onClick={() => setExpanded(isOpen ? null : hw.id)}>
                  <span className="text-xs font-bold px-2.5 py-1.5 rounded-xl flex-shrink-0"
                    style={{ ...TYPE_STYLE[hw.type], fontFamily: "var(--font-nunito)", minWidth: 64, textAlign: "center" }}>
                    {hw.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-navy truncate" style={{ fontFamily: "var(--font-nunito)" }}>{hw.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
                      {hw.subject} · Due {new Date(hw.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      {overdue && <span className="ml-2 font-bold" style={{ color: "#FF6B6B" }}>Overdue</span>}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 text-xs font-bold flex-shrink-0" style={{ fontFamily: "var(--font-nunito)" }}>
                    <span style={{ color: "#6BCB77" }}>{reviewed} ✓</span>
                    <span style={{ color: "#d97706" }}>{submitted - reviewed} ⟳</span>
                    <span style={{ color: "#FF6B6B" }}>{pending} ✗</span>
                  </div>
                  {isOpen
                    ? <ChevronUp size={16} style={{ color: "rgba(26,26,46,0.40)", flexShrink: 0 }} />
                    : <ChevronDown size={16} style={{ color: "rgba(26,26,46,0.40)", flexShrink: 0 }} />}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(26,26,46,0.06)" }}>
                    <p className="text-xs mt-3 mb-3 leading-relaxed" style={{ color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-inter)" }}>
                      {hw.description}
                    </p>
                    <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: "rgba(26,26,46,0.06)" }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: pct === 100 ? "#6BCB77" : pct >= 60 ? "#d97706" : "#FF6B6B" }} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {hw.submissions.map(sub => (
                        <SubmissionRow
                          key={sub.id}
                          sub={sub}
                          onReview={(remarks) => markReviewed(hw.id, sub.id, remarks)}
                        />
                      ))}
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
          <Calendar size={10} className="inline mr-1" />
          {new Date(sub.submittedOn).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </p>
      )}
      {sub.remarks && (
        <p className="text-xs italic" style={{ color: "#6BCB77", fontFamily: "var(--font-inter)" }}>&ldquo;{sub.remarks}&rdquo;</p>
      )}
      {sub.status === "submitted" && !showRemarks && (
        <button type="button" onClick={() => setShowRemarks(true)}
          className="mt-1.5 text-xs font-semibold px-2 py-1 rounded-lg"
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

