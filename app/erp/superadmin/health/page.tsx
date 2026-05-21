"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";

interface Service {
  name: string;
  status: "operational" | "degraded" | "down";
  latency: string;
  uptime: string;
  lastChecked: string;
}

const SERVICES: Service[] = [
  { name: "Web App (Vercel)",         status: "operational", latency: "42ms",  uptime: "99.98%", lastChecked: "Just now" },
  { name: "API Server (ECS Fargate)", status: "operational", latency: "88ms",  uptime: "99.95%", lastChecked: "Just now" },
  { name: "PostgreSQL (RDS Mumbai)",  status: "operational", latency: "12ms",  uptime: "99.99%", lastChecked: "Just now" },
  { name: "Redis (ElastiCache)",      status: "operational", latency: "4ms",   uptime: "100%",   lastChecked: "Just now" },
  { name: "AWS S3 + CloudFront",      status: "operational", latency: "18ms",  uptime: "99.99%", lastChecked: "Just now" },
  { name: "Firebase FCM (Push)",      status: "degraded",    latency: "340ms", uptime: "98.10%", lastChecked: "2m ago" },
  { name: "Razorpay Payments",        status: "operational", latency: "210ms", uptime: "99.90%", lastChecked: "Just now" },
  { name: "MSG91 (SMS)",              status: "operational", latency: "180ms", uptime: "99.80%", lastChecked: "Just now" },
  { name: "SendGrid (Email)",         status: "operational", latency: "95ms",  uptime: "99.85%", lastChecked: "Just now" },
  { name: "BullMQ (Job Queue)",       status: "operational", latency: "6ms",   uptime: "99.92%", lastChecked: "Just now" },
];

const STATUS_META = {
  operational: { label: "Operational", color: "#6BCB77", bg: "rgba(107,203,119,0.10)", icon: <CheckCircle size={13} /> },
  degraded:    { label: "Degraded",    color: "#d97706", bg: "rgba(217,119,6,0.10)",   icon: <AlertTriangle size={13} /> },
  down:        { label: "Down",        color: "#FF6B6B", bg: "rgba(255,107,107,0.10)", icon: <AlertTriangle size={13} /> },
};

const INCIDENTS = [
  { id: "I1", service: "Firebase FCM", title: "Elevated push notification latency", severity: "minor", start: "May 20, 2026 · 11:40 AM", status: "Monitoring", color: "#d97706", bg: "rgba(217,119,6,0.08)" },
  { id: "I2", service: "PostgreSQL",   title: "Scheduled maintenance completed",    severity: "none",  start: "May 18, 2026 · 2:00 AM",  status: "Resolved",   color: "#6BCB77", bg: "rgba(107,203,119,0.08)" },
];

export default function SuperAdminHealthPage() {
  const [user, setUser] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUser(user.user_metadata?.name || "Super Admin");
    });
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }

  const operational = SERVICES.filter(s => s.status === "operational").length;
  const degraded    = SERVICES.filter(s => s.status === "degraded").length;
  const overallOk   = degraded === 0;

  return (
    <ERPShell role="superadmin" userName={user}>
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>System Health</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
            Real-time status of all platform services
          </p>
        </div>
        <button type="button" onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
          style={{ background: "rgba(26,26,46,0.07)", color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-nunito)" }}>
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Overall banner */}
      <div className="glass-card p-5 mb-5 flex items-center gap-4"
        style={{ border: `1.5px solid ${overallOk ? "rgba(107,203,119,0.25)" : "rgba(217,119,6,0.25)"}` }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: overallOk ? "rgba(107,203,119,0.12)" : "rgba(217,119,6,0.12)" }}>
          {overallOk ? "✅" : "⚠️"}
        </div>
        <div>
          <p className="text-base font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>
            {overallOk ? "All Systems Operational" : `${degraded} Service${degraded > 1 ? "s" : ""} Degraded`}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
            {operational}/{SERVICES.length} services healthy · Last checked: {refreshing ? "Checking…" : "Just now"}
          </p>
        </div>
      </div>

      {/* Services */}
      <div className="glass-card overflow-hidden mb-4">
        <p className="text-sm font-bold text-navy px-5 pt-4 pb-3" style={{ fontFamily: "var(--font-nunito)" }}>Services</p>
        <div className="divide-y" style={{ borderColor: "rgba(26,26,46,0.06)" }}>
          {SERVICES.map(s => {
            const meta = STATUS_META[s.status];
            return (
              <div key={s.name} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{s.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>
                    Latency {s.latency} · Uptime {s.uptime} · {s.lastChecked}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: meta.bg, color: meta.color, fontFamily: "var(--font-nunito)" }}>
                  <span style={{ color: meta.color }}>{meta.icon}</span>
                  {meta.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incidents */}
      <div className="glass-card p-5">
        <p className="text-sm font-bold text-navy mb-3" style={{ fontFamily: "var(--font-nunito)" }}>Recent Incidents</p>
        <div className="space-y-2">
          {INCIDENTS.map(i => (
            <div key={i.id} className="px-4 py-3 rounded-xl"
              style={{ background: i.bg, border: `1px solid ${i.color}25` }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{i.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
                    {i.service} · {i.start}
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: `${i.color}18`, color: i.color, fontFamily: "var(--font-nunito)" }}>
                  {i.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ERPShell>
  );
}
