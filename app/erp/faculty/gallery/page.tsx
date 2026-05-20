"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ERPShell from "@/components/erp/ERPShell";
import { Upload, X, Eye, CheckCircle, Plus } from "lucide-react";

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
  submitted: boolean;
}

const STOCK: Record<string, string> = {
  classroom: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=70",
  art:       "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=70",
  music:     "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=70",
  play:      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=70",
  craft:     "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&q=70",
};

const INITIAL_ALBUMS: GalleryAlbum[] = [
  {
    id: "FA1", title: "Story Time — May Week 1", tag: "Classroom", tagColor: "#7c3aed", tagBg: "rgba(124,58,237,0.10)",
    date: "May 7, 2026", cover: STOCK.classroom, submitted: true,
    photos: [
      { id: "FP1", url: STOCK.classroom, caption: "Story time with big picture book",  date: "May 7" },
      { id: "FP2", url: STOCK.play,      caption: "Children listening attentively",    date: "May 7" },
    ],
  },
  {
    id: "FA2", title: "Art Period — Clay Modelling", tag: "Activity", tagColor: "#d97706", tagBg: "rgba(217,119,6,0.10)",
    date: "May 13, 2026", cover: STOCK.art, submitted: false,
    photos: [
      { id: "FP3", url: STOCK.art,       caption: "Clay animals made by JKG-A",       date: "May 13" },
      { id: "FP4", url: STOCK.craft,     caption: "Drying clay models",               date: "May 13" },
    ],
  },
];

const TAGS = ["Classroom", "Activity", "Event", "Field Trip", "General"];
const TAG_META: Record<string, { color: string; bg: string }> = {
  "Classroom":  { color: "#7c3aed", bg: "rgba(124,58,237,0.10)" },
  "Activity":   { color: "#d97706", bg: "rgba(217,119,6,0.10)"  },
  "Event":      { color: "#6BCB77", bg: "rgba(107,203,119,0.10)"},
  "Field Trip": { color: "#FF6B6B", bg: "rgba(255,107,107,0.10)"},
  "General":    { color: "rgba(26,26,46,0.50)", bg: "rgba(26,26,46,0.07)" },
};

