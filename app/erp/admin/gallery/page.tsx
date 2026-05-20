"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ERPShell from "@/components/erp/ERPShell";
import { Upload, Trash2, Eye, Plus, X, CheckCircle } from "lucide-react";

interface GalleryPhoto {
  id: string;
  url: string;
  caption: string;
  uploadedBy: string;
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
  published: boolean;
  audience: "all" | "jkg" | "skg" | "nursery" | "playgroup";
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

const INITIAL_ALBUMS: GalleryAlbum[] = [
  {
    id: "A1", title: "Annual Sports Day 2026", tag: "Event", tagColor: "#6BCB77", tagBg: "rgba(107,203,119,0.10)",
    date: "May 28, 2026", cover: STOCK.sports, published: true, audience: "all",
    photos: [
      { id: "P1", url: STOCK.sports,    caption: "Opening ceremony",      uploadedBy: "Admin",            date: "May 28" },
      { id: "P2", url: STOCK.play,      caption: "Relay race — JKG",      uploadedBy: "Ms. Priya Sharma", date: "May 28" },
      { id: "P3", url: STOCK.dance,     caption: "Prize distribution",    uploadedBy: "Admin",            date: "May 28" },
    ],
  },
  {
    id: "A2", title: "Art & Craft Week", tag: "Academic", tagColor: "#d97706", tagBg: "rgba(217,119,6,0.10)",
    date: "May 12–16, 2026", cover: STOCK.art, published: true, audience: "all",
    photos: [
      { id: "P4", url: STOCK.art,       caption: "Clay modelling session", uploadedBy: "Ms. Deepa Iyer",  date: "May 13" },
      { id: "P5", url: STOCK.craft,     caption: "Paper folding — SKG",   uploadedBy: "Ms. Deepa Iyer",  date: "May 14" },
    ],
  },
  {
    id: "A3", title: "Classroom Activities — JKG", tag: "Classroom", tagColor: "#7c3aed", tagBg: "rgba(124,58,237,0.10)",
    date: "May 2026", cover: STOCK.classroom, published: true, audience: "jkg",
    photos: [
      { id: "P6", url: STOCK.classroom, caption: "Story time with Ms. Priya", uploadedBy: "Ms. Priya Sharma", date: "May 7" },
      { id: "P7", url: STOCK.music,     caption: "Music period",           uploadedBy: "Mr. Suresh Kumar", date: "May 9" },
    ],
  },
  {
    id: "A4", title: "Garden Walk — Nursery", tag: "Activity", tagColor: "#6BCB77", tagBg: "rgba(107,203,119,0.10)",
    date: "May 5, 2026", cover: STOCK.garden, published: false, audience: "nursery",
    photos: [
      { id: "P8", url: STOCK.garden,    caption: "Exploring plants",       uploadedBy: "Ms. Rekha Nair",   date: "May 5" },
    ],
  },
];

const TAGS    = ["Event", "Academic", "Classroom", "Activity", "Holiday", "General"];
const AUDIENCES = [
  { key: "all",       label: "All Classes" },
  { key: "playgroup", label: "Playgroup" },
  { key: "nursery",   label: "Nursery" },
  { key: "jkg",       label: "JKG" },
  { key: "skg",       label: "SKG" },
] as const;

const TAG_META: Record<string, { color: string; bg: string }> = {
  "Event":     { color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
  "Academic":  { color: "#d97706", bg: "rgba(217,119,6,0.10)" },
  "Classroom": { color: "#7c3aed", bg: "rgba(124,58,237,0.10)" },
  "Activity":  { color: "#6BCB77", bg: "rgba(107,203,119,0.10)" },
  "Holiday":   { color: "#7c3aed", bg: "rgba(124,58,237,0.10)" },
  "General":   { color: "#FF6B6B", bg: "rgba(255,107,107,0.10)" },
};

export default function AdminGalleryPage() {
  const router = useRouter();
  const [user, setUser]       = useState("");
  const [albums, setAlbums]   = useState<GalleryAlbum[]>(INITIAL_ALBUMS);
  const [view, setView]       = useState<"grid" | "album">("grid");
  const [openAlbum, setOpenAlbum] = useState<GalleryAlbum | null>(null);
  const [lightbox, setLightbox]   = useState<GalleryPhoto | null>(null);
  const [showNew, setShowNew]     = useState(false);
  const [newTitle, setNewTitle]   = useState("");
  const [newTag, setNewTag]       = useState("Event");
  const [newAudience, setNewAudience] = useState<GalleryAlbum["audience"]>("all");
  const [newDate, setNewDate]     = useState("2026-05-20");
  const [uploaded, setUploaded]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const role = sessionStorage.getItem("erp_role");
    const u    = sessionStorage.getItem("erp_user");
    if (role !== "admin") { router.replace("/erp/login"); return; }
    setUser(u || "Admin");
  }, []);

