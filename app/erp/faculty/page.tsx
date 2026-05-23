"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { Clock, CheckCircle, AlertCircle, BookOpen, Users, Camera, FileText, CheckSquare } from "lucide-react";

interface PendingItem {
  student: string;
  hwTitle: string;
  subject: string;
  dueDate: string;
}

export default function FacultyDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [classLabel, setClassLabel] = useState("");
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserName(user.app_metadata?.name || user.user_metadata?.name || "Faculty");
      const ca = user.app_metadata?.class_assigned ?? "";
      setClassLabel(ca.replace("-", " "));
    });

    fetch("/api/homework")
      .then(r => r.json())
      .then(data => {
        if (!data.homework) return;
        const items: PendingItem[] = [];
        for (const hw of data.homework) {
          for (const sub of (hw.homework_submissions ?? [])) {
            if (sub.status === "pending") {
              items.push({
                student: sub.students?.name ?? "Unknown",
                hwTitle: hw.title,
                subject: hw.subject,
                dueDate: hw.due_date,
              });
            }
          }
        }
        setPendingItems(items);
      })
      .finally(() => setLoading(false));
  }, []);

  const routineStatus = { presence: true, workPlan: true, workDone: false };
  const allDone = routineStatus.presence && routineStatus.workPlan && routineStatus.workDone;

  return (
    <ERPShell role="faculty" userName={userName}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Good morning!</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          {classLabel ? ` · ${classLabel}` : ""}
        </p>
      </div>

      {!allDone && (
        <div className="mb-6 p-4 rounded-2xl flex items-start gap-3"
          style={{ background: "linear-gradient(135deg, rgba(255,107,107,0.10), rgba(255,217,61,0.10))", border: "1.5px solid rgba(255,107,107,0.22)" }}>
          <AlertCircle size={18} style={{ color: "#FF6B6B", flexShrink: 0, marginTop: 2 }} />
          <div className="flex-1">
            <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Complete your daily routine</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-inter)" }}>
              Presence photo, work plan, and work done are pending. Complete before your first class.
            </p>
          </div>
          <button type="button"
            className="text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "#FF6B6B", color: "white", fontFamily: "var(--font-nunito)" }}>
            Complete Now
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Daily Routine */}
        <div className="glass-card p-6 lg:col-span-1">
          <h2 className="text-sm font-bold text-navy mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
            <Clock size={15} /> Daily Routine
          </h2>
          <div className="space-y-3">
            {[
              { key: "presence", label: "Presence Photo",   sub: "Geo-tagged selfie",  done: routineStatus.presence,  icon: <Camera size={16} />,      color: "#FF6B6B", bg: "rgba(255,107,107,0.10)" },
              { key: "workPlan", label: "Daily Work Plan",  sub: "Submit before 9 AM", done: routineStatus.workPlan,  icon: <FileText size={16} />,    color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
              { key: "workDone", label: "Work Done Report", sub: "Submit by 12:30 PM", done: routineStatus.workDone,  icon: <CheckSquare size={16} />, color: "#7c3aed", bg: "rgba(167,139,250,0.10)" },
            ].map(item => (
              <div key={item.key}
                className="flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: item.done ? item.bg : "rgba(255,255,255,0.60)", border: `1.5px solid ${item.done ? item.color + "33" : "rgba(255,255,255,0.60)"}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg, color: item.color }}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{item.label}</p>
                  <p className="text-xs" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>{item.sub}</p>
                </div>
                {item.done
                  ? <CheckCircle size={16} style={{ color: item.color, flexShrink: 0 }} />
                  : <div className="w-4 h-4 rounded-full border-2 flex-shrink-0" style={{ borderColor: "rgba(26,26,46,0.20)" }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Pending Homework */}
        <div className="glass-card p-6 lg:col-span-2">
          <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
            <BookOpen size={15} /> Homework — Pending Submissions
            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,107,107,0.12)", color: "#FF6B6B" }}>
              {loading ? "…" : `${pendingItems.length} pending`}
            </span>
          </h2>

          {loading ? (
            <p className="text-sm" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>Loading…</p>
          ) : pendingItems.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{ background: "rgba(107,203,119,0.10)" }}>
                <CheckCircle size={18} style={{ color: "#6BCB77" }} />
              </div>
              <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>All caught up!</p>
              <p className="text-xs mt-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>No pending submissions from your class.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {pendingItems.map((h, i) => (
                <div key={i} className="p-4 rounded-2xl"
                  style={{ background: "rgba(255,107,107,0.06)", border: "1px solid rgba(255,107,107,0.15)" }}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{h.student}</p>
                    <AlertCircle size={13} style={{ color: "#FF6B6B" }} />
                  </div>
                  <p className="text-xs mb-1" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>{h.subject}</p>
                  <p className="text-xs mb-2 leading-snug" style={{ color: "rgba(26,26,46,0.70)", fontFamily: "var(--font-inter)" }}>{h.hwTitle}</p>
                  <p className="text-xs font-semibold" style={{ color: "#FF6B6B", fontFamily: "var(--font-nunito)" }}>
                    Due: {new Date(h.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              ))}
            </div>
          )}

          <button type="button"
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
            onClick={() => router.push("/erp/faculty/attendance")}
            style={{ fontFamily: "var(--font-nunito)", background: "linear-gradient(135deg, #FF6B6B, #ff8e53)", color: "white", boxShadow: "0 4px 16px rgba(255,107,107,0.25)" }}>
            <Users size={15} /> Mark Attendance
          </button>
        </div>
      </div>
    </ERPShell>
  );
}
