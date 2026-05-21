"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { Save, CheckCircle } from "lucide-react";

export default function SuperAdminSettingsPage() {
  const [user, setUser] = useState("");
  const [active, setActive] = useState("platform");
  const [saved, setSaved] = useState<string | null>(null);

  const [platform, setPlatform] = useState({
    platformName: "Smart Neurons ERP",
    supportEmail: "support@smartneurons.in",
    helpUrl: "help.smartneurons.in",
    maxSchools: "50",
    maxStudentsPerSchool: "500",
    defaultPlan: "Growth",
    trialDays: "30",
  });

  const [billing, setBilling] = useState({
    starterMonthly: "1999",
    growthMonthly: "4999",
    enterpriseMonthly: "9999",
    taxRate: "18",
    currency: "INR",
    invoicePrefix: "SN-INV",
  });

  const [features, setFeatures] = useState({
    liveClasses: false,
    razorpay: true,
    fcmPush: true,
    smsAlerts: true,
    emailReports: true,
    parentApp: true,
    aiInsights: false,
    multiLanguage: false,
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUser(user.user_metadata?.name || "Super Admin");
    });
  }, []);

  function handleSave(id: string) {
    setSaved(id);
    setTimeout(() => setSaved(null), 2500);
  }

  const SaveBtn = ({ id }: { id: string }) => (
    <button type="button" onClick={() => handleSave(id)}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
      style={{
        background: saved === id ? "rgba(107,203,119,0.15)" : "linear-gradient(135deg,#1A1A2E,#2d2d4e)",
        color: saved === id ? "#6BCB77" : "white",
        boxShadow: saved === id ? "none" : "0 3px 10px rgba(26,26,46,0.25)",
        fontFamily: "var(--font-nunito)",
      }}>
      {saved === id ? <><CheckCircle size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
    </button>
  );

  const SECTIONS = [
    { id: "platform", label: "Platform" },
    { id: "billing",  label: "Billing & Plans" },
    { id: "features", label: "Feature Flags" },
  ];

  return (
    <ERPShell role="superadmin" userName={user}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Platform Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          Global configuration for the Smart Neurons ERP platform
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card p-2">
            {SECTIONS.map(s => (
              <button key={s.id} type="button" onClick={() => setActive(s.id)}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all"
                style={{
                  background: active === s.id ? "rgba(26,26,46,0.10)" : "transparent",
                  color: active === s.id ? "#1A1A2E" : "rgba(26,26,46,0.55)",
                  fontFamily: "var(--font-nunito)",
                  fontWeight: active === s.id ? 700 : 500,
                }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">

          {/* Platform */}
          {active === "platform" && (
            <div className="glass-card p-6">
              <p className="text-base font-bold text-navy mb-5" style={{ fontFamily: "var(--font-nunito)" }}>Platform Configuration</p>
              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                {([
                  { label: "Platform Name",           key: "platformName" },
                  { label: "Support Email",            key: "supportEmail" },
                  { label: "Help Centre URL",          key: "helpUrl" },
                  { label: "Max Schools",              key: "maxSchools" },
                  { label: "Max Students / School",    key: "maxStudentsPerSchool" },
                  { label: "Trial Period (days)",       key: "trialDays" },
                ] as const).map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>{f.label}</label>
                    <input type="text" value={platform[f.key]}
                      onChange={e => setPlatform(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm"
                      style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.09)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }} />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>Default Plan</label>
                  <select value={platform.defaultPlan}
                    onChange={e => setPlatform(p => ({ ...p, defaultPlan: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.09)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }}>
                    {["Starter", "Growth", "Enterprise"].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <SaveBtn id="platform" />
            </div>
          )}

          {/* Billing */}
          {active === "billing" && (
            <div className="glass-card p-6">
              <p className="text-base font-bold text-navy mb-5" style={{ fontFamily: "var(--font-nunito)" }}>Billing & Plan Pricing</p>
              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                {([
                  { label: "Starter — Monthly (₹)", key: "starterMonthly" },
                  { label: "Growth — Monthly (₹)",  key: "growthMonthly" },
                  { label: "Enterprise — Monthly (₹)", key: "enterpriseMonthly" },
                  { label: "GST Rate (%)",           key: "taxRate" },
                  { label: "Currency",               key: "currency" },
                  { label: "Invoice Prefix",         key: "invoicePrefix" },
                ] as const).map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>{f.label}</label>
                    <input type="text" value={billing[f.key]}
                      onChange={e => setBilling(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm"
                      style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.09)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }} />
                  </div>
                ))}
              </div>
              <SaveBtn id="billing" />
            </div>
          )}

          {/* Feature Flags */}
          {active === "features" && (
            <div className="glass-card p-6">
              <p className="text-base font-bold text-navy mb-1" style={{ fontFamily: "var(--font-nunito)" }}>Feature Flags</p>
              <p className="text-xs mb-5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
                Toggle features globally across all schools on the platform.
              </p>
              <div className="space-y-2 mb-5">
                {([
                  { key: "razorpay",      label: "Razorpay Payments",        desc: "Enable online fee collection via Razorpay" },
                  { key: "fcmPush",       label: "Firebase Push (FCM)",       desc: "Push notifications to mobile app" },
                  { key: "smsAlerts",     label: "SMS Alerts (MSG91)",        desc: "OTP and transactional SMS" },
                  { key: "emailReports",  label: "Email Reports",             desc: "Weekly and monthly email digests" },
                  { key: "parentApp",     label: "Parent Mobile App",         desc: "Flutter app access for parents" },
                  { key: "liveClasses",   label: "Live Classes (Agora)",      desc: "Video streaming for online sessions" },
                  { key: "aiInsights",    label: "AI Insights (Beta)",        desc: "ML-based attendance and performance insights" },
                  { key: "multiLanguage", label: "Multi-Language Support",    desc: "Hindi, Marathi, Tamil, Telugu interfaces" },
                ] as const).map(item => (
                  <div key={item.key} className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: "rgba(26,26,46,0.03)", border: "1px solid rgba(26,26,46,0.06)" }}>
                    <div>
                      <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{item.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{item.desc}</p>
                    </div>
                    <button type="button" onClick={() => setFeatures(p => ({ ...p, [item.key]: !p[item.key] }))}
                      className="w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 relative ml-3"
                      style={{ background: features[item.key] ? "#1A1A2E" : "rgba(26,26,46,0.15)" }}>
                      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
                        style={{ left: features[item.key] ? "22px" : "2px" }} />
                    </button>
                  </div>
                ))}
              </div>
              <SaveBtn id="features" />
            </div>
          )}

        </div>
      </div>
    </ERPShell>
  );
}
