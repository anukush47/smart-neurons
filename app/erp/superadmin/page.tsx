"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ERPShell from "@/components/erp/ERPShell";
import { Building2, Users, GraduationCap, Activity, CheckCircle, AlertCircle, TrendingUp, Server } from "lucide-react";

const platformStats = [
  { label: "Active Schools", value: "3", icon: <Building2 size={20} />, color: "#1A1A2E", bg: "rgba(26,26,46,0.08)", trend: "+1 this month" },
  { label: "Total Students", value: "523", icon: <Users size={20} />, color: "#FF6B6B", bg: "rgba(255,107,107,0.10)", trend: "+24 this term" },
  { label: "Faculty Members", value: "41", icon: <GraduationCap size={20} />, color: "#6BCB77", bg: "rgba(107,203,119,0.10)", trend: "Across all schools" },
  { label: "Active Sessions", value: "42", icon: <Activity size={20} />, color: "#7c3aed", bg: "rgba(167,139,250,0.10)", trend: "Right now" },
];

const systemHealth = [
  { service: "API Gateway", status: "operational", latency: "42ms", uptime: "99.98%" },
  { service: "Database (PostgreSQL)", status: "operational", latency: "8ms", uptime: "99.99%" },
  { service: "Redis Cache", status: "operational", latency: "2ms", uptime: "100%" },
  { service: "File Storage (S3)", status: "operational", latency: "—", uptime: "99.99%" },
  { service: "Email Service", status: "operational", latency: "—", uptime: "99.95%" },
  { service: "Push Notifications", status: "degraded", latency: "340ms", uptime: "98.2%" },
];

const schools = [
  { name: "Smart Neurons – Jatkhedi", students: 156, faculty: 18, attendance: 89, status: "active" },
  { name: "Smart Neurons – Arera Colony", students: 203, faculty: 14, attendance: 92, status: "active" },
  { name: "Smart Neurons – Bhopal (New)", students: 164, faculty: 9, attendance: 85, status: "active" },
];

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState("");

  useEffect(() => {
    const role = sessionStorage.getItem("erp_role");
    const u = sessionStorage.getItem("erp_user");
    if (role !== "superadmin") { router.replace("/erp/login"); return; }
    setUser(u || "superadmin@smartneurons.in");
  }, [router]);

  return (
    <ERPShell role="superadmin" userName={user}>
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>
          Platform Overview
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>
          All schools · Real-time data · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {platformStats.map((s) => (
          <div key={s.label} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <TrendingUp size={13} style={{ color: "rgba(26,26,46,0.30)" }} />
            </div>
            <p className="text-2xl font-bold text-navy mb-0.5" style={{ fontFamily: "var(--font-nunito)" }}>{s.value}</p>
            <p className="text-xs font-semibold text-navy mb-1" style={{ fontFamily: "var(--font-nunito)" }}>{s.label}</p>
            <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{s.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
            <Server size={16} className="text-coral-500" /> System Health
          </h2>
          <div className="space-y-2.5">
            {systemHealth.map((s) => (
              <div key={s.service} className="flex items-center gap-3 py-2 px-3 rounded-xl" style={{ background: "rgba(255,255,255,0.50)" }}>
                {s.status === "operational"
                  ? <CheckCircle size={14} style={{ color: "#6BCB77", flexShrink: 0 }} />
                  : <AlertCircle size={14} style={{ color: "#FF6B6B", flexShrink: 0 }} />}
                <span className="flex-1 text-xs font-medium text-navy" style={{ fontFamily: "var(--font-inter)" }}>{s.service}</span>
                {s.latency !== "—" && (
                  <span className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{s.latency}</span>
                )}
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    fontFamily: "var(--font-nunito)",
                    background: s.status === "operational" ? "rgba(107,203,119,0.12)" : "rgba(255,107,107,0.10)",
                    color: s.status === "operational" ? "#6BCB77" : "#FF6B6B",
                  }}
                >
                  {s.uptime}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Schools */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
            <Building2 size={16} className="text-coral-500" /> Schools on Platform
          </h2>
          <div className="space-y-3">
            {schools.map((sc, i) => (
              <div key={sc.name} className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.60)" }}>
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{sc.name}</p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(107,203,119,0.12)", color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>Active</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-xs" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>{sc.students} students</span>
                  <span className="text-xs" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>{sc.faculty} faculty</span>
                  <span className="text-xs font-semibold" style={{ color: "#FF6B6B", fontFamily: "var(--font-nunito)" }}>{sc.attendance}% attendance</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ERPShell>
  );
}
