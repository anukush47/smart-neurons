"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import {
  Search, Filter, X, ChevronDown, ChevronUp,
  Phone, User, Calendar, MapPin, Users, Download,
  Plus, CheckCircle, AlertCircle,
} from "lucide-react";

type Gender = "M" | "F";
type BloodGroup = "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";
type Status = "active" | "inactive";

interface Student {
  id: number;
  name: string;
  rollNo: string;
  class: string;
  section: string;
  dob: string;
  gender: Gender;
  blood: BloodGroup;
  parentName: string;
  parentPhone: string;
  address: string;
  admissionDate: string;
  status: Status;
  fees: "paid" | "due" | "partial";
  avatar: string; // emoji
}

const CLASSES = ["All", "Nursery", "LKG", "UKG", "JKG", "SKG"];
const SECTIONS: Record<string, string[]> = {
  Nursery: ["A"], LKG: ["A"], UKG: ["A"], JKG: ["A"], SKG: ["A"],
};

const RAW_STUDENTS: Omit<Student, "id" | "rollNo" | "avatar">[] = [
  // Nursery A — Teacher: Aarav Kumar
  { name: "Aarav Sharma",   class: "Nursery", section: "A", dob: "2022-03-15", gender: "M", blood: "A+",  parentName: "Mr. Raj Sharma",      parentPhone: "9876543210", address: "18, MP Nagar, Bhopal",      admissionDate: "2025-04-01", status: "active", fees: "paid"    },
  { name: "Priya Verma",    class: "Nursery", section: "A", dob: "2022-07-22", gender: "F", blood: "B+",  parentName: "Mrs. Sunita Verma",   parentPhone: "8765432109", address: "6, Lalghati, Bhopal",       admissionDate: "2025-04-01", status: "active", fees: "paid"    },
  { name: "Rohan Patel",    class: "Nursery", section: "A", dob: "2022-01-10", gender: "M", blood: "O+",  parentName: "Mr. Dinesh Patel",    parentPhone: "7654321098", address: "31, Bittan Market, Bhopal", admissionDate: "2025-04-01", status: "active", fees: "due"     },

  // LKG A — Teacher: Neha Sharma
  { name: "Sneha Gupta",    class: "LKG",     section: "A", dob: "2021-05-18", gender: "F", blood: "A+",  parentName: "Mr. Anil Gupta",      parentPhone: "6543210987", address: "2, Shivaji Nagar, Bhopal",  admissionDate: "2024-04-01", status: "active", fees: "paid"    },
  { name: "Aditya Singh",   class: "LKG",     section: "A", dob: "2021-09-30", gender: "M", blood: "O+",  parentName: "Mrs. Kavita Singh",   parentPhone: "5432109876", address: "16, Arera Colony, Bhopal",  admissionDate: "2024-04-01", status: "active", fees: "paid"    },
  { name: "Kavya Nair",     class: "LKG",     section: "A", dob: "2021-12-25", gender: "F", blood: "B+",  parentName: "Mr. Suresh Nair",     parentPhone: "4321098765", address: "41, Tulsi Nagar, Bhopal",   admissionDate: "2024-04-01", status: "active", fees: "due"     },

  // UKG A — Teacher: Rohan Singh
  { name: "Rahul Mehta",    class: "UKG",     section: "A", dob: "2020-08-14", gender: "M", blood: "B+",  parentName: "Mr. Vijay Mehta",     parentPhone: "3210987654", address: "8, Sehore Road, Bhopal",    admissionDate: "2023-04-01", status: "active", fees: "paid"    },
  { name: "Ananya Das",     class: "UKG",     section: "A", dob: "2020-04-20", gender: "F", blood: "A-",  parentName: "Mrs. Priyanka Das",   parentPhone: "2109876543", address: "21, Awadhpuri, Bhopal",     admissionDate: "2023-04-01", status: "active", fees: "paid"    },
  { name: "Vivek Joshi",    class: "UKG",     section: "A", dob: "2020-11-05", gender: "M", blood: "O+",  parentName: "Mr. Ramesh Joshi",    parentPhone: "1098765432", address: "13, Nehru Nagar, Bhopal",   admissionDate: "2023-04-01", status: "active", fees: "partial" },

  // JKG A — Teacher: Priya Patel
  { name: "Isha Kapoor",    class: "JKG",     section: "A", dob: "2021-02-28", gender: "F", blood: "AB+", parentName: "Mrs. Meena Kapoor",   parentPhone: "9987654321", address: "7, Chuna Bhatti, Bhopal",   admissionDate: "2024-04-01", status: "active", fees: "paid"    },
  { name: "Arjun Rao",      class: "JKG",     section: "A", dob: "2021-06-15", gender: "M", blood: "O-",  parentName: "Mr. Krishna Rao",     parentPhone: "8876543210", address: "23, Katara Hills, Bhopal",  admissionDate: "2024-04-01", status: "active", fees: "paid"    },
  { name: "Meera Iyer",     class: "JKG",     section: "A", dob: "2021-10-08", gender: "F", blood: "B-",  parentName: "Mrs. Lakshmi Iyer",   parentPhone: "7765432109", address: "10, Indrapuri, Bhopal",     admissionDate: "2024-04-01", status: "active", fees: "due"     },

  // SKG A — Teacher: Vikram Verma
  { name: "Siddharth Jain", class: "SKG",     section: "A", dob: "2020-01-20", gender: "M", blood: "A+",  parentName: "Mr. Mahesh Jain",     parentPhone: "6654321098", address: "37, Misrod, Bhopal",        admissionDate: "2023-04-01", status: "active", fees: "paid"    },
  { name: "Pooja Malhotra", class: "SKG",     section: "A", dob: "2020-06-12", gender: "F", blood: "B+",  parentName: "Mrs. Ritu Malhotra",  parentPhone: "5543210987", address: "3, New Market, Bhopal",     admissionDate: "2023-04-01", status: "active", fees: "paid"    },
  { name: "Kunal Mishra",   class: "SKG",     section: "A", dob: "2020-09-18", gender: "M", blood: "O+",  parentName: "Mr. Shiv Mishra",     parentPhone: "4432109876", address: "44, Lalghati, Bhopal",      admissionDate: "2023-04-01", status: "active", fees: "partial" },
];

