"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { ChevronDown, ChevronUp, Plus, Search } from "lucide-react";

interface School {
  id: string;
  name: string;
  city: string;
  state: string;
  principal: string;
  students: number;
  staff: number;
  plan: "Starter" | "Growth" | "Enterprise";
  status: "active" | "inactive" | "trial";
  joinedOn: string;
  dueDate: string;
}

const SCHOOLS: School[] = [
  { id: "S1", name: "Smart Neurons Preschool",       city: "Bhopal",     state: "MP",   principal: "Mrs. Sunita Verma",   students: 180, staff: 22, plan: "Enterprise", status: "active",   joinedOn: "Apr 2023", dueDate: "Mar 2027" },
  { id: "S2", name: "Little Stars Play School",      city: "Indore",     state: "MP",   principal: "Mr. Rajesh Gupta",    students: 95,  staff: 12, plan: "Growth",     status: "active",   joinedOn: "Jun 2023", dueDate: "May 2025" },
  { id: "S3", name: "Sunshine Kidz Academy",         city: "Pune",       state: "MH",   principal: "Ms. Priya Joshi",     students: 210, staff: 28, plan: "Enterprise", status: "active",   joinedOn: "Jan 2024", dueDate: "Dec 2025" },
  { id: "S4", name: "Rainbow Montessori",            city: "Nagpur",     state: "MH",   principal: "Mrs. Anita Sharma",   students: 60,  staff: 8,  plan: "Starter",    status: "trial",    joinedOn: "May 2026", dueDate: "Jun 2026" },
  { id: "S5", name: "Tiny Tots Learning Centre",    city: "Jaipur",     state: "RJ",   principal: "Mr. Vikram Singh",    students: 130, staff: 16, plan: "Growth",     status: "active",   joinedOn: "Aug 2023", dueDate: "Jul 2025" },
  { id: "S6", name: "Blossom Tree Nursery",          city: "Lucknow",    state: "UP",   principal: "Mrs. Kavita Yadav",   students: 45,  staff: 6,  plan: "Starter",    status: "inactive", joinedOn: "Mar 2024", dueDate: "Feb 2025" },
];

const PLAN_COLOR: Record<string, { color: string; bg: string }> = {
  Starter:    { color: "rgba(26,26,46,0.55)", bg: "rgba(26,26,46,0.08)" },
  Growth:     { color: "#d97706",             bg: "rgba(217,119,6,0.10)" },
  Enterprise: { color: "#7c3aed",             bg: "rgba(124,58,237,0.10)" },
};
const STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  active:   { color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
  trial:    { color: "#d97706", bg: "rgba(217,119,6,0.10)" },
  inactive: { color: "#FF6B6B", bg: "rgba(255,107,107,0.10)" },
};

export default function SuperAdminSchoolsPage() {
  const [user, setUser] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUser(user.user_metadata?.name || "Super Admin");
    });
  }, []);

  const filtered = SCHOOLS.filter(s => {
    if (statusFilter !== "All" && s.status !== statusFilter.toLowerCase()) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalStudents = SCHOOLS.reduce((a, s) => a + s.students, 0);
  const totalStaff    = SCHOOLS.reduce((a, s) => a + s.staff, 0);
  const active        = SCHOOLS.filter(s => s.status === "active").length;

  return (
    <ERPShell role="superadmin" userName={user}>
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Schools</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
            All onboarded schools on the Smart Neurons platform
          </p>
        </div>
        <button type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg,#1A1A2E,#2d2d4e)", color: "white", boxShadow: "0 3px 10px rgba(26,26,46,0.25)", fontFamily: "var(--font-nunito)" }}>
          <Plus size={15} /> Onboard School
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Schools",   value: SCHOOLS.length, color: "#1A1A2E" },
          { label: "Active",          value: active,          color: "#6BCB77" },
          { label: "Total Students",  value: totalStudents,   color: "#7c3aed" },
          { label: "Total Staff",     value: totalStaff,      color: "#d97706" },
        ].map(c => (
          <div key={c.label} className="glass-card p-4">
            <p className="text-2xl font-bold" style={{ color: c.color, fontFamily: "var(--font-nunito)" }}>{c.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(26,26,46,0.35)" }} />
          <input type="text" placeholder="Search by name or city…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl text-sm"
            style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }} />
        </div>
        {["All", "Active", "Trial", "Inactive"].map(s => (
          <button key={s} type="button" onClick={() => setStatusFilter(s)}
            className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: statusFilter === s ? "rgba(26,26,46,0.12)" : "rgba(26,26,46,0.05)",
              color: statusFilter === s ? "#1A1A2E" : "rgba(26,26,46,0.45)",
              border: statusFilter === s ? "1px solid rgba(26,26,46,0.20)" : "1px solid transparent",
              fontFamily: "var(--font-nunito)",
            }}>{s}</button>
        ))}
      </div>

      {/* School list */}
      <div className="space-y-2">
        {filtered.map(s => {
          const open = expanded === s.id;
          const pc = PLAN_COLOR[s.plan];
          const sc = STATUS_COLOR[s.status];
          return (
            <div key={s.id} className="glass-card overflow-hidden">
              <button type="button" onClick={() => setExpanded(open ? null : s.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: "rgba(26,26,46,0.06)" }}>🏫</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{s.name}</p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.color, fontFamily: "var(--font-nunito)" }}>{s.status}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: pc.bg, color: pc.color, fontFamily: "var(--font-nunito)" }}>{s.plan}</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
                    {s.city}, {s.state} · {s.students} students · {s.staff} staff
                  </p>
                </div>
                {open ? <ChevronUp size={16} style={{ color: "rgba(26,26,46,0.35)" }} /> : <ChevronDown size={16} style={{ color: "rgba(26,26,46,0.35)" }} />}
              </button>
              {open && (
                <div className="px-4 pb-4 grid sm:grid-cols-3 gap-3" style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
                  <div className="pt-3">
                    <p className="text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-nunito)" }}>PRINCIPAL</p>
                    <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{s.principal}</p>
                  </div>
                  <div className="pt-3">
                    <p className="text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-nunito)" }}>JOINED</p>
                    <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{s.joinedOn}</p>
                  </div>
                  <div className="pt-3">
                    <p className="text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-nunito)" }}>RENEWAL</p>
                    <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{s.dueDate}</p>
                  </div>
                  <div className="sm:col-span-3 flex gap-2 pt-1">
                    <button type="button" className="px-3 py-1.5 rounded-lg text-xs font-bold"
                      style={{ background: "rgba(26,26,46,0.07)", color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>
                      View ERP
                    </button>
                    <button type="button" className="px-3 py-1.5 rounded-lg text-xs font-bold"
                      style={{ background: "rgba(124,58,237,0.10)", color: "#7c3aed", fontFamily: "var(--font-nunito)" }}>
                      Edit Plan
                    </button>
                    {s.status === "active" && (
                      <button type="button" className="px-3 py-1.5 rounded-lg text-xs font-bold"
                        style={{ background: "rgba(255,107,107,0.10)", color: "#FF6B6B", fontFamily: "var(--font-nunito)" }}>
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ERPShell>
  );
}
