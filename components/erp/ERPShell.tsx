"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, Users, GraduationCap, CalendarDays, ClipboardList,
  CreditCard, Bell, MessageSquare, Image as ImageIcon, BarChart2,
  Settings, LogOut, Menu, X, ChevronRight, BookOpen, FileText,
  Clock, Award, Home, Building2, Activity, Shield,
} from "lucide-react";

type Role = "superadmin" | "admin" | "faculty" | "parent";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

const navByRole: Record<Role, NavItem[]> = {
  superadmin: [
    { href: "/erp/superadmin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/erp/superadmin/schools", label: "Schools", icon: <Building2 size={18} /> },
    { href: "/erp/superadmin/analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
    { href: "/erp/superadmin/health", label: "System Health", icon: <Activity size={18} /> },
    { href: "/erp/superadmin/settings", label: "Settings", icon: <Settings size={18} /> },
  ],
  admin: [
    { href: "/erp/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/erp/admin/students", label: "Students", icon: <Users size={18} /> },
    { href: "/erp/admin/staff", label: "Staff & Leave", icon: <GraduationCap size={18} /> },
    { href: "/erp/admin/timetable", label: "Timetable", icon: <CalendarDays size={18} /> },
    { href: "/erp/admin/attendance", label: "Attendance", icon: <ClipboardList size={18} /> },
    { href: "/erp/admin/fees", label: "Fee Management", icon: <CreditCard size={18} />, badge: "2" },
    { href: "/erp/admin/communication", label: "Communication", icon: <Bell size={18} /> },
    { href: "/erp/admin/gallery", label: "Gallery", icon: <ImageIcon size={18} /> },
    { href: "/erp/admin/reports", label: "Reports", icon: <BarChart2 size={18} /> },
    { href: "/erp/admin/settings", label: "Settings", icon: <Settings size={18} /> },
  ],
  faculty: [
    { href: "/erp/faculty", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/erp/faculty/routine", label: "Daily Routine", icon: <Clock size={18} />, badge: "!" },
    { href: "/erp/faculty/attendance", label: "My Classes", icon: <ClipboardList size={18} /> },
    { href: "/erp/faculty/homework", label: "Homework", icon: <BookOpen size={18} />, badge: "4" },
    { href: "/erp/faculty/syllabus", label: "Syllabus", icon: <FileText size={18} /> },
    { href: "/erp/faculty/progress", label: "Progress Reports", icon: <Award size={18} /> },
    { href: "/erp/faculty/leave", label: "Leave", icon: <CalendarDays size={18} /> },
    { href: "/erp/faculty/chat", label: "Messages", icon: <MessageSquare size={18} />, badge: "3" },
    { href: "/erp/faculty/gallery", label: "Gallery", icon: <ImageIcon size={18} /> },
  ],
  parent: [
    { href: "/erp/parent", label: "Dashboard", icon: <Home size={18} /> },
    { href: "/erp/parent/attendance", label: "Attendance", icon: <ClipboardList size={18} /> },
    { href: "/erp/parent/homework", label: "Homework", icon: <BookOpen size={18} />, badge: "2" },
    { href: "/erp/parent/syllabus", label: "Syllabus", icon: <FileText size={18} /> },
    { href: "/erp/parent/reports", label: "Progress Reports", icon: <Award size={18} /> },
    { href: "/erp/parent/fees", label: "Fees", icon: <CreditCard size={18} />, badge: "Due" },
    { href: "/erp/parent/timetable", label: "Timetable", icon: <CalendarDays size={18} /> },
    { href: "/erp/parent/gallery", label: "Gallery", icon: <ImageIcon size={18} /> },
    { href: "/erp/parent/chat", label: "Messages", icon: <MessageSquare size={18} /> },
  ],
};

const roleConfig: Record<Role, { label: string; color: string; bg: string; emoji: string }> = {
  superadmin: { label: "Super Admin", color: "#1A1A2E", bg: "rgba(26,26,46,0.08)", emoji: "🏢" },
  admin: { label: "School Admin", color: "#FF6B6B", bg: "rgba(255,107,107,0.10)", emoji: "📊" },
  faculty: { label: "Faculty", color: "#6BCB77", bg: "rgba(107,203,119,0.10)", emoji: "🎓" },
  parent: { label: "Parent", color: "#d97706", bg: "rgba(255,217,61,0.12)", emoji: "👨‍👩‍👧" },
};

interface SidebarContentProps {
  nav: NavItem[];
  role: Role;
  pathname: string;
  sidebarOpen: boolean;
  onLinkClick?: () => void;
  onLogout: () => void;
  userName?: string;
}

function SidebarContent({ nav, role, pathname, sidebarOpen, onLinkClick, onLogout, userName }: SidebarContentProps) {
  const config = roleConfig[role];
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="px-5 py-5 flex items-center gap-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.30)" }}
      >
        <div className="relative w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
          <Image src="/logo.png" alt="Logo" fill sizes="36px" className="object-contain" />
        </div>
        {sidebarOpen && (
          <div className="min-w-0">
            <p
              className="text-xs font-bold text-navy leading-tight truncate"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Smart Neurons
            </p>
            <p
              className="text-xs leading-tight truncate"
              style={{ color: config.color, fontFamily: "var(--font-nunito)", fontWeight: 700 }}
            >
              {config.emoji} {config.label}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative"
              style={{
                background: active ? config.bg : "transparent",
                color: active ? config.color : "rgba(26,26,46,0.60)",
                fontFamily: "var(--font-nunito)",
                fontSize: "0.8125rem",
                fontWeight: active ? 700 : 600,
              }}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: item.badge === "!" ? "#FF6B6B" : config.color,
                        color: "white",
                        fontSize: "0.625rem",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {active && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                  style={{ background: config.color }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div
        className="px-3 py-4 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.30)" }}
      >
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2"
          style={{ background: config.bg }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: config.color, fontFamily: "var(--font-nunito)" }}
          >
            {(userName || config.label).charAt(0).toUpperCase()}
          </div>
          {sidebarOpen && (
            <div className="min-w-0 flex-1">
              <p
                className="text-xs font-bold text-navy truncate"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                {userName || config.label}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: config.color, fontFamily: "var(--font-nunito)" }}
              >
                {config.label}
              </p>
            </div>
          )}
        </div>
        <button
          type="button"
          aria-label="Sign Out"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 hover:bg-red-50"
          style={{
            color: "rgba(26,26,46,0.50)",
            fontFamily: "var(--font-nunito)",
            fontSize: "0.8125rem",
            fontWeight: 600,
          }}
        >
          <LogOut size={16} />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}

