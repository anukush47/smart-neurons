"use client";

import { useState, useEffect } from "react";
import ERPShell from "@/components/erp/ERPShell";
import { createClient } from "@/lib/supabase/client";
import { User, Mail, Phone, GraduationCap, Hash, CheckCircle, AlertCircle } from "lucide-react";

interface Child {
  id: string;
  name: string;
  class: string;
  section: string;
  roll_no: number | null;
  dob: string | null;
  gender: string | null;
}

export default function ParentProfilePage() {
  const [profile, setProfile] = useState<{
    id: string; email: string; name: string; phone: string; createdAt: string;
  } | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) { setLoading(false); return; }
      const u = data.user;
      const p = {
        id: u.id,
        email: u.email ?? "",
        name: u.app_metadata?.name || u.user_metadata?.name || "Parent",
        phone: u.app_metadata?.phone || u.user_metadata?.phone || "",
        createdAt: u.created_at || "",
      };
      setProfile(p);
      setName(p.name);
      setPhone(p.phone);

      // Load child info
      const res = await fetch("/api/students/my-child");
      if (res.ok) {
        const json = await res.json();
        if (json.student) setChild(json.student);
      }
      setLoading(false);
    }
    load();
  }, []);

  function showFlash(type: "ok" | "err", msg: string) {
    setFlash({ type, msg });
    setTimeout(() => setFlash(null), 3000);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
    });
    const json = await res.json();
    setSaving(false);
    if (json.error) { showFlash("err", json.error); return; }
    setProfile(prev => prev ? { ...prev, name: name.trim(), phone: phone.trim() } : prev);
    showFlash("ok", "Profile updated");
  }

  if (loading) return (
    <ERPShell role="parent">
      <div className="flex items-center justify-center h-64 text-gray-400" style={{ fontFamily: "var(--font-nunito)" }}>Loading…</div>
    </ERPShell>
  );

  if (!profile) return (
    <ERPShell role="parent">
      <div className="text-center py-16 text-red-500" style={{ fontFamily: "var(--font-nunito)" }}>Could not load profile</div>
    </ERPShell>
  );

  const initials = profile.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <ERPShell role="parent" userName={profile.name}>
      <div className="max-w-2xl mx-auto space-y-5">
        {flash && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${flash.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
            style={{ fontFamily: "var(--font-nunito)" }}>
            {flash.type === "ok" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {flash.msg}
          </div>
        )}

        {/* Avatar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{ background: "#d97706", fontFamily: "var(--font-nunito)" }}>
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{profile.name}</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
              style={{ background: "#d97706", fontFamily: "var(--font-nunito)" }}>PARENT</span>
            <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: "var(--font-nunito)" }}>
              Member since {new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Child Info */}
        {child && (
          <div className="bg-amber-50 rounded-2xl p-6 shadow-sm border border-amber-100">
            <h2 className="font-bold text-amber-800 text-sm mb-4" style={{ fontFamily: "var(--font-nunito)" }}>Your Child</h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                style={{ background: "#d97706", fontFamily: "var(--font-nunito)" }}>
                {child.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 space-y-1.5">
                <p className="font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{child.name}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-amber-700" style={{ fontFamily: "var(--font-nunito)" }}>
                    <GraduationCap size={12} /> {child.class}-{child.section}
                  </span>
                  {child.roll_no && (
                    <span className="flex items-center gap-1 text-xs text-amber-700" style={{ fontFamily: "var(--font-nunito)" }}>
                      <Hash size={12} /> Roll {child.roll_no}
                    </span>
                  )}
                  {child.gender && (
                    <span className="text-xs text-amber-700" style={{ fontFamily: "var(--font-nunito)" }}>{child.gender}</span>
                  )}
                  {child.dob && (
                    <span className="text-xs text-amber-700" style={{ fontFamily: "var(--font-nunito)" }}>
                      DOB: {new Date(child.dob).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-navy text-sm" style={{ fontFamily: "var(--font-nunito)" }}>Account Info</h2>
          <div className="flex items-center gap-3 py-2 border-b border-gray-50">
            <Mail size={16} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400" style={{ fontFamily: "var(--font-nunito)" }}>Email</p>
              <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Edit */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-navy text-sm" style={{ fontFamily: "var(--font-nunito)" }}>Edit Profile</h2>
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1" style={{ fontFamily: "var(--font-nunito)" }}>Full Name</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm" style={{ fontFamily: "var(--font-nunito)" }}
                placeholder="Your full name" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1" style={{ fontFamily: "var(--font-nunito)" }}>Phone Number</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm" style={{ fontFamily: "var(--font-nunito)" }}
                placeholder="+91 XXXXX XXXXX" />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
            style={{ background: "#d97706", fontFamily: "var(--font-nunito)" }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </ERPShell>
  );
}
