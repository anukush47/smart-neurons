import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import InstagramIcon from "@/components/InstagramIcon";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Glimpses of life at Smart Neurons Preschool — classroom moments, activities, performances, and all the joy in between.",
};

const categories = [
  { label: "All", id: "all" },
  { label: "Classroom", id: "classroom" },
  { label: "Outdoor Play", id: "outdoor" },
  { label: "Celebrations", id: "celebrations" },
  { label: "Art & Craft", id: "art" },
];

const galleryItems = [
  {
    emoji: "🎨",
    title: "Art Day Magic",
    category: "Art & Craft",
    bg: "linear-gradient(135deg, rgba(255,107,107,0.15), rgba(255,217,61,0.15))",
    accent: "#FF6B6B",
    desc: "Little artists expressing their world through colours and shapes.",
    span: "col-span-1 row-span-2",
  },
  {
    emoji: "🌳",
    title: "Garden Explorers",
    category: "Outdoor Play",
    bg: "linear-gradient(135deg, rgba(107,203,119,0.18), rgba(76,175,80,0.12))",
    accent: "#6BCB77",
    desc: "Discovering nature, seasons, and the magic of growing things.",
    span: "col-span-1 row-span-1",
  },
  {
    emoji: "📖",
    title: "Story Time Circle",
    category: "Classroom",
    bg: "linear-gradient(135deg, rgba(167,139,250,0.15), rgba(124,58,237,0.10))",
    accent: "#7c3aed",
    desc: "Imagination runs wild every morning in our cozy reading corner.",
    span: "col-span-1 row-span-1",
  },
  {
    emoji: "🎭",
    title: "Annual Day 2024",
    category: "Celebrations",
    bg: "linear-gradient(135deg, rgba(255,217,61,0.18), rgba(249,115,22,0.12))",
    accent: "#d97706",
    desc: "Stars on stage! Our little performers took our breath away.",
    span: "col-span-2 row-span-1",
  },
  {
    emoji: "🧪",
    title: "Science Wonders",
    category: "Classroom",
    bg: "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(8,145,178,0.10))",
    accent: "#06b6d4",
    desc: "Volcanoes, colours, and reactions — science is always a WOW!",
    span: "col-span-1 row-span-1",
  },
  {
    emoji: "🎵",
    title: "Music & Movement",
    category: "Classroom",
    bg: "linear-gradient(135deg, rgba(255,107,107,0.12), rgba(167,139,250,0.12))",
    accent: "#FF6B6B",
    desc: "Singing, dancing, and rhythm-making every single day.",
    span: "col-span-1 row-span-1",
  },
  {
    emoji: "🏃",
    title: "Sports Carnival",
    category: "Outdoor Play",
    bg: "linear-gradient(135deg, rgba(107,203,119,0.15), rgba(255,217,61,0.12))",
    accent: "#6BCB77",
    desc: "Our annual sports day — laughter, teamwork, and tiny trophies!",
    span: "col-span-1 row-span-2",
  },
  {
    emoji: "🍳",
    title: "Kitchen Corner",
    category: "Classroom",
    bg: "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(255,217,61,0.15))",
    accent: "#f97316",
    desc: "Making salads, kneading dough, and learning life skills deliciously.",
    span: "col-span-1 row-span-1",
  },
  {
    emoji: "🪁",
    title: "Diwali Celebrations",
    category: "Celebrations",
    bg: "linear-gradient(135deg, rgba(255,217,61,0.20), rgba(249,115,22,0.15))",
    accent: "#d97706",
    desc: "Lights, diyas, rangoli and festive joy all around.",
    span: "col-span-1 row-span-1",
  },
  {
    emoji: "🧩",
    title: "Puzzle Masters",
    category: "Classroom",
    bg: "linear-gradient(135deg, rgba(167,139,250,0.12), rgba(6,182,212,0.10))",
    accent: "#7c3aed",
    desc: "Concentration, problem-solving, and tiny victories celebrated.",
    span: "col-span-1 row-span-1",
  },
  {
    emoji: "🌸",
    title: "Flower Making",
    category: "Art & Craft",
    bg: "linear-gradient(135deg, rgba(255,107,107,0.12), rgba(107,203,119,0.10))",
    accent: "#FF6B6B",
    desc: "Paper, scissors, and pure creativity in full bloom.",
    span: "col-span-2 row-span-1",
  },
  {
    emoji: "🎂",
    title: "Birthday Celebrations",
    category: "Celebrations",
    bg: "linear-gradient(135deg, rgba(255,107,107,0.15), rgba(255,217,61,0.15))",
    accent: "#FF6B6B",
    desc: "Every birthday is a grand event at Smart Neurons!",
    span: "col-span-1 row-span-1",
  },
];

