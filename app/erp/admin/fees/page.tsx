"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import ERPShell from "@/components/erp/ERPShell";
import {
  Search, Filter, X, Download, CreditCard,
  CheckCircle, AlertCircle, Clock, ChevronDown, ChevronUp,
  TrendingUp, Users, IndianRupee,
} from "lucide-react";

type FeeStatus = "paid" | "due" | "partial" | "overdue";
type PayMode = "Cash" | "UPI" | "Cheque" | "Online";

interface Payment {
  date: string;
  amount: number;
  mode: PayMode;
  receipt: string;
}

interface FeeRecord {
  id: number;
  studentName: string;
  rollNo: string;
  class: string;
  parentName: string;
  parentPhone: string;
  totalFee: number;
  paidAmount: number;
  status: FeeStatus;
  dueDate: string;
  payments: Payment[];
}

const STATUS_STYLE: Record<FeeStatus, { label: string; bg: string; color: string }> = {
  paid:    { label: "Paid",    bg: "rgba(107,203,119,0.12)", color: "#6BCB77" },
  due:     { label: "Due",     bg: "rgba(255,107,107,0.12)", color: "#FF6B6B" },
  partial: { label: "Partial", bg: "rgba(255,217,61,0.15)",  color: "#d97706" },
  overdue: { label: "Overdue", bg: "rgba(255,107,107,0.18)", color: "#dc2626" },
};

const CLASSES = ["All", "Playgroup", "Nursery", "JKG", "SKG"];

