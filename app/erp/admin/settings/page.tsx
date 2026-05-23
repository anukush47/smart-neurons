"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { Save, CheckCircle } from "lucide-react";

interface S { school_name: string; tagline: string; address: string; phone: string; email: string; academic_year: string; }
const DEF: S = { school_name: "Smart Neurons", tagline: "Where Little Minds Bloom", address: "Bhopal, Madhya Pradesh", phone: "+91 98765 43210", email: "info@smartneurons.in", academic_year: "2025-26" };

export default function AdminSettingsPage() {
  const [userName, setUserName] = useState("");
  const [form, setForm] = useState<S>(DEF);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => { if (user) setUserName(user.app_metadata?.name || user.user_metadata?.name || "Admin"); });
    fetch("/api/settings").then(r => r.json()).then(d => { if (d.settings) setForm({ ...DEF, ...d.settings }); setLoading(false); });
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
  }

  const fields: { key: keyof S; label: string }[] = [
    { key: "school_name", label: "School Name" }, { key: "tagline", label: "Tagline" },
    { key: "address", label: "Address" }, { key: "phone", label: "Phone" },
    { key: "email", label: "Email" }, { key: "academic_year", label: "Academic Year" },
  ];

  return (
    <ERPShell role="admin" userName={userName}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>School Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>Manage your school's basic information</p>
      </div>
      <div className="glass-card p-6 max-w-2xl">
        {loading ? <p className="text-sm text-center py-8" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>Loading…</p> : (
          <div className="space-y-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="block text-xs font-bold mb-1.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</label>
                <input type="text" value={form[f.key]} onChange={e => { setForm(p => ({ ...p, [f.key]: e.target.value })); setSaved(false); }}
                  className="w-full px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.09)", outline: "none", fontFamily: "var(--font-inter)", color: "#1A1A2E" }} />
              </div>
            ))}
            <div className="pt-2">
              <button type="button" onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                style={{ background: saved ? "rgba(107,203,119,0.90)" : "linear-gradient(135deg,#1A1A2E,#2d2d4e)", fontFamily: "var(--font-nunito)" }}>
                {saved ? <CheckCircle size={15} /> : <Save size={15} />}
                {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </ERPShell>
  );
}
