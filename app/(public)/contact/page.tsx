"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Phone, MessageCircle, Clock, ArrowRight, Smile, Mail } from "lucide-react";
import InstagramIcon from "@/components/InstagramIcon";

const contactInfo = [
  {
    icon: <MapPin size={20} />,
    label: "Address",
    value: "Pebble Bay, A-12, behind Ashima Mall, Phase II, Jatkhedi, Bhopal, MP 462043",
    href: "https://maps.google.com/?q=Pebble+Bay+A-12+Jatkhedi+Bhopal+462043",
    linkText: "Get Directions",
    color: "#FF6B6B",
    bg: "rgba(255,107,107,0.10)",
  },
  {
    icon: <Phone size={20} />,
    label: "Phone",
    value: "+91 XXXXX XXXXX",
    href: "tel:+91XXXXXXXXXX",
    linkText: "Call Now",
    color: "#6BCB77",
    bg: "rgba(107,203,119,0.10)",
  },
  {
    icon: <MessageCircle size={20} />,
    label: "WhatsApp",
    value: "Chat with our admissions team",
    href: "https://wa.me/91XXXXXXXXXX",
    linkText: "Chat Now",
    color: "#25D366",
    bg: "rgba(37,211,102,0.10)",
  },
  {
    icon: <InstagramIcon size={20} />,
    label: "Instagram",
    value: "@smartneurons",
    href: "https://www.instagram.com/smartneurons/",
    linkText: "Follow Us",
    color: "#e1306c",
    bg: "rgba(225,48,108,0.10)",
  },
];

