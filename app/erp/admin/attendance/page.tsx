"use client";

import { useState, useEffect } from "react";
import ERPShell from "@/components/erp/ERPShell";
import { CheckCircle, XCircle, Clock, AlertCircle, Download, Users, ChevronDown, Search } from "lucide-react";

type Status = "present" | "absent" | "late" | "half";

interface Student {
  id: number;
  name: string;
  roll: string;
  status: Status;
}

const classOptions = [
  { id: "pg-a", label: "Playgroup A", teacher: "Ms. Kavita Singh" },
  { id: "nur-a", label: "Nursery A", teacher: "Ms. Priya Sharma" },
  { id: "nur-b", label: "Nursery B", teacher: "Mr. Suresh Yadav" },
  { id: "jkg-a", label: "JKG A", teacher: "Ms. Anita Patel" },
  { id: "jkg-b", label: "JKG B", teacher: "Mr. Rahul Verma" },
  { id: "skg-a", label: "SKG A", teacher: "Ms. Deepa Mehta" },
];

const allStudents: Record<string, Student[]> = {
  "pg-a": [
    { id: 1, name: "Aarav Sharma", roll: "PGA-01", status: "present" },
    { id: 2, name: "Aanya Patel", roll: "PGA-02", status: "present" },
    { id: 3, name: "Vivaan Singh", roll: "PGA-03", status: "absent" },
    { id: 4, name: "Ira Gupta", roll: "PGA-04", status: "present" },
    { id: 5, name: "Kabir Mehta", roll: "PGA-05", status: "late" },
    { id: 6, name: "Mira Joshi", roll: "PGA-06", status: "present" },
    { id: 7, name: "Rehan Khan", roll: "PGA-07", status: "present" },
    { id: 8, name: "Tara Nair", roll: "PGA-08", status: "present" },
    { id: 9, name: "Yash Verma", roll: "PGA-09", status: "absent" },
    { id: 10, name: "Zara Ali", roll: "PGA-10", status: "present" },
  ],
  "nur-a": [
    { id: 11, name: "Ananya Sharma", roll: "NRA-01", status: "present" },
    { id: 12, name: "Dev Patel", roll: "NRA-02", status: "absent" },
    { id: 13, name: "Ishaan Gupta", roll: "NRA-03", status: "present" },
    { id: 14, name: "Kiara Singh", roll: "NRA-04", status: "present" },
    { id: 15, name: "Laksh Verma", roll: "NRA-05", status: "late" },
    { id: 16, name: "Meera Jain", roll: "NRA-06", status: "present" },
    { id: 17, name: "Neil Mehta", roll: "NRA-07", status: "present" },
    { id: 18, name: "Ora Kapoor", roll: "NRA-08", status: "present" },
    { id: 19, name: "Prisha Sharma", roll: "NRA-09", status: "present" },
    { id: 20, name: "Riya Gupta", roll: "NRA-10", status: "absent" },
    { id: 21, name: "Sai Reddy", roll: "NRA-11", status: "present" },
    { id: 22, name: "Tiya Nair", roll: "NRA-12", status: "present" },
  ],
  "nur-b": [
    { id: 23, name: "Arjun Singh", roll: "NRB-01", status: "present" },
    { id: 24, name: "Bhavya Patel", roll: "NRB-02", status: "present" },
    { id: 25, name: "Chetan Verma", roll: "NRB-03", status: "late" },
    { id: 26, name: "Diya Sharma", roll: "NRB-04", status: "present" },
    { id: 27, name: "Eshan Gupta", roll: "NRB-05", status: "present" },
    { id: 28, name: "Fatima Khan", roll: "NRB-06", status: "absent" },
    { id: 29, name: "Gautam Joshi", roll: "NRB-07", status: "present" },
    { id: 30, name: "Hana Mehta", roll: "NRB-08", status: "present" },
    { id: 31, name: "Ishan Roy", roll: "NRB-09", status: "present" },
    { id: 32, name: "Jiya Nair", roll: "NRB-10", status: "present" },
    { id: 33, name: "Krish Kapoor", roll: "NRB-11", status: "present" },
    { id: 34, name: "Lavnya Reddy", roll: "NRB-12", status: "half" },
  ],
  "jkg-a": [
    { id: 35, name: "Manav Sharma", roll: "JKA-01", status: "present" },
    { id: 36, name: "Navya Patel", roll: "JKA-02", status: "present" },
    { id: 37, name: "Om Gupta", roll: "JKA-03", status: "present" },
    { id: 38, name: "Pari Singh", roll: "JKA-04", status: "absent" },
    { id: 39, name: "Qian Verma", roll: "JKA-05", status: "present" },
    { id: 40, name: "Radha Mehta", roll: "JKA-06", status: "present" },
    { id: 41, name: "Samar Joshi", roll: "JKA-07", status: "late" },
    { id: 42, name: "Tanya Kapoor", roll: "JKA-08", status: "present" },
    { id: 43, name: "Uday Reddy", roll: "JKA-09", status: "present" },
    { id: 44, name: "Veda Nair", roll: "JKA-10", status: "present" },
    { id: 45, name: "Wren Khan", roll: "JKA-11", status: "present" },
    { id: 46, name: "Xia Roy", roll: "JKA-12", status: "absent" },
    { id: 47, name: "Yuvaan Sharma", roll: "JKA-13", status: "present" },
    { id: 48, name: "Zoya Patel", roll: "JKA-14", status: "present" },
  ],
  "jkg-b": [
    { id: 49, name: "Aarush Singh", roll: "JKB-01", status: "present" },
    { id: 50, name: "Bela Gupta", roll: "JKB-02", status: "present" },
    { id: 51, name: "Cyrus Mehta", roll: "JKB-03", status: "present" },
    { id: 52, name: "Drishti Joshi", roll: "JKB-04", status: "late" },
    { id: 53, name: "Ekam Kapoor", roll: "JKB-05", status: "present" },
    { id: 54, name: "Freya Nair", roll: "JKB-06", status: "absent" },
    { id: 55, name: "Gaurav Verma", roll: "JKB-07", status: "present" },
    { id: 56, name: "Hiya Reddy", roll: "JKB-08", status: "present" },
    { id: 57, name: "Inaaya Khan", roll: "JKB-09", status: "present" },
    { id: 58, name: "Jayden Roy", roll: "JKB-10", status: "present" },
    { id: 59, name: "Kavya Sharma", roll: "JKB-11", status: "present" },
    { id: 60, name: "Leo Patel", roll: "JKB-12", status: "absent" },
    { id: 61, name: "Maya Singh", roll: "JKB-13", status: "present" },
    { id: 62, name: "Neel Gupta", roll: "JKB-14", status: "present" },
  ],
  "skg-a": [
    { id: 63, name: "Ojas Mehta", roll: "SKA-01", status: "present" },
    { id: 64, name: "Pihu Joshi", roll: "SKA-02", status: "present" },
    { id: 65, name: "Qais Kapoor", roll: "SKA-03", status: "absent" },
    { id: 66, name: "Reva Nair", roll: "SKA-04", status: "present" },
    { id: 67, name: "Shiv Reddy", roll: "SKA-05", status: "present" },
    { id: 68, name: "Tara Verma", roll: "SKA-06", status: "present" },
    { id: 69, name: "Uday Khan", roll: "SKA-07", status: "late" },
    { id: 70, name: "Vanya Roy", roll: "SKA-08", status: "present" },
    { id: 71, name: "Wisha Sharma", roll: "SKA-09", status: "present" },
    { id: 72, name: "Yash Patel", roll: "SKA-10", status: "present" },
    { id: 73, name: "Zahra Singh", roll: "SKA-11", status: "present" },
    { id: 74, name: "Aadi Gupta", roll: "SKA-12", status: "half" },
    { id: 75, name: "Bia Mehta", roll: "SKA-13", status: "absent" },
    { id: 76, name: "Cyra Joshi", roll: "SKA-14", status: "present" },
  ],
};

