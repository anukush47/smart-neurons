"use client";

import { useState, useEffect } from "react";
import ERPShell from "@/components/erp/ERPShell";
import { createClient } from "@/lib/supabase/client";
import {
  CreditCard, CheckCircle, Clock, AlertCircle,
  ChevronDown, ChevronUp, IndianRupee,
} from "lucide-react";

interface FeeRow {
  id: string;
  amount_due: number;
  amount_paid: number;
  status: "pending" | "paid" | "overdue";
  due_date: string;
  paid_at: string | null;
  receipt_no: string | null;
  fee_structures: { name: string; term: string; academic_year: string };
}

interface Child { name: string; class: string; section: string }

const PAY_MODES = [
  { mode: "UPI",         emoji: "📱", sub: "Google Pay, PhonePe…" },
  { mode: "Card",        emoji: "💳", sub: "Debit / Credit card" },
  { mode: "Net Banking", emoji: "🏦", sub: "Internet banking" },
  { mode: "Cheque",      emoji: "📝", sub: "Drop at school office" },
];

function fmt(n: number) { return "₹" + n.toLocaleString("en-IN"); }

function loadRazorpay(): Promise<boolean> {
  return new Promise(resolve => {
    if (typeof window !== "undefined" && (window as Window & { Razorpay?: unknown }).Razorpay) {
      resolve(true); return;
    }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function ParentFeesPage() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [fees, setFees] = useState<FeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Pay flow
  const [payTarget, setPayTarget] = useState<FeeRow | null>(null);
  const [payMode, setPayMode] = useState("UPI");
  const [payStep, setPayStep] = useState<"idle" | "select" | "confirm" | "done">("idle");
  const [paying, setPaying] = useState(false);
  const [doneReceipt, setDoneReceipt] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) setUser({ id: data.user.id, name: data.user.app_metadata?.name || data.user.email || "Parent" });

      const res = await fetch("/api/fees/my-child");
      if (res.ok) {
        const json = await res.json();
        setFees(json.fees ?? []);
        if (json.student) setChild(json.student);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Derived values from live data
  const totalDue    = fees.reduce((s, f) => s + f.amount_due, 0);
  const totalPaid   = fees.reduce((s, f) => s + f.amount_paid, 0);
  const outstanding = totalDue - totalPaid;
  const paidCount   = fees.filter(f => f.status === "paid").length;
  const pct         = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;
  const nextDue     = fees.find(f => f.status !== "paid");

  async function handlePay() {
    if (!payTarget) return;
    setPaying(true);

    const loaded = await loadRazorpay();
    if (!loaded) {
      alert("Failed to load payment gateway. Please try again.");
      setPaying(false); return;
    }

    const res = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fee_payment_id: payTarget.id, amount: payTarget.amount_due }),
    });

    if (!res.ok) {
      alert("Could not create payment order. Please try again.");
      setPaying(false); return;
    }

    const order = await res.json() as { order_id: string; amount: number; currency: string; key: string };

    const options = {
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      name: "Smart Neurons",
      description: payTarget.fee_structures.name,
      order_id: order.order_id,
      handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        const vRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...resp, fee_payment_id: payTarget.id }),
        });
        if (vRes.ok) {
          const { receipt_no } = await vRes.json() as { receipt_no?: string };
          setDoneReceipt(receipt_no ?? "");
          setFees(prev => prev.map(f =>
            f.id === payTarget.id ? { ...f, status: "paid" as const, paid_at: new Date().toISOString() } : f
          ));
          setPayStep("done");
        } else {
          alert("Payment recorded by Razorpay but verification failed. Contact support with payment ID: " + resp.razorpay_payment_id);
        }
        setPaying(false);
      },
      prefill: { name: child?.name ?? "Parent" },
      theme: { color: "#7c3aed" },
      modal: { ondismiss: () => setPaying(false) },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new ((window as unknown as Record<string, any>).Razorpay)(options).open();
  }

  if (loading) return (
    <ERPShell role="parent" userName={user?.name}>
      <div className="flex items-center justify-center h-64 text-gray-400" style={{ fontFamily: "var(--font-nunito)" }}>
        Loading fees…
      </div>
    </ERPShell>
  );

  return (
    <ERPShell role="parent" userName={user?.name}>
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Fee & Payments</h1>
          {child && (
            <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: "var(--font-nunito)" }}>
              {child.name} · {child.class}-{child.section} · Academic Year {fees[0]?.fee_structures?.academic_year ?? "2026-27"}
            </p>
          )}
        </div>

        {fees.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <IndianRupee size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="font-bold text-gray-500" style={{ fontFamily: "var(--font-nunito)" }}>No fee records found</p>
            <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: "var(--font-nunito)" }}>Contact school admin to set up fee account</p>
          </div>
        ) : (
          <>
            {/* Due Alert */}
            {nextDue && (
              <div className="p-4 rounded-2xl flex items-start gap-3"
                style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.08),rgba(167,139,250,0.05))", border: "1.5px solid rgba(124,58,237,0.20)" }}>
                <CreditCard size={20} style={{ color: "#7c3aed", flexShrink: 0, marginTop: 2 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>
                    Next due — {fmt(nextDue.amount_due - nextDue.amount_paid)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: "var(--font-nunito)" }}>
                    {nextDue.fee_structures.name} · Due {new Date(nextDue.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
                  </p>
                </div>
                <button onClick={() => { setPayTarget(nextDue); setPayStep("select"); }}
                  className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", fontFamily: "var(--font-nunito)" }}>
                  Pay Now
                </button>
              </div>
            )}

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Annual Fee",   value: fmt(totalDue),    color: "#7c3aed" },
                { label: "Paid",         value: fmt(totalPaid),   color: "#16a34a" },
                { label: "Outstanding",  value: fmt(outstanding), color: "#FF6B6B" },
                { label: "Instalments",  value: `${paidCount}/${fees.length}`, color: "#d97706" },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 mb-1" style={{ fontFamily: "var(--font-nunito)" }}>{s.label}</p>
                  <p className="text-lg font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Annual Payment Progress</p>
                <p className="text-sm font-bold" style={{ color: "#7c3aed", fontFamily: "var(--font-nunito)" }}>{pct}%</p>
              </div>
              <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: "rgba(26,26,46,0.06)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: "linear-gradient(90deg,#7c3aed,#a78bfa)" }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400" style={{ fontFamily: "var(--font-nunito)" }}>
                <span>{fmt(totalPaid)} paid</span>
                <span>{fmt(outstanding)} remaining</span>
              </div>
            </div>

            {/* Instalment list */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-navy mb-3" style={{ fontFamily: "var(--font-nunito)" }}>Payment Schedule</h2>
              <div className="space-y-2">
                {fees.map(f => {
                  const isPaid = f.status === "paid";
                  const isOverdue = f.status === "overdue";
                  const color = isPaid ? "#16a34a" : isOverdue ? "#dc2626" : "#FF6B6B";
                  const bg    = isPaid ? "rgba(107,203,119,0.10)" : isOverdue ? "rgba(220,38,38,0.08)" : "rgba(255,107,107,0.08)";
                  const label = isPaid ? "Paid" : isOverdue ? "Overdue" : "Due";
                  const isOpen = expanded === f.id;
                  return (
                    <div key={f.id} className="rounded-2xl overflow-hidden" style={{ background: bg, border: `1px solid ${color}25` }}>
                      <button type="button" onClick={() => setExpanded(isOpen ? null : f.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left">
                        <div className="flex-shrink-0">
                          {isPaid ? <CheckCircle size={16} style={{ color }} /> :
                           isOverdue ? <AlertCircle size={16} style={{ color }} /> :
                           <Clock size={16} style={{ color }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{f.fee_structures.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: "var(--font-nunito)" }}>
                            {new Date(f.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                        <span className="text-sm font-bold flex-shrink-0" style={{ color, fontFamily: "var(--font-nunito)" }}>
                          {fmt(f.amount_due)}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 bg-white/60" style={{ color, fontFamily: "var(--font-nunito)" }}>
                          {label}
                        </span>
                        {isOpen ? <ChevronUp size={13} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={13} className="text-gray-400 flex-shrink-0" />}
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-3">
                          {isPaid ? (
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500" style={{ fontFamily: "var(--font-nunito)" }}>
                                Paid on {f.paid_at ? new Date(f.paid_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                                {f.receipt_no && <> · Receipt: <span className="font-semibold text-navy">{f.receipt_no}</span></>}
                              </p>
                            </div>
                          ) : (
                            <button onClick={() => { setPayTarget(f); setPayStep("select"); }}
                              className="w-full py-2 rounded-xl text-xs font-bold text-white mt-1"
                              style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", fontFamily: "var(--font-nunito)" }}>
                              Pay {fmt(f.amount_due)} Now
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Payment Modal */}
      {payStep !== "idle" && payTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.40)" }}>
          <div className="w-full max-w-sm rounded-3xl p-6 shadow-2xl bg-white">

            {payStep === "select" && (
              <>
                <h3 className="text-base font-bold text-navy mb-0.5" style={{ fontFamily: "var(--font-nunito)" }}>{payTarget.fee_structures.name}</h3>
                <p className="text-2xl font-bold mb-5" style={{ color: "#7c3aed", fontFamily: "var(--font-nunito)" }}>{fmt(payTarget.amount_due)}</p>
                <p className="text-xs font-bold text-gray-500 mb-2" style={{ fontFamily: "var(--font-nunito)" }}>Choose payment method</p>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {PAY_MODES.map(m => (
                    <button key={m.mode} onClick={() => setPayMode(m.mode)}
                      className="p-3 rounded-2xl text-left transition-all"
                      style={{
                        background: payMode === m.mode ? "rgba(124,58,237,0.10)" : "rgba(26,26,46,0.04)",
                        border: `1.5px solid ${payMode === m.mode ? "rgba(124,58,237,0.35)" : "transparent"}`,
                      }}>
                      <p className="text-lg mb-0.5">{m.emoji}</p>
                      <p className="text-xs font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{m.mode}</p>
                      <p className="text-xs text-gray-400" style={{ fontFamily: "var(--font-nunito)" }}>{m.sub}</p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setPayStep("idle"); setPayTarget(null); }}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-bold"
                    style={{ background: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>
                    Cancel
                  </button>
                  <button onClick={() => setPayStep("confirm")}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", fontFamily: "var(--font-nunito)" }}>
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
                    { label: "Student", value: child?.name ?? "—" },
                    { label: "Class",   value: child ? `${child.class}-${child.section}` : "—" },
                    { label: "For",     value: payTarget.fee_structures.name },
                    { label: "Amount",  value: fmt(payTarget.amount_due) },
                    { label: "Method",  value: payMode },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between">
                      <p className="text-xs text-gray-400" style={{ fontFamily: "var(--font-nunito)" }}>{r.label}</p>
                      <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{r.value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setPayStep("select")}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-bold"
                    style={{ background: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>
                    Back
                  </button>
                  <button onClick={handlePay} disabled={paying}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", fontFamily: "var(--font-nunito)" }}>
                    {paying ? "Opening…" : `Pay ${fmt(payTarget.amount_due)}`}
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
                <p className="text-sm text-gray-500 mb-1" style={{ fontFamily: "var(--font-nunito)" }}>
                  {fmt(payTarget.amount_due)} paid via {payMode}
                </p>
                {doneReceipt && (
                  <p className="text-xs text-gray-400 mb-5" style={{ fontFamily: "var(--font-nunito)" }}>
                    Receipt: {doneReceipt} · {new Date().toLocaleDateString("en-IN")}
                  </p>
                )}
                <button onClick={() => { setPayStep("idle"); setPayTarget(null); }}
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