const timings = [
  { day: "Monday – Friday", time: "8:00 AM – 1:30 PM" },
  { day: "Saturday", time: "9:00 AM – 12:00 PM (Enquiries)" },
  { day: "Sunday", time: "Closed" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <>
      {/* Hero */}
      <section
        className="relative pt-32 pb-16 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #FFF5F5 0%, #FFFBF0 50%, #F8F4F0 100%)" }}
      >
        <div
          className="absolute top-20 right-0 w-72 h-72 opacity-30 animate-float blob"
          style={{ background: "linear-gradient(135deg, rgba(255,107,107,0.20), rgba(107,203,119,0.15))" }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="text-sm font-bold uppercase tracking-widest mb-4"
            style={{ fontFamily: "var(--font-nunito)", color: "#FF6B6B" }}
          >
            We&apos;d Love to Hear From You
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy mb-6"
            style={{ fontFamily: "var(--font-playfair)", lineHeight: 1.1 }}
          >
            Get in <span className="text-gradient-coral">Touch</span>
          </h1>
          <p
            className="text-lg max-w-xl mx-auto"
            style={{ color: "rgba(26,26,46,0.65)", fontFamily: "var(--font-inter)" }}
          >
            Have questions about admissions, our programs, or just want to say hello?
            We&apos;re here and happy to help.
          </p>
        </div>
      </section>

      {/* Contact cards + Form */}
      <section
        className="section-padding"
        style={{ background: "rgba(255,255,255,0.55)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: info */}
            <div className="space-y-5">
              <h2
                className="text-2xl font-bold text-navy mb-6"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Contact Details
              </h2>

              {contactInfo.map((info) => (
                <div key={info.label} className="glass-card p-5 flex gap-4 items-start">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: info.bg, color: info.color }}
                  >
                    {info.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-bold uppercase tracking-wide mb-1"
                      style={{ fontFamily: "var(--font-nunito)", color: "rgba(26,26,46,0.50)" }}
                    >
                      {info.label}
                    </p>
                    <p
                      className="text-sm text-navy mb-2 leading-snug"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {info.value}
                    </p>
                    <a
                      href={info.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold transition-opacity duration-200 hover:opacity-70"
                      style={{ fontFamily: "var(--font-nunito)", color: info.color }}
                    >
                      {info.linkText} →
                    </a>
                  </div>
                </div>
              ))}

              {/* Timings */}
              <div className="glass-card p-6 mt-6">
                <h3
                  className="text-base font-bold text-navy mb-4 flex items-center gap-2"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  <Clock size={16} className="text-coral-500" />
                  School &amp; Enquiry Timings
                </h3>
                <div className="space-y-2.5">
                  {timings.map((t) => (
                    <div
                      key={t.day}
                      className="flex items-center justify-between py-1.5"
                      style={{ borderBottom: "1px solid rgba(26,26,46,0.06)" }}
                    >
                      <span
                        className="text-sm text-navy"
                        style={{ fontFamily: "var(--font-nunito)" }}
                      >
                        {t.day}
                      </span>
                      <span
                        className="text-sm font-semibold"
                        style={{
                          fontFamily: "var(--font-nunito)",
                          color: t.time === "Closed" ? "#FF6B6B" : "#6BCB77",
                        }}
                      >
                        {t.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/91XXXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "#25D366",
                  boxShadow: "0 6px 24px rgba(37,211,102,0.30)",
                }}
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <div>
                  <p
                    className="text-sm font-bold text-white"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    WhatsApp Us Now
                  </p>
                  <p
                    className="text-xs text-white/80"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Fastest way to get answers — we respond quickly!
                  </p>
                </div>
                <ArrowRight size={18} className="text-white ml-auto flex-shrink-0" />
              </a>
            </div>

            {/* Right: form */}
            <div>
              <h2
                className="text-2xl font-bold text-navy mb-6"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Send Us a Message
              </h2>

              {submitted ? (
                <div className="glass-card p-10 text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: "rgba(107,203,119,0.12)" }}
                  >
                    <Smile size={32} style={{ color: "#6BCB77" }} />
                  </div>
                  <h3
                    className="text-xl font-bold text-navy mb-2"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    Message Received! 🎉
                  </h3>
                  <p
                    className="text-sm mb-6"
                    style={{ color: "rgba(26,26,46,0.65)", fontFamily: "var(--font-inter)" }}
                  >
                    Thank you{form.name ? `, ${form.name}` : ""}! We&apos;ll get back to you very
                    soon.
                  </p>
                  <Link href="/" className="btn-coral">
                    Back to Home
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="ctName"
                        className="block text-sm font-semibold text-navy mb-1.5"
                        style={{ fontFamily: "var(--font-nunito)" }}
                      >
                        Your Name *
                      </label>
                      <input
                        id="ctName"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Full name"
                        className="input-glass"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="ctPhone"
                        className="block text-sm font-semibold text-navy mb-1.5"
                        style={{ fontFamily: "var(--font-nunito)" }}
                      >
                        Phone Number *
                      </label>
                      <input
                        id="ctPhone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        className="input-glass"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="ctEmail"
                      className="block text-sm font-semibold text-navy mb-1.5"
                      style={{ fontFamily: "var(--font-nunito)" }}
                    >
                      Email Address
                    </label>
                    <input
                      id="ctEmail"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      type="email"
                      placeholder="your@email.com"
                      className="input-glass"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="ctMessage"
                      className="block text-sm font-semibold text-navy mb-1.5"
                      style={{ fontFamily: "var(--font-nunito)" }}
                    >
                      Message *
                    </label>
                    <textarea
                      id="ctMessage"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="How can we help you?"
                      className="input-glass resize-none"
                    />
                  </div>
                  <button type="submit" className="btn-coral w-full justify-center">
                    Send Message <ArrowRight size={18} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps embed */}
      <section
        className="section-padding"
        style={{ background: "linear-gradient(180deg, #F8F4F0 0%, rgba(248,244,240,0.80) 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2
              className="text-2xl sm:text-3xl font-bold text-navy mb-3"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Find Us Here
            </h2>
            <p
              className="text-sm"
              style={{ color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-inter)" }}
            >
              Pebble Bay, A-12, behind Ashima Mall, Phase II, Jatkhedi, Bhopal, MP 462043
            </p>
          </div>

          <div
            className="rounded-3xl overflow-hidden"
            style={{
              boxShadow: "0 16px 48px rgba(26,26,46,0.12)",
              border: "1px solid rgba(255,255,255,0.60)",
            }}
          >
            <iframe
              title="Smart Neurons Preschool Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3667.0!2d77.4!3d23.26!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDE1JzM2LjAiTiA3N8KwMjQnMDAuMCJF!5e0!3m2!1sen!2sin!4v1"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="mt-5 text-center">
            <a
              href="https://maps.google.com/?q=Pebble+Bay+A-12+Jatkhedi+Bhopal+462043"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold transition-opacity duration-200 hover:opacity-70"
              style={{ fontFamily: "var(--font-nunito)", color: "#FF6B6B" }}
            >
              <MapPin size={15} />
              Open in Google Maps →
            </a>
          </div>
        </div>
      </section>

      {/* Visit CTA */}
      <section
        className="py-14"
        style={{ background: "rgba(255,255,255,0.50)" }}
      >
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2
            className="text-2xl sm:text-3xl font-bold text-navy mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Ready to Visit?
          </h2>
          <p
            className="text-base mb-8"
            style={{ color: "rgba(26,26,46,0.62)", fontFamily: "var(--font-inter)" }}
          >
            Book a campus visit and let your child experience the Smart Neurons
            magic firsthand.
          </p>
          <Link href="/admissions" className="btn-coral">
            Book a Visit <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
