import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Users, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Explore Smart Neurons Preschool programs — Playgroup (2–3 yrs), Nursery (3–4 yrs), Junior KG, and Senior KG — designed for holistic early childhood development.",
};

const programs = [
  {
    name: "Playgroup",
    age: "2 – 3 years",
    emoji: "🌱",
    color: "#6BCB77",
    bg: "rgba(107,203,119,0.10)",
    duration: "3 hours / day",
    batchSize: "10–12 children",
    tagline: "Where Wonder Begins",
    description:
      "Our Playgroup is a gentle, loving introduction to the world beyond home. Designed for 2–3 year olds, this program focuses on building comfort, social skills, and early language through sensory-rich play experiences.",
    highlights: [
      "Sensory play stations (sand, water, art, music)",
      "Circle time with songs, stories, and rhymes",
      "Gross motor development through outdoor play",
      "Potty training support and life skills",
      "Parent-teacher bonding sessions every month",
      "Emotion recognition and self-regulation activities",
    ],
    schedule: [
      { time: "8:30 AM", activity: "Drop-off & Free Play" },
      { time: "9:00 AM", activity: "Morning Circle & Songs" },
      { time: "9:30 AM", activity: "Sensory / Art Activity" },
      { time: "10:15 AM", activity: "Snack Time & Social Skills" },
      { time: "10:45 AM", activity: "Outdoor Play" },
      { time: "11:15 AM", activity: "Story Time & Goodbye Circle" },
      { time: "11:30 AM", activity: "Pick-up" },
    ],
  },
  {
    name: "Nursery",
    age: "3 – 4 years",
    emoji: "🌻",
    color: "#d97706",
    bg: "rgba(255,217,61,0.14)",
    duration: "3.5 hours / day",
    batchSize: "12–14 children",
    tagline: "Curiosity in Full Bloom",
    description:
      "The Nursery program sparks curiosity and introduces foundational concepts in literacy, numeracy, and creativity. Children learn through themes, projects, and joyful exploration, building independence and language skills.",
    highlights: [
      "Pre-reading: phonemic awareness, alphabet recognition",
      "Pre-math: counting, patterns, shapes, and colours",
      "Creative arts: painting, collage, clay, and craft",
      "Dramatic play and role-playing corners",
      "Nature exploration and gardening activities",
      "Digital literacy with age-appropriate tools",
    ],
    schedule: [
      { time: "8:30 AM", activity: "Arrival & Morning Work" },
      { time: "9:00 AM", activity: "Circle Time & Calendar" },
      { time: "9:30 AM", activity: "Literacy / Numeracy Activity" },
      { time: "10:15 AM", activity: "Creative Arts or Project Work" },
      { time: "10:45 AM", activity: "Snack & Social Time" },
      { time: "11:00 AM", activity: "Outdoor Play & Exploration" },
      { time: "11:30 AM", activity: "Story, Reflection & Pick-up" },
      { time: "12:00 PM", activity: "Pick-up" },
    ],
  },
  {
    name: "Junior KG",
    age: "4 – 5 years",
    emoji: "🚀",
    color: "#FF6B6B",
    bg: "rgba(255,107,107,0.10)",
    duration: "4 hours / day",
    batchSize: "14–16 children",
    tagline: "Ready to Soar",
    description:
      "Junior KG is where children become confident, curious, and capable learners. The program deepens literacy and numeracy skills, introduces scientific thinking, and nurtures social-emotional competencies for a seamless transition to Senior KG.",
    highlights: [
      "Guided reading with phonics and sight words",
      "Number sense: addition, subtraction, comparisons",
      "Science experiments and STEM exploration",
      "Social skills: teamwork, conflict resolution",
      "Public speaking and show-and-tell activities",
      "Introduction to Hindi script and conversational Hindi",
    ],
    schedule: [
      { time: "8:30 AM", activity: "Arrival & Journaling" },
      { time: "9:00 AM", activity: "Circle Time & Planning" },
      { time: "9:30 AM", activity: "English / Phonics" },
      { time: "10:15 AM", activity: "Math & STEM Activity" },
      { time: "10:45 AM", activity: "Snack Break" },
      { time: "11:00 AM", activity: "Hindi / Regional Language" },
      { time: "11:30 AM", activity: "Creative Arts or Music" },
      { time: "12:00 PM", activity: "Outdoor / PE" },
      { time: "12:30 PM", activity: "Review & Pick-up" },
    ],
  },
  {
    name: "Senior KG",
    age: "5 – 6 years",
    emoji: "🎓",
    color: "#7c3aed",
    bg: "rgba(167,139,250,0.10)",
    duration: "4.5 hours / day",
    batchSize: "14–16 children",
    tagline: "School Ready. Life Ready.",
    description:
      "Our Senior KG program prepares children holistically for the transition to Class 1. Academic preparation is balanced with social-emotional learning, creative expression, and leadership experiences that build genuine confidence.",
    highlights: [
      "Reading fluency and comprehension skills",
      "Writing: sentences, descriptions, and creative stories",
      "Advanced math: place value, simple word problems",
      "Leadership projects and classroom responsibilities",
      "Critical thinking and problem-solving challenges",
      "School transition visits and readiness assessments",
    ],
    schedule: [
      { time: "8:30 AM", activity: "Arrival & Self-directed Learning" },
      { time: "9:00 AM", activity: "Morning Meeting" },
      { time: "9:30 AM", activity: "English & Literacy" },
      { time: "10:15 AM", activity: "Mathematics" },
      { time: "10:45 AM", activity: "Snack Break" },
      { time: "11:00 AM", activity: "EVS / Science / STEM" },
      { time: "11:30 AM", activity: "Hindi / Second Language" },
      { time: "12:00 PM", activity: "Arts / Music / PE" },
      { time: "12:30 PM", activity: "Project Work / Leadership" },
      { time: "1:00 PM", activity: "Reflection & Pick-up" },
    ],
  },
];

