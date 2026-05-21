"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { CheckCircle, AlertCircle, Clock, BookOpen, ChevronDown, ChevronUp } from "lucide-react";

type HWStatus = "pending" | "done";
type HWType = "Drawing" | "Activity" | "Oral" | "Written" | "Reading";

interface Homework {
  id: number;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  type: HWType;
  status: HWStatus;
  submittedOn?: string;
  teacherRemark?: string;
}

const TYPE_STYLE: Record<HWType, { bg: string; color: string }> = {
  Drawing:  { bg: "rgba(124,58,237,0.10)", color: "#7c3aed" },
  Activity: { bg: "rgba(255,217,61,0.15)", color: "#d97706" },
  Oral:     { bg: "rgba(107,203,119,0.12)", color: "#6BCB77" },
  Written:  { bg: "rgba(255,107,107,0.10)", color: "#FF6B6B" },
  Reading:  { bg: "rgba(26,26,46,0.06)",    color: "rgba(26,26,46,0.55)" },
};

const INITIAL_HW: Homework[] = [
  {
    id: 1,
    subject: "English",
    title: "Draw your favourite animal",
    description: "Help Aarav draw his favourite animal using crayons. Label the animal's name below the drawing.",
    dueDate: "2026-05-20",
    type: "Drawing",
    status: "pending",
  },
  {
    id: 2,
    subject: "Maths",
    title: "Count objects around the house",
    description: "Count 5 different groups of objects at home and write the numbers on a sheet of paper.",
    dueDate: "2026-05-21",
    type: "Activity",
    status: "pending",
  },
  {
    id: 3,
    subject: "Hindi",
    title: "Revise vowels (अ, आ, इ, ई)",
    description: "Help Aarav practise the first 4 Hindi vowels — say them aloud together 3 times.",
    dueDate: "2026-05-22",
    type: "Oral",
    status: "done",
    submittedOn: "2026-05-19",
    teacherRemark: "Excellent recitation! Aarav did very well. 🌟",
  },
  {
    id: 4,
    subject: "English",
    title: "Read a short story aloud",
    description: "Read the short story on page 12 of the English textbook aloud with your child.",
    dueDate: "2026-05-24",
    type: "Reading",
    status: "pending",
  },
];

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).setHours(0,0,0,0) - new Date("2026-05-20").setHours(0,0,0,0);
  return Math.round(diff / 86400000);
}

