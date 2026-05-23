"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { Save, CheckCircle, Plus, Trash2 } from "lucide-react";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
const CLASSES_LIST = [
  { label: "Nursery A", cls: "Nursery", sec: "A" },
  { label: "LKG A",     cls: "LKG",     sec: "A" },
  { label: "UKG A",     cls: "UKG",     sec: "A" },
  { label: "JKG A",     cls: "JKG",     sec: "A" },
  { label: "SKG A",     cls: "SKG",     sec: "A" },
];
const SUBJECTS = ["English","Hindi","Mathematics","EVS","Art & Craft","GK","Music","Physical Education","Free Play","Break","Assembly","Story Time"];

interface Period { time: string; subject: string; teacher: string; }
type TT = Record<string, Period[]>; // day → periods

export default function AdminTimetablePage() {
  const [userName, setUserName] = useState("");
  const [classIdx, setClassIdx] = useState(0);
  const [tt, setTt] = useState<TT>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const selected = CLASSES_LIST[classIdx];

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => { if (user) setUserName(user.app_metadata?.name || user.user_metadata?.name || "Admin"); });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/timetable?class=${selected.cls}-${selected.sec}`)
      .then(r => r.json())
      .then(data => {
        const map: TT = {};
        for (const row of data.timetable ?? []) map[row.day] = row.periods ?? [];
        setTt(map);
        setLoading(false);
      });
  }, [classIdx]);

  function getPeriods(day: string): Period[] { return tt[day] ?? []; }
  function setPeriods(day: string, periods: Period[]) { setTt(p => ({ ...p, [day]: periods })); }
  function addPeriod(day: string) { setPeriods(day, [...getPeriods(day), { time: "", subject: "", teacher: "" }]); }
  function removePeriod(day: string, i: number) { setPeriods(day, getPeriods(day).filter((_, idx) => idx !== i)); }
  function updatePeriod(day: string, i: number, key: keyof Period, val: string) {
    setPeriods(day, getPeriods(day).map((p, idx) => idx === i ? { ...p, [key]: val } : p));
  }

  async function saveDay(day: string) {
    setSaving(day);
    await fetch("/api/timetable", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ class: selected.cls, section: selected.sec, day, periods: getPeriods(day) }),
    });
    setSaving(null); setSaved(day); setTimeout(() => setSaved(null), 2000);
  }

  return (
    <ERPShell role="admin" userName={userName}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Timetable</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>Set weekly schedule for each class</p>
      </div>

      <div className="flex gap-1 flex-wrap mb-6">
        {CLASSES_LIST.map((c, i) => (
          <button key={c.label} type="button" onClick={() => setClassIdx(i)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={{ background: classIdx === i ? "rgba(255,107,107,0.12)" : "rgba(26,26,46,0.05)", color: classIdx === i ? "#FF6B6B" : "rgba(26,26,46,0.50)", border: classIdx === i ? "1px solid rgba(255,107,107,0.25)" : "1px solid transparent", fontFamily: "var(--font-nunito)" }}>
            {c.label}
          </button>
        ))}
      </div>

      {loading ? <div className="glass-card p-10 text-center"><p className="text-sm" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>Loading…</p></div> : (
        <div className="space-y-4">
          {DAYS.map(day => {
            const periods = getPeriods(day);
            const isSaving = saving === day;
            const isSaved = saved === day;
            return (
              <div key={day} className="glass-card overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(26,26,46,0.06)" }}>
                  <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{day}</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => addPeriod(day)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
                      style={{ background: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>
                      <Plus size={11} /> Add Period
                    </button>
                    <button type="button" onClick={() => saveDay(day)} disabled={isSaving}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
                      style={{ background: isSaved ? "rgba(107,203,119,0.15)" : "rgba(26,26,46,0.10)", color: isSaved ? "#6BCB77" : "rgba(26,26,46,0.65)", fontFamily: "var(--font-nunito)" }}>
                      {isSaved ? <CheckCircle size={11} /> : <Save size={11} />}
                      {isSaving ? "Saving…" : isSaved ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {periods.length === 0 && <p className="text-xs text-center py-2" style={{ color: "rgba(26,26,46,0.35)", fontFamily: "var(--font-inter)" }}>No periods — click Add Period</p>}
                  {periods.map((p, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="text" placeholder="9:00–9:45" value={p.time} onChange={e => updatePeriod(day, i, "time", e.target.value)}
                        className="w-24 flex-shrink-0 px-2 py-1.5 rounded-lg text-xs"
                        style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "#1A1A2E" }} />
                      <select value={p.subject} onChange={e => updatePeriod(day, i, "subject", e.target.value)}
                        className="flex-1 px-2 py-1.5 rounded-lg text-xs"
                        style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "#1A1A2E" }}>
                        <option value="">Subject…</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input type="text" placeholder="Teacher…" value={p.teacher} onChange={e => updatePeriod(day, i, "teacher", e.target.value)}
                        className="flex-1 px-2 py-1.5 rounded-lg text-xs"
                        style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "#1A1A2E" }} />
                      <button type="button" onClick={() => removePeriod(day, i)} className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(255,107,107,0.10)", color: "#FF6B6B" }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ERPShell>
  );
}
