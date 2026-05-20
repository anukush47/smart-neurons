"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight, Phone, MessageCircle, Calendar, FileText, Users, Smile } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <FileText size={22} />,
    title: "Fill the Enquiry Form",
    desc: "Complete the online enquiry form below with your child's details and preferred program.",
    color: "#FF6B6B",
    bg: "rgba(255,107,107,0.10)",
  },
  {
    number: "02",
    icon: <Phone size={22} />,
    title: "Team Reaches Out",
    desc: "Our admissions team will call you within 24 hours to answer questions and schedule a visit.",
    color: "#6BCB77",
    bg: "rgba(107,203,119,0.10)",
  },
  {
    number: "03",
    icon: <Calendar size={22} />,
    title: "Campus Visit",
    desc: "Come see our spaces, meet our teachers, and let your child experience a trial session.",
    color: "#d97706",
    bg: "rgba(255,217,61,0.14)",
  },
  {
    number: "04",
    icon: <Users size={22} />,
    title: "Enrolment",
    desc: "Complete the registration formalities and secure your child's place at Smart Neurons!",
    color: "#7c3aed",
    bg: "rgba(167,139,250,0.10)",
  },
];

const faqs = [
  {
    q: "What are the school timings?",
    a: "School timings vary by program: Playgroup (8:30 AM – 11:30 AM), Nursery (8:30 AM – 12:00 PM), Junior KG (8:30 AM – 12:30 PM), and Senior KG (8:30 AM – 1:00 PM).",
  },
  {
    q: "Is there a waiting list?",
    a: "Yes, we have limited seats per batch to maintain quality. We strongly recommend enquiring early to avoid missing out.",
  },
  {
    q: "Do you offer a trial class?",
    a: "Absolutely! Every family is invited for a free orientation session where your child can explore the classroom and meet the teachers.",
  },
  {
    q: "What is the fee structure?",
    a: "Fees vary by program. Our team will share a detailed fee structure during your campus visit or over the phone.",
  },
  {
    q: "Is there a transport facility?",
    a: "We are working on a transport arrangement. Please contact us to check the latest availability from your area.",
  },
  {
    q: "Are meals included?",
    a: "Children bring a healthy snack from home. We provide filtered water and guide families on nutrition through our parent workshops.",
  },
];