const activities = [
  { emoji: "🎵", name: "Music & Rhythm" },
  { emoji: "🎨", name: "Visual Arts" },
  { emoji: "💃", name: "Creative Movement" },
  { emoji: "🌿", name: "Nature Club" },
  { emoji: "🧩", name: "Logic Games" },
  { emoji: "📖", name: "Storytelling" },
  { emoji: "🔭", name: "Science Corner" },
  { emoji: "🍳", name: "Cooking Activities" },
  { emoji: "🌍", name: "World Cultures" },
  { emoji: "🏃", name: "Sports & PE" },
  { emoji: "🎭", name: "Drama & Role Play" },
  { emoji: "🤝", name: "Community Projects" },
];

export default function ProgramsPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative pt-32 pb-20 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #FFF5F5 0%, #F0FDF4 60%, #F8F4F0 100%)" }}
      >
        <div
          className="absolute top-20 right-0 w-80 h-80 opacity-30 animate-float blob"
          style={{ background: "linear-gradient(135deg, rgba(107,203,119,0.25), rgba(255,217,61,0.20))" }}
        />
        <div
          className="absolute bottom-0 left-0 w-56 h-56 opacity-25 animate-float-delay blob-sm"
          style={{ background: "linear-gradient(135deg, rgba(255,107,107,0.20), rgba(167,139,250,0.20))" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="text-sm font-bold uppercase tracking-widest mb-4"
            style={{ fontFamily: "var(--font-nunito)", color: "#6BCB77" }}
          >
            Our Curriculum
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy mb-6"
            style={{ fontFamily: "var(--font-playfair)", lineHeight: 1.1 }}
          >
            Programs Designed for{" "}
            <span className="text-gradient-sage">Every Stage</span>
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: "rgba(26,26,46,0.65)", fontFamily: "var(--font-inter)" }}
          >
            From first steps to school readiness — each Smart Neurons program is
            meticulously crafted to match your child's developmental milestones with
            joyful, play-based learning.
          </p>
        </div>
      </section>

      {/* Programs detail */}
      {programs.map((prog, idx) => (
        <section
          key={prog.name}
          id={prog.name.toLowerCase().replace(" ", "-")}
          className="section-padding"
          style={{
            background:
              idx % 2 === 0
                ? "rgba(255,255,255,0.55)"
                : "linear-gradient(180deg, #F8F4F0 0%, rgba(248,244,240,0.70) 100%)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid lg:grid-cols-2 gap-12 items-start ${idx % 2 !== 0 ? "lg:flex-row-reverse" : ""}`}>
              {/* Info */}
              <div className={idx % 2 !== 0 ? "lg:order-2" : ""}>
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-16 h-16 rounded-3xl flex items-center justify-center text-4xl flex-shrink-0"
                    style={{ background: prog.bg }}
                  >
                    {prog.emoji}
                  </div>
                  <div>
                    <h2
                      className="text-3xl font-bold text-navy"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      {prog.name}
                    </h2>
                    <p
                      className="text-sm font-bold"
                      style={{ color: prog.color, fontFamily: "var(--font-nunito)" }}
                    >
                      {prog.tagline}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                  <span
                    className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full"
                    style={{ fontFamily: "var(--font-nunito)", background: prog.bg, color: prog.color }}
                  >
                    🎂 {prog.age}
                  </span>
                  <span
                    className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full"
                    style={{
                      fontFamily: "var(--font-nunito)",
                      background: "rgba(26,26,46,0.06)",
                      color: "rgba(26,26,46,0.65)",
                    }}
                  >
                    <Clock size={14} /> {prog.duration}
                  </span>
                  <span
                    className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full"
                    style={{
                      fontFamily: "var(--font-nunito)",
                      background: "rgba(26,26,46,0.06)",
                      color: "rgba(26,26,46,0.65)",
                    }}
                  >
                    <Users size={14} /> {prog.batchSize}
                  </span>
                </div>

                <p
                  className="text-base leading-relaxed mb-8"
                  style={{ color: "rgba(26,26,46,0.68)", fontFamily: "var(--font-inter)" }}
                >
                  {prog.description}
                </p>

                <h3
                  className="text-base font-bold text-navy mb-4"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  What Your Child Will Discover
                </h3>
                <ul className="space-y-2.5 mb-8">
                  {prog.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2.5">
                      <CheckCircle
                        size={16}
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: prog.color }}
                      />
                      <span
                        className="text-sm"
                        style={{ color: "rgba(26,26,46,0.68)", fontFamily: "var(--font-inter)" }}
                      >
                        {h}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href="/admissions" className="btn-coral">
                  Enquire for {prog.name} <ArrowRight size={16} />
                </Link>
              </div>

              {/* Schedule */}
              <div className={idx % 2 !== 0 ? "lg:order-1" : ""}>
                <div className="glass-card p-7">
                  <h3
                    className="text-base font-bold text-navy mb-6 flex items-center gap-2"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    <Clock size={16} style={{ color: prog.color }} />
                    Sample Daily Schedule
                  </h3>
                  <div className="space-y-3">
                    {prog.schedule.map((s, i) => (
                      <div
                        key={s.time}
                        className="flex items-center gap-4 p-3 rounded-xl transition-colors duration-200 hover:bg-white/50"
                      >
                        <span
                          className="text-xs font-bold w-20 flex-shrink-0"
                          style={{ color: prog.color, fontFamily: "var(--font-nunito)" }}
                        >
                          {s.time}
                        </span>
                        <div
                          className="w-0.5 h-5 flex-shrink-0 rounded-full"
                          style={{ background: `${prog.color}40` }}
                        />
                        <span
                          className="text-sm"
                          style={{ color: "rgba(26,26,46,0.70)", fontFamily: "var(--font-inter)" }}
                        >
                          {s.activity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Activities grid */}
      <section
        className="section-padding"
        style={{ background: "linear-gradient(135deg, #FFF5F5 0%, #F0FDF4 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p
              className="text-sm font-bold uppercase tracking-widest mb-3"
              style={{ fontFamily: "var(--font-nunito)", color: "#FF6B6B" }}
            >
              Beyond the Curriculum
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-navy mb-4"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Enrichment Activities
            </h2>
            <p
              className="text-base max-w-lg mx-auto"
              style={{ color: "rgba(26,26,46,0.62)", fontFamily: "var(--font-inter)" }}
            >
              Every day at Smart Neurons is full of discovery, expression, and fun.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {activities.map((a) => (
              <div
                key={a.name}
                className="glass-card p-4 text-center"
              >
                <p className="text-3xl mb-2">{a.emoji}</p>
                <p
                  className="text-xs font-semibold text-navy"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  {a.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-16"
        style={{ background: "rgba(255,255,255,0.50)" }}
      >
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2
            className="text-2xl sm:text-3xl font-bold text-navy mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Not Sure Which Program Fits?
          </h2>
          <p
            className="text-base mb-8"
            style={{ color: "rgba(26,26,46,0.62)", fontFamily: "var(--font-inter)" }}
          >
            Our team will happily guide you to the right program for your child's
            age, interests, and learning style.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/admissions" className="btn-coral">
              Enquire Now <ArrowRight size={18} />
            </Link>
            <Link href="/contact" className="btn-outline">
              Talk to an Educator
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