export default function ParentHomeworkPage() {
  const [user, setUser] = useState("");
  const [homeworks, setHomeworks] = useState<Homework[]>(INITIAL_HW);
  const [expanded, setExpanded] = useState<number | null>(1);
  const [tab, setTab] = useState<"all" | "pending" | "done">("all");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUser(user.user_metadata?.name || "Parent");
    });
  }, []);

  function markDone(id: number) {
    setHomeworks(prev => prev.map(h =>
      h.id !== id ? h : { ...h, status: "done", submittedOn: "2026-05-20" }
    ));
  }

  const pending = homeworks.filter(h => h.status === "pending");
  const done    = homeworks.filter(h => h.status === "done");
  const shown   = tab === "pending" ? pending : tab === "done" ? done : homeworks;

  return (
    <ERPShell role="parent" userName={user}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Aarav's Homework</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          JKG-A · Academic Year 2026–27
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending", value: pending.length, color: "#FF6B6B", bg: "rgba(255,107,107,0.08)" },
          { label: "Done",    value: done.length,    color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
          { label: "Total",   value: homeworks.length, color: "#7c3aed", bg: "rgba(167,139,250,0.10)" },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>{s.value}</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending alert */}
      {pending.length > 0 && (
        <div className="mb-5 p-4 rounded-2xl flex items-start gap-3"
          style={{ background: "rgba(255,107,107,0.07)", border: "1.5px solid rgba(255,107,107,0.20)" }}>
          <AlertCircle size={18} style={{ color: "#FF6B6B", flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>
              {pending.length} homework{pending.length > 1 ? "s" : ""} pending
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>
              Earliest due: {new Date([...pending].sort((a,b) => a.dueDate.localeCompare(b.dueDate))[0].dueDate)
                .toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(["all", "pending", "done"] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all duration-150"
            style={{
              background: tab === t ? "rgba(124,58,237,0.12)" : "rgba(26,26,46,0.05)",
              color: tab === t ? "#7c3aed" : "rgba(26,26,46,0.55)",
              fontFamily: "var(--font-nunito)",
            }}>
            {t} {t === "all" ? `(${homeworks.length})` : t === "pending" ? `(${pending.length})` : `(${done.length})`}
          </button>
        ))}
      </div>

      {/* Homework cards */}
      <div className="space-y-3">
        {shown.length === 0 && (
          <div className="glass-card p-10 text-center">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>All caught up!</p>
            <p className="text-xs mt-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>No pending homework right now.</p>
          </div>
        )}

        {shown.map(hw => {
          const isOpen  = expanded === hw.id;
          const days    = daysUntil(hw.dueDate);
          const isDone  = hw.status === "done";
          const urgent  = !isDone && days <= 0;
          const typeStyle = TYPE_STYLE[hw.type];

          return (
            <div key={hw.id} className="glass-card overflow-hidden"
              style={{
                border: isDone
                  ? "1.5px solid rgba(107,203,119,0.25)"
                  : urgent
                  ? "1.5px solid rgba(255,107,107,0.30)"
                  : "1.5px solid rgba(255,255,255,0.60)",
              }}>
              <button type="button" className="w-full flex items-center gap-3 p-4 text-left"
                onClick={() => setExpanded(isOpen ? null : hw.id)}>
                {/* Status icon */}
                <div className="flex-shrink-0">
                  {isDone
                    ? <CheckCircle size={20} style={{ color: "#6BCB77" }} />
                    : urgent
                    ? <AlertCircle size={20} style={{ color: "#FF6B6B" }} />
                    : <Clock size={20} style={{ color: "#d97706" }} />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{hw.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-lg" style={{ ...typeStyle, fontFamily: "var(--font-nunito)" }}>{hw.type}</span>
                    <span className="text-xs" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>{hw.subject}</span>
                    {isDone
                      ? <span className="text-xs font-semibold" style={{ color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>Done ✅</span>
                      : <span className="text-xs font-semibold" style={{ color: urgent ? "#FF6B6B" : days === 1 ? "#d97706" : "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>
                          {days === 0 ? "Due Today" : days < 0 ? `${Math.abs(days)}d overdue` : `Due in ${days}d`}
                        </span>}
                  </div>
                </div>

                {isOpen
                  ? <ChevronUp size={16} style={{ color: "rgba(26,26,46,0.40)", flexShrink: 0 }} />
                  : <ChevronDown size={16} style={{ color: "rgba(26,26,46,0.40)", flexShrink: 0 }} />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(26,26,46,0.06)" }}>
                  <p className="text-sm leading-relaxed mt-3 mb-4" style={{ color: "rgba(26,26,46,0.65)", fontFamily: "var(--font-inter)" }}>
                    {hw.description}
                  </p>

                  {/* Due date row */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(26,26,46,0.06)" }}>
                      <BookOpen size={13} style={{ color: "rgba(26,26,46,0.45)" }} />
                    </div>
                    <p className="text-xs" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>
                      Due: <span className="font-semibold text-navy">{new Date(hw.dueDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</span>
                    </p>
                  </div>

                  {/* Teacher remark */}
                  {hw.teacherRemark && (
                    <div className="p-3 rounded-2xl mb-4" style={{ background: "rgba(107,203,119,0.08)", border: "1px solid rgba(107,203,119,0.20)" }}>
                      <p className="text-xs font-semibold mb-0.5" style={{ color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>Teacher's Remark</p>
                      <p className="text-sm" style={{ color: "rgba(26,26,46,0.70)", fontFamily: "var(--font-inter)" }}>{hw.teacherRemark}</p>
                    </div>
                  )}

                  {!isDone ? (
                    <button type="button" onClick={() => markDone(hw.id)}
                      className="w-full py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
                      style={{
                        background: "linear-gradient(135deg, #6BCB77, #4CAF50)",
                        boxShadow: "0 4px 14px rgba(107,203,119,0.28)",
                        fontFamily: "var(--font-nunito)",
                      }}>
                      Mark as Done ✓
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
                      <CheckCircle size={15} />
                      Completed on {hw.submittedOn && new Date(hw.submittedOn).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </div>
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
