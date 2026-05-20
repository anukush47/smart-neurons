import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, ExternalLink } from "lucide-react";
import InstagramIcon from "@/components/InstagramIcon";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/programs", label: "Programs" },
  { href: "/admissions", label: "Admissions" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

const programs = [
  { label: "Playgroup (2–3 yrs)", href: "/programs" },
  { label: "Nursery (3–4 yrs)", href: "/programs" },
  { label: "Junior KG (4–5 yrs)", href: "/programs" },
  { label: "Senior KG (5–6 yrs)", href: "/programs" },
];

export default function Footer() {
  return (
    <footer
      className="relative mt-auto pt-16 pb-8"
      style={{
        background:
          "linear-gradient(180deg, #F8F4F0 0%, rgba(248,244,240,0.95) 100%)",
        borderTop: "1px solid rgba(255,255,255,0.8)",
      }}
    >
      {/* Subtle top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{
          background:
            "linear-gradient(90deg, #FF6B6B20, #FFD93D40, #6BCB7740, #FF6B6B20)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-5 group w-fit">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-md transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="Smart Neurons Logo"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <div>
                <p
                  className="text-sm font-bold text-navy leading-tight"
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
            <p
              className="text-sm leading-relaxed mb-5"
              style={{ color: "rgba(26,26,46,0.65)" }}
            >
              Where little minds bloom. A premium preschool nurturing curious,
              confident, and creative children in the heart of Bhopal.
            </p>
            <a
              href="https://www.instagram.com/smartneurons/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
              style={{
                fontFamily: "var(--font-nunito)",
                background:
                  "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                color: "white",
                boxShadow: "0 4px 16px rgba(220,39,67,0.30)",
              }}
            >
              <InstagramIcon size={16} />
              @smartneurons
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className="text-sm font-bold text-navy mb-5 uppercase tracking-widest"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium transition-colors duration-200 hover:text-coral-500"
                    style={{
                      color: "rgba(26,26,46,0.65)",
                      fontFamily: "var(--font-nunito)",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3
              className="text-sm font-bold text-navy mb-5 uppercase tracking-widest"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Programs
            </h3>
            <ul className="space-y-2.5">
              {programs.map((p) => (
                <li key={p.label}>
                  <Link
                    href={p.href}
                    className="text-sm font-medium transition-colors duration-200 hover:text-coral-500"
                    style={{
                      color: "rgba(26,26,46,0.65)",
                      fontFamily: "var(--font-nunito)",
                    }}
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="text-sm font-bold text-navy mb-5 uppercase tracking-widest"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <MapPin
                  size={16}
                  className="text-coral-500 flex-shrink-0 mt-0.5"
                />
                <a
                  href="https://maps.google.com/?q=Pebble+Bay+A-12+Jatkhedi+Bhopal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm leading-relaxed transition-colors duration-200 hover:text-coral-500 flex items-start gap-1"
                  style={{ color: "rgba(26,26,46,0.65)", fontFamily: "var(--font-nunito)" }}
                >
                  Pebble Bay, A-12, behind Ashima Mall,
                  <br />
                  Phase II, Jatkhedi, Bhopal, MP 462043
                  <ExternalLink size={11} className="flex-shrink-0 mt-1 opacity-60" />
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-coral-500 flex-shrink-0" />
                <a
                  href="tel:+91XXXXXXXXXX"
                  className="text-sm font-medium transition-colors duration-200 hover:text-coral-500"
                  style={{
                    color: "rgba(26,26,46,0.65)",
                    fontFamily: "var(--font-nunito)",
                  }}
                >
                  +91 XXXXX XXXXX
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(26,26,46,0.08)" }}
        >
          <p
            className="text-xs"
            style={{
              color: "rgba(26,26,46,0.45)",
              fontFamily: "var(--font-nunito)",
            }}
          >
            © {new Date().getFullYear()} Smart Neurons Preschool · Powered by{" "}
            <a
              href="https://wowkids.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              Wow Kids
            </a>
            {" · "}Built by{" "}
            <a
              href="https://alphazenx.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              Alpha ZenX
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
