"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ERPShell from "@/components/erp/ERPShell";
import { CheckCircle, AlertCircle, CreditCard, BookOpen, Bell, Calendar, Star, ChevronRight, MessageSquare } from "lucide-react";

const attendance = [
  { day: "Mon", date: "12", status: "present" },
  { day: "Tue", date: "13", status: "present" },
  { day: "Wed", date: "14", status: "absent" },
  { day: "Thu", date: "15", status: "present" },
  { day: "Fri", date: "16", status: "present" },
  { day: "Sat", date: "17", status: "holiday" },
  { day: "Sun", date: "18", status: "holiday" },
];

const homeworkList = [
  { subject: "English", title: "Draw your favourite animal", due: "Today", type: "Drawing", status: "pending" },
  { subject: "Maths", title: "Count objects around the house", due: "Tomorrow", type: "Activity", status: "pending" },
  { subject: "Hindi", title: "Revise vowels (अ, आ, इ, ई)", due: "May 22", type: "Oral", status: "submitted" },
];

const announcements = [
  { title: "School closed on May 21", tag: "Holiday", time: "2 hours ago", color: "#d97706" },
  { title: "Annual Sports Day — May 28", tag: "Event", time: "Yesterday", color: "#7c3aed" },
  { title: "Fee reminder: June installment due Jun 1", tag: "Fee", time: "2 days ago", color: "#FF6B6B" },
];

const feeSummary = {
  nextDue: "June 1, 2026",
  amount: "₹4,500",
  daysLeft: 12,
  lastPaid: "₹4,500 on May 1",
};

