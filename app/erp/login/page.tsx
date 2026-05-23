"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";

type Role = "admin" | "faculty" | "parent";

interface RoleConfig {
  id: Role;
  label: string;
  emoji: string;
  tagline: string;
  color: string;
  bg: string;
  border: string;
  loginField: "email" | "phone";
  loginLabel: string;
  loginPlaceholder: string;
}

const roles: RoleConfig[] = [
  {
    id: "admin",
    label: "School Admin",
    emoji: "📊",
    tagline: "School operations & management",
    color: "#FF6B6B",
    bg: "rgba(255,107,107,0.08)",
    border: "rgba(255,107,107,0.25)",
    loginField: "email",
    loginLabel: "Admin Email",
    loginPlaceholder: "admin@smartneurons.in",
  },
  {
    id: "faculty",
    label: "Faculty",
    emoji: "🎓",
    tagline: "Teaching, attendance & learning",
    color: "#6BCB77",
    bg: "rgba(107,203,119,0.08)",
    border: "rgba(107,203,119,0.25)",
    loginField: "email",
    loginLabel: "Faculty Email",
    loginPlaceholder: "faculty@smartneurons.in",
  },
  {
    id: "parent",
    label: "Parent",
    emoji: "👨‍👩‍👧",
    tagline: "Your child's school life, anywhere",
    color: "#d97706",
    bg: "rgba(255,217,61,0.10)",
    border: "rgba(255,217,61,0.35)",
    loginField: "phone",
    loginLabel: "Registered Mobile Number",
    loginPlaceholder: "+91 XXXXX XXXXX",
  },
];

