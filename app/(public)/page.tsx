import Link from "next/link";
import { ArrowRight, Star, BookOpen, Award, Smile, Heart, Shield, Leaf, ChevronRight } from "lucide-react";

const stats = [
  { value: "500+", label: "Happy Children", icon: "🧒" },
  { value: "10+", label: "Years of Excellence", icon: "🌟" },
  { value: "4", label: "Curated Programs", icon: "📚" },
  { value: "20+", label: "Fun Activities", icon: "🎨" },
];

const programs = [
  {
    name: "Playgroup",
    age: "2 – 3 yrs",
    emoji: "🌱",
    color: "#6BCB77",
    bg: "rgba(107,203,119,0.10)",
    desc: "Sensory play, social bonding, and early language development in a warm, nurturing environment.",
  },
  {
    name: "Nursery",
    age: "3 – 4 yrs",
    emoji: "🌻",
    color: "#d97706",
    bg: "rgba(255,217,61,0.14)",
    desc: "Pre-literacy, numeracy foundations, and creative arts through joyful hands-on learning.",
  },
  {
    name: "Junior KG",
    age: "4 – 5 yrs",
    emoji: "🚀",
    color: "#FF6B6B",
    bg: "rgba(255,107,107,0.10)",
    desc: "Building confidence, critical thinking, and a love for discovery before primary school.",
  },
  {
    name: "Senior KG",
    age: "5 – 6 yrs",
    emoji: "🎓",
    color: "#7c3aed",
    bg: "rgba(167,139,250,0.10)",
    desc: "School readiness, advanced concepts, and leadership skills for a strong start ahead.",
  },
];

const whyUs = [
  {
    icon: <Award size={24} />,
    title: "Expert Educators",
    desc: "Qualified, trained teachers who bring warmth, patience, and expertise to every interaction.",
    color: "#FF6B6B",
    bg: "rgba(255,107,107,0.10)",
  },
  {
    icon: <Shield size={24} />,
    title: "Safe Environment",
    desc: "CCTV-monitored, child-proofed spaces designed with your child's safety as the top priority.",
    color: "#6BCB77",
    bg: "rgba(107,203,119,0.10)",
  },
  {
    icon: <Leaf size={24} />,
    title: "Holistic Development",
    desc: "Physical, emotional, cognitive, and social growth woven into every moment of the day.",
    color: "#d97706",
    bg: "rgba(255,217,61,0.14)",
  },
  {
    icon: <BookOpen size={24} />,
    title: "Play-Based Learning",
    desc: "Research-backed curriculum that makes learning feel like the world's greatest adventure.",
    color: "#7c3aed",
    bg: "rgba(167,139,250,0.10)",
  },
  {
    icon: <Heart size={24} />,
    title: "Parent Partnership",
    desc: "Regular updates, open communication, and workshops to involve you in every milestone.",
    color: "#f97316",
    bg: "rgba(249,115,22,0.10)",
  },
  {
    icon: <Smile size={24} />,
    title: "Modern Curriculum",
    desc: "Aligned with NEP 2020, blending Montessori, art integration, and digital literacy.",
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.10)",
  },
];

