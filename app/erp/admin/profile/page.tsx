"use client";

import { useState, useEffect } from "react";
import ERPShell from "@/components/erp/ERPShell";
import { createClient } from "@/lib/supabase/client";
import {
  User, Mail, Calendar, Building2, Users, GraduationCap,
  Pencil, Check, X, Shield, MapPin, BookOpen,
} from "lucide-react";
import type { User as SupaUser } from "@supabase/supabase-js";

function InfoRow({ icon, label, value, color = "#FF6B6B" }: {
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

export default function AdminProfilePage() {
  const [user, setUser] = useState<SupaUser | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [editName, setEditName] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const name = user.user_metadata?.name || user.email?.split("@")[0] || "Admin";
      setUser(user);
      setDisplayName(name);
      setEditName(name);
    });
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

  const initials = displayName.split(" ").filter(Boolean).map(w => w[0]).join("").toUpperCase().slice(0, 2) || "A";
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  const stats = [
    { label: "Students", value: "15", icon: <Users size={18} />, color: "#6BCB77" },
    { label: "Staff Members", value: "7", icon: <GraduationCap size={18} />, color: "#FF6B6B" },
    { label: "Classes", value: "5", icon: <BookOpen size={18} />, color: "#d97706" },
    { label: "Academic Year", value: "2026-27", icon: <Calendar size={18} />, color: "#7c3aed" },
  ];

  return (
    <ERPShell role="admin" userName={displayName}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>My Profile</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          Account information and preferences
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Avatar card */}
        <div className="glass-card p-6 flex flex-col items-center text-center gap-3">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
            style={{ background: "linear-gradient(135deg,#FF6B6B,#ff9a9a)", fontFamily: "var(--font-nunito)" }}
          >
            {initials}
          </div>

          {editing ? (
            <div className="w-full space-y-2">
              <input
                className="w-full text-center text-sm font-bold text-navy border rounded-xl px-3 py-2 outline-none focus:ring-2"
                style={{ borderColor: "rgba(255,107,107,0.4)", fontFamily: "var(--font-nunito)", background: "rgba(255,107,107,0.04)" }}
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
                style={{ background: "rgba(255,107,107,0.10)", color: "#FF6B6B", fontFamily: "var(--font-nunito)" }}>
                <Shield size={11} /> School Admin
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
            <InfoRow icon={<User size={15} />}     label="Full Name"  value={displayName} />
            <InfoRow icon={<Mail size={15} />}     label="Email"      value={user?.email || "—"} />
            <InfoRow icon={<Shield size={15} />}   label="Role"       value="School Administrator" />
            <InfoRow icon={<Calendar size={15} />} label="Joined"     value={memberSince} />
          </div>
        </div>

        {/* School info */}
        <div className="glass-card p-5">
          <p className="text-sm font-bold text-navy mb-4" style={{ fontFamily: "var(--font-nunito)" }}>School Information</p>
          <div className="space-y-4">
            <InfoRow icon={<Building2 size={15} />} label="School"        value="Smart Neurons Preschool"   color="#7c3aed" />
            <InfoRow icon={<MapPin size={15} />}    label="Location"      value="Bhopal, Madhya Pradesh"    color="#7c3aed" />
            <InfoRow icon={<Calendar size={15} />}  label="Academic Year" value="2026 – 27"                 color="#7c3aed" />
            <InfoRow icon={<Users size={15} />}     label="Enrollment"    value="15 students · 5 classes"   color="#7c3aed" />
          </div>
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