interface ERPShellProps {
  role: Role;
  userName?: string;
  children: React.ReactNode;
}

export default function ERPShell({ role, userName, children }: ERPShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const config = roleConfig[role];
  const navItems = navByRole[role];

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  async function handleLogout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Sign out error:", error.message);
    router.replace("/erp/login");
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F8F4F0" }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 relative"
        style={{
          width: sidebarOpen ? "232px" : "64px",
          background: "rgba(255,255,255,0.80)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255,255,255,0.55)",
          boxShadow: "4px 0 24px rgba(26,26,46,0.06)",
        }}
      >
        <SidebarContent
          nav={navItems}
          role={role}
          pathname={pathname}
          sidebarOpen={sidebarOpen}
          onLogout={handleLogout}
          userName={userName}
        />
        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute bottom-24 -right-3 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110"
          style={{
            background: "white",
            border: "1.5px solid rgba(255,255,255,0.70)",
            color: "rgba(26,26,46,0.40)",
          }}
        >
          <ChevronRight
            size={12}
            style={{ transform: sidebarOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}
          />
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.30)" }}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className="fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col lg:hidden transition-transform duration-300"
        style={{
          transform: mobileSidebarOpen ? "translateX(0)" : "translateX(-100%)",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(255,255,255,0.55)",
          boxShadow: "8px 0 40px rgba(26,26,46,0.12)",
        }}
      >
        <SidebarContent
          nav={navItems}
          role={role}
          pathname={pathname}
          sidebarOpen={true}
          onLinkClick={() => setMobileSidebarOpen(false)}
          onLogout={handleLogout}
          userName={userName}
        />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex-shrink-0 h-14 flex items-center px-4 sm:px-6 gap-4"
          style={{
            background: "rgba(255,255,255,0.70)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.55)",
            boxShadow: "0 2px 12px rgba(26,26,46,0.05)",
            position: "relative",
            zIndex: 10,
          }}
        >
          <button
            type="button"
            aria-label={mobileSidebarOpen ? "Close menu" : "Open menu"}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl"
            style={{ background: "rgba(26,26,46,0.06)" }}
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu size={18} className="text-navy" />
          </button>

          <div className="flex-1">
            <p
              className="text-sm font-bold text-navy"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              {navItems.find((n) => n.href === pathname)?.label ?? "Dashboard"}
            </p>
          </div>

          {/* Topbar actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:bg-white"
              style={{ background: "rgba(26,26,46,0.05)" }}
            >
              <Bell size={17} className="text-navy" />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: "#FF6B6B" }}
              />
            </button>

            <div
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl cursor-pointer"
              style={{ background: config.bg }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: config.color, fontFamily: "var(--font-nunito)" }}
              >
                {(userName || config.label).charAt(0).toUpperCase()}
              </div>
              <span
                className="text-xs font-bold text-navy hidden sm:block"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                {userName ? userName.split("@")[0] : config.label}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="erp-main flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
