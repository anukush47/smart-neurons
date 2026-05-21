"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { CreditCard, CheckCircle, Clock, Download, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (typeof window !== "undefined" && (window as Window & { Razorpay?: unknown }).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface Payment {
  id: string;
  description: string;
  amount: number;
  date: string;
  mode: string;
  receipt: string;
  status: "paid" | "due" | "upcoming";
  paidOn?: string;
}

const PAYMENTS_DATA: Payment[] = [
  { id: "p1", description: "Term 1 — April Instalment",   amount: 20000, date: "2026-04-01", mode: "UPI",    receipt: "RC-SN-0041", status: "paid" },
  { id: "p2", description: "Term 1 — May Instalment",     amount: 20000, date: "2026-05-01", mode: "UPI",    receipt: "RC-SN-0082", status: "paid" },
  { id: "p3", description: "Term 1 — June Instalment",    amount: 20000, date: "2026-06-01", mode: "—",      receipt: "—",          status: "due"  },
  { id: "p4", description: "Term 2 — July Instalment",    amount: 20000, date: "2026-07-01", mode: "—",      receipt: "—",          status: "upcoming" },
  { id: "p5", description: "Term 2 — August Instalment",  amount: 20000, date: "2026-08-01", mode: "—",      receipt: "—",          status: "upcoming" },
  { id: "p6", description: "Term 2 — September Instalment",amount:20000, date: "2026-09-01", mode: "—",      receipt: "—",          status: "upcoming" },
];

const ANNUAL_FEE = 120000;
const PAID_AMT   = 40000;
const DUE_AMT    = 20000;
const NEXT_DUE   = "June 1, 2026";
const DAYS_LEFT  = 12;

