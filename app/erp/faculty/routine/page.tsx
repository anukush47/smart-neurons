"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ERPShell from "@/components/erp/ERPShell";
import {
  Camera, FileText, CheckSquare, CheckCircle,
  Clock, AlertCircle, ChevronDown, ChevronUp,
  MapPin, Upload, Save, Lock, Calendar,
} from "lucide-react";

type StepStatus = "pending" | "done" | "locked";

interface PeriodPlan {
  period: string;
  class: string;
  subject: string;
  plan: string;
  done: string;
}

interface PastEntry {
  date: string;
  presenceDone: boolean;
  planDone: boolean;
  workDone: boolean;
}

const SCHEDULE: PeriodPlan[] = [
  { period: "P1", class: "JKG-A",     subject: "English",  plan: "", done: "" },
  { period: "P2", class: "SKG-A",     subject: "Maths",    plan: "", done: "" },
  { period: "P3", class: "JKG-B",     subject: "English",  plan: "", done: "" },
  { period: "Break", class: "—",      subject: "Break",    plan: "—", done: "—" },
  { period: "P4", class: "Nursery-A", subject: "Rhymes",   plan: "", done: "" },
  { period: "P5", class: "JKG-A",     subject: "Drawing",  plan: "", done: "" },
  { period: "P6", class: "SKG-A",     subject: "English",  plan: "", done: "" },
];

const PAST: PastEntry[] = [
  { date: "2026-05-19", presenceDone: true, planDone: true,  workDone: true  },
  { date: "2026-05-18", presenceDone: true, planDone: true,  workDone: true  },
  { date: "2026-05-17", presenceDone: true, planDone: false, workDone: false },
  { date: "2026-05-16", presenceDone: true, planDone: true,  workDone: true  },
  { date: "2026-05-15", presenceDone: true, planDone: true,  workDone: true  },
];

const TODAY = new Date("2026-05-20").toLocaleDateString("en-IN", {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
});