export default function ERPLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeRole = roles.find((r) => r.id === selectedRole);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setLoginValue("");
    setPassword("");
    setError("");
  };

  const handleNext = () => {
    if (!selectedRole) {
      setError("Please select your role to continue.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    if (!loginValue.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const isPhoneLogin = activeRole?.loginField === "phone";
      const credentials = isPhoneLogin
        ? { phone: loginValue, password }
        : { email: loginValue, password };
      const { data, error: authError } = await supabase.auth.signInWithPassword(credentials);

      if (authError) {
        setError(authError.message || "Invalid credentials. Please try again.");
        return;
      }

      const role = data.user?.app_metadata?.role as string | undefined;
      const validRoles = ["admin", "faculty", "parent"];
      if (!role || !validRoles.includes(role)) {
        setError("Account is not configured. Please contact your administrator.");
        return;
      }

      router.push(`/erp/${role}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar />
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-24 pb-12 px-4"
      style={{ background: "linear-gradient(135deg, #FFF5F5 0%, #FFFBF0 35%, #F0FDF4 65%, #F8F4F0 100%)" }}
    >
      {/* Floating blobs */}
      <div
        className="absolute top-10 right-10 w-72 h-72 opacity-40 animate-float blob"
        style={{ background: "linear-gradient(135deg, rgba(255,107,107,0.20), rgba(255,217,61,0.18))" }}
      />
      <div
        className="absolute bottom-10 left-10 w-56 h-56 opacity-35 animate-float-delay blob-sm"
        style={{ background: "linear-gradient(135deg, rgba(107,203,119,0.20), rgba(167,139,250,0.15))" }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-40 h-40 opacity-20 animate-float-slow blob"
        style={{ background: "linear-gradient(135deg, rgba(255,217,61,0.22), rgba(255,107,107,0.15))" }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(26,26,46,0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-lg"
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.65)",
          boxShadow: "0 24px 64px rgba(26,26,46,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
          borderRadius: "1.75rem",
        }}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center" style={{ borderBottom: "1px solid rgba(26,26,46,0.06)" }}>
          <div className="flex justify-center mb-4">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-md">
              <Image src="/logo.png" alt="Smart Neurons Logo" fill sizes="56px" className="object-contain" />
            </div>
          </div>
          <h1
            className="text-2xl font-bold text-navy"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Smart Neurons Portal
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}
          >
            {step === 1 ? "Select your role to continue" : `Signing in as ${activeRole?.label}`}
          </p>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2].map((s) => (
              <div
                key={s}
                className="flex items-center gap-2"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    background: step >= s ? "linear-gradient(135deg, #FF6B6B, #ff8e53)" : "rgba(26,26,46,0.08)",
                    color: step >= s ? "white" : "rgba(26,26,46,0.35)",
                    fontFamily: "var(--font-nunito)",
                  }}
                >
                  {step > s ? <CheckCircle size={14} /> : s}
                </div>
                <span
                  className="text-xs font-semibold"
                  style={{
                    fontFamily: "var(--font-nunito)",
                    color: step >= s ? "#FF6B6B" : "rgba(26,26,46,0.35)",
                  }}
                >
                  {s === 1 ? "Select Role" : "Sign In"}
                </span>
                {s < 2 && (
                  <div
                    className="w-8 h-0.5 rounded-full"
                    style={{ background: step > s ? "#FF6B6B" : "rgba(26,26,46,0.10)" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8">
          {/* Step 1: Role selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => {
                  const active = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role.id)}
                      className="p-4 rounded-2xl text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                      style={{
                        background: active ? role.bg : "rgba(255,255,255,0.60)",
                        border: `2px solid ${active ? role.color : "rgba(255,255,255,0.60)"}`,
                        boxShadow: active
                          ? `0 4px 20px ${role.color}22`
                          : "0 2px 8px rgba(26,26,46,0.06)",
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">{role.emoji}</span>
                        {active && (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: role.color }}
                          >
                            <CheckCircle size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                      <p
                        className="text-sm font-bold text-navy mb-0.5"
                        style={{ fontFamily: "var(--font-nunito)" }}
                      >
                        {role.label}
                      </p>
                      <p
                        className="text-xs leading-snug"
                        style={{ color: "rgba(26,26,46,0.52)", fontFamily: "var(--font-inter)" }}
                      >
                        {role.tagline}
                      </p>
                    </button>
                  );
                })}
              </div>

              {error && (
                <p
                  className="text-xs text-center"
                  style={{ color: "#FF6B6B", fontFamily: "var(--font-nunito)" }}
                >
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="btn-coral w-full justify-center mt-2"
                disabled={!selectedRole}
                style={{ opacity: selectedRole ? 1 : 0.5 }}
              >
                Continue <ArrowRight size={17} />
              </button>
            </div>
          )}

          {/* Step 2: Credentials */}
          {step === 2 && activeRole && (
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Role badge */}
              <div
                className="flex items-center gap-3 p-3.5 rounded-2xl"
                style={{ background: activeRole.bg, border: `1px solid ${activeRole.border}` }}
              >
                <span className="text-2xl">{activeRole.emoji}</span>
                <div>
                  <p
                    className="text-sm font-bold text-navy"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    {activeRole.label}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}
                  >
                    {activeRole.tagline}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="ml-auto text-xs font-semibold transition-opacity hover:opacity-70"
                  style={{ color: activeRole.color, fontFamily: "var(--font-nunito)" }}
                >
                  Change
                </button>
              </div>

              {/* Login field */}
              <div>
                <label
                  htmlFor="loginField"
                  className="block text-sm font-semibold text-navy mb-1.5"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  {activeRole.loginLabel} *
                </label>
                <input
                  id="loginField"
                  type={activeRole.loginField === "phone" ? "tel" : "email"}
                  value={loginValue}
                  onChange={(e) => setLoginValue(e.target.value)}
                  required
                  autoFocus
                  placeholder={activeRole.loginPlaceholder}
                  className="input-glass"
                  style={{
                    borderColor: loginValue ? `${activeRole.color}55` : undefined,
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-navy mb-1.5"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="input-glass pr-12"
                    style={{
                      borderColor: password ? `${activeRole.color}55` : undefined,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                    style={{ color: "rgba(26,26,46,0.45)" }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label
                  className="flex items-center gap-2 cursor-pointer text-sm"
                  style={{ color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-nunito)" }}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-coral-500"
                    style={{ accentColor: "#FF6B6B" }}
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="text-sm font-semibold transition-opacity hover:opacity-70"
                  style={{ color: activeRole.color, fontFamily: "var(--font-nunito)" }}
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <p
                  className="text-xs text-center"
                  style={{ color: "#FF6B6B", fontFamily: "var(--font-nunito)" }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-sm text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
                style={{
                  fontFamily: "var(--font-nunito)",
                  background: loading
                    ? "rgba(26,26,46,0.20)"
                    : `linear-gradient(135deg, ${activeRole.color}, ${activeRole.color}cc)`,
                  boxShadow: loading ? "none" : `0 8px 24px ${activeRole.color}35`,
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    Signing in…
                  </>
                ) : (
                  <>Sign In <ArrowRight size={16} /></>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setError(""); }}
                className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70 py-2"
                style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}
              >
                <ArrowLeft size={14} /> Back to role selection
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-8 py-4 text-center"
          style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}
        >
          <p
            className="text-xs"
            style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-nunito)" }}
          >
            Smart Neurons Preschool · Powered by{" "}
            <a href="https://wowkids.in/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-70 transition-opacity">Wow Kids</a>
            {" · "}Built by{" "}
            <a href="https://alphazenx.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-70 transition-opacity">Alpha ZenX</a>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