const testimonials = [
  {
    quote:
      "My daughter went from being shy and hesitant to a confident, curious little girl who absolutely loves going to school every day. The teachers here are magical!",
    name: "Priya Sharma",
    role: "Parent of Anaya, Nursery",
    initials: "PS",
    color: "#FF6B6B",
  },
  {
    quote:
      "Smart Neurons is not just a school — it's a second home. The warmth, the activities, the individual attention — everything is exceptional. Best decision we made!",
    name: "Rohit Verma",
    role: "Parent of Aaryan, Junior KG",
    initials: "RV",
    color: "#6BCB77",
  },
  {
    quote:
      "Dr. Pachori and her team have created something truly special here. My son's creativity and vocabulary have exploded in just six months. We're beyond grateful.",
    name: "Meena Patel",
    role: "Parent of Vivaan, Playgroup",
    initials: "MP",
    color: "#d97706",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden pt-24 md:pt-32"
        style={{ background: "linear-gradient(135deg, #FFF5F5 0%, #FFFBF0 35%, #F0FDF4 65%, #F8F4F0 100%)" }}
      >
        {/* Floating blobs */}
        <div
          className="absolute top-16 right-8 w-80 h-80 opacity-40 animate-float blob"
          style={{ background: "linear-gradient(135deg, rgba(255,107,107,0.2), rgba(255,217,61,0.2))" }}
        />
        <div
          className="absolute bottom-24 left-8 w-64 h-64 opacity-35 animate-float-delay blob-sm"
          style={{ background: "linear-gradient(135deg, rgba(107,203,119,0.2), rgba(76,175,80,0.2))" }}
        />
        <div
          className="absolute top-1/3 left-1/4 w-48 h-48 opacity-25 animate-float-slow blob"
          style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.2), rgba(107,203,119,0.2))" }}
        />

        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(26,26,46,0.12) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-8"
              style={{
                fontFamily: "var(--font-nunito)",
                background: "rgba(255,255,255,0.70)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.65)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                color: "#FF6B6B",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-coral-500 animate-pulse-soft inline-block" />
              Admissions Open 2026–27 🎉
            </div>

            {/* Heading */}
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-navy mb-6"
              style={{ fontFamily: "var(--font-playfair)", lineHeight: 1.1 }}
            >
              Where{" "}
              <span className="text-gradient-coral">Little Minds</span>
              <br />
              Bloom &amp; Grow
            </h1>

            <p
              className="text-lg sm:text-xl text-navy leading-relaxed mb-10 max-w-2xl"
              style={{ opacity: 0.72, fontFamily: "var(--font-inter)" }}
            >
              Smart Neurons Preschool by Wow Kids — a premium learning sanctuary in
              Bhopal where curiosity is celebrated, confidence is built, and every
              child's unique potential is lovingly nurtured.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/admissions" className="btn-coral text-base">
                Start the Journey
                <ArrowRight size={18} />
              </Link>
              <Link href="/programs" className="btn-outline text-base">
                Explore Programs
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap gap-3">
              {["NEP 2020 Aligned", "CCTV Safe Campus", "Wow Kids Certified", "10+ Years"].map(
                (badge) => (
                  <span
                    key={badge}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{
                      fontFamily: "var(--font-nunito)",
                      background: "rgba(255,255,255,0.60)",
                      border: "1px solid rgba(255,255,255,0.70)",
                      color: "rgba(26,26,46,0.70)",
                    }}
                  >
                    <Star size={11} style={{ color: "#FFD93D", fill: "#FFD93D" }} />
                    {badge}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section
        className="py-16"
        style={{ background: "rgba(255,255,255,0.55)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card p-6 text-center">
                <p className="text-4xl mb-1">{stat.icon}</p>
                <p
                  className="text-3xl sm:text-4xl font-bold mb-1"
                  style={{ fontFamily: "var(--font-nunito)", color: "#FF6B6B" }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-nunito)" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Programs ── */}
      <section
        className="section-padding"
        style={{ background: "linear-gradient(180deg, #F8F4F0 0%, #FFF5F5 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p
              className="text-sm font-bold uppercase tracking-widest mb-3"
              style={{ fontFamily: "var(--font-nunito)", color: "#FF6B6B" }}
            >
              Our Programs
            </p>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy mb-4"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Curated for Every Stage
            </h2>
            <p
              className="text-base max-w-xl mx-auto"
              style={{ color: "rgba(26,26,46,0.62)", fontFamily: "var(--font-inter)" }}
            >
              Age-appropriate programs that spark curiosity and build skills
              through play, creativity, and exploration.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((prog) => (
              <Link
                key={prog.name}
                href="/programs"
                className="glass-card p-7 text-left group"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5"
                  style={{ background: prog.bg }}
                >
                  {prog.emoji}
                </div>
                <h3
                  className="text-lg font-bold text-navy mb-1"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  {prog.name}
                </h3>
                <p
                  className="text-xs font-bold mb-3 px-2.5 py-1 rounded-full w-fit"
                  style={{
                    fontFamily: "var(--font-nunito)",
                    color: prog.color,
                    background: prog.bg,
                  }}
                >
                  {prog.age}
                </p>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-inter)" }}
                >
                  {prog.desc}
                </p>
                <span
                  className="text-xs font-bold flex items-center gap-1"
                  style={{ color: prog.color, fontFamily: "var(--font-nunito)" }}
                >
                  Learn more <ChevronRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section
        className="section-padding"
        style={{ background: "linear-gradient(135deg, #FFF5F5 0%, #F0FDF4 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p
              className="text-sm font-bold uppercase tracking-widest mb-3"
              style={{ fontFamily: "var(--font-nunito)", color: "#6BCB77" }}
            >
              Why Smart Neurons
            </p>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy mb-4"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              The Wow Kids Difference
            </h2>
            <p
              className="text-base max-w-xl mx-auto"
              style={{ color: "rgba(26,26,46,0.62)", fontFamily: "var(--font-inter)" }}
            >
              We don&apos;t just prepare children for school — we prepare them for life.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item) => (
              <div key={item.title} className="glass-card p-7">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: item.bg, color: item.color }}
                >
                  {item.icon}
                </div>
                <h3
                  className="text-base font-bold text-navy mb-2"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-inter)" }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section
        className="section-padding"
        style={{ background: "rgba(255,255,255,0.50)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p
              className="text-sm font-bold uppercase tracking-widest mb-3"
              style={{ fontFamily: "var(--font-nunito)", color: "#FF6B6B" }}
            >
              Parent Stories
            </p>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              What Families Say
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="glass-card p-7 flex flex-col">
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} size={14} style={{ color: "#FFD93D", fill: "#FFD93D" }} />
                  ))}
                </div>
                <p
                  className="text-sm leading-relaxed flex-1 mb-6"
                  style={{
                    color: "rgba(26,26,46,0.72)",
                    fontFamily: "var(--font-inter)",
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p
                      className="text-sm font-bold text-navy"
                      style={{ fontFamily: "var(--font-nunito)" }}
                    >
                      {t.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}
                    >
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Admission CTA ── */}
      <section
        className="relative py-20 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #FF6B6B 0%, #ff8e53 60%, #FFD93D 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute top-0 right-0 w-80 h-80 opacity-20 animate-float blob"
          style={{ background: "rgba(255,255,255,0.3)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 opacity-15 animate-float-delay blob-sm"
          style={{ background: "rgba(255,255,255,0.25)" }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="font-bold text-sm uppercase tracking-widest mb-4"
            style={{ fontFamily: "var(--font-nunito)", color: "rgba(255,255,255,0.80)" }}
          >
            Limited Seats Available
          </p>
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-playfair)", lineHeight: 1.1 }}
          >
            Give Your Child the
            <br />
            Best Start in Life
          </h2>
          <p
            className="text-lg mb-10 max-w-xl mx-auto"
            style={{ fontFamily: "var(--font-inter)", color: "rgba(255,255,255,0.85)" }}
          >
            Secure your child&apos;s spot at Smart Neurons Preschool. Fill out the
            admissions enquiry today and our team will reach out within 24 hours.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/admissions"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base transition-all duration-200 hover:-translate-y-1"
              style={{
                fontFamily: "var(--font-nunito)",
                background: "white",
                color: "#FF6B6B",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              }}
            >
              Apply Now <ArrowRight size={18} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base transition-all duration-200 hover:-translate-y-1"
              style={{
                fontFamily: "var(--font-nunito)",
                background: "rgba(255,255,255,0.20)",
                color: "white",
                border: "2px solid rgba(255,255,255,0.60)",
                backdropFilter: "blur(8px)",
              }}
            >
              Talk to Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