export default function GalleryPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative pt-32 pb-20 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #FFF5F5 0%, #F0FDF4 60%, #F8F4F0 100%)" }}
      >
        <div
          className="absolute top-20 right-8 w-72 h-72 opacity-30 animate-float blob"
          style={{ background: "linear-gradient(135deg, rgba(255,217,61,0.22), rgba(255,107,107,0.18))" }}
        />
        <div
          className="absolute bottom-10 left-10 w-52 h-52 opacity-25 animate-float-delay blob-sm"
          style={{ background: "linear-gradient(135deg, rgba(107,203,119,0.20), rgba(167,139,250,0.15))" }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="text-sm font-bold uppercase tracking-widest mb-4"
            style={{ fontFamily: "var(--font-nunito)", color: "#FFD93D" }}
          >
            Life at Smart Neurons
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy mb-6"
            style={{ fontFamily: "var(--font-playfair)", lineHeight: 1.1 }}
          >
            A Glimpse of the{" "}
            <span className="text-gradient-coral">Joy Inside</span>
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto leading-relaxed mb-8"
            style={{ color: "rgba(26,26,46,0.65)", fontFamily: "var(--font-inter)" }}
          >
            Every day is a new adventure. Peek into our classrooms, playgrounds,
            and celebrations — moments full of laughter, discovery, and love.
          </p>
          <a
            href="https://www.instagram.com/smartneurons/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{
              fontFamily: "var(--font-nunito)",
              background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
              boxShadow: "0 4px 20px rgba(220,39,67,0.30)",
            }}
          >
            <InstagramIcon size={16} />
            Follow us on Instagram
            <ExternalLink size={13} />
          </a>
        </div>
      </section>

      {/* Gallery Grid */}
      <section
        className="section-padding"
        style={{ background: "rgba(255,255,255,0.50)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Masonry-style grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
            {galleryItems.map((item, idx) => (
              <div
                key={item.title}
                className={`glass-card p-6 sm:p-8 flex flex-col justify-between min-h-44 ${
                  idx === 0 || idx === 6 ? "lg:row-span-2" : ""
                } ${idx === 3 || idx === 10 ? "lg:col-span-2" : ""}`}
                style={{ background: item.bg }}
              >
                <div>
                  <p className={`mb-3 ${idx === 0 || idx === 6 ? "text-6xl" : "text-5xl"}`}>
                    {item.emoji}
                  </p>
                  <span
                    className="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3"
                    style={{
                      fontFamily: "var(--font-nunito)",
                      background: `${item.accent}18`,
                      color: item.accent,
                    }}
                  >
                    {item.category}
                  </span>
                  <h3
                    className="text-base sm:text-lg font-bold text-navy mb-2"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "rgba(26,26,46,0.62)", fontFamily: "var(--font-inter)" }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Note about photos */}
      <section
        className="py-12"
        style={{ background: "linear-gradient(135deg, #FFF5F5, #F8F4F0)" }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="glass-card p-8 text-center"
            style={{ background: "rgba(255,217,61,0.08)" }}
          >
            <p className="text-4xl mb-4">📸</p>
            <h3
              className="text-xl font-bold text-navy mb-3"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              See More on Instagram
            </h3>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "rgba(26,26,46,0.65)", fontFamily: "var(--font-inter)" }}
            >
              We share daily moments of joy, learning, and celebration on our
              Instagram. Follow{" "}
              <strong style={{ color: "#FF6B6B" }}>@smartneurons</strong> for a
              daily peek into our world — and share your child&apos;s moments with
              us too!
            </p>
            <a
              href="https://www.instagram.com/smartneurons/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-coral inline-flex"
            >
              <InstagramIcon size={18} />
              @smartneurons
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-14"
        style={{ background: "rgba(255,255,255,0.50)" }}
      >
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2
            className="text-2xl sm:text-3xl font-bold text-navy mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Want to Experience It in Person?
          </h2>
          <p
            className="text-base mb-8"
            style={{ color: "rgba(26,26,46,0.62)", fontFamily: "var(--font-inter)" }}
          >
            Come visit our campus — we&apos;d love to show you around and introduce
            your child to the Smart Neurons family.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/admissions" className="btn-coral">
              Book a Campus Visit <ArrowRight size={18} />
            </Link>
            <Link href="/contact" className="btn-outline">
              Get Directions
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