const STATUS_STYLE = {
  paid:     { label: "Paid",     bg: "rgba(107,203,119,0.12)", color: "#6BCB77" },
  due:      { label: "Due",      bg: "rgba(255,107,107,0.12)", color: "#FF6B6B" },
  upcoming: { label: "Upcoming", bg: "rgba(26,26,46,0.06)",    color: "rgba(26,26,46,0.45)" },
};

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export default function ParentFeesPage() {
  const [user, setUser] = useState("");
  const [payments, setPayments] = useState(PAYMENTS_DATA);
  const [payStep, setPayStep] = useState<"idle" | "select" | "confirm" | "done">("idle");
  const [payMode, setPayMode] = useState("UPI");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [paidAmount, setPaidAmount] = useState(0);
  const [liveFees, setLiveFees] = useState<{
    id: string;
    amount_due: number;
    status: "pending" | "paid" | "overdue";
    due_date: string;
    paid_at: string | null;
    receipt_no: string | null;
    fee_structures: { name: string; term: string };
  }[]>([]);
  const [childName, setChildName] = useState<string | null>(null);
  const [payingFeeId, setPayingFeeId] = useState<string | null>(null);
  const [verifiedReceipt, setVerifiedReceipt] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUser(user.user_metadata?.name || "Parent");
    });
    fetch("/api/fees/my-child")
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(({ fees, student }: { fees?: typeof liveFees; student?: { name: string } | null }) => {
        if (fees?.length) setLiveFees(fees);
        if (student?.name) setChildName(student.name);
      })
      .catch(() => { /* silently keep mock data */ });
  }, []);

  const paidCount    = payments.filter(p => p.status === "paid").length;
  const pct = Math.round((PAID_AMT / ANNUAL_FEE) * 100);

  async function handleRazorpayPayment() {
    const duePayment = liveFees.length > 0
      ? liveFees.find(f => f.status === "pending" || f.status === "overdue")
      : payments.find(p => p.status === "due");
    if (!duePayment) return;

    const amount = liveFees.length > 0
      ? (duePayment as typeof liveFees[0]).amount_due
      : (duePayment as typeof payments[0]).amount;

    setPaidAmount(amount);

    if (liveFees.length > 0) {
      setPayingFeeId((duePayment as typeof liveFees[0]).id);
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Failed to load Razorpay. Please try again.");
        return;
      }
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fee_payment_id: (duePayment as typeof liveFees[0]).id, amount }),
      });
      if (!res.ok) {
        alert("Could not create payment order. Please try again.");
        setPayingFeeId(null);
        return;
      }
      const orderData = await res.json() as { order_id: string; amount: number; currency: string; key: string };

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Smart Neurons ERP",
        description: "School Fee Payment",
        order_id: orderData.order_id,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              fee_payment_id: (duePayment as typeof liveFees[0]).id,
            }),
          });
          if (verifyRes.ok) {
            const { receipt_no } = await verifyRes.json() as { receipt_no?: string };
            setVerifiedReceipt(receipt_no ?? null);
            setLiveFees(prev => prev.map(f =>
              f.id === (duePayment as typeof liveFees[0]).id
                ? { ...f, status: "paid" as const, paid_at: new Date().toISOString() }
                : f
            ));
            setPayStep("done");
          } else {
            const { error } = await verifyRes.json().catch(() => ({ error: "Verification failed" }));
            alert(`Payment recorded by Razorpay but verification failed: ${error}. Please contact support with your payment ID: ${response.razorpay_payment_id}`);
          }
          setPayingFeeId(null);
        },
        prefill: { name: childName || "Parent" },
        theme: { color: "#1A1A2E" },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new ((window as unknown as Record<string, any>).Razorpay)(options);
      rzp.open();
    } else {
      setPayingFeeId("mock");
      setPayments(prev =>
        prev.map(p => p.id === (duePayment as typeof payments[0]).id
          ? { ...p, status: "paid" as const, paidOn: new Date().toLocaleDateString("en-IN") }
          : p
        )
      );
      setPayStep("done");
      setPayingFeeId(null);
    }
  }

  return (
    <ERPShell role="parent" userName={user}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Fee & Payments</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          Aarav Sharma · JKG-A · Academic Year 2026–27
        </p>
      </div>

      {/* Due alert */}
      <div className="mb-5 p-4 rounded-2xl flex items-start gap-3"
        style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(167,139,250,0.05))", border: "1.5px solid rgba(124,58,237,0.20)" }}>
        <CreditCard size={20} style={{ color: "#7c3aed", flexShrink: 0, marginTop: 2 }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>
            Next payment due — {fmt(DUE_AMT)}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>
            {NEXT_DUE} · {DAYS_LEFT} days remaining
          </p>
        </div>
        <button type="button" onClick={() => setPayStep("select")}
          className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all duration-150 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", boxShadow: "0 3px 12px rgba(124,58,237,0.30)", fontFamily: "var(--font-nunito)" }}>
          Pay Now
        </button>
      </div>

      {/* Fee summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Annual Fee",    value: fmt(ANNUAL_FEE), color: "#7c3aed", bg: "rgba(167,139,250,0.10)" },
          { label: "Paid",          value: fmt(PAID_AMT),   color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
          { label: "Outstanding",   value: fmt(DUE_AMT),    color: "#FF6B6B", bg: "rgba(255,107,107,0.08)" },
          { label: "Instalments",   value: `${paidCount}/${payments.length}`, color: "#d97706", bg: "rgba(255,217,61,0.12)" },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>{s.label}</p>
            <p className="text-lg font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Annual Payment Progress</p>
          <p className="text-sm font-bold" style={{ color: "#7c3aed", fontFamily: "var(--font-nunito)" }}>{pct}%</p>
        </div>
        <div className="h-3 rounded-full overflow-hidden mb-3" style={{ background: "rgba(26,26,46,0.06)" }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg,#7c3aed,#a78bfa)" }} />
        </div>
        <div className="flex justify-between text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
          <span>{fmt(PAID_AMT)} paid</span>
          <span>{fmt(ANNUAL_FEE - PAID_AMT)} remaining</span>
        </div>
      </div>

      {/* Live fee account rows */}
      {liveFees.length > 0 && (
        <div className="glass-card p-5 mb-4">
          <p className="text-sm font-bold text-navy mb-3" style={{ fontFamily: "var(--font-nunito)" }}>
            Fee Account — {childName ?? "Your Child"} ({new Date().getFullYear()}-{String(new Date().getFullYear() + 1).slice(-2)})
          </p>
          <div className="space-y-2">
            {liveFees.map(f => (
              <div key={f.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: "rgba(26,26,46,0.03)", border: "1px solid rgba(26,26,46,0.06)" }}>
                <div>
                  <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{f.fee_structures.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
                    Due: {new Date(f.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    {f.receipt_no && ` · ${f.receipt_no}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold" style={{ color: "#1A1A2E", fontFamily: "var(--font-nunito)" }}>
                    ₹{f.amount_due.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: f.status === "paid" ? "rgba(107,203,119,0.12)" : f.status === "overdue" ? "rgba(255,107,107,0.12)" : "rgba(217,119,6,0.10)",
                      color: f.status === "paid" ? "#6BCB77" : f.status === "overdue" ? "#FF6B6B" : "#d97706",
                      fontFamily: "var(--font-nunito)"
                    }}>
                    {f.status === "paid" ? "Paid" : f.status === "overdue" ? "Overdue" : "Due"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment schedule */}
      <div className="glass-card p-5 mb-5">
        <h2 className="text-sm font-bold text-navy mb-4" style={{ fontFamily: "var(--font-nunito)" }}>Payment Schedule</h2>
        <div className="space-y-2">
          {payments.map(p => {
            const isOpen = expanded === p.id;
            const st = STATUS_STYLE[p.status];
            return (
              <div key={p.id} className="overflow-hidden rounded-2xl"
                style={{ background: st.bg, border: `1px solid ${st.color}30` }}>
                <button type="button" className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  onClick={() => setExpanded(isOpen ? null : p.id)}>
                  <div className="flex-shrink-0">
                    {p.status === "paid"
                      ? <CheckCircle size={16} style={{ color: "#6BCB77" }} />
                      : p.status === "due"
                      ? <AlertCircle size={16} style={{ color: "#FF6B6B" }} />
                      : <Clock size={16} style={{ color: "rgba(26,26,46,0.35)" }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{p.description}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
                      {new Date(p.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <span className="text-sm font-bold flex-shrink-0 mr-1" style={{ color: st.color, fontFamily: "var(--font-nunito)" }}>
                    {fmt(p.amount)}
                  </span>
                  {isOpen ? <ChevronUp size={14} style={{ color: "rgba(26,26,46,0.40)", flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: "rgba(26,26,46,0.40)", flexShrink: 0 }} />}
                </button>

                {isOpen && p.status === "paid" && (
                  <div className="px-4 pb-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
                        Paid via {p.mode} · Receipt: <span className="font-semibold text-navy">{p.receipt}</span>
                      </p>
                    </div>
                    <button type="button"
                      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl"
                      style={{ background: "rgba(107,203,119,0.12)", color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
                      <Download size={12} /> Receipt
                    </button>
                  </div>
                )}
                {isOpen && p.status === "due" && (
                  <div className="px-4 pb-3">
                    <button type="button" onClick={() => setPayStep("select")}
                      className="w-full py-2 rounded-xl text-xs font-bold text-white transition-all duration-150"
                      style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", fontFamily: "var(--font-nunito)" }}>
                      Pay {fmt(p.amount)} Now
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment gateway modal */}
      {payStep !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.40)" }}>
          <div className="w-full max-w-sm rounded-3xl p-6 shadow-2xl" style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(24px)" }}>
            {payStep === "select" && (
              <>
                <h3 className="text-base font-bold text-navy mb-1" style={{ fontFamily: "var(--font-nunito)" }}>Pay June Instalment</h3>
                <p className="text-2xl font-bold mb-4" style={{ color: "#7c3aed", fontFamily: "var(--font-nunito)" }}>{fmt(payments.find(p => p.status === "due")?.amount ?? 20000)}</p>
                <p className="text-xs font-semibold mb-2" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>Choose payment method</p>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {[
                    { mode: "UPI",    emoji: "📱", sub: "Google Pay, PhonePe…" },
                    { mode: "Card",   emoji: "💳", sub: "Debit / Credit card" },
                    { mode: "Net Banking", emoji: "🏦", sub: "Internet banking" },
                    { mode: "Cheque", emoji: "📝", sub: "Drop at school office" },
                  ].map(m => (
                    <button key={m.mode} type="button" onClick={() => setPayMode(m.mode)}
                      className="p-3 rounded-2xl text-left transition-all duration-150"
                      style={{
                        background: payMode === m.mode ? "rgba(124,58,237,0.10)" : "rgba(26,26,46,0.04)",
                        border: `1.5px solid ${payMode === m.mode ? "rgba(124,58,237,0.35)" : "transparent"}`,
                      }}>
                      <p className="text-lg mb-0.5">{m.emoji}</p>
                      <p className="text-xs font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{m.mode}</p>
                      <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{m.sub}</p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setPayStep("idle")}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-bold"
                    style={{ background: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-nunito)" }}>
                    Cancel
                  </button>
                  <button type="button" onClick={() => setPayStep("confirm")}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", boxShadow: "0 4px 14px rgba(124,58,237,0.28)", fontFamily: "var(--font-nunito)" }}>
                    Continue
                  </button>
                </div>
              </>
            )}

            {payStep === "confirm" && (
              <>
                <h3 className="text-base font-bold text-navy mb-4" style={{ fontFamily: "var(--font-nunito)" }}>Confirm Payment</h3>
                <div className="space-y-3 mb-5">
                  {[
                    { label: "Student",  value: "Aarav Sharma" },
                    { label: "Class",    value: "JKG-A" },
                    { label: "For",      value: "June Instalment — Term 1" },
                    { label: "Amount",   value: fmt(payments.find(p => p.status === "due")?.amount ?? 20000) },
                    { label: "Method",   value: payMode },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between">
                      <p className="text-xs" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>{r.label}</p>
                      <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{r.value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setPayStep("select")}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-bold"
                    style={{ background: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-nunito)" }}>
                    Back
                  </button>
                  <button type="button" onClick={handleRazorpayPayment} disabled={!!payingFeeId}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", boxShadow: "0 4px 14px rgba(124,58,237,0.28)", fontFamily: "var(--font-nunito)", opacity: payingFeeId ? 0.6 : 1 }}>
                    Pay {fmt(payments.find(p => p.status === "due")?.amount ?? 20000)}
                  </button>
                </div>
              </>
            )}

            {payStep === "done" && (
              <div className="text-center py-2">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(107,203,119,0.15)" }}>
                  <CheckCircle size={32} style={{ color: "#6BCB77" }} />
                </div>
                <h3 className="text-lg font-bold text-navy mb-1" style={{ fontFamily: "var(--font-nunito)" }}>Payment Successful!</h3>
                <p className="text-sm mb-1" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-inter)" }}>
                  {fmt(paidAmount)} paid via {payMode}
                </p>
                <p className="text-xs mb-5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
                  Receipt {verifiedReceipt ?? "RC-SN-0124"} · {new Date().toLocaleDateString("en-IN")}
                </p>
                <button type="button" onClick={() => setPayStep("idle")}
                  className="w-full py-2.5 rounded-2xl text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#6BCB77,#4CAF50)", fontFamily: "var(--font-nunito)" }}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </ERPShell>
  );
}