const FEE_DATA: FeeRecord[] = [
  { id: 1,  studentName: "Aarav Sharma",    rollNo: "SN006", class: "Nursery",   parentName: "Rohit Sharma",    parentPhone: "9871234560", totalFee: 54000, paidAmount: 54000, status: "paid",    dueDate: "2026-06-01", payments: [{ date: "2026-04-01", amount: 18000, mode: "UPI",    receipt: "RC001" }, { date: "2026-05-01", amount: 18000, mode: "UPI",    receipt: "RC002" }, { date: "2026-06-01", amount: 18000, mode: "Online", receipt: "RC003" }] },
  { id: 2,  studentName: "Diya Patel",      rollNo: "SN007", class: "Nursery",   parentName: "Nikhil Patel",    parentPhone: "9871234561", totalFee: 54000, paidAmount: 54000, status: "paid",    dueDate: "2026-06-01", payments: [{ date: "2026-04-01", amount: 18000, mode: "Cash",   receipt: "RC004" }, { date: "2026-05-01", amount: 18000, mode: "Cash",   receipt: "RC005" }, { date: "2026-06-01", amount: 18000, mode: "UPI",    receipt: "RC006" }] },
  { id: 3,  studentName: "Ishaan Gupta",    rollNo: "SN008", class: "Nursery",   parentName: "Manish Gupta",    parentPhone: "9871234562", totalFee: 54000, paidAmount: 36000, status: "due",     dueDate: "2026-06-01", payments: [{ date: "2026-04-01", amount: 18000, mode: "UPI",    receipt: "RC007" }, { date: "2026-05-01", amount: 18000, mode: "UPI",    receipt: "RC008" }] },
  { id: 4,  studentName: "Priya Singh",     rollNo: "SN009", class: "Nursery",   parentName: "Anil Singh",      parentPhone: "9871234563", totalFee: 54000, paidAmount: 27000, status: "partial", dueDate: "2026-05-15", payments: [{ date: "2026-04-01", amount: 18000, mode: "Cheque", receipt: "RC009" }, { date: "2026-05-10", amount: 9000,  mode: "UPI",    receipt: "RC010" }] },
  { id: 5,  studentName: "Arjun Verma",     rollNo: "SN010", class: "Nursery",   parentName: "Sunil Verma",     parentPhone: "9871234564", totalFee: 54000, paidAmount: 54000, status: "paid",    dueDate: "2026-06-01", payments: [{ date: "2026-04-01", amount: 18000, mode: "Online", receipt: "RC011" }, { date: "2026-05-01", amount: 18000, mode: "Online", receipt: "RC012" }, { date: "2026-06-01", amount: 18000, mode: "Online", receipt: "RC013" }] },
  { id: 6,  studentName: "Ananya Joshi",    rollNo: "SN017", class: "JKG",       parentName: "Amit Joshi",      parentPhone: "9869012340", totalFee: 60000, paidAmount: 60000, status: "paid",    dueDate: "2026-06-01", payments: [{ date: "2026-04-01", amount: 20000, mode: "UPI",    receipt: "RC014" }, { date: "2026-05-01", amount: 20000, mode: "UPI",    receipt: "RC015" }, { date: "2026-06-01", amount: 20000, mode: "UPI",    receipt: "RC016" }] },
  { id: 7,  studentName: "Vivaan Saxena",   rollNo: "SN018", class: "JKG",       parentName: "Pankaj Saxena",   parentPhone: "9869012341", totalFee: 60000, paidAmount: 60000, status: "paid",    dueDate: "2026-06-01", payments: [{ date: "2026-04-01", amount: 20000, mode: "Cash",   receipt: "RC017" }, { date: "2026-05-01", amount: 20000, mode: "Cash",   receipt: "RC018" }, { date: "2026-06-01", amount: 20000, mode: "Cash",   receipt: "RC019" }] },
  { id: 8,  studentName: "Ayaan Nair",      rollNo: "SN019", class: "JKG",       parentName: "Manoj Nair",      parentPhone: "9869012342", totalFee: 60000, paidAmount: 40000, status: "due",     dueDate: "2026-06-01", payments: [{ date: "2026-04-01", amount: 20000, mode: "UPI",    receipt: "RC020" }, { date: "2026-05-01", amount: 20000, mode: "Online", receipt: "RC021" }] },
  { id: 9,  studentName: "Dhruv Agarwal",   rollNo: "SN021", class: "JKG",       parentName: "Vikas Agarwal",   parentPhone: "9869012344", totalFee: 60000, paidAmount: 20000, status: "overdue", dueDate: "2026-04-30", payments: [{ date: "2026-04-01", amount: 20000, mode: "Cheque", receipt: "RC022" }] },
  { id: 10, studentName: "Saanvi Iyer",     rollNo: "SN031", class: "SKG",       parentName: "Ravi Iyer",       parentPhone: "9862109870", totalFee: 66000, paidAmount: 66000, status: "paid",    dueDate: "2026-06-01", payments: [{ date: "2026-04-01", amount: 22000, mode: "Online", receipt: "RC023" }, { date: "2026-05-01", amount: 22000, mode: "Online", receipt: "RC024" }, { date: "2026-06-01", amount: 22000, mode: "Online", receipt: "RC025" }] },
  { id: 11, studentName: "Krish Gupta",     rollNo: "SN032", class: "SKG",       parentName: "Hemant Gupta",    parentPhone: "9862109871", totalFee: 66000, paidAmount: 66000, status: "paid",    dueDate: "2026-06-01", payments: [{ date: "2026-04-01", amount: 22000, mode: "UPI",    receipt: "RC026" }, { date: "2026-05-01", amount: 22000, mode: "UPI",    receipt: "RC027" }, { date: "2026-06-01", amount: 22000, mode: "UPI",    receipt: "RC028" }] },
  { id: 12, studentName: "Tarini Bhatt",    rollNo: "SN033", class: "SKG",       parentName: "Ashish Bhatt",    parentPhone: "9862109872", totalFee: 66000, paidAmount: 44000, status: "due",     dueDate: "2026-06-01", payments: [{ date: "2026-04-01", amount: 22000, mode: "Cash",   receipt: "RC029" }, { date: "2026-05-01", amount: 22000, mode: "Cash",   receipt: "RC030" }] },
  { id: 13, studentName: "Myra Kapoor",     rollNo: "SN001", class: "Playgroup", parentName: "Rajan Kapoor",    parentPhone: "9876543210", totalFee: 48000, paidAmount: 48000, status: "paid",    dueDate: "2026-06-01", payments: [{ date: "2026-04-01", amount: 16000, mode: "UPI",    receipt: "RC031" }, { date: "2026-05-01", amount: 16000, mode: "UPI",    receipt: "RC032" }, { date: "2026-06-01", amount: 16000, mode: "UPI",    receipt: "RC033" }] },
  { id: 14, studentName: "Aryan Mehta",     rollNo: "SN002", class: "Playgroup", parentName: "Suresh Mehta",    parentPhone: "9876543211", totalFee: 48000, paidAmount: 32000, status: "due",     dueDate: "2026-06-01", payments: [{ date: "2026-04-01", amount: 16000, mode: "Cash",   receipt: "RC034" }, { date: "2026-05-01", amount: 16000, mode: "Cash",   receipt: "RC035" }] },
  { id: 15, studentName: "Dev Sharma",      rollNo: "SN004", class: "Playgroup", parentName: "Vikram Sharma",   parentPhone: "9876543213", totalFee: 48000, paidAmount: 16000, status: "overdue", dueDate: "2026-04-30", payments: [{ date: "2026-04-01", amount: 16000, mode: "UPI",    receipt: "RC036" }] },
];

