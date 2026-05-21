"use client";

import { useState, useEffect } from "react";
import ERPShell from "@/components/erp/ERPShell";
import { createClient } from "@/lib/supabase/client";
import {
  User, Phone, Calendar, BookOpen, CreditCard,
  Pencil, Check, X, GraduationCap, ClipboardList, Hash,
} from "lucide-react";
import type { User as SupaUser } from "@supabase/supabase-js";

function InfoRow({ icon, label, value, color = "#d97706" }: {
  icon: React.ReactNode; label: string; value: string; color?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{label}</p>
        <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{value}</p>
      </div>
    </div>
  );
}

interface ChildInfo {
  name: string;
  class: string;
  section: string;
  roll_no: string;
}

export default function ParentProfilePage() {
  const [user, setUser] = useState<SupaUser | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [editName, setEditName] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [child, setChild] = useState<ChildInfo | null>(null);
  const [feeStats, setFeeStats] = useState({ paid: 0, total: 0, pending: 0 });

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const name = user.user_metadata?.name || "Parent";
      setUser(user);
      setDisplayName(name);
      setEditName(name);
    });

    fetch("/api/fees/my-child")
      .then(r => r.json())
      .then(data => {
        if (!data.fees?.length) return;
        // Extract child from first record
        const first = data.fees[0];
        if (first.students) setChild(first.students as ChildInfo);
        const paid    = data.fees.filter((f: { status: string }) => f.status === "paid").length;
        const pending = data.fees.filter((f: { status: string }) => f.status === "pending").length;
        setFeeStats({ paid, total: data.fees.length, pending });
      })
      .catch(() => {/* ignore */});
  }, []);

  async function handleSave() {
    if (!user || !editName.trim()) return;
    setSaving(true);
    const sb = createClient();
    const { error } = await sb.auth.updateUser({ data: { name: editName.trim() } });
    if (!error) {
      setDisplayName(editName.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
    setEditing(false);
  }

  const initials = displayName.split(" ").filter(Boolean).map(w => w[0]).join("").toUpperCase().slice(0, 2) || "P";
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "—";
  const phone = user?.phone || "—";

  const stats = [
    { label: "Child's Class",   value: child ? `${child.class}-${child.section}` : "—", icon: <BookOpen size={18} />,      color: "#d97706" },
    { label: "Roll Number",     value: child?.roll_no ? `#${child.roll_no}` : "—",      icon: <Hash size={18} />,           color: "#6BCB77" },
    { label: "Fees Paid",       value: `${feeStats.paid}/${feeStats.total}`,             icon: <CreditCard size={18} />,     color: "#7c3aed" },
    { label: "Fees Pending",    value: String(feeStats.pending),                          icon: <ClipboardList size={18} />,  color: "#FF6B6B" },
  ];

  return (
    <ERPShell role="parent" userName={displayName}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>My Profile</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          Your account and your child&apos;s information
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Avatar */}
        <div className="glass-card p-6 flex flex-col items-center text-center gap-3">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
            style={{ background: "linear-gradient(135deg,#d97706,#fbbf24)", fontFamily: "var(--font-nunito)" }}
          >
            {initials}
          </div>

          {editing ? (
            <div className="w-full space-y-2">
              <input
                className="w-full text-center text-sm font-bold text-navy border rounded-xl px-3 py-2 outline-none focus:ring-2"
                style={{ borderColor: "rgba(217,119,6,0.4)", fontFamily: "var(--font-nunito)", background: "rgba(217,119,6,0.04)" }}
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSave()}
                autoFocus
              />
              <div className="flex gap-2 justify-center">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
                  <Check size={13} /> {saving ? "Saving…" : "Save"}
                </button>
                <button onClick={() => { setEditing(false); setEditName(displayName); }}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-opacity hover:opacity-70"
                  style={{ background: "rgba(26,26,46,0.08)", color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>
                  <X size={13} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-center gap-2 justify-center">
                  <p className="text-base font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{displayName}</p>
                  <button onClick={() => setEditing(true)} title="Edit name"
                    className="opacity-30 hover:opacity-70 transition-opacity">
                    <Pencil size={13} className="text-navy" />
                  </button>
                </div>
                {saved && (
                  <p className="text-xs mt-0.5" style={{ color: "#6BCB77", fontFamily: "var(--font-inter)" }}>Name updated!</p>
                )}
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: "rgba(217,119,6,0.10)", color: "#d97706", fontFamily: "var(--font-nunito)" }}>
                👨‍👩‍👧 Parent
              </span>
              <div className="w-full pt-3 border-t" style={{ borderColor: "rgba(26,26,46,0.07)" }}>
                <p className="text-xs" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>Member since</p>
                <p className="text-sm font-semibold text-navy mt-0.5" style={{ fontFamily: "var(--font-nunito)" }}>{memberSince}</p>
              </div>
            </>
          )}
        </div>

        {/* Personal info */}
        <div className="glass-card p-5">
          <p className="text-sm font-bold text-navy mb-4" style={{ fontFamily: "var(--font-nunito)" }}>Personal Information</p>
          <div className="space-y-4">
            <InfoRow icon={<User size={15} />}    label="Full Name"    value={displayName} />
            <InfoRow icon={<Phone size={15} />}   label="Phone (Login)" value={phone} />
            <InfoRow icon={<Calendar size={15} />}label="Joined"        value={memberSince} />
            <InfoRow icon={<GraduationCap size={15} />} label="Role"   value="Parent / Guardian" />
          </div>
        </div>

        {/* Child info */}
        <div className="glass-card p-5">
          <p className="text-sm font-bold text-navy mb-4" style={{ fontFamily: "var(--font-nunito)" }}>Child Information</p>
          {child ? (
            <div className="space-y-4">
              <InfoRow icon={<User size={15} />}        label="Child's Name" value={child.name}                          color="#6BCB77" />
              <InfoRow icon={<BookOpen size={15} />}    label="Class"        value={`${child.class} — Section ${child.section}`} color="#6BCB77" />
              <InfoRow icon={<Hash size={15} />}        label="Roll Number"  value={child.roll_no || "—"}                color="#6BCB77" />
              <InfoRow icon={<ClipboardList size={15} />}label="Academic Year" value="2026 – 27"                         color="#6BCB77" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(107,203,119,0.10)" }}>
                <BookOpen size={18} style={{ color: "#6BCB77" }} />
              </div>
              <p className="text-xs text-center" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
                Loading child information…
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="glass-card p-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${s.color}18`, color: s.color }}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{s.label}</p>
          </div>
        ))}
      </div>
    </ERPShell>
  );
}