export default function ParentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [childName] = useState("Aarav");
  const [childClass] = useState("JKG-A");
  const [childAge] = useState("4 yrs");

  useEffect(() => {
    const role = sessionStorage.getItem("erp_role");
    const u = sessionStorage.getItem("erp_user");
    if (role !== "parent") { router.replace("/erp/login"); return; }
    setUser(u || "+91 XXXXX XXXXX");
  }, []);

  return (
    <ERPShell role="parent" userName={user}>
      {/* Child selector + Greeting */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>
            Hello! 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>
            Here's what's happening with {childName} today.
          </p>
        </div>

        {/* Child card */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: "rgba(255,217,61,0.12)",
            border: "1.5px solid rgba(255,217,61,0.30)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: "rgba(255,217,61,0.20)" }}
          >
            🧒
          </div>
          <div>
            <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{childName}</p>
            <p className="text-xs" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>{childClass} · {childAge}</p>
          </div>
          <ChevronRight size={14} style={{ color: "rgba(26,26,46,0.30)" }} />
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Today",
            value: "Present ✅",
            sub: "Marked at 8:42 AM",
            color: "#6BCB77",
            bg: "rgba(107,203,119,0.10)",
          },
          {
            label: "This Month",
            value: "18/20 days",
            sub: "90% attendance",
            color: "#FF6B6B",
            bg: "rgba(255,107,107,0.08)",
          },
          {
            label: "Homework Due",
            value: "2 pending",
            sub: "Due today & tomorrow",
            color: "#d97706",
            bg: "rgba(255,217,61,0.12)",
          },
          {
            label: "Next Fee",
            value: feeSummary.amount,
            sub: `Due in ${feeSummary.daysLeft} days`,
            color: "#7c3aed",
            bg: "rgba(167,139,250,0.10)",
          },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-xs font-semibold mb-2" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>{s.label}</p>
            <p className="text-sm font-bold text-navy mb-0.5" style={{ fontFamily: "var(--font-nunito)" }}>{s.value}</p>
            <p className="text-xs" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Attendance this week */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
            <Calendar size={15} className="text-coral-500" /> This Week
          </h2>
          <div className="flex gap-2">
            {attendance.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>{d.day}</p>
                <div
                  className="w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold"
                  style={{
                    fontFamily: "var(--font-nunito)",
                    background:
                      d.status === "present"
                        ? "rgba(107,203,119,0.15)"
                        : d.status === "absent"
                        ? "rgba(255,107,107,0.12)"
                        : "rgba(26,26,46,0.05)",
                    color:
                      d.status === "present"
                        ? "#6BCB77"
                        : d.status === "absent"
                        ? "#FF6B6B"
                        : "rgba(26,26,46,0.30)",
                  }}
                >
                  {d.status === "present" ? "✓" : d.status === "absent" ? "✗" : "–"}
                </div>
                <p className="text-xs" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-nunito)" }}>{d.date}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            {[["#6BCB77", "Present"], ["#FF6B6B", "Absent"], ["rgba(26,26,46,0.20)", "Holiday"]].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                <span className="text-xs" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Homework */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
            <BookOpen size={15} className="text-coral-500" /> Homework
          </h2>
          <div className="space-y-2.5">
            {homeworkList.map((h, i) => (
              <div
                key={h.subject}
                className="p-3.5 rounded-2xl"
                style={{
                  background: h.status === "submitted" ? "rgba(107,203,119,0.07)" : "rgba(255,255,255,0.60)",
                  border: `1px solid ${h.status === "submitted" ? "rgba(107,203,119,0.20)" : "rgba(255,255,255,0.60)"}`,
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{h.title}</p>
                  {h.status === "submitted"
                    ? <CheckCircle size={13} style={{ color: "#6BCB77", flexShrink: 0 }} />
                    : <AlertCircle size={13} style={{ color: "#d97706", flexShrink: 0 }} />}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(255,107,107,0.10)", color: "#FF6B6B", fontFamily: "var(--font-nunito)" }}
                  >
                    {h.subject}
                  </span>
                  <span className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>Due {h.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fee + Chat */}
        <div className="space-y-4">
          {/* Fee card */}
          <div
            className="glass-card p-5"
            style={{ background: "rgba(167,139,250,0.06)" }}
          >
            <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
              <CreditCard size={15} style={{ color: "#7c3aed" }} /> Fee Due
            </h2>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{feeSummary.amount}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
                  Due: {feeSummary.nextDue}
                </p>
              </div>
              <div
                className="text-2xl w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(167,139,250,0.12)" }}
              >
                💳
              </div>
            </div>
            <button
              type="button"
              className="w-full py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{
                fontFamily: "var(--font-nunito)",
                background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                boxShadow: "0 4px 16px rgba(124,58,237,0.25)",
              }}
            >
              Pay Now via Razorpay
            </button>
            <p className="text-xs mt-2 text-center" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>
              Last paid: {feeSummary.lastPaid}
            </p>
          </div>

          {/* Chat with teacher */}
          <div className="glass-card p-5">
            <h2 className="text-sm font-bold text-navy mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
              <MessageSquare size={15} className="text-coral-500" /> Class Teacher
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: "rgba(107,203,119,0.10)" }}
              >
                👩‍🏫
              </div>
              <div>
                <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Ms. Priya Sharma</p>
                <p className="text-xs" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>JKG-A · Class Teacher</p>
              </div>
            </div>
            <button
              type="button"
              className="w-full py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
              style={{
                fontFamily: "var(--font-nunito)",
                background: "rgba(107,203,119,0.10)",
                color: "#6BCB77",
                border: "1.5px solid rgba(107,203,119,0.25)",
              }}
            >
              Send Message
            </button>
          </div>
        </div>

        {/* Announcements */}
        <div className="glass-card p-6 lg:col-span-3">
          <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
            <Bell size={15} className="text-coral-500" /> Latest Announcements
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {announcements.map((a, i) => (
              <div
                key={a.title}
                className="p-4 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.60)",
                  border: "1px solid rgba(255,255,255,0.60)",
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${a.color}15`, color: a.color, fontFamily: "var(--font-nunito)" }}
                  >
                    {a.tag}
                  </span>
                  <span className="text-xs" style={{ color: "rgba(26,26,46,0.35)", fontFamily: "var(--font-inter)" }}>{a.time}</span>
                </div>
                <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-inter)" }}>{a.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ERPShell>
  );
}