export default function AdmissionsPage() {
  const [form, setForm] = useState({
    parentName: "",
    childName: "",
    childAge: "",
    program: "",
    phone: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <>
      {/* Hero */}
      <section
        className="relative pt-32 pb-20 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #FFF5F5 0%, #FFFBF0 50%, #F8F4F0 100%)" }}
      >
        <div
          className="absolute top-20 right-0 w-72 h-72 opacity-30 animate-float blob"
          style={{ background: "linear-gradient(135deg, rgba(255,107,107,0.22), rgba(255,217,61,0.18))" }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="text-sm font-bold uppercase tracking-widest mb-4"
            style={{ fontFamily: "var(--font-nunito)", color: "#FF6B6B" }}
          >
            Admissions 2026–27
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy mb-6"
            style={{ fontFamily: "var(--font-playfair)", lineHeight: 1.1 }}
          >
            Begin Your Child&apos;s
            <br />
            <span className="text-gradient-coral">Amazing Journey</span>
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: "rgba(26,26,46,0.65)", fontFamily: "var(--font-inter)" }}
          >
            Seats are limited and fill up quickly. Take the first step today by
            filling out the enquiry form below.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section
        className="section-padding"
        style={{ background: "rgba(255,255,255,0.55)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-2xl sm:text-3xl font-bold text-navy"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              How Admissions Work
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.number} className="glass-card p-6 relative">
                <div
                  className="absolute top-4 right-4 text-4xl font-black opacity-10"
                  style={{ fontFamily: "var(--font-nunito)", color: step.color }}
                >
                  {step.number}
                </div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: step.bg, color: step.color }}
                >
                  {step.icon}
                </div>
                <h3
                  className="text-base font-bold text-navy mb-2"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-inter)" }}
                >
                  {step.desc}
                </p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-3 z-10">
                    <ArrowRight size={18} style={{ color: "rgba(26,26,46,0.25)" }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry Form */}
      <section
        id="enquiry"
        className="section-padding"
        style={{ background: "linear-gradient(180deg, #FFF5F5 0%, #F8F4F0 100%)" }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2
              className="text-2xl sm:text-3xl font-bold text-navy mb-3"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Admission Enquiry Form
            </h2>
            <p
              className="text-base"
              style={{ color: "rgba(26,26,46,0.62)", fontFamily: "var(--font-inter)" }}
            >
              Fill in your details and we&apos;ll get back to you within 24 hours.
            </p>
          </div>

          {submitted ? (
            <div className="glass-card p-12 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(107,203,119,0.12)" }}>
                <Smile size={40} style={{ color: "#6BCB77" }} />
              </div>
              <h3
                className="text-2xl font-bold text-navy mb-3"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Thank You! 🎉
              </h3>
              <p
                className="text-base mb-8 max-w-md mx-auto"
                style={{ color: "rgba(26,26,46,0.65)", fontFamily: "var(--font-inter)" }}
              >
                Your enquiry has been received! Our admissions team will call you
                within 24 hours. We&apos;re so excited to meet{" "}
                <strong>{form.childName || "your child"}</strong>!
              </p>
              <Link href="/" className="btn-coral">
                Back to Home <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="parentName"
                    className="block text-sm font-semibold text-navy mb-1.5"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    Parent / Guardian Name *
                  </label>
                  <input
                    id="parentName"
                    name="parentName"
                    value={form.parentName}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                    className="input-glass"
                  />
                </div>
                <div>
                  <label
                    htmlFor="childName"
                    className="block text-sm font-semibold text-navy mb-1.5"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    Child&apos;s Name *
                  </label>
                  <input
                    id="childName"
                    name="childName"
                    value={form.childName}
                    onChange={handleChange}
                    required
                    placeholder="Child's full name"
                    className="input-glass"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="childAge"
                    className="block text-sm font-semibold text-navy mb-1.5"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    Child&apos;s Age *
                  </label>
                  <input
                    id="childAge"
                    name="childAge"
                    value={form.childAge}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 3 years 2 months"
                    className="input-glass"
                  />
                </div>
                <div>
                  <label
                    htmlFor="program"
                    className="block text-sm font-semibold text-navy mb-1.5"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    Preferred Program *
                  </label>
                  <select
                    id="program"
                    name="program"
                    value={form.program}
                    onChange={handleChange}
                    required
                    className="input-glass"
                  >
                    <option value="">Select a program</option>
                    <option value="playgroup">Playgroup (2–3 yrs)</option>
                    <option value="nursery">Nursery (3–4 yrs)</option>
                    <option value="junior-kg">Junior KG (4–5 yrs)</option>
                    <option value="senior-kg">Senior KG (5–6 yrs)</option>
                    <option value="unsure">Not Sure Yet</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="admPhone"
                    className="block text-sm font-semibold text-navy mb-1.5"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    Phone Number *
                  </label>
                  <input
                    id="admPhone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    className="input-glass"
                  />
                </div>
                <div>
                  <label
                    htmlFor="admEmail"
                    className="block text-sm font-semibold text-navy mb-1.5"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    Email Address
                  </label>
                  <input
                    id="admEmail"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="your@email.com"
                    className="input-glass"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-navy mb-1.5"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  Message / Questions
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Any questions or special requirements..."
                  className="input-glass resize-none"
                />
              </div>

              <button type="submit" className="btn-coral w-full justify-center text-base">
                Submit Enquiry
                <ArrowRight size={18} />
              </button>

              <p
                className="text-xs text-center"
                style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}
              >
                We respect your privacy and will never share your information.
              </p>
            </form>
          )}

          {/* WhatsApp quick contact */}
          <div
            className="mt-6 p-5 rounded-2xl flex items-center justify-between flex-wrap gap-4"
            style={{
              background: "rgba(107,203,119,0.10)",
              border: "1px solid rgba(107,203,119,0.25)",
            }}
          >
            <div>
              <p
                className="text-sm font-bold text-navy"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Prefer WhatsApp?
              </p>
              <p
                className="text-xs"
                style={{ color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-inter)" }}
              >
                Message us directly and we&apos;ll respond quickly.
              </p>
            </div>
            <a
              href="https://wa.me/91XXXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{
                fontFamily: "var(--font-nunito)",
                background: "#25D366",
                boxShadow: "0 4px 16px rgba(37,211,102,0.35)",
              }}
            >
              <MessageCircle size={16} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="section-padding"
        style={{ background: "rgba(255,255,255,0.50)" }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-2xl sm:text-3xl font-bold text-navy"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={faq.q} className="glass-card overflow-hidden">
                <button
                  type="button"
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span
                    className="text-sm font-semibold text-navy"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    {faq.q}
                  </span>
                  <span
                    className="text-lg leading-none flex-shrink-0 transition-transform duration-200"
                    style={{
                      color: "#FF6B6B",
                      transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div
                    className="px-6 pb-5"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}
                  >
                    <p
                      className="text-sm leading-relaxed pt-3"
                      style={{ color: "rgba(26,26,46,0.68)", fontFamily: "var(--font-inter)" }}
                    >
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section
        className="py-14"
        style={{ background: "linear-gradient(135deg, #F0FDF4, #F8F4F0)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-8">
            <h2
              className="text-xl font-bold text-navy mb-6"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Age Eligibility at a Glance
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { program: "Playgroup", age: "2 – 3 yrs", color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
                { program: "Nursery", age: "3 – 4 yrs", color: "#d97706", bg: "rgba(255,217,61,0.14)" },
                { program: "Junior KG", age: "4 – 5 yrs", color: "#FF6B6B", bg: "rgba(255,107,107,0.10)" },
                { program: "Senior KG", age: "5 – 6 yrs", color: "#7c3aed", bg: "rgba(167,139,250,0.10)" },
              ].map((item) => (
                <div
                  key={item.program}
                  className="p-4 rounded-2xl text-center"
                  style={{ background: item.bg }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-wide mb-1"
                    style={{ fontFamily: "var(--font-nunito)", color: item.color }}
                  >
                    {item.program}
                  </p>
                  <p
                    className="text-lg font-bold text-navy"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    {item.age}
                  </p>
                </div>
              ))}
            </div>
            <p
              className="text-xs mt-4"
              style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}
            >
              * Age as of 1st June of the academic year. Contact us for age eligibility clarification.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