export default function FacultyRoutinePage() {
  const router = useRouter();
  const [user, setUser] = useState("");

  // Step statuses
  const [presenceStatus, setPresenceStatus] = useState<StepStatus>("pending");
  const [planStatus, setPlanStatus]         = useState<StepStatus>("pending");
  const [workStatus, setWorkStatus]         = useState<StepStatus>("pending");

  // Presence photo
  const [photoPreview, setPhotoPreview]     = useState<string | null>(null);
  const [location, setLocation]             = useState<string | null>(null);
  const [locLoading, setLocLoading]         = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Work plan
  const [periods, setPeriods]               = useState<PeriodPlan[]>(SCHEDULE);
  const [planNote, setPlanNote]             = useState("");
  const [planSaved, setPlanSaved]           = useState(false);

  // Work done
  const [workPeriods, setWorkPeriods]       = useState<PeriodPlan[]>(SCHEDULE);
  const [workNote, setWorkNote]             = useState("");
  const [workSaved, setWorkSaved]           = useState(false);

  // Accordion
  const [openSection, setOpenSection]       = useState<"presence" | "plan" | "work" | null>("presence");
  const [showHistory, setShowHistory]       = useState(false);

  useEffect(() => {
    const role = sessionStorage.getItem("erp_role");
    const u = sessionStorage.getItem("erp_user");
    if (role !== "faculty") { router.replace("/erp/login"); return; }
    setUser(u || "Ms. Priya Sharma");
  }, []);

  // Simulated geolocation
  function getLocation() {
    setLocLoading(true);
    setTimeout(() => {
      setLocation("Smart Neurons Preschool, Jatkhedi, Bhopal (23.1765°N, 77.3963°E)");
      setLocLoading(false);
    }, 1400);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }

  function submitPresence() {
    if (!photoPreview || !location) return;
    setPresenceStatus("done");
    setOpenSection("plan");
  }

  function updatePlan(idx: number, val: string) {
    setPeriods(prev => prev.map((p, i) => i === idx ? { ...p, plan: val } : p));
  }

  function submitPlan() {
    setPlanStatus("done");
    setPlanSaved(true);
    setOpenSection("work");
    setTimeout(() => setPlanSaved(false), 2000);
  }

  function updateWork(idx: number, val: string) {
    setWorkPeriods(prev => prev.map((p, i) => i === idx ? { ...p, done: val } : p));
  }

  function submitWork() {
    setWorkStatus("done");
    setWorkSaved(true);
    setOpenSection(null);
    setTimeout(() => setWorkSaved(false), 2000);
  }

  const allDone = presenceStatus === "done" && planStatus === "done" && workStatus === "done";

  const STEPS = [
    {
      key: "presence" as const,
      label: "Presence Photo",
      sub: "Geo-tagged selfie from school",
      icon: <Camera size={18} />,
      color: "#FF6B6B",
      bg: "rgba(255,107,107,0.10)",
      status: presenceStatus,
      deadline: "Before first class",
    },
    {
      key: "plan" as const,
      label: "Daily Work Plan",
      sub: "Submit today's period-wise plan",
      icon: <FileText size={18} />,
      color: "#6BCB77",
      bg: "rgba(107,203,119,0.10)",
      status: planStatus,
      deadline: "Before 9:00 AM",
    },
    {
      key: "work" as const,
      label: "Work Done Report",
      sub: "What was covered in each period",
      icon: <CheckSquare size={18} />,
      color: "#7c3aed",
      bg: "rgba(167,139,250,0.10)",
      status: workStatus,
      deadline: "By 12:30 PM",
    },
  ];

  return (
    <ERPShell role="faculty" userName={user}>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Daily Routine</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>{TODAY}</p>
        </div>
        {allDone && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl"
            style={{ background: "rgba(107,203,119,0.12)", border: "1.5px solid rgba(107,203,119,0.30)" }}>
            <CheckCircle size={16} style={{ color: "#6BCB77" }} />
            <span className="text-sm font-bold" style={{ color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>All tasks complete!</span>
          </div>
        )}
      </div>

      {/* Progress strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {STEPS.map(step => (
          <button
            key={step.key}
            type="button"
            onClick={() => setOpenSection(openSection === step.key ? null : step.key)}
            className="glass-card p-4 text-left transition-all duration-150"
            style={{
              border: step.status === "done"
                ? `1.5px solid ${step.color}35`
                : openSection === step.key
                ? `1.5px solid ${step.color}50`
                : "1.5px solid rgba(255,255,255,0.60)",
              background: step.status === "done" ? `${step.color}08` : undefined,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: step.bg, color: step.color }}>
                {step.icon}
              </div>
              {step.status === "done"
                ? <CheckCircle size={16} style={{ color: step.color }} />
                : <Clock size={14} style={{ color: "rgba(26,26,46,0.30)" }} />}
            </div>
            <p className="text-xs font-bold text-navy leading-tight" style={{ fontFamily: "var(--font-nunito)" }}>{step.label}</p>
            <p className="text-xs mt-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{step.deadline}</p>
            <div className="mt-2">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: step.status === "done" ? `${step.color}15` : "rgba(26,26,46,0.06)",
                  color: step.status === "done" ? step.color : "rgba(26,26,46,0.40)",
                  fontFamily: "var(--font-nunito)",
                }}>
                {step.status === "done" ? "Done ✓" : "Pending"}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Incomplete alert */}
      {!allDone && (
        <div className="mb-5 p-4 rounded-2xl flex items-center gap-3"
          style={{ background: "rgba(255,107,107,0.07)", border: "1.5px solid rgba(255,107,107,0.20)" }}>
          <AlertCircle size={16} style={{ color: "#FF6B6B", flexShrink: 0 }} />
          <p className="text-sm" style={{ color: "rgba(26,26,46,0.65)", fontFamily: "var(--font-inter)" }}>
            <span className="font-bold text-navy">
              {STEPS.filter(s => s.status !== "done").length} task{STEPS.filter(s => s.status !== "done").length > 1 ? "s" : ""} remaining.
            </span>{" "}
            Complete all three before your day ends.
          </p>
        </div>
      )}

      {/* ─── SECTION: Presence Photo ─── */}
      {openSection === "presence" && (
        <div className="glass-card p-5 mb-4" style={{ border: "1.5px solid rgba(255,107,107,0.25)" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-navy flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
              <Camera size={15} style={{ color: "#FF6B6B" }} /> Presence Photo
            </h2>
            {presenceStatus === "done" && <CheckCircle size={16} style={{ color: "#6BCB77" }} />}
          </div>

          {presenceStatus === "done" ? (
            <div className="text-center py-4">
              <CheckCircle size={36} style={{ color: "#6BCB77", margin: "0 auto 12px" }} />
              <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Presence recorded!</p>
              <p className="text-xs mt-1" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>Photo submitted with location at 8:31 AM</p>
            </div>
          ) : (
            <>
              {/* Photo area */}
              <div
                className="rounded-2xl mb-4 overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-200 hover:opacity-90"
                style={{ background: "rgba(255,107,107,0.06)", border: "2px dashed rgba(255,107,107,0.25)", height: 180 }}
                onClick={() => fileRef.current?.click()}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Camera size={32} style={{ color: "rgba(255,107,107,0.40)", margin: "0 auto 8px" }} />
                    <p className="text-sm font-semibold" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>Click to upload selfie</p>
                    <p className="text-xs mt-1" style={{ color: "rgba(26,26,46,0.30)", fontFamily: "var(--font-inter)" }}>JPG, PNG · max 5 MB</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhotoChange} />

              {/* Geo tag */}
              <div className="mb-4">
                {location ? (
                  <div className="flex items-start gap-2 p-3 rounded-2xl"
                    style={{ background: "rgba(107,203,119,0.08)", border: "1px solid rgba(107,203,119,0.20)" }}>
                    <MapPin size={14} style={{ color: "#6BCB77", flexShrink: 0, marginTop: 1 }} />
                    <p className="text-xs" style={{ color: "rgba(26,26,46,0.65)", fontFamily: "var(--font-inter)" }}>{location}</p>
                  </div>
                ) : (
                  <button type="button" onClick={getLocation}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5"
                    style={{ background: "rgba(26,26,46,0.05)", color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-nunito)", border: "1.5px dashed rgba(26,26,46,0.15)" }}>
                    <MapPin size={15} />
                    {locLoading ? "Getting location…" : "Fetch Current Location"}
                  </button>
                )}
              </div>

              <button type="button" onClick={submitPresence}
                disabled={!photoPreview || !location}
                className="w-full py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{ background: "linear-gradient(135deg, #FF6B6B, #ff8e53)", boxShadow: "0 4px 14px rgba(255,107,107,0.28)", fontFamily: "var(--font-nunito)" }}>
                Submit Presence Photo
              </button>
              {(!photoPreview || !location) && (
                <p className="text-xs text-center mt-2" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>
                  {!photoPreview && !location ? "Upload photo and fetch location to continue" : !photoPreview ? "Upload a selfie to continue" : "Fetch location to continue"}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* ─── SECTION: Daily Work Plan ─── */}
      {openSection === "plan" && (
        <div className="glass-card p-5 mb-4" style={{ border: "1.5px solid rgba(107,203,119,0.25)" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-navy flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
              <FileText size={15} style={{ color: "#6BCB77" }} /> Daily Work Plan
            </h2>
            {planStatus === "done" && <CheckCircle size={16} style={{ color: "#6BCB77" }} />}
          </div>

          {planStatus === "done" ? (
            <div className="text-center py-4">
              <CheckCircle size={36} style={{ color: "#6BCB77", margin: "0 auto 12px" }} />
              <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Work plan submitted!</p>
              <p className="text-xs mt-1" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>Submitted at 8:47 AM · Visible to admin</p>
            </div>
          ) : (
            <>
              <p className="text-xs mb-4 leading-relaxed" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>
                Fill in what you plan to teach in each period today. This is reviewed by the principal.
              </p>

              <div className="space-y-2 mb-4">
                {periods.map((p, i) => {
                  if (p.period === "Break") {
                    return (
                      <div key={p.period} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                        style={{ background: "rgba(26,26,46,0.04)" }}>
                        <span className="text-xs font-bold w-6 text-center" style={{ color: "rgba(26,26,46,0.30)", fontFamily: "var(--font-nunito)" }}>—</span>
                        <p className="text-xs" style={{ color: "rgba(26,26,46,0.35)", fontFamily: "var(--font-inter)" }}>Break</p>
                      </div>
                    );
                  }
                  return (
                    <div key={p.period} className="flex items-start gap-3 p-3 rounded-2xl"
                      style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(26,26,46,0.06)" }}>
                      <div className="flex-shrink-0 pt-0.5">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-lg"
                          style={{ background: "rgba(107,203,119,0.12)", color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
                          {p.period}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-navy mb-1.5" style={{ fontFamily: "var(--font-nunito)" }}>
                          {p.class} · {p.subject}
                        </p>
                        <textarea
                          rows={2}
                          placeholder={`What will you teach in ${p.subject} today?`}
                          value={p.plan}
                          onChange={e => updatePlan(i, e.target.value)}
                          className="w-full px-3 py-2 rounded-xl text-xs resize-none"
                          style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.75)", lineHeight: 1.5 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold mb-1.5" htmlFor="plan-note"
                  style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>
                  Additional Notes (optional)
                </label>
                <textarea id="plan-note" rows={2} placeholder="Any special activities, events, or notes for today…"
                  value={planNote} onChange={e => setPlanNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm resize-none"
                  style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.75)" }}
                />
              </div>

              <button type="button" onClick={submitPlan}
                className="w-full py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #6BCB77, #4CAF50)", boxShadow: "0 4px 14px rgba(107,203,119,0.28)", fontFamily: "var(--font-nunito)" }}>
                {planSaved ? "Submitted ✓" : "Submit Work Plan"}
              </button>
            </>
          )}
        </div>
      )}

      {/* ─── SECTION: Work Done ─── */}
      {openSection === "work" && (
        <div className="glass-card p-5 mb-4" style={{ border: "1.5px solid rgba(124,58,237,0.25)" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-navy flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
              <CheckSquare size={15} style={{ color: "#7c3aed" }} /> Work Done Report
            </h2>
            {workStatus === "done" && <CheckCircle size={16} style={{ color: "#6BCB77" }} />}
          </div>

          {workStatus === "done" ? (
            <div className="text-center py-4">
              <CheckCircle size={36} style={{ color: "#6BCB77", margin: "0 auto 12px" }} />
              <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Work done report submitted!</p>
              <p className="text-xs mt-1" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>Submitted at 12:28 PM · Visible to admin</p>
            </div>
          ) : (
            <>
              <p className="text-xs mb-4 leading-relaxed" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>
                Report what was actually covered in each period today. Compared against your work plan by the admin.
              </p>

              <div className="space-y-2 mb-4">
                {workPeriods.map((p, i) => {
                  if (p.period === "Break") {
                    return (
                      <div key={p.period} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                        style={{ background: "rgba(26,26,46,0.04)" }}>
                        <span className="text-xs font-bold w-6 text-center" style={{ color: "rgba(26,26,46,0.30)", fontFamily: "var(--font-nunito)" }}>—</span>
                        <p className="text-xs" style={{ color: "rgba(26,26,46,0.35)", fontFamily: "var(--font-inter)" }}>Break</p>
                      </div>
                    );
                  }
                  // Show plan as reference if available
                  const planRef = periods[i]?.plan;
                  return (
                    <div key={p.period} className="p-3 rounded-2xl"
                      style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(26,26,46,0.06)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-lg"
                          style={{ background: "rgba(124,58,237,0.10)", color: "#7c3aed", fontFamily: "var(--font-nunito)" }}>
                          {p.period}
                        </span>
                        <p className="text-xs font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>
                          {p.class} · {p.subject}
                        </p>
                      </div>
                      {planRef && (
                        <p className="text-xs mb-1.5 italic" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>
                          Plan: {planRef}
                        </p>
                      )}
                      <textarea
                        rows={2}
                        placeholder="What was actually covered?"
                        value={p.done}
                        onChange={e => updateWork(i, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs resize-none"
                        style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.75)", lineHeight: 1.5 }}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold mb-1.5" htmlFor="work-note"
                  style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>
                  End-of-Day Remarks
                </label>
                <textarea id="work-note" rows={2}
                  placeholder="Any observations, student behaviour, or notes for the admin…"
                  value={workNote} onChange={e => setWorkNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm resize-none"
                  style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.75)" }}
                />
              </div>

              <button type="button" onClick={submitWork}
                className="w-full py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", boxShadow: "0 4px 14px rgba(124,58,237,0.28)", fontFamily: "var(--font-nunito)" }}>
                {workSaved ? "Submitted ✓" : "Submit Work Done Report"}
              </button>
            </>
          )}
        </div>
      )}

      {/* Completion banner */}
      {allDone && (
        <div className="glass-card p-5 mb-5 flex items-center gap-4"
          style={{ background: "rgba(107,203,119,0.08)", border: "1.5px solid rgba(107,203,119,0.30)" }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: "rgba(107,203,119,0.15)" }}>
            🎉
          </div>
          <div>
            <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>All done for today!</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>
              Presence photo, work plan, and work done report have all been submitted and are visible to the admin.
            </p>
          </div>
        </div>
      )}

      {/* History */}
      <div className="glass-card p-5">
        <button type="button" className="w-full flex items-center justify-between"
          onClick={() => setShowHistory(h => !h)}>
          <h2 className="text-sm font-bold text-navy flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
            <Calendar size={14} style={{ color: "#d97706" }} /> Past 5 Days
          </h2>
          {showHistory
            ? <ChevronUp size={15} style={{ color: "rgba(26,26,46,0.40)" }} />
            : <ChevronDown size={15} style={{ color: "rgba(26,26,46,0.40)" }} />}
        </button>

        {showHistory && (
          <div className="mt-4 space-y-2">
            {PAST.map(entry => {
              const complete = entry.presenceDone && entry.planDone && entry.workDone;
              const d = new Date(entry.date);
              return (
                <div key={entry.date} className="flex items-center gap-4 px-3 py-3 rounded-2xl"
                  style={{ background: complete ? "rgba(107,203,119,0.07)" : "rgba(255,107,107,0.06)", border: `1px solid ${complete ? "rgba(107,203,119,0.18)" : "rgba(255,107,107,0.15)"}` }}>
                  <div className="flex-shrink-0 text-center min-w-[44px]">
                    <p className="text-xs font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>
                      {d.toLocaleDateString("en-IN", { weekday: "short" })}
                    </p>
                    <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
                      {d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>

                  <div className="flex-1 flex items-center gap-3">
                    {[
                      { label: "Photo",    done: entry.presenceDone, color: "#FF6B6B" },
                      { label: "Plan",     done: entry.planDone,     color: "#6BCB77" },
                      { label: "Report",   done: entry.workDone,     color: "#7c3aed" },
                    ].map(t => (
                      <div key={t.label} className="flex items-center gap-1.5">
                        {t.done
                          ? <CheckCircle size={13} style={{ color: t.color }} />
                          : <AlertCircle size={13} style={{ color: "#FF6B6B" }} />}
                        <span className="text-xs" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>{t.label}</span>
                      </div>
                    ))}
                  </div>

                  <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: complete ? "rgba(107,203,119,0.12)" : "rgba(255,107,107,0.10)",
                      color: complete ? "#6BCB77" : "#FF6B6B",
                      fontFamily: "var(--font-nunito)",
                    }}>
                    {complete ? "Complete" : "Incomplete"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ERPShell>
  );
}
