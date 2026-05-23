"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { CheckCircle, AlertCircle, Save, Lock, Users } from "lucide-react";

type AttStatus = "P" | "A" | "L" | "-";

const STATUS_CFG: Record<AttStatus, { label: string; bg: string; color: string }> = {
  P:   { label: "Present", bg: "rgba(107,203,119,0.15)", color: "#6BCB77" },
  A:   { label: "Absent",  bg: "rgba(255,107,107,0.12)", color: "#FF6B6B" },
  L:   { label: "Late",    bg: "rgba(255,217,61,0.15)",  color: "#d97706" },
  "-": { label: "—",       bg: "rgba(26,26,46,0.05)",    color: "rgba(26,26,46,0.30)" },
};

function toMark(s: string): AttStatus {
  if (s === "present") return "P";
  if (s === "absent")  return "A";
  if (s === "late")    return "L";
  return "-";
}

interface DbStudent { id: string; name: string; roll_no: string; }

export default function FacultyAttendancePage() {
  const [userName, setUserName] = useState("");
  const [classAssigned, setClassAssigned] = useState("");
  const [classLabel, setClassLabel] = useState("");

  const [students, setStudents] = useState<DbStudent[]>([]);
  const [marks, setMarks] = useState<Record<string, AttStatus>>({});
  const [locked, setLocked] = useState(false);

  const [studentsLoading, setStudentsLoading] = useState(true);
  const [attLoading, setAttLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [flashSaved, setFlashSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  // Load auth + students once
  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserName(user.app_metadata?.name || user.user_metadata?.name || "Faculty");
      const ca: string = user.app_metadata?.class_assigned ?? "";
      setClassAssigned(ca);
      setClassLabel(ca.replace("-", " "));
      if (!ca) { setStudentsLoading(false); return; }

      const res = await fetch(`/api/students?class=${encodeURIComponent(ca)}`);
      const data = await res.json();
      if (data.students) setStudents(data.students as DbStudent[]);
      setStudentsLoading(false);
    });
  }, []);

  // Reload attendance marks whenever date or class changes (and students are loaded)
  useEffect(() => {
    if (!classAssigned || students.length === 0) return;
    setAttLoading(true);
    setLocked(false);
    setSaveError(null);
    fetch(`/api/attendance?date=${selectedDate}&class=${encodeURIComponent(classAssigned)}`)
      .then(r => r.json())
      .then(data => {
        const list: { student_id: string; status: string }[] = data.attendance ?? [];
        const newMarks: Record<string, AttStatus> = {};
        for (const a of list) newMarks[a.student_id] = toMark(a.status);
        setMarks(newMarks);
        if (list.length > 0 && list.length >= students.length) setLocked(true);
      })
      .finally(() => setAttLoading(false));
  }, [selectedDate, classAssigned, students.length]);

  // Derived display rows
  const rows = students.map(s => ({ ...s, status: marks[s.id] ?? "-" as AttStatus }));
  const present  = rows.filter(r => r.status === "P").length;
  const absent   = rows.filter(r => r.status === "A").length;
  const late     = rows.filter(r => r.status === "L").length;
  const unmarked = rows.filter(r => r.status === "-").length;
  const pct = students.length > 0 ? Math.round((present / students.length) * 100) : 0;

  function setMark(id: string, st: AttStatus) {
    setMarks(prev => ({ ...prev, [id]: prev[id] === st ? "-" : st }));
  }

  function markAll(st: "P" | "A") {
    const next: Record<string, AttStatus> = {};
    for (const s of students) next[s.id] = st;
    setMarks(next);
  }

  async function handleSave(lock = true) {
    const toSend = lock
      ? rows
      : rows.filter(r => r.status !== "-");

    if (lock && unmarked > 0) {
      setSaveError(`${unmarked} student${unmarked !== 1 ? "s" : ""} not yet marked`);
      return;
    }
    if (toSend.length === 0) return;

    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          class: classAssigned,
          records: toSend.map(r => ({
            student_id: r.id,
            status: r.status === "P" ? "present" : r.status === "A" ? "absent" : "late",
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setSaveError(err.error || "Failed to save");
        return;
      }
      if (lock) setLocked(true);
      setFlashSaved(true);
      setTimeout(() => setFlashSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ERPShell role="faculty" userName={userName}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>
          Attendance {classLabel ? `— ${classLabel}` : ""}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total",   value: students.length, color: "#7c3aed", bg: "rgba(167,139,250,0.10)" },
          { label: "Present", value: present,          color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
          { label: "Absent",  value: absent,           color: "#FF6B6B", bg: "rgba(255,107,107,0.08)" },
          { label: "Late",    value: late,             color: "#d97706", bg: "rgba(255,217,61,0.12)"  },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>
              {studentsLoading ? "…" : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Date picker */}
      <div className="flex items-center gap-3 mb-5">
        <label className="text-xs font-semibold" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>Date</label>
        <input type="date" value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm"
          style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.09)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }}
        />
        {attLoading && <span className="text-xs" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>Loading…</span>}
        {locked && (
          <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: "rgba(107,203,119,0.12)", color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
            <CheckCircle size={12} /> Submitted
          </span>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        {/* Roll call toolbar */}
        {!locked && !studentsLoading && students.length > 0 && (
          <div className="flex items-center justify-between flex-wrap gap-3 px-4 pt-4 pb-3"
            style={{ borderBottom: "1px solid rgba(26,26,46,0.06)" }}>
            <div className="flex gap-2">
              <button type="button" onClick={() => markAll("P")}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-150 hover:-translate-y-0.5"
                style={{ background: "rgba(107,203,119,0.12)", color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
                <Users size={11} className="inline mr-1" /> All Present
              </button>
              <button type="button" onClick={() => markAll("A")}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-150 hover:-translate-y-0.5"
                style={{ background: "rgba(255,107,107,0.10)", color: "#FF6B6B", fontFamily: "var(--font-nunito)" }}>
                All Absent
              </button>
            </div>
            <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
              {present}P · {absent}A · {late}L · {unmarked} unmarked
            </p>
          </div>
        )}

        {/* Progress bar */}
        {students.length > 0 && (
          <div className="px-4 pt-3">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(26,26,46,0.06)" }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: pct >= 80 ? "#6BCB77" : pct >= 60 ? "#d97706" : "#FF6B6B" }} />
            </div>
          </div>
        )}

        {/* Student list */}
        <div className="p-4">
          {studentsLoading ? (
            <p className="text-sm text-center py-8" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
              Loading students…
            </p>
          ) : students.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>No class assigned</p>
              <p className="text-xs mt-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
                Contact admin to assign your class.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {rows.map((student, idx) => (
                <div key={student.id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl transition-colors"
                  style={{ background: STATUS_CFG[student.status].bg }}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy truncate" style={{ fontFamily: "var(--font-nunito)" }}>
                        {student.name}
                      </p>
                      <p className="text-xs" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>
                        {student.roll_no}
                      </p>
                    </div>
                  </div>

                  {locked ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0"
                      style={{ background: STATUS_CFG[student.status].bg, color: STATUS_CFG[student.status].color, fontFamily: "var(--font-nunito)" }}>
                      {student.status === "-" ? "—" : STATUS_CFG[student.status].label}
                    </span>
                  ) : (
                    <div className="flex gap-1 flex-shrink-0">
                      {(["P", "A", "L"] as const).map(st => (
                        <button key={st} type="button"
                          onClick={() => setMark(student.id, st)}
                          className="w-7 h-7 rounded-lg text-xs font-bold transition-all duration-150 hover:scale-105"
                          style={{
                            background: student.status === st ? STATUS_CFG[st].bg : "rgba(26,26,46,0.05)",
                            color:      student.status === st ? STATUS_CFG[st].color : "rgba(26,26,46,0.35)",
                            border: student.status === st ? `1px solid ${STATUS_CFG[st].color}40` : "1px solid transparent",
                            fontFamily: "var(--font-nunito)",
                          }}>
                          {st}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action row */}
        {!studentsLoading && students.length > 0 && (
          <div className="px-4 pb-4 flex flex-wrap items-center gap-3" style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
            {locked ? (
              <div className="flex items-center gap-2 text-sm font-semibold py-2"
                style={{ color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
                <CheckCircle size={15} /> Attendance submitted and locked for this date.
              </div>
            ) : (
              <>
                <button type="button"
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
                  style={{
                    background: flashSaved ? "rgba(107,203,119,0.15)" : "rgba(26,26,46,0.06)",
                    color: flashSaved ? "#6BCB77" : "rgba(26,26,46,0.70)",
                    fontFamily: "var(--font-nunito)",
                  }}>
                  <Save size={14} />
                  {saving ? "Saving…" : flashSaved ? "Saved!" : "Save Draft"}
                </button>

                <button type="button"
                  onClick={() => handleSave(true)}
                  disabled={unmarked > 0 || saving}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  style={{
                    background: "linear-gradient(135deg, #6BCB77, #4CAF50)",
                    boxShadow: "0 4px 14px rgba(107,203,119,0.30)",
                    fontFamily: "var(--font-nunito)",
                  }}>
                  <Lock size={14} />
                  {saving ? "Saving…" : `Submit & Lock${unmarked > 0 ? ` (${unmarked} left)` : ""}`}
                </button>
              </>
            )}

            {saveError && (
              <div className="flex items-center gap-1.5">
                <AlertCircle size={13} style={{ color: "#FF6B6B" }} />
                <p className="text-xs" style={{ color: "#FF6B6B", fontFamily: "var(--font-inter)" }}>{saveError}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ERPShell>
  );
}