const STUDENTS: Student[] = RAW_STUDENTS.map((s, i) => ({
  ...s,
  id: i + 1,
  rollNo: `SN${String(i + 1).padStart(3, "0")}`,
  avatar: s.gender === "F"
    ? (i % 2 === 0 ? "👧" : "🧒‍♀️")
    : (i % 2 === 0 ? "👦" : "🧒"),
}));

const FEE_STYLE = {
  paid:    { label: "Paid",    bg: "rgba(107,203,119,0.12)", color: "#6BCB77" },
  due:     { label: "Due",     bg: "rgba(255,107,107,0.12)", color: "#FF6B6B" },
  partial: { label: "Partial", bg: "rgba(255,217,61,0.15)",  color: "#d97706" },
};

export default function AdminStudentsPage() {
  const [user, setUser] = useState("");
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [sectionFilter, setSectionFilter] = useState("All");
  const [feeFilter, setFeeFilter] = useState("All");
  const [selected, setSelected] = useState<Student | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUser(user.user_metadata?.name || "Admin");
    });
  }, []);

  const sections = classFilter !== "All"
    ? ["All", ...(SECTIONS[classFilter] ?? [])]
    : ["All"];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return STUDENTS.filter(s => {
      if (classFilter !== "All" && s.class !== classFilter) return false;
      if (sectionFilter !== "All" && s.section !== sectionFilter) return false;
      if (feeFilter !== "All" && s.fees !== feeFilter.toLowerCase()) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.rollNo.toLowerCase().includes(q) && !s.parentName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, classFilter, sectionFilter, feeFilter]);

  // Stats
  const total   = STUDENTS.length;
  const active  = STUDENTS.filter(s => s.status === "active").length;
  const feeDue  = STUDENTS.filter(s => s.fees === "due").length;
  const byClass = CLASSES.slice(1).map(c => ({
    label: c,
    count: STUDENTS.filter(s => s.class === c).length,
  }));

  function clearFilters() {
    setSearch(""); setClassFilter("All"); setSectionFilter("All"); setFeeFilter("All");
  }
  const hasFilters = search || classFilter !== "All" || sectionFilter !== "All" || feeFilter !== "All";

  return (
    <ERPShell role="admin" userName={user}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>
            Student Directory
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
            {total} students enrolled · Academic Year 2026–27
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #FF6B6B, #ff8e53)",
            boxShadow: "0 4px 14px rgba(255,107,107,0.25)",
            fontFamily: "var(--font-nunito)",
          }}
        >
          <Plus size={15} /> Enrol New Student
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Students", value: total,        color: "#7c3aed", bg: "rgba(167,139,250,0.10)" },
          { label: "Active",         value: active,       color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
          { label: "Fee Due",        value: feeDue,       color: "#FF6B6B", bg: "rgba(255,107,107,0.08)" },
          { label: "Classes",        value: CLASSES.length - 1, color: "#d97706", bg: "rgba(255,217,61,0.12)"  },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Class distribution bar */}
      <div className="glass-card p-5 mb-6">
        <h2 className="text-sm font-bold text-navy mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
          <Users size={14} style={{ color: "#7c3aed" }} /> Enrolment by Class
        </h2>
        <div className="flex gap-2 flex-wrap">
          {byClass.map((c, i) => {
            const colors = ["#7c3aed","#FF6B6B","#d97706","#6BCB77"];
            const pct = Math.round((c.count / total) * 100);
            return (
              <button
                key={c.label}
                type="button"
                onClick={() => { setClassFilter(c.label); setSectionFilter("All"); }}
                className="flex-1 min-w-[80px] p-3 rounded-2xl text-center transition-all duration-150 hover:-translate-y-0.5"
                style={{
                  background: classFilter === c.label ? `${colors[i]}15` : "rgba(26,26,46,0.04)",
                  border: `1.5px solid ${classFilter === c.label ? colors[i] + "40" : "transparent"}`,
                }}
              >
                <p className="text-lg font-bold" style={{ color: colors[i], fontFamily: "var(--font-nunito)" }}>{c.count}</p>
                <p className="text-xs font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{c.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>{pct}%</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className={`grid gap-6 ${selected ? "lg:grid-cols-3" : "grid-cols-1"}`}>
        {/* === Left: Search + List === */}
        <div className={selected ? "lg:col-span-2" : ""}>
          {/* Search + filter bar */}
          <div className="glass-card p-4 mb-4">
            <div className="flex gap-3 flex-wrap">
              {/* Search */}
              <div className="flex-1 min-w-[180px] relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(26,26,46,0.35)" }} />
                <input
                  type="text"
                  placeholder="Search by name, roll no, parent…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-sm"
                  style={{
                    background: "rgba(26,26,46,0.05)",
                    border: "1px solid rgba(26,26,46,0.08)",
                    color: "rgba(26,26,46,0.80)",
                    fontFamily: "var(--font-inter)",
                    outline: "none",
                  }}
                />
              </div>

              {/* Filter toggle */}
              <button
                type="button"
                onClick={() => setShowFilters(f => !f)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
                style={{
                  background: showFilters ? "rgba(124,58,237,0.10)" : "rgba(26,26,46,0.05)",
                  color: showFilters ? "#7c3aed" : "rgba(26,26,46,0.60)",
                  fontFamily: "var(--font-nunito)",
                  border: `1px solid ${showFilters ? "rgba(124,58,237,0.25)" : "transparent"}`,
                }}
              >
                <Filter size={14} /> Filters
                {hasFilters && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#FF6B6B" }} />}
              </button>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: "rgba(255,107,107,0.10)", color: "#FF6B6B", fontFamily: "var(--font-nunito)" }}
                >
                  <X size={13} /> Clear
                </button>
              )}
            </div>

            {showFilters && (
              <div className="flex gap-3 flex-wrap mt-3 pt-3" style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
                {/* Class */}
                <div>
                  <p className="text-xs font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>Class</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {CLASSES.map(c => (
                      <button key={c} type="button"
                        onClick={() => { setClassFilter(c); setSectionFilter("All"); }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150"
                        style={{
                          background: classFilter === c ? "rgba(124,58,237,0.12)" : "rgba(26,26,46,0.05)",
                          color: classFilter === c ? "#7c3aed" : "rgba(26,26,46,0.55)",
                          fontFamily: "var(--font-nunito)",
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section */}
                {classFilter !== "All" && (
                  <div>
                    <p className="text-xs font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>Section</p>
                    <div className="flex gap-1.5">
                      {sections.map(s => (
                        <button key={s} type="button"
                          onClick={() => setSectionFilter(s)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150"
                          style={{
                            background: sectionFilter === s ? "rgba(107,203,119,0.12)" : "rgba(26,26,46,0.05)",
                            color: sectionFilter === s ? "#6BCB77" : "rgba(26,26,46,0.55)",
                            fontFamily: "var(--font-nunito)",
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fee status */}
                <div>
                  <p className="text-xs font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>Fee Status</p>
                  <div className="flex gap-1.5">
                    {["All", "Paid", "Due", "Partial"].map(f => (
                      <button key={f} type="button"
                        onClick={() => setFeeFilter(f)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150"
                        style={{
                          background: feeFilter === f ? "rgba(255,107,107,0.10)" : "rgba(26,26,46,0.05)",
                          color: feeFilter === f ? "#FF6B6B" : "rgba(26,26,46,0.55)",
                          fontFamily: "var(--font-nunito)",
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-xs font-semibold" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>
              {filtered.length} student{filtered.length !== 1 ? "s" : ""}
              {hasFilters ? " found" : " total"}
            </p>
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}
            >
              <Download size={12} /> Export
            </button>
          </div>

          {/* Student list */}
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="glass-card p-10 text-center">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>No students found</p>
                <p className="text-xs mt-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>Try adjusting your search or filters</p>
              </div>
            ) : (
              filtered.map(student => {
                const isSelected = selected?.id === student.id;
                const fee = FEE_STYLE[student.fees];
                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => setSelected(isSelected ? null : student)}
                    className="w-full text-left glass-card"
                    style={{
                      border: isSelected ? "1.5px solid rgba(124,58,237,0.35)" : "1.5px solid rgba(255,255,255,0.60)",
                      background: isSelected ? "rgba(124,58,237,0.05)" : undefined,
                      borderRadius: "1.25rem",
                    }}
                  >
                    <div className="flex items-center gap-3 p-3.5">
                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: "rgba(255,217,61,0.15)" }}
                      >
                        {student.avatar}
                      </div>

                      {/* Name + class */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>
                            {student.name}
                          </p>
                          {student.status === "inactive" && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(26,26,46,0.08)", color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
                          {student.rollNo} · {student.class}-{student.section} · {student.parentName}
                        </p>
                      </div>

                      {/* Fee badge */}
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: fee.bg, color: fee.color, fontFamily: "var(--font-nunito)" }}
                      >
                        {fee.label}
                      </span>

                      {/* Phone */}
                      <a
                        href={`tel:${student.parentPhone}`}
                        onClick={e => e.stopPropagation()}
                        className="hidden sm:flex w-8 h-8 rounded-xl items-center justify-center flex-shrink-0 transition-all duration-150 hover:scale-105"
                        style={{ background: "rgba(107,203,119,0.10)", color: "#6BCB77" }}
                      >
                        <Phone size={13} />
                      </a>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* === Right: Student profile panel === */}
        {selected && (
          <div className="lg:col-span-1">
            <div className="glass-card p-5 sticky top-4">
              {/* Close */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Student Profile</h2>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(26,26,46,0.06)" }}
                >
                  <X size={14} style={{ color: "rgba(26,26,46,0.50)" }} />
                </button>
              </div>

              {/* Avatar + name */}
              <div className="text-center mb-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3"
                  style={{ background: "rgba(255,217,61,0.15)" }}
                >
                  {selected.avatar}
                </div>
                <p className="text-base font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{selected.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
                  {selected.rollNo} · {selected.class}-{selected.section}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: selected.status === "active" ? "rgba(107,203,119,0.12)" : "rgba(26,26,46,0.08)",
                      color: selected.status === "active" ? "#6BCB77" : "rgba(26,26,46,0.50)",
                      fontFamily: "var(--font-nunito)",
                    }}
                  >
                    {selected.status === "active" ? "Active" : "Inactive"}
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: FEE_STYLE[selected.fees].bg, color: FEE_STYLE[selected.fees].color, fontFamily: "var(--font-nunito)" }}
                  >
                    Fee: {FEE_STYLE[selected.fees].label}
                  </span>
                </div>
              </div>

              {/* Detail rows */}
              {[
                { icon: <Calendar size={13} />, label: "Date of Birth",   value: new Date(selected.dob).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
                { icon: <User size={13} />,     label: "Gender",          value: selected.gender === "M" ? "Male" : "Female" },
                { icon: <User size={13} />,     label: "Blood Group",     value: selected.blood },
                { icon: <User size={13} />,     label: "Parent / Guardian", value: selected.parentName },
                { icon: <Phone size={13} />,    label: "Parent Phone",    value: selected.parentPhone },
                { icon: <MapPin size={13} />,   label: "Address",         value: selected.address },
                { icon: <Calendar size={13} />, label: "Admission Date",  value: new Date(selected.admissionDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
              ].map(row => (
                <div key={row.label} className="flex gap-3 mb-3">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.40)" }}
                  >
                    {row.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{row.label}</p>
                    <p className="text-sm font-semibold text-navy break-words" style={{ fontFamily: "var(--font-nunito)" }}>{row.value}</p>
                  </div>
                </div>
              ))}

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 mt-5 pt-4" style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
                {[
                  { label: "Edit Profile",    bg: "rgba(124,58,237,0.10)", color: "#7c3aed" },
                  { label: "View Attendance", bg: "rgba(107,203,119,0.10)", color: "#6BCB77" },
                  { label: "Fee History",     bg: "rgba(255,107,107,0.10)", color: "#FF6B6B" },
                  { label: "Progress Report", bg: "rgba(255,217,61,0.15)",  color: "#d97706" },
                ].map(a => (
                  <button
                    key={a.label}
                    type="button"
                    className="py-2 rounded-xl text-xs font-bold transition-all duration-150 hover:-translate-y-0.5"
                    style={{ background: a.bg, color: a.color, fontFamily: "var(--font-nunito)" }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ERPShell>
  );
}