const MONTHS = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];

const MONTHLY_COLLECTION = [
  { month: "Apr", collected: 452000, target: 600000 },
  { month: "May", collected: 388000, target: 600000 },
  { month: "Jun", collected: 120000, target: 600000 },
];

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export default function AdminFeesPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [collectFor, setCollectFor] = useState<FeeRecord | null>(null);
  const [collectAmount, setCollectAmount] = useState("");
  const [collectMode, setCollectMode] = useState<PayMode>("Cash");
  const [records, setRecords] = useState<FeeRecord[]>(FEE_DATA);

  useEffect(() => {
    const role = sessionStorage.getItem("erp_role");
    const u = sessionStorage.getItem("erp_user");
    if (role !== "admin") { router.replace("/erp/login"); return; }
    setUser(u || "admin@smartneurons.in");
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return records.filter(r => {
      if (classFilter !== "All" && r.class !== classFilter) return false;
      if (statusFilter !== "All" && r.status !== statusFilter.toLowerCase()) return false;
      if (q && !r.studentName.toLowerCase().includes(q) && !r.rollNo.toLowerCase().includes(q) && !r.parentName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, classFilter, statusFilter, records]);

  // Overall stats
  const totalExpected = records.reduce((a, r) => a + r.totalFee, 0);
  const totalCollected = records.reduce((a, r) => a + r.paidAmount, 0);
  const totalDue = totalExpected - totalCollected;
  const overdueCount = records.filter(r => r.status === "overdue").length;
  const collectionPct = Math.round((totalCollected / totalExpected) * 100);

  function collectFee() {
    if (!collectFor || !collectAmount) return;
    const amt = parseInt(collectAmount);
    if (isNaN(amt) || amt <= 0) return;
    setRecords(prev => prev.map(r => {
      if (r.id !== collectFor.id) return r;
      const newPaid = Math.min(r.paidAmount + amt, r.totalFee);
      const newStatus: FeeStatus = newPaid >= r.totalFee ? "paid" : newPaid > 0 ? "partial" : "due";
      return {
        ...r,
        paidAmount: newPaid,
        status: newStatus,
        payments: [...r.payments, {
          date: "2026-05-20",
          amount: amt,
          mode: collectMode,
          receipt: `RC${String(Math.floor(Math.random() * 900) + 100)}`,
        }],
      };
    }));
    setCollectFor(null);
    setCollectAmount("");
  }

  const hasFilters = search || classFilter !== "All" || statusFilter !== "All";

  return (
    <ERPShell role="admin" userName={user}>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Fee Management</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
            Academic Year 2026–27 · Term 1 (Apr–Jun)
          </p>
        </div>
        <button type="button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", boxShadow: "0 4px 14px rgba(124,58,237,0.25)", fontFamily: "var(--font-nunito)" }}>
          <Download size={15} /> Export Report
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Expected",  value: fmt(totalExpected),  color: "#7c3aed", bg: "rgba(167,139,250,0.10)" },
          { label: "Collected",       value: fmt(totalCollected), color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
          { label: "Outstanding",     value: fmt(totalDue),       color: "#FF6B6B", bg: "rgba(255,107,107,0.08)" },
          { label: "Overdue Records", value: overdueCount,        color: "#dc2626", bg: "rgba(255,107,107,0.12)" },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Collection progress + monthly trend */}
      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        {/* Collection ring */}
        <div className="glass-card p-5 flex flex-col items-center justify-center">
          <p className="text-sm font-bold text-navy mb-4" style={{ fontFamily: "var(--font-nunito)" }}>Overall Collection</p>
          <div className="relative w-28 h-28 mb-4">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(26,26,46,0.06)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none"
                stroke={collectionPct >= 75 ? "#6BCB77" : "#d97706"} strokeWidth="3"
                strokeDasharray={`${collectionPct} ${100 - collectionPct}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{collectionPct}%</p>
              <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>collected</p>
            </div>
          </div>
          <div className="w-full space-y-1.5">
            {[
              { label: "Paid",    count: records.filter(r => r.status === "paid").length,    color: "#6BCB77" },
              { label: "Partial", count: records.filter(r => r.status === "partial").length, color: "#d97706" },
              { label: "Due",     count: records.filter(r => r.status === "due").length,     color: "#FF6B6B" },
              { label: "Overdue", count: overdueCount,                                        color: "#dc2626" },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>{s.label}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>{s.count} students</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly bars */}
        <div className="glass-card p-5 lg:col-span-2">
          <p className="text-sm font-bold text-navy mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
            <TrendingUp size={14} style={{ color: "#7c3aed" }} /> Monthly Collection — Term 1
          </p>
          <div className="space-y-4">
            {MONTHLY_COLLECTION.map(m => {
              const pct = Math.round((m.collected / m.target) * 100);
              return (
                <div key={m.month}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{m.month} 2026</p>
                    <p className="text-xs font-bold" style={{ color: pct >= 80 ? "#6BCB77" : "#d97706", fontFamily: "var(--font-nunito)" }}>
                      {fmt(m.collected)} / {fmt(m.target)} ({pct}%)
                    </p>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(26,26,46,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: pct >= 80 ? "linear-gradient(90deg,#6BCB77,#4CAF50)" : "linear-gradient(90deg,#d97706,#f59e0b)" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fee structure */}
          <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
            <p className="text-xs font-bold text-navy mb-2" style={{ fontFamily: "var(--font-nunito)" }}>Annual Fee Structure</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Playgroup", fee: "₹48,000" },
                { label: "Nursery",   fee: "₹54,000" },
                { label: "JKG",       fee: "₹60,000" },
                { label: "SKG",       fee: "₹66,000" },
              ].map(f => (
                <div key={f.label} className="p-2.5 rounded-xl text-center" style={{ background: "rgba(26,26,46,0.04)" }}>
                  <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{f.fee}</p>
                  <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{f.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Collect fee modal */}
      {collectFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)" }}>
          <div className="w-full max-w-sm rounded-3xl p-6 shadow-2xl" style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(24px)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Collect Fee</h3>
              <button type="button" onClick={() => setCollectFor(null)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(26,26,46,0.06)" }}>
                <X size={14} />
              </button>
            </div>
            <p className="text-sm font-semibold text-navy mb-0.5" style={{ fontFamily: "var(--font-nunito)" }}>{collectFor.studentName}</p>
            <p className="text-xs mb-4" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
              {collectFor.rollNo} · {collectFor.class} · Balance: {fmt(collectFor.totalFee - collectFor.paidAmount)}
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }} htmlFor="col-amount">Amount (₹)</label>
                <input id="col-amount" type="number" placeholder="Enter amount"
                  value={collectAmount} onChange={e => setCollectAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm"
                  style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.10)", outline: "none", fontFamily: "var(--font-inter)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }} htmlFor="col-mode">Payment Mode</label>
                <div className="flex gap-2">
                  {(["Cash","UPI","Cheque","Online"] as PayMode[]).map(m => (
                    <button key={m} type="button" onClick={() => setCollectMode(m)}
                      className="flex-1 py-1.5 rounded-xl text-xs font-bold transition-all duration-150"
                      style={{
                        background: collectMode === m ? "rgba(124,58,237,0.12)" : "rgba(26,26,46,0.05)",
                        color: collectMode === m ? "#7c3aed" : "rgba(26,26,46,0.55)",
                        fontFamily: "var(--font-nunito)",
                        border: collectMode === m ? "1px solid rgba(124,58,237,0.30)" : "1px solid transparent",
                      }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button type="button" onClick={collectFee}
              className="w-full py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", boxShadow: "0 4px 14px rgba(124,58,237,0.25)", fontFamily: "var(--font-nunito)" }}>
              Record Payment
            </button>
          </div>
        </div>
      )}

      {/* Search + filters */}
      <div className="glass-card p-4 mb-4">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[180px] relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(26,26,46,0.35)" }} />
            <input type="text" placeholder="Search student, roll no, parent…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm"
              style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }}
            />
          </div>
          <button type="button" onClick={() => setShowFilters(f => !f)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{
              background: showFilters ? "rgba(124,58,237,0.10)" : "rgba(26,26,46,0.05)",
              color: showFilters ? "#7c3aed" : "rgba(26,26,46,0.60)",
              fontFamily: "var(--font-nunito)",
              border: `1px solid ${showFilters ? "rgba(124,58,237,0.25)" : "transparent"}`,
            }}>
            <Filter size={14} /> Filters
            {hasFilters && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#FF6B6B" }} />}
          </button>
          {hasFilters && (
            <button type="button" onClick={() => { setSearch(""); setClassFilter("All"); setStatusFilter("All"); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold"
              style={{ background: "rgba(255,107,107,0.10)", color: "#FF6B6B", fontFamily: "var(--font-nunito)" }}>
              <X size={13} /> Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="flex gap-4 flex-wrap mt-3 pt-3" style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
            <div>
              <p className="text-xs font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>Class</p>
              <div className="flex gap-1.5 flex-wrap">
                {CLASSES.map(c => (
                  <button key={c} type="button" onClick={() => setClassFilter(c)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: classFilter === c ? "rgba(124,58,237,0.12)" : "rgba(26,26,46,0.05)", color: classFilter === c ? "#7c3aed" : "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>Status</p>
              <div className="flex gap-1.5 flex-wrap">
                {["All", "Paid", "Due", "Partial", "Overdue"].map(s => (
                  <button key={s} type="button" onClick={() => setStatusFilter(s)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: statusFilter === s ? "rgba(255,107,107,0.10)" : "rgba(26,26,46,0.05)", color: statusFilter === s ? "#FF6B6B" : "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs font-semibold px-1 mb-3" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>
        {filtered.length} record{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Fee records list */}
      <div className="space-y-2">
        {filtered.map(rec => {
          const isOpen = expanded === rec.id;
          const balance = rec.totalFee - rec.paidAmount;
          const pct = Math.round((rec.paidAmount / rec.totalFee) * 100);
          const st = STATUS_STYLE[rec.status];

          return (
            <div key={rec.id} className="glass-card overflow-hidden"
              style={{ border: rec.status === "overdue" ? "1.5px solid rgba(220,38,38,0.25)" : "1.5px solid rgba(255,255,255,0.60)" }}>
              <div className="flex items-center gap-3 p-4">
                <button type="button" className="flex-1 flex items-center gap-3 text-left min-w-0"
                  onClick={() => setExpanded(isOpen ? null : rec.id)}>
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: "rgba(255,217,61,0.15)" }}>
                    {rec.studentName.includes("a") ? "👧" : "👦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{rec.studentName}</p>
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: st.bg, color: st.color, fontFamily: "var(--font-nunito)" }}>{st.label}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
                      {rec.rollNo} · {rec.class} · {rec.parentName}
                    </p>
                  </div>
                  <div className="hidden sm:block text-right flex-shrink-0 mr-2">
                    <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{fmt(rec.paidAmount)}</p>
                    <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>of {fmt(rec.totalFee)}</p>
                  </div>
                  {isOpen ? <ChevronUp size={15} style={{ color: "rgba(26,26,46,0.40)", flexShrink: 0 }} /> : <ChevronDown size={15} style={{ color: "rgba(26,26,46,0.40)", flexShrink: 0 }} />}
                </button>

                {rec.status !== "paid" && (
                  <button type="button" onClick={() => setCollectFor(rec)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all duration-150 hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", boxShadow: "0 3px 10px rgba(124,58,237,0.25)", fontFamily: "var(--font-nunito)" }}>
                    Collect
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <div className="px-4 pb-2">
                <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(26,26,46,0.06)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct === 100 ? "#6BCB77" : pct >= 50 ? "#d97706" : "#FF6B6B" }} />
                </div>
              </div>

              {isOpen && (
                <div className="px-4 pb-4 border-t mt-2" style={{ borderColor: "rgba(26,26,46,0.06)" }}>
                  {/* Summary row */}
                  <div className="grid grid-cols-3 gap-3 my-4">
                    {[
                      { label: "Total Fee",  value: fmt(rec.totalFee),   color: "#7c3aed" },
                      { label: "Paid",       value: fmt(rec.paidAmount), color: "#6BCB77" },
                      { label: "Balance",    value: fmt(balance),         color: balance > 0 ? "#FF6B6B" : "#6BCB77" },
                    ].map(s => (
                      <div key={s.label} className="p-3 rounded-2xl text-center" style={{ background: `${s.color}10` }}>
                        <p className="text-sm font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>{s.value}</p>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Payment history */}
                  <p className="text-xs font-bold text-navy mb-2" style={{ fontFamily: "var(--font-nunito)" }}>Payment History</p>
                  <div className="space-y-2">
                    {rec.payments.map(p => (
                      <div key={p.receipt} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                        style={{ background: "rgba(107,203,119,0.06)", border: "1px solid rgba(107,203,119,0.15)" }}>
                        <div>
                          <p className="text-xs font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{fmt(p.amount)}</p>
                          <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
                            {new Date(p.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {p.mode}
                          </p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(107,203,119,0.10)", color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
                          {p.receipt}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs mt-3" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>
                    Parent: {rec.parentName} · {rec.parentPhone} · Due by {new Date(rec.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ERPShell>
  );
}
