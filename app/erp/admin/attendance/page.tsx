"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { CheckCircle, XCircle, Clock, AlertCircle, Download, Search } from "lucide-react";

type AttStatus = "P" | "A" | "L" | "H";

const STATUS_CFG: Record<AttStatus, { label: string; color: string; bg: string }> = {
  P: { label: "Present",  color: "#6BCB77", bg: "rgba(107,203,119,0.12)" },
  A: { label: "Absent",   color: "#FF6B6B", bg: "rgba(255,107,107,0.12)" },
  L: { label: "Late",     color: "#d97706", bg: "rgba(255,217,61,0.18)"  },
  H: { label: "Half Day", color: "#7c3aed", bg: "rgba(167,139,250,0.12)" },
};

const CLASSES = [
  { label: "Nursery A", cls: "Nursery-A", teacher: "Aarav Kumar" },
  { label: "LKG A",     cls: "LKG-A",     teacher: "Neha Sharma" },
  { label: "UKG A",     cls: "UKG-A",     teacher: "Rohan Singh" },
  { label: "JKG A",     cls: "JKG-A",     teacher: "Priya Patel" },
  { label: "SKG A",     cls: "SKG-A",     teacher: "Vikram Verma" },
];

function toMark(s: string): AttStatus {
  if (s === "present") return "P";
  if (s === "absent")  return "A";
  if (s === "late")    return "L";
  return "H";
}

interface DbStudent { id: string; name: string; roll_no: string; }

interface ClassSummary { cls: string; present: number; absent: number; total: number; }