const weekTrend = [
  { day: "Mon", pct: 94 }, { day: "Tue", pct: 91 }, { day: "Wed", pct: 88 },
  { day: "Thu", pct: 93 }, { day: "Fri", pct: 87 },
];

const statusConfig: Record<Status, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  present: { label: "Present", color: "#6BCB77", bg: "rgba(107,203,119,0.12)", icon: <CheckCircle size={14} /> },
  absent:  { label: "Absent",  color: "#FF6B6B", bg: "rgba(255,107,107,0.12)", icon: <XCircle size={14} /> },
  late:    { label: "Late",    color: "#d97706", bg: "rgba(255,217,61,0.18)",   icon: <Clock size={14} /> },
  half:    { label: "Half Day",color: "#7c3aed", bg: "rgba(167,139,250,0.12)", icon: <AlertCircle size={14} /> },
};

export default function AdminAttendancePage() {
  const [selectedClass, setSelectedClass] = useState("nur-a");
  const [students, setStudents] = useState<Record<string, Student[]>>(allStudents);
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [liveData, setLiveData] = useState<{ student_id: string; status: string; students: { name: string; class: string; section: string } }[]>([]);

  async function fetchAttendance(date: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?date=${date}`);
      if (res.ok) {
        const { attendance } = await res.json();
        setLiveData(attendance);
        // Merge live DB statuses into displayed students
        setStudents(prev => {
          const updated = { ...prev };
          for (const [cls, list] of Object.entries(updated)) {
            updated[cls] = list.map(s => {
              const match = attendance.find(
                (a: { students?: { name?: string }; status: string }) =>
                  a.students?.name === s.name
              );
              if (match) {
                return { ...s, status: match.status as typeof s.status };
              }
              return s;
            });
          }
          return updated;
        });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAttendance(selectedDate); }, [selectedDate]);

  const classInfo = classOptions.find(c => c.id === selectedClass)!;
  const list = (students[selectedClass] || []).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    present: students[selectedClass]?.filter(s => s.status === "present").length ?? 0,
    absent:  students[selectedClass]?.filter(s => s.status === "absent").length ?? 0,
    late:    students[selectedClass]?.filter(s => s.status === "late").length ?? 0,
    half:    students[selectedClass]?.filter(s => s.status === "half").length ?? 0,
    total:   students[selectedClass]?.length ?? 0,
  };

  const setStatus = (id: number, status: Status) => {
    setSaved(false);
    setStudents(prev => ({
      ...prev,
      [selectedClass]: prev[selectedClass].map(s => s.id === id ? { ...s, status } : s),
    }));
  };

  const markAll = (status: Status) => {
    setSaved(false);
    setStudents(prev => ({
      ...prev,
      [selectedClass]: prev[selectedClass].map(s => ({ ...s, status })),
    }));
  };

  async function handleSaveAttendance() {
    const classStudents = students[selectedClass] ?? [];
    if (classStudents.length === 0) return;
    setSaving(true);
    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          class: selectedClass,
          records: classStudents
            .filter(s => s.status !== ("—" as string) && s.status !== ("-" as string))
            .map(s => ({
              student_id: String(s.id),
              status: s.status === "present" ? "present"
                     : s.status === "absent" ? "absent"
                     : s.status === "late" ? "late"
                     : "present",
            })),
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ERPShell role="admin" userName="admin@smartneurons.in">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>
            Attendance Management
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm"
            style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.09)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }} />
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full transition-all duration-200 hover:-translate-y-0.5"
            style={{ fontFamily: "var(--font-nunito)", background: "rgba(26,26,46,0.07)", color: "#1A1A2E" }}
          >
            <Download size={13} /> Export
          </button>
          <button
            type="button"
            onClick={handleSaveAttendance}
            disabled={saving}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-nunito)", background: saved ? "#6BCB77" : "linear-gradient(135deg,#FF6B6B,#ff8e53)", boxShadow: "0 4px 14px rgba(255,107,107,0.30)" }}
          >
            {saved ? <><CheckCircle size={13} /> Saved</> : saving ? "Saving…" : "Save Attendance"}
          </button>
        </div>
      </div>

      {/* Class tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide">
        {classOptions.map(c => {
          const st = students[c.id] ?? [];
          const absCnt = st.filter(s => s.status === "absent").length;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => { setSelectedClass(c.id); setSearch(""); setSaved(false); }}
              className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200"
              style={{
                fontFamily: "var(--font-nunito)",
                background: selectedClass === c.id ? "linear-gradient(135deg,#FF6B6B,#ff8e53)" : "rgba(255,255,255,0.70)",
                color: selectedClass === c.id ? "white" : "rgba(26,26,46,0.60)",
                boxShadow: selectedClass === c.id ? "0 4px 14px rgba(255,107,107,0.25)" : "none",
                border: selectedClass === c.id ? "none" : "1px solid rgba(255,255,255,0.60)",
              }}
            >
              {c.label}
              {absCnt > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs" style={{ background: selectedClass === c.id ? "rgba(255,255,255,0.25)" : "rgba(255,107,107,0.12)", color: selectedClass === c.id ? "white" : "#FF6B6B" }}>
                  {absCnt}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {([
          { key: "present", label: "Present", value: stats.present, color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
          { key: "absent",  label: "Absent",  value: stats.absent,  color: "#FF6B6B", bg: "rgba(255,107,107,0.10)" },
          { key: "late",    label: "Late",    value: stats.late,    color: "#d97706", bg: "rgba(255,217,61,0.12)" },
          { key: "total",   label: "Total",   value: stats.total,   color: "#7c3aed", bg: "rgba(167,139,250,0.10)" },
        ] as const).map(s => (
          <div key={s.key} className="glass-card p-4">
            <p className="text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>{s.value}</p>
            {s.key !== "total" && (
              <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>
                {Math.round((s.value / stats.total) * 100)}% of class
              </p>
            )}
          </div>
        ))}
      </div>

      {liveData.length > 0 && (
        <div className="glass-card p-4 mb-4">
          <p className="text-sm font-bold text-navy mb-2" style={{ fontFamily: "var(--font-nunito)" }}>
            Live — {new Date(selectedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </p>
          <div className="flex gap-4 flex-wrap">
            {["present","absent","late"].map(s => {
              const count = liveData.filter(r => r.status === s).length;
              const colors: Record<string, string> = { present: "#6BCB77", absent: "#FF6B6B", late: "#d97706" };
              return (
                <div key={s} className="text-center">
                  <p className="text-xl font-bold" style={{ color: colors[s], fontFamily: "var(--font-nunito)" }}>{count}</p>
                  <p className="text-xs capitalize" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{s}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(124,58,237,0.30)", borderTopColor: "#7c3aed" }} />
          <span className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>Loading attendance…</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Student list */}
        <div className="lg:col-span-2 glass-card p-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{classInfo.label}</p>
              <p className="text-xs" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>Class Teacher: {classInfo.teacher}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={() => markAll("present")} className="text-xs font-bold px-3 py-1.5 rounded-full transition-colors" style={{ background: "rgba(107,203,119,0.12)", color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>All Present</button>
              <button type="button" onClick={() => markAll("absent")} className="text-xs font-bold px-3 py-1.5 rounded-full transition-colors" style={{ background: "rgba(255,107,107,0.10)", color: "#FF6B6B", fontFamily: "var(--font-nunito)" }}>All Absent</button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(26,26,46,0.35)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search student name or roll…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
              style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.07)", fontFamily: "var(--font-inter)", color: "#1A1A2E", outline: "none" }}
            />
          </div>

          {/* List */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {list.map(student => {
              const cfg = statusConfig[student.status];
              return (
                <div
                  key={student.id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all duration-150"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.color}20` }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: cfg.color, fontFamily: "var(--font-nunito)" }}
                  >
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-navy truncate" style={{ fontFamily: "var(--font-nunito)" }}>{student.name}</p>
                    <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{student.roll}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {(["present", "absent", "late", "half"] as Status[]).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(student.id, s)}
                        className="text-xs font-bold px-2 py-1 rounded-lg transition-all duration-150"
                        style={{
                          fontFamily: "var(--font-nunito)",
                          background: student.status === s ? statusConfig[s].color : "rgba(26,26,46,0.05)",
                          color: student.status === s ? "white" : "rgba(26,26,46,0.40)",
                          transform: student.status === s ? "scale(1.05)" : "scale(1)",
                        }}
                      >
                        {s === "present" ? "P" : s === "absent" ? "A" : s === "late" ? "L" : "H"}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs mt-3 text-center" style={{ color: "rgba(26,26,46,0.35)", fontFamily: "var(--font-nunito)" }}>
            P = Present · A = Absent · L = Late · H = Half Day
          </p>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Weekly trend */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-navy mb-4" style={{ fontFamily: "var(--font-nunito)" }}>This Week — School Avg</h3>
            <div className="flex items-end gap-2 h-24">
              {weekTrend.map(d => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                  <p className="text-xs font-bold" style={{ color: d.pct >= 90 ? "#6BCB77" : "#FF6B6B", fontFamily: "var(--font-nunito)" }}>{d.pct}%</p>
                  <div
                    className="w-full rounded-lg transition-all duration-300"
                    style={{
                      height: `${(d.pct / 100) * 64}px`,
                      background: d.pct >= 90 ? "rgba(107,203,119,0.50)" : "rgba(255,107,107,0.40)",
                      minHeight: 8,
                    }}
                  />
                  <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>{d.day}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Absent list */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-navy mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
              <XCircle size={14} style={{ color: "#FF6B6B" }} /> Absentees Today
            </h3>
            <div className="space-y-2">
              {Object.entries(allStudents).flatMap(([cls, studs]) =>
                studs.filter(s => s.status === "absent").map(s => ({
                  ...s,
                  cls: classOptions.find(c => c.id === cls)?.label ?? cls,
                }))
              ).slice(0, 8).map(s => (
                <div key={s.id} className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: "#FF6B6B", fontFamily: "var(--font-nunito)" }}>
                    {s.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-navy truncate" style={{ fontFamily: "var(--font-nunito)" }}>{s.name}</p>
                    <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{s.cls}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overall today */}
          <div className="glass-card p-5" style={{ background: "rgba(107,203,119,0.06)" }}>
            <h3 className="text-sm font-bold text-navy mb-3" style={{ fontFamily: "var(--font-nunito)" }}>All Classes — Today</h3>
            {classOptions.map(c => {
              const st = allStudents[c.id] ?? [];
              const pres = st.filter(s => s.status === "present").length;
              const pct = Math.round((pres / st.length) * 100);
              return (
                <div key={c.id} className="flex items-center gap-2 mb-2">
                  <p className="text-xs font-semibold w-20 flex-shrink-0" style={{ color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-nunito)" }}>{c.label}</p>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(26,26,46,0.07)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: pct >= 90 ? "#6BCB77" : pct >= 75 ? "#d97706" : "#FF6B6B" }}
                    />
                  </div>
                  <p className="text-xs font-bold w-8 text-right flex-shrink-0" style={{ color: pct >= 90 ? "#6BCB77" : pct >= 75 ? "#d97706" : "#FF6B6B", fontFamily: "var(--font-nunito)" }}>{pct}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ERPShell>
  );
}