  function togglePublish(albumId: string) {
    setAlbums(prev => prev.map(a => a.id === albumId ? { ...a, published: !a.published } : a));
    if (openAlbum?.id === albumId) setOpenAlbum(a => a ? { ...a, published: !a.published } : a);
  }

  function deleteAlbum(albumId: string) {
    const album = albums.find(a => a.id === albumId);
    album?.photos.forEach(p => { if (p.url.startsWith("blob:")) URL.revokeObjectURL(p.url); });
    setAlbums(prev => prev.filter(a => a.id !== albumId));
    if (openAlbum?.id === albumId) { setOpenAlbum(null); setView("grid"); }
  }

  function createAlbum() {
    if (!newTitle.trim()) return;
    const meta = TAG_META[newTag] || TAG_META["General"];
    const album: GalleryAlbum = {
      id: `A${Date.now()}`, title: newTitle.trim(), tag: newTag,
      tagColor: meta.color, tagBg: meta.bg,
      date: newDate, cover: STOCK.classroom, published: false,
      audience: newAudience, photos: [],
    };
    setAlbums(prev => [album, ...prev]);
    setNewTitle(""); setNewTag("Event"); setNewDate("2026-05-20"); setShowNew(false);
  }

  function handlePhotoUpload(albumId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newPhotos: GalleryPhoto[] = files.map((f, i) => ({
      id: `P${Date.now()}-${i}`,
      url: URL.createObjectURL(f),
      caption: f.name.replace(/\.[^.]+$/, ""),
      uploadedBy: "Admin",
      date: "Today",
    }));
    setAlbums(prev => prev.map(a => a.id === albumId ? { ...a, photos: [...a.photos, ...newPhotos] } : a));
    if (openAlbum?.id === albumId) setOpenAlbum(a => a ? { ...a, photos: [...a.photos, ...newPhotos] } : a);
    setUploaded(true);
    setTimeout(() => setUploaded(false), 2000);
  }

  function deletePhoto(albumId: string, photoId: string) {
    // Revoke blob URL if present
    const album = albums.find(a => a.id === albumId);
    const photo = album?.photos.find(p => p.id === photoId);
    if (photo?.url.startsWith("blob:")) URL.revokeObjectURL(photo.url);

    setAlbums(prev => prev.map(a => a.id !== albumId ? a : { ...a, photos: a.photos.filter(p => p.id !== photoId) }));
    if (openAlbum?.id === albumId) setOpenAlbum(a => a ? { ...a, photos: a.photos.filter(p => p.id !== photoId) } : a);
  }

