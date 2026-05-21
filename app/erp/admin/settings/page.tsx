"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { Save, CheckCircle, Bell, Lock, User, School, Palette, Globe } from "lucide-react";

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const SECTIONS: SettingsSection[] = [
  { id: "school",        label: "School Profile",    icon: <School size={16} /> },
  { id: "account",       label: "My Account",        icon: <User size={16} /> },
  { id: "notifications", label: "Notifications",     icon: <Bell size={16} /> },
  { id: "security",      label: "Security",          icon: <Lock size={16} /> },
  { id: "appearance",    label: "Appearance",        icon: <Palette size={16} /> },
  { id: "localization",  label: "Localization",      icon: <Globe size={16} /> },
];

export default function AdminSettingsPage() {
  const [user, setUser] = useState("");
  const [active, setActive] = useState("school");
  const [saved, setSaved] = useState<string | null>(null);

  // School profile
  const [school, setSchool] = useState({
    name: "Smart Neurons Preschool",
    tagline: "Where Little Minds Bloom",
    email: "admin@smartneurons.in",
    phone: "+91 98765 43210",
    address: "12, Green Park Avenue, Bhopal, MP 462001",
    website: "www.smartneurons.in",
    estYear: "2018",
    affiliation: "MP State Board",
    principal: "Mrs. Sunita Verma",
  });

  // Account
  const [account, setAccount] = useState({
    name: "School Admin",
    email: "admin@smartneurons.in",
    phone: "+91 98765 43210",
    password: "",
    confirm: "",
  });

  // Notifications
  const [notifs, setNotifs] = useState({
    feeReminders: true,
    attendanceAlerts: true,
    leaveRequests: true,
    newEnquiries: true,
    systemUpdates: false,
    weeklyReport: true,
  });

  // Appearance
  const [theme, setTheme] = useState("glass");
  const [accentColor, setAccentColor] = useState("#FF6B6B");

  // Localization
  const [locale, setLocale] = useState({
    language: "English",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    currency: "INR (₹)",
    academicStart: "April",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUser(user.user_metadata?.name || "Admin");
    });
  }, []);

  function handleSave(section: string) {
    setSaved(section);
    setTimeout(() => setSaved(null), 2500);
  }

  const SaveBtn = ({ id }: { id: string }) => (
    <button type="button" onClick={() => handleSave(id)}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
      style={{
        background: saved === id ? "rgba(107,203,119,0.15)" : "linear-gradient(135deg,#FF6B6B,#ff8e8e)",
        color: saved === id ? "#6BCB77" : "white",
        boxShadow: saved === id ? "none" : "0 3px 10px rgba(255,107,107,0.28)",
        fontFamily: "var(--font-nunito)",
      }}>
      {saved === id ? <><CheckCircle size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
    </button>
  );

  return (
    <ERPShell role="admin" userName={user}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          Manage school profile, account, and preferences
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card p-2">
            {SECTIONS.map(s => (
              <button key={s.id} type="button" onClick={() => setActive(s.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                style={{
                  background: active === s.id ? "rgba(255,107,107,0.10)" : "transparent",
                  color: active === s.id ? "#FF6B6B" : "rgba(26,26,46,0.60)",
                  fontFamily: "var(--font-nunito)",
                  fontWeight: active === s.id ? 700 : 500,
                }}>
                <span style={{ color: active === s.id ? "#FF6B6B" : "rgba(26,26,46,0.40)" }}>{s.icon}</span>
                <span className="text-sm">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">

          {/* School Profile */}
          {active === "school" && (
            <div className="glass-card p-6">
              <p className="text-base font-bold text-navy mb-5" style={{ fontFamily: "var(--font-nunito)" }}>School Profile</p>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                {([
                  { label: "School Name",    key: "name" },
                  { label: "Tagline",        key: "tagline" },
                  { label: "Email Address",  key: "email" },
                  { label: "Phone Number",   key: "phone" },
                  { label: "Website",        key: "website" },
                  { label: "Year Established", key: "estYear" },
                  { label: "Affiliation",    key: "affiliation" },
                  { label: "Principal Name", key: "principal" },
                ] as const).map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>
                      {f.label}
                    </label>
                    <input type="text" value={school[f.key]}
                      onChange={e => setSchool(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm"
                      style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.09)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }} />
                  </div>
                ))}
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>Address</label>
                <textarea rows={2} value={school.address}
                  onChange={e => setSchool(p => ({ ...p, address: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm resize-none"
                  style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.09)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }} />
              </div>
              <SaveBtn id="school" />
            </div>
          )}

          {/* Account */}
          {active === "account" && (
            <div className="space-y-4">
              <div className="glass-card p-6">
                <p className="text-base font-bold text-navy mb-5" style={{ fontFamily: "var(--font-nunito)" }}>Account Details</p>
                <div className="grid sm:grid-cols-2 gap-4 mb-5">
                  {([
                    { label: "Full Name",  key: "name",  type: "text" },
                    { label: "Email",      key: "email", type: "email" },
                    { label: "Phone",      key: "phone", type: "tel" },
                  ] as const).map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>{f.label}</label>
                      <input type={f.type} value={account[f.key]}
                        onChange={e => setAccount(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl text-sm"
                        style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.09)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }} />
                    </div>
                  ))}
                </div>
                <SaveBtn id="account" />
              </div>
              <div className="glass-card p-6">
                <p className="text-base font-bold text-navy mb-5" style={{ fontFamily: "var(--font-nunito)" }}>Change Password</p>
                <div className="grid sm:grid-cols-2 gap-4 mb-5">
                  {([
                    { label: "New Password",     key: "password" },
                    { label: "Confirm Password", key: "confirm" },
                  ] as const).map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>{f.label}</label>
                      <input type="password" value={account[f.key]}
                        placeholder="••••••••"
                        onChange={e => setAccount(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl text-sm"
                        style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.09)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }} />
                    </div>
                  ))}
                </div>
                <SaveBtn id="password" />
              </div>
            </div>
          )}

          {/* Notifications */}
          {active === "notifications" && (
            <div className="glass-card p-6">
              <p className="text-base font-bold text-navy mb-5" style={{ fontFamily: "var(--font-nunito)" }}>Notification Preferences</p>
              <div className="space-y-1 mb-6">
                {([
                  { key: "feeReminders",     label: "Fee payment reminders",          desc: "Alert when fee due date is approaching" },
                  { key: "attendanceAlerts", label: "Attendance alerts",              desc: "Notify when student attendance drops below 75%" },
                  { key: "leaveRequests",    label: "Staff leave requests",           desc: "Notify when a staff member applies for leave" },
                  { key: "newEnquiries",     label: "New admissions enquiries",       desc: "Alert on new enquiry form submissions" },
                  { key: "systemUpdates",    label: "System updates",                 desc: "ERP platform update notifications" },
                  { key: "weeklyReport",     label: "Weekly summary report",          desc: "Receive a weekly school activity digest" },
                ] as const).map(item => (
                  <div key={item.key} className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: "rgba(26,26,46,0.03)", border: "1px solid rgba(26,26,46,0.06)" }}>
                    <div>
                      <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{item.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{item.desc}</p>
                    </div>
                    <button type="button" onClick={() => setNotifs(p => ({ ...p, [item.key]: !p[item.key] }))}
                      className="w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 relative"
                      style={{ background: notifs[item.key] ? "#FF6B6B" : "rgba(26,26,46,0.15)" }}>
                      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
                        style={{ left: notifs[item.key] ? "22px" : "2px" }} />
                    </button>
                  </div>
                ))}
              </div>
              <SaveBtn id="notifications" />
            </div>
          )}

          {/* Security */}
          {active === "security" && (
            <div className="space-y-4">
              <div className="glass-card p-6">
                <p className="text-base font-bold text-navy mb-1" style={{ fontFamily: "var(--font-nunito)" }}>Two-Factor Authentication</p>
                <p className="text-xs mb-4" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>Add an extra layer of security to your admin account.</p>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
                  style={{ background: "rgba(107,203,119,0.08)", border: "1px solid rgba(107,203,119,0.20)" }}>
                  <CheckCircle size={16} style={{ color: "#6BCB77" }} />
                  <p className="text-sm font-semibold" style={{ color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>2FA is enabled via SMS (MSG91)</p>
                </div>
                <button type="button" className="px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ background: "rgba(255,107,107,0.10)", color: "#FF6B6B", fontFamily: "var(--font-nunito)" }}>
                  Reconfigure 2FA
                </button>
              </div>
              <div className="glass-card p-6">
                <p className="text-base font-bold text-navy mb-1" style={{ fontFamily: "var(--font-nunito)" }}>Active Sessions</p>
                <p className="text-xs mb-4" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>Devices currently logged into your admin account.</p>
                {[
                  { device: "MacBook Pro — Chrome", location: "Bhopal, MP", time: "Active now", current: true },
                  { device: "iPhone 15 — Safari",   location: "Bhopal, MP", time: "2 hours ago", current: false },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl mb-2"
                    style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.07)" }}>
                    <div>
                      <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{s.device}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{s.location} · {s.time}</p>
                    </div>
                    {s.current
                      ? <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(107,203,119,0.12)", color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>This device</span>
                      : <button type="button" className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,107,107,0.10)", color: "#FF6B6B", fontFamily: "var(--font-nunito)" }}>Revoke</button>
                    }
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appearance */}
          {active === "appearance" && (
            <div className="glass-card p-6">
              <p className="text-base font-bold text-navy mb-5" style={{ fontFamily: "var(--font-nunito)" }}>Appearance</p>
              <p className="text-xs font-semibold mb-3" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Theme</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { id: "glass",   label: "Liquid Glass", preview: "rgba(255,255,255,0.70)" },
                  { id: "flat",    label: "Flat White",   preview: "rgba(248,249,250,1)" },
                  { id: "minimal", label: "Minimal",      preview: "rgba(241,241,241,1)" },
                ].map(t => (
                  <button key={t.id} type="button" onClick={() => setTheme(t.id)}
                    className="p-3 rounded-xl text-left transition-all"
                    style={{
                      border: theme === t.id ? "2px solid #FF6B6B" : "2px solid rgba(26,26,46,0.10)",
                      background: t.preview,
                    }}>
                    <div className="h-8 rounded-lg mb-2" style={{ background: "rgba(26,26,46,0.08)" }} />
                    <p className="text-xs font-bold" style={{ color: theme === t.id ? "#FF6B6B" : "rgba(26,26,46,0.60)", fontFamily: "var(--font-nunito)" }}>{t.label}</p>
                  </button>
                ))}
              </div>
              <p className="text-xs font-semibold mb-3" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Accent Colour</p>
              <div className="flex gap-3 mb-6">
                {["#FF6B6B", "#6BCB77", "#d97706", "#7c3aed", "#1A1A2E", "#0ea5e9"].map(c => (
                  <button key={c} type="button" onClick={() => setAccentColor(c)}
                    className="w-9 h-9 rounded-xl transition-all hover:scale-110"
                    style={{
                      background: c,
                      boxShadow: accentColor === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : "none",
                    }} />
                ))}
              </div>
              <SaveBtn id="appearance" />
            </div>
          )}

          {/* Localization */}
          {active === "localization" && (
            <div className="glass-card p-6">
              <p className="text-base font-bold text-navy mb-5" style={{ fontFamily: "var(--font-nunito)" }}>Localization</p>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {([
                  { label: "Language",         key: "language",     options: ["English", "Hindi", "Marathi", "Tamil", "Telugu"] },
                  { label: "Timezone",         key: "timezone",     options: ["Asia/Kolkata", "Asia/Dubai", "Europe/London", "America/New_York"] },
                  { label: "Date Format",      key: "dateFormat",   options: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] },
                  { label: "Currency",         key: "currency",     options: ["INR (₹)", "USD ($)", "AED (د.إ)"] },
                  { label: "Academic Year Start", key: "academicStart", options: ["April", "June", "January", "July"] },
                ] as const).map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>{f.label}</label>
                    <select value={locale[f.key]}
                      onChange={e => setLocale(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm"
                      style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.09)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }}>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <SaveBtn id="localization" />
            </div>
          )}

        </div>
      </div>
    </ERPShell>
  );
}
