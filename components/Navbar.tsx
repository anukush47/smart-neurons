"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/admissions", label: "Admissions" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-500"
        style={
          scrolled
            ? {
                background: "rgba(255,255,255,0.72)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)",
                borderBottom: "1px solid rgba(255,255,255,0.55)",
                boxShadow: "0 4px 32px rgba(26,26,46,0.08)",
              }
            : {
                background: "transparent",
                backdropFilter: "none",
                WebkitBackdropFilter: "none",
                borderBottom: "1px solid transparent",
                boxShadow: "none",
              }
        }
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Smart Neurons Logo"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <p
                className="text-sm font-bold leading-tight text-navy"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Smart Neurons
              </p>
              <p
                className="text-xs text-coral-500 font-semibold leading-tight"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Preschool by Wow Kids
              </p>
            </div>
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                      active
                        ? "text-coral-500"
                        : "text-navy hover:text-coral-500"
                    }`}
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    {active && (
                      <span
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "rgba(255,107,107,0.10)",
                        }}
                      />
                    )}
                    <span className="relative">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/erp/login"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
              style={{
                fontFamily: "var(--font-nunito)",
                background: scrolled ? "rgba(26,26,46,0.07)" : "rgba(255,255,255,0.55)",
                color: "#1A1A2E",
                border: "1.5px solid rgba(26,26,46,0.12)",
                backdropFilter: "blur(12px)",
              }}
            >
              Login
            </Link>
            <Link
              href="/admissions"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{
                fontFamily: "var(--font-nunito)",
                background: "linear-gradient(135deg, #FF6B6B 0%, #ff8e53 100%)",
                boxShadow: "0 6px 24px rgba(255,107,107,0.35)",
              }}
            >
              Enroll Now
            </Link>

            <button
              type="button"
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-400"
              style={{ background: "rgba(255,255,255,0.5)" }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X size={20} className="text-navy" />
              ) : (
                <Menu size={20} className="text-navy" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.3)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 w-72 transition-transform duration-300 ease-out md:hidden"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          borderLeft: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "-8px 0 48px rgba(26,26,46,0.15)",
          transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div className="flex items-center justify-between px-6 h-16">
          <p
            className="text-navy font-bold text-base"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Menu
          </p>
          <button
            className="flex items-center justify-center w-9 h-9 rounded-full"
            style={{ background: "rgba(255,107,107,0.1)" }}
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} className="text-coral-500" />
          </button>
        </div>

        <nav className="px-4 py-6 flex flex-col gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-semibold transition-all duration-200 ${
                  active
                    ? "text-coral-500"
                    : "text-navy hover:text-coral-500 hover:bg-coral-50"
                }`}
                style={{
                  fontFamily: "var(--font-nunito)",
                  background: active ? "rgba(255,107,107,0.08)" : undefined,
                }}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="mt-6 px-2 space-y-3">
            <Link
              href="/erp/login"
              className="flex items-center justify-center w-full px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200"
              style={{
                fontFamily: "var(--font-nunito)",
                background: "rgba(26,26,46,0.06)",
                color: "#1A1A2E",
                border: "1.5px solid rgba(26,26,46,0.10)",
              }}
            >
              Portal Login
            </Link>
            <Link
              href="/admissions"
              className="btn-coral w-full justify-center text-center"
            >
              Enroll Now
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
