import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GraduationCap, Heart, Sparkles, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Smart Neurons Preschool — our story, philosophy, and the passionate team led by Dr. Khushboo Pachori.",
};

const values = [
  {
    emoji: "🌱",
    title: "Child-First Philosophy",
    desc: "Every decision we make centres around the joy, safety, and flourishing of each unique child.",
    color: "#6BCB77",
    bg: "rgba(107,203,119,0.10)",
  },
  {
    emoji: "🔬",
    title: "Research-Backed Methods",
    desc: "Our curriculum draws from Montessori, Reggio Emilia, and the latest early childhood research.",
    color: "#FF6B6B",
    bg: "rgba(255,107,107,0.10)",
  },
  {
    emoji: "🤝",
    title: "Community & Family",
    desc: "We build a village around every child — parents, teachers, and peers all grow together.",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.10)",
  },
  {
    emoji: "🎨",
    title: "Creative Expression",
    desc: "Art, music, movement, and storytelling are woven into every day as essential forms of learning.",
    color: "#FFD93D",
    bg: "rgba(255,217,61,0.12)",
  },
];

const milestones = [
  { year: "2014", event: "Founded as a humble playgroup with 12 children and a big vision." },
  { year: "2016", event: "Expanded to full Nursery & KG programs; joined the Wow Kids family." },
  { year: "2019", event: "Shifted to the spacious Pebble Bay campus with modern outdoor play areas." },
  { year: "2021", event: "Launched digital learning integration and NEP 2020 aligned curriculum." },
  { year: "2024", event: "Celebrated 500+ alumni and received Best Preschool recognition, Bhopal." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative pt-32 pb-20 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #FFF5F5 0%, #FFF9F0 50%, #F0FDF4 100%)" }}
      >
        <div
          className="absolute top-20 right-0 w-96 h-96 opacity-30 animate-float blob"
          style={{ background: "linear-gradient(135deg, #FF6B6B25, #FFD93D25)" }}
        />
        <div
          className="absolute bottom-10 left-10 w-64 h-64 opacity-25 animate-float-delay blob-sm"
          style={{ background: "linear-gradient(135deg, #6BCB7725, #4CAF5025)" }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="text-sm font-bold text-coral-500 uppercase tracking-widest mb-4"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Our Story
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy mb-6"
            style={{ fontFamily: "var(--font-playfair)", lineHeight: 1.1 }}
          >
            Born from a{" "}
            <span className="text-gradient-coral">Passion</span>
            <br />
            for Little Learners
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: "rgba(26,26,46,0.65)", fontFamily: "var(--font-inter)" }}
          >
            Smart Neurons Preschool was founded with a single belief: that the
            earliest years of a child's life are the most precious, and they deserve
            the very best learning environment possible.
          </p>
        </div>
      </section>

      {/* Principal Section */}
      <section
        className="section-padding"
        style={{ background: "rgba(255,255,255,0.55)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-8 sm:p-12 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl flex items-center justify-center text-6xl shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #FF6B6B15, #FFD93D15)",
                    border: "2px solid rgba(255,107,107,0.20)",
                  }}
                >
                  👩‍🏫
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap size={18} className="text-coral-500" />
                  <p
                    className="text-xs font-bold text-coral-500 uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    Meet Our Principal
                  </p>
                </div>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-navy mb-1"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Dr. Khushboo Pachori
                </h2>
                <p
                  className="text-sm font-semibold text-coral-500 mb-5"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  Founder & Principal, Smart Neurons Preschool
                </p>

                <div
                  className="text-base leading-relaxed space-y-3"
                  style={{ color: "rgba(26,26,46,0.72)", fontFamily: "var(--font-inter)" }}
                >
                  <p>
                    Dr. Khushboo Pachori is a visionary early childhood educator with
                    over a decade of experience shaping young minds. Holding a
                    Doctorate in Child Psychology and Early Education, she has
                    dedicated her career to making quality preschool education
                    accessible, joyful, and impactful.
                  </p>
                  <p>
                    Her teaching philosophy rests on three pillars: every child is
                    inherently capable, play is the highest form of learning, and
                    families are a child's first and most important teachers. Under
                    her leadership, Smart Neurons has grown from a 12-child playgroup
                    to one of Bhopal's most trusted preschools.
                  </p>
                  <p>
                    Dr. Pachori regularly conducts parenting workshops, speaks at
                    early childhood conferences, and is a certified practitioner of
                    Montessori and Reggio Emilia approaches.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mt-6">
                  {["PhD in Child Psychology", "Montessori Certified", "NEP 2020 Expert", "10+ Years Experience"].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full"
                        style={{
                          fontFamily: "var(--font-nunito)",
                          background: "rgba(255,107,107,0.08)",
                          color: "#FF6B6B",
                          border: "1px solid rgba(255,107,107,0.18)",
                        }}
                      >
                        <Star size={10} className="fill-coral-500" />
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section
        className="section-padding"
        style={{ background: "linear-gradient(180deg, #F0FDF4 0%, #F8F4F0 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div
              className="glass-card p-8"
              style={{ background: "rgba(255,107,107,0.06)" }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "rgba(255,107,107,0.12)" }}
              >
                <Heart size={22} className="text-coral-500" />
              </div>
              <h3
                className="text-xl font-bold text-navy mb-3"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Our Mission
              </h3>
              <p
                className="text-base leading-relaxed"
                style={{ color: "rgba(26,26,46,0.68)", fontFamily: "var(--font-inter)" }}
              >
                To provide an inclusive, nurturing, and stimulating environment
                where every child — regardless of ability or background — can
                discover their strengths, develop a love for learning, and build the
                social-emotional skills that form the bedrock of a fulfilling life.
              </p>
            </div>

            <div
              className="glass-card p-8"
              style={{ background: "rgba(107,203,119,0.06)" }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "rgba(107,203,119,0.12)" }}
              >
                <Sparkles size={22} className="text-sage-400" />
              </div>
              <h3
                className="text-xl font-bold text-navy mb-3"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Our Vision
              </h3>
              <p
                className="text-base leading-relaxed"
                style={{ color: "rgba(26,26,46,0.68)", fontFamily: "var(--font-inter)" }}
              >
                To be the most trusted preschool in Madhya Pradesh — a place where
                families choose not just for academic preparation, but for the
                confidence, creativity, and character that our children carry with
                them for the rest of their lives.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="text-center mb-12">
            <h2
              className="text-3xl sm:text-4xl font-bold text-navy mb-4"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              What We Stand For
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div
                key={v.title}
                className="glass-card p-6 text-center animate-fade-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                  style={{ background: v.bg }}
                >
                  {v.emoji}
                </div>
                <h3
                  className="text-base font-bold text-navy mb-2"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  {v.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-inter)" }}
                >
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section
        className="section-padding"
        style={{ background: "rgba(255,255,255,0.40)" }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl sm:text-4xl font-bold text-navy"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Our Journey
            </h2>
          </div>
          <div className="relative">
            <div
              className="absolute left-6 top-0 bottom-0 w-0.5"
              style={{ background: "linear-gradient(180deg, #FF6B6B, #FFD93D, #6BCB77)" }}
            />
            <div className="space-y-8 pl-16">
              {milestones.map((m, i) => (
                <div key={m.year} className="relative animate-slide-left" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div
                    className="absolute -left-10 top-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, #FF6B6B, #ff8e53)",
                      boxShadow: "0 4px 12px rgba(255,107,107,0.35)",
                      fontFamily: "var(--font-nunito)",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="glass-card p-5">
                    <p
                      className="text-xs font-bold text-coral-500 mb-1.5 uppercase tracking-widest"
                      style={{ fontFamily: "var(--font-nunito)" }}
                    >
                      {m.year}
                    </p>
                    <p
                      className="text-sm leading-relaxed text-navy"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {m.event}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-16"
        style={{ background: "linear-gradient(135deg, #FFF5F5, #F8F4F0)" }}
      >
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2
            className="text-2xl sm:text-3xl font-bold text-navy mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Ready to Join Our Family?
          </h2>
          <p
            className="text-base mb-8"
            style={{ color: "rgba(26,26,46,0.62)", fontFamily: "var(--font-inter)" }}
          >
            Schedule a campus visit and experience the Smart Neurons magic in person.
          </p>
          <Link href="/admissions" className="btn-coral">
            Book a Visit <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