  return (
    <ERPShell role="admin" userName={user}>
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
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Gallery</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
            Manage and publish school photo albums
          </p>
        </div>
        <button type="button" onClick={() => setShowNew(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg,#FF6B6B,#ff8e8e)", color: "white", boxShadow: "0 3px 10px rgba(255,107,107,0.28)", fontFamily: "var(--font-nunito)" }}>
          <Plus size={15} /> New Album
        </button>
      </div>

      {/* New album form */}
      {showNew && (
        <div className="glass-card p-5 mb-5" style={{ border: "1.5px solid rgba(255,107,107,0.22)" }}>
          <p className="text-sm font-bold text-navy mb-4" style={{ fontFamily: "var(--font-nunito)" }}>Create New Album</p>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <input type="text" placeholder="Album title" value={newTitle} onChange={e => setNewTitle(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-sm"
              style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.09)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }} />
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-sm"
              style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.09)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }} />
          </div>
          <div className="flex gap-1.5 flex-wrap mb-3">
            {TAGS.map(t => (
              <button key={t} type="button" onClick={() => setNewTag(t)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: newTag === t ? `${TAG_META[t]?.bg}` : "rgba(26,26,46,0.05)",
                  color: newTag === t ? TAG_META[t]?.color : "rgba(26,26,46,0.45)",
                  border: newTag === t ? `1px solid ${TAG_META[t]?.color}30` : "1px solid transparent",
                  fontFamily: "var(--font-nunito)",
                }}>{t}</button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap mb-4">
            {AUDIENCES.map(a => (
              <button key={a.key} type="button" onClick={() => setNewAudience(a.key)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: newAudience === a.key ? "rgba(255,107,107,0.10)" : "rgba(26,26,46,0.05)",
                  color: newAudience === a.key ? "#FF6B6B" : "rgba(26,26,46,0.45)",
                  border: newAudience === a.key ? "1px solid rgba(255,107,107,0.25)" : "1px solid transparent",
                  fontFamily: "var(--font-nunito)",
                }}>{a.label}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={createAlbum}
              className="px-5 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#FF6B6B,#ff8e8e)", color: "white", fontFamily: "var(--font-nunito)" }}>
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

      {/* Album detail view */}
      {view === "album" && openAlbum ? (
        <div>
          <button type="button" onClick={() => { setView("grid"); setOpenAlbum(null); }}
            className="flex items-center gap-1.5 text-xs font-bold mb-4 px-3 py-2 rounded-xl"
            style={{ background: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>
            ← All Albums
          </button>
          <div className="glass-card p-5 mb-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: openAlbum.tagBg, color: openAlbum.tagColor, fontFamily: "var(--font-nunito)" }}>{openAlbum.tag}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: openAlbum.published ? "rgba(107,203,119,0.10)" : "rgba(26,26,46,0.07)", color: openAlbum.published ? "#6BCB77" : "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>
                    {openAlbum.published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-lg font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>{openAlbum.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{openAlbum.date} · {openAlbum.photos.length} photos</p>
              </div>
              <div className="flex gap-2">
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handlePhotoUpload(openAlbum.id, e)} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                  style={{ background: uploaded ? "rgba(107,203,119,0.12)" : "rgba(255,107,107,0.10)", color: uploaded ? "#6BCB77" : "#FF6B6B", border: `1px solid ${uploaded ? "rgba(107,203,119,0.25)" : "rgba(255,107,107,0.22)"}`, fontFamily: "var(--font-nunito)" }}>
                  {uploaded ? <><CheckCircle size={12} /> Added!</> : <><Upload size={12} /> Upload Photos</>}
                </button>
                <button type="button" onClick={() => togglePublish(openAlbum.id)}
                  className="px-3 py-2 rounded-xl text-xs font-bold"
                  style={{ background: openAlbum.published ? "rgba(26,26,46,0.07)" : "rgba(107,203,119,0.10)", color: openAlbum.published ? "rgba(26,26,46,0.50)" : "#6BCB77", fontFamily: "var(--font-nunito)" }}>
                  {openAlbum.published ? "Unpublish" : "Publish"}
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {openAlbum.photos.map(p => (
              <div key={p.id} className="group relative rounded-2xl overflow-hidden cursor-pointer"
                style={{ aspectRatio: "1", background: "rgba(26,26,46,0.07)" }}
                onClick={() => setLightbox(p)}>
                <img src={p.url} alt={p.caption} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2"
                  style={{ background: "rgba(0,0,0,0.45)" }}>
                  <Eye size={20} style={{ color: "white" }} />
                  <p className="text-xs text-white text-center px-2" style={{ fontFamily: "var(--font-inter)" }}>{p.caption}</p>
                </div>
                <button type="button" onClick={e => { e.stopPropagation(); deletePhoto(openAlbum.id, p.id); }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full items-center justify-center opacity-0 group-hover:flex hidden transition-opacity"
                  style={{ background: "#FF6B6B" }}>
                  <Trash2 size={11} style={{ color: "white" }} />
                </button>
              </div>
            ))}
            {openAlbum.photos.length === 0 && (
              <div className="col-span-full py-12 text-center rounded-2xl" style={{ border: "2px dashed rgba(26,26,46,0.12)" }}>
                <p className="text-sm" style={{ color: "rgba(26,26,46,0.35)", fontFamily: "var(--font-inter)" }}>No photos yet — upload some above.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Album grid */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {albums.map(a => (
            <div key={a.id} className="glass-card overflow-hidden group cursor-pointer"
              style={{ border: a.published ? "1.5px solid rgba(107,203,119,0.20)" : "1.5px solid rgba(26,26,46,0.08)" }}
              onClick={() => { setOpenAlbum(a); setView("album"); }}>
              <div className="relative overflow-hidden" style={{ height: 160 }}>
                <img src={a.cover} alt={a.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45), transparent)" }} />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: a.tagBg, color: a.tagColor, fontFamily: "var(--font-nunito)" }}>{a.tag}</span>
                  {!a.published && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(26,26,46,0.55)", color: "white", fontFamily: "var(--font-nunito)" }}>Draft</span>
                  )}
                </div>
                <p className="absolute bottom-3 left-3 text-xs text-white font-semibold" style={{ fontFamily: "var(--font-inter)" }}>
                  {a.photos.length} photo{a.photos.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="p-4">
                <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{a.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{a.date}</p>
                <div className="flex items-center justify-between mt-3">
                  <button type="button" onClick={e => { e.stopPropagation(); togglePublish(a.id); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: a.published ? "rgba(107,203,119,0.10)" : "rgba(26,26,46,0.06)",
                      color: a.published ? "#6BCB77" : "rgba(26,26,46,0.45)",
                      fontFamily: "var(--font-nunito)",
                    }}>
                    {a.published ? "✓ Published" : "Publish"}
                  </button>
                  <button type="button" onClick={e => { e.stopPropagation(); deleteAlbum(a.id); }}
                    className="p-1.5 rounded-lg transition-all hover:scale-110"
                    style={{ background: "rgba(255,107,107,0.08)" }}>
                    <Trash2 size={13} style={{ color: "#FF6B6B" }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ERPShell>
  );
}