export default function AdminAttendancePage() {
  const [userName, setUserName] = useState("");
  const [selectedCls, setSelectedCls] = useState(CLASSES[0].cls);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState("");

  const [students, setStudents] = useState<DbStudent[]>([]);
  const [marks, setMarks] = useState<Record<string, AttStatus>>({});

  const [studentsLoading, setStudentsLoading] = useState(true);
  const [attLoading, setAttLoading] = useState(false);
  const [summary, setSummary] = useState<ClassSummary[]>([]);
  const [saving, setSaving] = useState(false);
  const [flashSaved, setFlashSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Auth
  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserName(user.user_metadata?.name || "Admin");
    });
  }, []);

  // Load students when class changes
  useEffect(() => {
    setStudentsLoading(true);
    setMarks({});
    fetch(`/api/students?class=${encodeURIComponent(selectedCls)}`)
      .then(r => r.json())
      .then(data => { if (data.students) setStudents(data.students as DbStudent[]); })
      .finally(() => setStudentsLoading(false));
  }, [selectedCls]);

  // Load attendance when date or class changes (after students loaded)
  useEffect(() => {
    if (students.length === 0) return;
    setAttLoading(true);
    fetch(`/api/attendance?date=${selectedDate}&class=${encodeURIComponent(selectedCls)}`)
      .then(r => r.json())
      .then(data => {
        const list: { student_id: string; status: string }[] = data.attendance ?? [];
        const newMarks: Record<string, AttStatus> = {};
        for (const a of list) newMarks[a.student_id] = toMark(a.status);
        setMarks(newMarks);
      })
      .finally(() => setAttLoading(false));
  }, [selectedDate, selectedCls, students.length]);

  // Load all-class summary when date changes
  useEffect(() => {
    fetch(`/api/attendance?date=${selectedDate}`)
      .then(r => r.json())
      .then(data => {
        const all: { class: string; status: string }[] = data.attendance ?? [];
        const map: Record<string, ClassSummary> = {};
        for (const c of CLASSES) map[c.cls] = { cls: c.cls, present: 0, absent: 0, total: 0 };
        for (const rec of all) {
          if (rec.class in map) {
            map[rec.class].total++;
            if (rec.status === "present") map[rec.class].present++;
            if (rec.status === "absent")  map[rec.class].absent++;
          }
        }
        setSummary(Object.values(map));
      });
  }, [selectedDate]);

  const rows = students.map(s => ({ ...s, status: marks[s.id] ?? "P" as AttStatus }));
  const visible = rows.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_no.toLowerCase().includes(search.toLowerCase())
  );

  const present  = rows.filter(r => r.status === "P").length;
  const absent   = rows.filter(r => r.status === "A").length;
  const late     = rows.filter(r => r.status === "L").length;
  const total    = rows.length;

  function setMark(id: string, st: AttStatus) {
    setMarks(prev => ({ ...prev, [id]: st }));
  }

  function markAll(st: AttStatus) {
    const next: Record<string, AttStatus> = {};
    for (const s of students) next[s.id] = st;
    setMarks(next);
  }

  async function handleSave() {
    if (students.length === 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          class: selectedCls,
          records: rows.map(r => ({
            student_id: r.id,
            status: r.status === "P" ? "present" : r.status === "A" ? "absent" : r.status === "L" ? "late" : "present",
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setSaveError(err.error || "Failed to save");
        return;
      }
      setFlashSaved(true);
      setTimeout(() => setFlashSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  const classInfo = CLASSES.find(c => c.cls === selectedCls)!;

  return (
    <ERPShell role="admin" userName={userName}>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Attendance Management</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <input type="date" value={selectedDate}
            onChange={e => { setSelectedDate(e.target.value); setFlashSaved(false); }}
            className="px-3 py-2 rounded-xl text-sm"
            style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.09)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }}
          />
          <button type="button"
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full transition-all duration-200 hover:-translate-y-0.5"
            style={{ fontFamily: "var(--font-nunito)", background: "rgba(26,26,46,0.07)", color: "#1A1A2E" }}>
            <Download size={13} /> Export
          </button>
          <button type="button" onClick={handleSave} disabled={saving || studentsLoading}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-nunito)", background: flashSaved ? "#6BCB77" : "linear-gradient(135deg,#FF6B6B,#ff8e53)", boxShadow: "0 4px 14px rgba(255,107,107,0.30)" }}>
            {flashSaved ? <><CheckCircle size={13} /> Saved</> : saving ? "Saving…" : "Save Attendance"}
          </button>
        </div>
      </div>

      {/* Class tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
        {CLASSES.map(c => {
          const sum = summary.find(s => s.cls === c.cls);
          const absCnt = sum?.absent ?? 0;
          return (
            <button key={c.cls} type="button"
              onClick={() => { setSelectedCls(c.cls); setSearch(""); setFlashSaved(false); setSaveError(null); }}
              className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200"
              style={{
                fontFamily: "var(--font-nunito)",
                background: selectedCls === c.cls ? "linear-gradient(135deg,#FF6B6B,#ff8e53)" : "rgba(255,255,255,0.70)",
                color: selectedCls === c.cls ? "white" : "rgba(26,26,46,0.60)",
                boxShadow: selectedCls === c.cls ? "0 4px 14px rgba(255,107,107,0.25)" : "none",
                border: selectedCls === c.cls ? "none" : "1px solid rgba(255,255,255,0.60)",
              }}>
              {c.label}
              {absCnt > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                  style={{ background: selectedCls === c.cls ? "rgba(255,255,255,0.25)" : "rgba(255,107,107,0.12)", color: selectedCls === c.cls ? "white" : "#FF6B6B" }}>
                  {absCnt}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Present", value: present, color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
          { label: "Absent",  value: absent,  color: "#FF6B6B", bg: "rgba(255,107,107,0.10)" },
          { label: "Late",    value: late,    color: "#d97706", bg: "rgba(255,217,61,0.12)"  },
          { label: "Total",   value: total,   color: "#7c3aed", bg: "rgba(167,139,250,0.10)" },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>
              {studentsLoading ? "…" : s.value}
            </p>
            {s.label !== "Total" && total > 0 && (
              <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>
                {Math.round((s.value / total) * 100)}% of class
              </p>
            )}
          </div>
        ))}
      </div>

      {saveError && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl" style={{ background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.20)" }}>
          <AlertCircle size={13} style={{ color: "#FF6B6B" }} />
          <p className="text-xs" style={{ color: "#FF6B6B", fontFamily: "var(--font-inter)" }}>{saveError}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Student list */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{classInfo.label}</p>
              <p className="text-xs" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>Class Teacher: {classInfo.teacher}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={() => markAll("P")}
                className="text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
                style={{ background: "rgba(107,203,119,0.12)", color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
                All Present
              </button>
              <button type="button" onClick={() => markAll("A")}
                className="text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
                style={{ background: "rgba(255,107,107,0.10)", color: "#FF6B6B", fontFamily: "var(--font-nunito)" }}>
                All Absent
              </button>
            </div>
          </div>

          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(26,26,46,0.35)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search student name or roll…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
              style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.07)", fontFamily: "var(--font-inter)", color: "#1A1A2E", outline: "none" }}
            />
          </div>

          {(attLoading || studentsLoading) && (
            <p className="text-xs mb-3" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>Loading…</p>
          )}

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {visible.length === 0 && !studentsLoading ? (
              <p className="text-sm text-center py-8" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>No students found</p>
            ) : (
              visible.map(student => {
                const cfg = STATUS_CFG[student.status];
                return (
                  <div key={student.id}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all duration-150"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.color}20` }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: cfg.color, fontFamily: "var(--font-nunito)" }}>
                      {student.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-navy truncate" style={{ fontFamily: "var(--font-nunito)" }}>{student.name}</p>
                      <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{student.roll_no}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {(["P", "A", "L", "H"] as const).map(st => (
                        <button key={st} type="button" onClick={() => setMark(student.id, st)}
                          className="text-xs font-bold px-2 py-1 rounded-lg transition-all duration-150"
                          style={{
                            fontFamily: "var(--font-nunito)",
                            background: student.status === st ? STATUS_CFG[st].color : "rgba(26,26,46,0.05)",
                            color: student.status === st ? "white" : "rgba(26,26,46,0.40)",
                            transform: student.status === st ? "scale(1.05)" : "scale(1)",
                          }}>
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <p className="text-xs mt-3 text-center" style={{ color: "rgba(26,26,46,0.35)", fontFamily: "var(--font-nunito)" }}>
            P = Present · A = Absent · L = Late · H = Half Day
          </p>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Absentees */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-navy mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
              <XCircle size={14} style={{ color: "#FF6B6B" }} /> Absentees — {classInfo.label}
            </h3>
            <div className="space-y-2">
              {rows.filter(r => r.status === "A").length === 0 ? (
                <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>No absentees</p>
              ) : (
                rows.filter(r => r.status === "A").map(s => (
                  <div key={s.id} className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: "#FF6B6B", fontFamily: "var(--font-nunito)" }}>
                      {s.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-navy truncate" style={{ fontFamily: "var(--font-nunito)" }}>{s.name}</p>
                      <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{s.roll_no}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* All classes summary */}
          <div className="glass-card p-5" style={{ background: "rgba(107,203,119,0.06)" }}>
            <h3 className="text-sm font-bold text-navy mb-3" style={{ fontFamily: "var(--font-nunito)" }}>All Classes — Today</h3>
            {CLASSES.map(c => {
              const s = summary.find(x => x.cls === c.cls);
              const pres = s?.present ?? 0;
              const tot  = s?.total  ?? 0;
              const pct  = tot > 0 ? Math.round((pres / tot) * 100) : 0;
              return (
                <div key={c.cls} className="flex items-center gap-2 mb-2">
                  <p className="text-xs font-semibold w-20 flex-shrink-0" style={{ color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-nunito)" }}>{c.label}</p>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(26,26,46,0.07)" }}>
                    {tot > 0 && (
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: pct >= 90 ? "#6BCB77" : pct >= 75 ? "#d97706" : "#FF6B6B" }} />
                    )}
                  </div>
                  <p className="text-xs font-bold w-8 text-right flex-shrink-0"
                    style={{ color: tot === 0 ? "rgba(26,26,46,0.30)" : pct >= 90 ? "#6BCB77" : pct >= 75 ? "#d97706" : "#FF6B6B", fontFamily: "var(--font-nunito)" }}>
                    {tot === 0 ? "—" : `${pct}%`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ERPShell>
  );
}