export default function FacultyGalleryPage() {
  const router  = useRouter();
  const [user, setUser]         = useState("");
  const [albums, setAlbums]     = useState<GalleryAlbum[]>(INITIAL_ALBUMS);
  const [view, setView]         = useState<"grid" | "album">("grid");
  const [openAlbum, setOpenAlbum] = useState<GalleryAlbum | null>(null);
  const [lightbox, setLightbox] = useState<GalleryPhoto | null>(null);
  const [showNew, setShowNew]   = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTag, setNewTag]     = useState("Classroom");
  const [newDate, setNewDate]   = useState("2026-05-20");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const role = sessionStorage.getItem("erp_role");
    const u    = sessionStorage.getItem("erp_user");
    if (role !== "faculty") { router.replace("/erp/login"); return; }
    setUser(u || "Ms. Priya Sharma");
  }, []);

  function createAlbum() {
    if (!newTitle.trim()) return;
    const meta = TAG_META[newTag] || TAG_META["General"];
    const album: GalleryAlbum = {
      id: `FA${Date.now()}`, title: newTitle.trim(), tag: newTag,
      tagColor: meta.color, tagBg: meta.bg,
      date: newDate, cover: STOCK.classroom, submitted: false, photos: [],
    };
    setAlbums(prev => [album, ...prev]);
    setNewTitle(""); setShowNew(false);
  }

  function handlePhotoUpload(albumId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newPhotos: GalleryPhoto[] = files.map((f, i) => ({
      id: `FP${Date.now()}-${i}`,
      url: URL.createObjectURL(f),
      caption: f.name.replace(/\.[^.]+$/, ""),
      date: "Today",
    }));
    setAlbums(prev => prev.map(a => a.id === albumId ? { ...a, photos: [...a.photos, ...newPhotos] } : a));
    if (openAlbum?.id === albumId) setOpenAlbum(a => a ? { ...a, photos: [...a.photos, ...newPhotos] } : a);
    setUploading(true);
    setTimeout(() => setUploading(false), 2000);
  }

  function updateCaption(albumId: string, photoId: string, caption: string) {
    setAlbums(prev => prev.map(a => a.id !== albumId ? a : {
      ...a, photos: a.photos.map(p => p.id === photoId ? { ...p, caption } : p),
    }));
    if (openAlbum?.id === albumId) setOpenAlbum(a => a ? {
      ...a, photos: a.photos.map(p => p.id === photoId ? { ...p, caption } : p),
    } : a);
  }

  function deletePhoto(albumId: string, photoId: string) {
    setAlbums(prev => prev.map(a => a.id !== albumId ? a : { ...a, photos: a.photos.filter(p => p.id !== photoId) }));
    if (openAlbum?.id === albumId) setOpenAlbum(a => a ? { ...a, photos: a.photos.filter(p => p.id !== photoId) } : a);
  }

  function submitAlbum(albumId: string) {
    setAlbums(prev => prev.map(a => a.id === albumId ? { ...a, submitted: true } : a));
    if (openAlbum?.id === albumId) setOpenAlbum(a => a ? { ...a, submitted: true } : a);
  }

  return (
    <ERPShell role="faculty" userName={user}>
      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setLightbox(null)}>
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.caption} className="w-full rounded-2xl object-cover" style={{ maxHeight: "75vh" }} />
            <p className="text-white text-sm text-center mt-3" style={{ fontFamily: "var(--font-inter)" }}>{lightbox.caption}</p>
            <button type="button" onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.60)" }}>
              <X size={16} style={{ color: "white" }} />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Class Gallery</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
            JKG-A · Upload class photos for parents to view
          </p>
        </div>
        <button type="button" onClick={() => setShowNew(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg,#6BCB77,#4CAF50)", color: "white", boxShadow: "0 3px 10px rgba(107,203,119,0.30)", fontFamily: "var(--font-nunito)" }}>
          <Plus size={15} /> New Album
        </button>
      </div>

      {showNew && (
        <div className="glass-card p-5 mb-5" style={{ border: "1.5px solid rgba(107,203,119,0.22)" }}>
          <p className="text-sm font-bold text-navy mb-3" style={{ fontFamily: "var(--font-nunito)" }}>Create New Album</p>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <input type="text" placeholder="Album title" value={newTitle} onChange={e => setNewTitle(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-sm"
              style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.09)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }} />
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-sm"
              style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.09)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }} />
          </div>
          <div className="flex gap-1.5 flex-wrap mb-4">
            {TAGS.map(t => (
              <button key={t} type="button" onClick={() => setNewTag(t)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: newTag === t ? TAG_META[t]?.bg : "rgba(26,26,46,0.05)",
                  color: newTag === t ? TAG_META[t]?.color : "rgba(26,26,46,0.45)",
                  border: newTag === t ? `1px solid ${TAG_META[t]?.color}30` : "1px solid transparent",
                  fontFamily: "var(--font-nunito)",
                }}>{t}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={createAlbum}
              className="px-5 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-all"
              style={{ background: "linear-gradient(135deg,#6BCB77,#4CAF50)", color: "white", fontFamily: "var(--font-nunito)" }}>
              Create
            </button>
            <button type="button" onClick={() => setShowNew(false)}
              className="px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Album detail */}
      {view === "album" && openAlbum ? (
        <div>
          <button type="button" onClick={() => { setView("grid"); setOpenAlbum(null); }}
            className="flex items-center gap-1.5 text-xs font-bold mb-4 px-3 py-2 rounded-xl"
            style={{ background: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>
            ← All Albums
          </button>

          <div className="glass-card p-4 mb-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: openAlbum.tagBg, color: openAlbum.tagColor, fontFamily: "var(--font-nunito)" }}>{openAlbum.tag}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: openAlbum.submitted ? "rgba(107,203,119,0.10)" : "rgba(26,26,46,0.07)", color: openAlbum.submitted ? "#6BCB77" : "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>
                    {openAlbum.submitted ? "Submitted to Admin" : "Draft"}
                  </span>
                </div>
                <p className="text-base font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{openAlbum.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{openAlbum.date} · {openAlbum.photos.length} photos</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handlePhotoUpload(openAlbum.id, e)} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                  style={{ background: uploading ? "rgba(107,203,119,0.12)" : "rgba(107,203,119,0.10)", color: "#6BCB77", border: "1px solid rgba(107,203,119,0.22)", fontFamily: "var(--font-nunito)" }}>
                  {uploading ? <><CheckCircle size={12} /> Uploaded!</> : <><Upload size={12} /> Add Photos</>}
                </button>
                {!openAlbum.submitted && openAlbum.photos.length > 0 && (
                  <button type="button" onClick={() => submitAlbum(openAlbum.id)}
                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                    style={{ background: "linear-gradient(135deg,#6BCB77,#4CAF50)", color: "white", fontFamily: "var(--font-nunito)" }}>
                    Submit to Admin
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {openAlbum.photos.map(p => (
              <div key={p.id} className="group">
                <div className="relative rounded-2xl overflow-hidden cursor-pointer mb-2"
                  style={{ aspectRatio: "1" }} onClick={() => setLightbox(p)}>
                  <img src={p.url} alt={p.caption} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                    style={{ background: "rgba(0,0,0,0.40)" }}>
                    <Eye size={18} style={{ color: "white" }} />
                  </div>
                  <button type="button" onClick={e => { e.stopPropagation(); deletePhoto(openAlbum.id, p.id); }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "#FF6B6B" }}>
                    <X size={11} style={{ color: "white" }} />
                  </button>
                </div>
                <input type="text" value={p.caption} onChange={e => updateCaption(openAlbum.id, p.id, e.target.value)}
                  className="w-full px-2 py-1 rounded-lg text-xs"
                  style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.65)" }} />
              </div>
            ))}
            {openAlbum.photos.length === 0 && (
              <div className="col-span-full py-12 text-center rounded-2xl" style={{ border: "2px dashed rgba(26,26,46,0.12)" }}>
                <p className="text-sm mb-2" style={{ color: "rgba(26,26,46,0.35)", fontFamily: "var(--font-inter)" }}>No photos yet.</p>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="text-xs font-bold px-4 py-2 rounded-xl"
                  style={{ background: "rgba(107,203,119,0.10)", color: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
                  Upload Photos
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {albums.map(a => (
            <div key={a.id} className="glass-card overflow-hidden group cursor-pointer"
              style={{ border: a.submitted ? "1.5px solid rgba(107,203,119,0.22)" : "1.5px solid rgba(26,26,46,0.08)" }}
              onClick={() => { setOpenAlbum(a); setView("album"); }}>
              <div className="relative overflow-hidden" style={{ height: 150 }}>
                <img src={a.cover} alt={a.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.40), transparent)" }} />
                <span className="absolute top-3 left-3 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: a.tagBg, color: a.tagColor, fontFamily: "var(--font-nunito)" }}>{a.tag}</span>
                <p className="absolute bottom-3 left-3 text-xs text-white font-semibold" style={{ fontFamily: "var(--font-inter)" }}>
                  {a.photos.length} photo{a.photos.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="p-4">
                <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{a.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{a.date}</p>
                <div className="mt-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: a.submitted ? "rgba(107,203,119,0.10)" : "rgba(26,26,46,0.07)", color: a.submitted ? "#6BCB77" : "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>
                    {a.submitted ? "✓ Submitted" : "Draft"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ERPShell>
  );
}
