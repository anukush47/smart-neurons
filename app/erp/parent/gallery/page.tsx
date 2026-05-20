"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ERPShell from "@/components/erp/ERPShell";
import { X, Eye } from "lucide-react";

interface GalleryPhoto {
  id: string;
  url: string;
  caption: string;
  date: string;
}

interface GalleryAlbum {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  date: string;
  cover: string;
  photos: GalleryPhoto[];
}

const STOCK: Record<string, string> = {
  sports:    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=70",
  art:       "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=70",
  classroom: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=70",
  garden:    "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&q=70",
  music:     "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=70",
  play:      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=70",
  craft:     "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&q=70",
  dance:     "https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&q=70",
};

const ALBUMS: GalleryAlbum[] = [
  {
    id: "A1", title: "Annual Sports Day 2026", tag: "Event", tagColor: "#6BCB77", tagBg: "rgba(107,203,119,0.10)",
    date: "May 28, 2026", cover: STOCK.sports,
    photos: [
      { id: "P1", url: STOCK.sports,    caption: "Opening ceremony",           date: "May 28" },
      { id: "P2", url: STOCK.play,      caption: "Relay race — JKG",           date: "May 28" },
      { id: "P3", url: STOCK.dance,     caption: "Prize distribution",         date: "May 28" },
    ],
  },
  {
    id: "A2", title: "Art & Craft Week", tag: "Academic", tagColor: "#d97706", tagBg: "rgba(217,119,6,0.10)",
    date: "May 12–16, 2026", cover: STOCK.art,
    photos: [
      { id: "P4", url: STOCK.art,       caption: "Clay modelling session",     date: "May 13" },
      { id: "P5", url: STOCK.craft,     caption: "Paper folding — JKG-A",      date: "May 14" },
    ],
  },
  {
    id: "A3", title: "Classroom Activities — JKG", tag: "Classroom", tagColor: "#7c3aed", tagBg: "rgba(124,58,237,0.10)",
    date: "May 2026", cover: STOCK.classroom,
    photos: [
      { id: "P6", url: STOCK.classroom, caption: "Story time with Ms. Priya", date: "May 7" },
      { id: "P7", url: STOCK.music,     caption: "Music period",              date: "May 9" },
    ],
  },
  {
    id: "A4", title: "Garden Walk", tag: "Activity", tagColor: "#6BCB77", tagBg: "rgba(107,203,119,0.10)",
    date: "May 5, 2026", cover: STOCK.garden,
    photos: [
      { id: "P8", url: STOCK.garden,    caption: "Exploring plants in school garden", date: "May 5" },
    ],
  },
];

export default function ParentGalleryPage() {
  const router = useRouter();
  const [user, setUser]         = useState("");
  const [view, setView]         = useState<"grid" | "album">("grid");
  const [openAlbum, setOpenAlbum] = useState<GalleryAlbum | null>(null);
  const [lightbox, setLightbox] = useState<GalleryPhoto | null>(null);
  const [tagFilter, setTagFilter] = useState("All");

  useEffect(() => {
    const role = sessionStorage.getItem("erp_role");
    const u    = sessionStorage.getItem("erp_user");
    if (role !== "parent") { router.replace("/erp/login"); return; }
    setUser(u || "+91 XXXXX XXXXX");
  }, []);

  const tags = ["All", ...Array.from(new Set(ALBUMS.map(a => a.tag)))];
  const filtered = tagFilter === "All" ? ALBUMS : ALBUMS.filter(a => a.tag === tagFilter);
  const totalPhotos = ALBUMS.reduce((a, al) => a + al.photos.length, 0);

  return (
    <ERPShell role="parent" userName={user}>
      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.88)" }} onClick={() => setLightbox(null)}>
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.caption}
              className="w-full rounded-2xl object-cover" style={{ maxHeight: "75vh" }} />
            <p className="text-white text-sm text-center mt-3 opacity-80" style={{ fontFamily: "var(--font-inter)" }}>
              {lightbox.caption}
            </p>
            <button type="button" onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.60)" }}>
              <X size={16} style={{ color: "white" }} />
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>School Gallery</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          {ALBUMS.length} albums · {totalPhotos} photos from school activities
        </p>
      </div>

      {/* Album detail */}
      {view === "album" && openAlbum ? (
        <div>
          <button type="button" onClick={() => { setView("grid"); setOpenAlbum(null); }}
            className="flex items-center gap-1.5 text-xs font-bold mb-4 px-3 py-2 rounded-xl"
            style={{ background: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>
            ← All Albums
          </button>

          {/* Album header */}
          <div className="glass-card p-5 mb-4" style={{ border: "1.5px solid rgba(217,119,6,0.18)" }}>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: openAlbum.tagBg, color: openAlbum.tagColor, fontFamily: "var(--font-nunito)" }}>
                {openAlbum.tag}
              </span>
            </div>
            <p className="text-base font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>{openAlbum.title}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
              {openAlbum.date} · {openAlbum.photos.length} photos
            </p>
          </div>

          {/* Photo grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {openAlbum.photos.map(p => (
              <div key={p.id} className="group cursor-pointer" onClick={() => setLightbox(p)}>
                <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "1" }}>
                  <img src={p.url} alt={p.caption} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-end justify-start p-2"
                    style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.30), transparent)" }}>
                    <Eye size={16} style={{ color: "white" }} />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2.5"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }}>
                    <p className="text-xs text-white font-semibold" style={{ fontFamily: "var(--font-inter)" }}>{p.caption}</p>
                    <p className="text-xs text-white opacity-60 mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>{p.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Tag filter */}
          <div className="flex gap-2 flex-wrap mb-5">
            {tags.map(t => (
              <button key={t} type="button" onClick={() => setTagFilter(t)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: tagFilter === t ? "rgba(217,119,6,0.12)" : "rgba(26,26,46,0.05)",
                  color: tagFilter === t ? "#d97706" : "rgba(26,26,46,0.50)",
                  border: tagFilter === t ? "1.5px solid rgba(217,119,6,0.28)" : "1.5px solid transparent",
                  fontFamily: "var(--font-nunito)",
                }}>{t}</button>
            ))}
          </div>

          {/* Album grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(a => (
              <div key={a.id} className="glass-card overflow-hidden group cursor-pointer"
                onClick={() => { setOpenAlbum(a); setView("album"); }}>
                <div className="relative overflow-hidden" style={{ height: 180 }}>
                  <img src={a.cover} alt={a.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.50), transparent)" }} />
                  <span className="absolute top-3 left-3 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: a.tagBg, color: a.tagColor, fontFamily: "var(--font-nunito)" }}>
                    {a.tag}
                  </span>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-nunito)" }}>{a.title}</p>
                    <p className="text-xs text-white opacity-70 mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>
                      {a.date} · {a.photos.length} photo{a.photos.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(0,0,0,0.20)" }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}>
                      <Eye size={20} style={{ color: "white" }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="glass-card p-10 text-center">
              <p className="text-sm" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>No albums in this category yet.</p>
            </div>
          )}
        </>
      )}
    </ERPShell>
  );
}
