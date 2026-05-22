"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { CheckCircle, AlertCircle, Clock, BookOpen, ChevronDown, ChevronUp } from "lucide-react";

type HWStatus = "pending" | "submitted" | "reviewed";
type HWType = "Drawing" | "Activity" | "Oral" | "Written" | "Reading";

interface Homework {
  id: string;
  subject: string;
  title: string;
  description: string;
  due_date: string;
  type: HWType;
  submission_id: string | null;
  status: HWStatus;
  submitted_at: string | null;
  remarks: string | null;
}

const TYPE_STYLE: Record<HWType, { bg: string; color: string }> = {
  Drawing:  { bg: "rgba(124,58,237,0.10)", color: "#7c3aed" },
  Activity: { bg: "rgba(255,217,61,0.15)", color: "#d97706" },
  Oral:     { bg: "rgba(107,203,119,0.12)", color: "#6BCB77" },
  Written:  { bg: "rgba(255,107,107,0.10)", color: "#FF6B6B" },
  Reading:  { bg: "rgba(26,26,46,0.06)",    color: "rgba(26,26,46,0.55)" },
};

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).setHours(0,0,0,0) - new Date().setHours(0,0,0,0);
  return Math.ceil(diff / 86400000);
}

export default function ParentHomeworkPage() {
  const [userName, setUserName] = useState("");
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [marking, setMarking] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserName(user.user_metadata?.name || "Parent");
    });
    fetch("/api/homework/my-child")
      .then(r => r.json())
      .then(data => {
        if (data.homework) setHomeworks(data.homework as Homework[]);
        if ((data.homework as Homework[])?.length > 0) setExpanded((data.homework as Homework[])[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  async function markDone(hw: Homework) {
    if (!hw.submission_id) return;
    setMarking(hw.id);
    const res = await fetch(`/api/homework/${hw.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submission_id: hw.submission_id, status: "submitted" }),
    });
    if (res.ok) {
      setHomeworks(prev => prev.map(h =>
        h.id !== hw.id ? h : { ...h, status: "submitted", submitted_at: new Date().toISOString() }
      ));
    }
    setMarking(null);
  }

  const pending   = homeworks.filter(h => h.status === "pending").length;
  const submitted = homeworks.filter(h => h.status === "submitted").length;
  const reviewed  = homeworks.filter(h => h.status === "reviewed").length;

  return (
    <ERPShell role="parent" userName={userName}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Homework</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          Track and submit your child&apos;s assignments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total",     value: homeworks.length, color: "#7c3aed", bg: "rgba(167,139,250,0.10)" },
          { label: "Pending",   value: pending,           color: "#FF6B6B", bg: "rgba(255,107,107,0.08)" },
          { label: "Submitted", value: submitted,         color: "#d97706", bg: "rgba(255,217,61,0.12)" },
          { label: "Reviewed",  value: reviewed,          color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {loading && (
        <div className="glass-card p-10 text-center">
          <p className="text-sm" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>Loading homework…</p>
        </div>
      )}

      {!loading && homeworks.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "rgba(107,203,119,0.10)" }}>
            <CheckCircle size={22} style={{ color: "#6BCB77" }} />
          </div>
          <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>No homework assigned yet</p>
        </div>
      )}

      <div className="space-y-3">
        {homeworks.map(hw => {
          const isOpen = expanded === hw.id;
          const days = daysUntil(hw.due_date);
          const overdue = hw.status === "pending" && days < 0;

          const statusIcon =
            hw.status === "reviewed"  ? <CheckCircle size={14} style={{ color: "#6BCB77" }} /> :
            hw.status === "submitted" ? <Clock size={14} style={{ color: "#d97706" }} /> :
            overdue                   ? <AlertCircle size={14} style={{ color: "#FF6B6B" }} /> :
                                        <BookOpen size={14} style={{ color: "#7c3aed" }} />;

          const statusLabel =
            hw.status === "reviewed"  ? "Reviewed by teacher" :
            hw.status === "submitted" ? "Submitted — awaiting review" :
            overdue                   ? "Overdue" :
            days === 0                ? "Due today" :
            days === 1                ? "Due tomorrow" :
                                        `Due in ${days} days`;

          const statusColor =
            hw.status === "reviewed"  ? "#6BCB77" :
            hw.status === "submitted" ? "#d97706" :
            overdue                   ? "#FF6B6B" : "#7c3aed";

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
                    {hw.subject} · {new Date(hw.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                  {statusIcon}
                  <span className="text-xs font-semibold" style={{ color: statusColor, fontFamily: "var(--font-nunito)" }}>{statusLabel}</span>
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

                  {/* Mobile status */}
                  <div className="flex items-center gap-1.5 mb-3 sm:hidden">
                    {statusIcon}
                    <span className="text-xs font-semibold" style={{ color: statusColor, fontFamily: "var(--font-nunito)" }}>{statusLabel}</span>
                  </div>

                  {hw.remarks && (
                    <div className="mb-3 px-3 py-2.5 rounded-xl"
                      style={{ background: "rgba(107,203,119,0.08)", border: "1px solid rgba(107,203,119,0.20)" }}>
                      <p className="text-xs font-bold mb-0.5" style={{ color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>Teacher&apos;s Feedback</p>
                      <p className="text-xs italic" style={{ color: "rgba(26,26,46,0.65)", fontFamily: "var(--font-inter)" }}>&ldquo;{hw.remarks}&rdquo;</p>
                    </div>
                  )}

                  {hw.status === "pending" && hw.submission_id && (
                    <button type="button"
                      onClick={() => markDone(hw)}
                      disabled={marking === hw.id}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg,#d97706,#fbbf24)", boxShadow: "0 4px 14px rgba(217,119,6,0.25)", fontFamily: "var(--font-nunito)" }}>
                      <CheckCircle size={14} />
                      {marking === hw.id ? "Marking…" : "Mark as Done"}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ERPShell>
  );
}
