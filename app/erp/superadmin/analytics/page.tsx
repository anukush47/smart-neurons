"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ERPShell from "@/components/erp/ERPShell";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const REVENUE = [38000, 42000, 39000, 55000, 61000, 58000];
const SCHOOLS_GROWTH = [3, 3, 4, 5, 5, 6];
const STUDENTS_GROWTH = [410, 430, 480, 590, 650, 720];

function fmt(n: number) { return "₹" + (n / 1000).toFixed(0) + "k"; }

export default function SuperAdminAnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [period, setPeriod] = useState<"6m" | "1y">("6m");

  useEffect(() => {
    const role = sessionStorage.getItem("erp_role");
    const u = sessionStorage.getItem("erp_user");
    if (role !== "superadmin") { router.replace("/erp/login"); return; }
    setUser(u || "Super Admin");
  }, []);

  const maxRevenue = Math.max(...REVENUE);

  return (
    <ERPShell role="superadmin" userName={user}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Analytics</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          Platform-wide performance metrics
        </p>
      </div>

      {/* Period toggle */}
      <div className="flex gap-2 mb-6">
        {(["6m", "1y"] as const).map(p => (
          <button key={p} type="button" onClick={() => setPeriod(p)}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: period === p ? "rgba(26,26,46,0.12)" : "rgba(26,26,46,0.05)",
              color: period === p ? "#1A1A2E" : "rgba(26,26,46,0.45)",
              border: period === p ? "1.5px solid rgba(26,26,46,0.20)" : "1.5px solid transparent",
              fontFamily: "var(--font-nunito)",
            }}>{p === "6m" ? "Last 6 Months" : "Last 12 Months"}</button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "MRR",             value: "₹61,000",  change: "+12%", up: true,  color: "#6BCB77" },
          { label: "ARR",             value: "₹7.3L",    change: "+28%", up: true,  color: "#7c3aed" },
          { label: "Active Schools",  value: "5",        change: "+1",   up: true,  color: "#1A1A2E" },
          { label: "Churn Rate",      value: "0%",       change: "0",    up: true,  color: "#d97706" },
        ].map(k => (
          <div key={k.label} className="glass-card p-4">
            <p className="text-xl font-bold" style={{ color: k.color, fontFamily: "var(--font-nunito)" }}>{k.value}</p>
            <p className="text-xs mt-0.5 mb-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{k.label}</p>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: k.up ? "rgba(107,203,119,0.12)" : "rgba(255,107,107,0.12)", color: k.up ? "#6BCB77" : "#FF6B6B", fontFamily: "var(--font-nunito)" }}>
              {k.change}
            </span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Revenue chart */}
        <div className="glass-card p-5">
          <p className="text-sm font-bold text-navy mb-4" style={{ fontFamily: "var(--font-nunito)" }}>Monthly Revenue</p>
          <div className="flex items-end gap-2 h-36">
            {MONTHS.map((m, i) => (
              <div key={m} className="flex-1 flex flex-col items-center gap-1">
                <p className="text-xs font-bold" style={{ color: "#1A1A2E", fontFamily: "var(--font-nunito)" }}>{fmt(REVENUE[i])}</p>
                <div className="w-full rounded-t-lg transition-all duration-500"
                  style={{ height: `${(REVENUE[i] / maxRevenue) * 90}px`, background: i === MONTHS.length - 1 ? "linear-gradient(to top,#1A1A2E,#2d2d4e)" : "rgba(26,26,46,0.12)" }} />
                <p className="text-xs" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>{m}</p>
              </div>
            ))}
          </div>
        </div>

        {/* School & student growth */}
        <div className="glass-card p-5">
          <p className="text-sm font-bold text-navy mb-4" style={{ fontFamily: "var(--font-nunito)" }}>Growth — Schools & Students</p>
          <div className="space-y-3 mb-4">
            {MONTHS.map((m, i) => (
              <div key={m} className="flex items-center gap-3">
                <span className="text-xs w-8 flex-shrink-0" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>{m}</span>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 rounded-full" style={{ width: `${(SCHOOLS_GROWTH[i] / 6) * 100}%`, background: "#1A1A2E", minWidth: 8 }} />
                    <span className="text-xs font-bold" style={{ color: "#1A1A2E", fontFamily: "var(--font-nunito)" }}>{SCHOOLS_GROWTH[i]} schools</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 rounded-full" style={{ width: `${(STUDENTS_GROWTH[i] / 720) * 100}%`, background: "#7c3aed", minWidth: 8 }} />
                    <span className="text-xs font-bold" style={{ color: "#7c3aed", fontFamily: "var(--font-nunito)" }}>{STUDENTS_GROWTH[i]} students</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plan breakdown */}
      <div className="glass-card p-5">
        <p className="text-sm font-bold text-navy mb-4" style={{ fontFamily: "var(--font-nunito)" }}>Plan Distribution</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { plan: "Starter",    count: 2, pct: 33, color: "rgba(26,26,46,0.50)", bg: "rgba(26,26,46,0.08)" },
            { plan: "Growth",     count: 2, pct: 33, color: "#d97706",             bg: "rgba(217,119,6,0.10)" },
            { plan: "Enterprise", count: 2, pct: 34, color: "#7c3aed",             bg: "rgba(124,58,237,0.10)" },
          ].map(p => (
            <div key={p.plan} className="rounded-xl p-4 text-center" style={{ background: p.bg }}>
              <p className="text-2xl font-bold mb-1" style={{ color: p.color, fontFamily: "var(--font-nunito)" }}>{p.count}</p>
              <p className="text-sm font-bold mb-1" style={{ color: p.color, fontFamily: "var(--font-nunito)" }}>{p.plan}</p>
              <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{p.pct}% of schools</p>
            </div>
          ))}
        </div>
      </div>
    </ERPShell>
  );
}
