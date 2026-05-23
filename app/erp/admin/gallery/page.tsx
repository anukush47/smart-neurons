"use client";

import { useState, useEffect } from "react";
import ERPShell from "@/components/erp/ERPShell";
import { createClient } from "@/lib/supabase/client";
import { ImageIcon, Plus, Trash2, X, CheckCircle, AlertCircle, Filter } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  class_filter: string | null;
  uploaded_by_name: string | null;
  created_at: string;
}

const CLASSES = ["All", "Nursery", "LKG", "UKG", "JKG", "SKG"];

export default function AdminGalleryPage() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newClass, setNewClass] = useState("All");
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [preview, setPreview] = useState<GalleryItem | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          id: data.user.id,
          name: data.user.app_metadata?.name || data.user.email || "Admin",
        });
      }
    });
  }, []);

  useEffect(() => {
    loadGallery();
  }, [filterClass]);

  async function loadGallery() {
    setLoading(true);
    const url = filterClass === "All" ? "/api/gallery" : `/api/gallery?class=${filterClass}`;
    const res = await fetch(url);
    const json = await res.json();
    setItems(json.photos ?? []);
    setLoading(false);
  }

  function showFlash(type: "ok" | "err", msg: string) {
    setFlash({ type, msg });
    setTimeout(() => setFlash(null), 3000);
  }

  async function handleAdd() {
    if (!newTitle.trim() || !newUrl.trim()) return;
    setSaving(true);
    const res = await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle.trim(),
        image_url: newUrl.trim(),
        class_filter: newClass === "All" ? null : newClass,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (json.error) { showFlash("err", json.error); return; }
    showFlash("ok", "Photo added successfully");
    setNewTitle(""); setNewUrl(""); setNewClass("All"); setShowAdd(false);
    loadGallery();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this photo?")) return;
    const res = await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.error) { showFlash("err", json.error); return; }
    showFlash("ok", "Deleted");
    setItems(prev => prev.filter(i => i.id !== id));
  }

  return (
    <ERPShell role="admin" userName={user?.name}>
      <div className="max-w-5xl mx-auto space-y-6">
        {flash && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${flash.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
            style={{ fontFamily: "var(--font-nunito)" }}>
            {flash.type === "ok" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {flash.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Gallery</h1>
            <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: "var(--font-nunito)" }}>{items.length} photos</p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: "#FF6B6B", fontFamily: "var(--font-nunito)" }}>
            <Plus size={16} /> Add Photo
          </button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-gray-400" />
          {CLASSES.map(cls => (
            <button key={cls} onClick={() => setFilterClass(cls)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              style={{
                fontFamily: "var(--font-nunito)",
                background: filterClass === cls ? "#FF6B6B" : "rgba(26,26,46,0.06)",
                color: filterClass === cls ? "white" : "rgba(26,26,46,0.60)",
              }}>
              {cls}
            </button>
          ))}
        </div>

        {/* Add Photo Form */}
        {showAdd && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-navy text-base" style={{ fontFamily: "var(--font-nunito)" }}>Add New Photo</h2>
              <button onClick={() => setShowAdd(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1" style={{ fontFamily: "var(--font-nunito)" }}>Title</label>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm" style={{ fontFamily: "var(--font-nunito)" }}
                  placeholder="e.g. Annual Day Celebration" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1" style={{ fontFamily: "var(--font-nunito)" }}>Image URL</label>
                <input value={newUrl} onChange={e => setNewUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm" style={{ fontFamily: "var(--font-nunito)" }}
                  placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1" style={{ fontFamily: "var(--font-nunito)" }}>Class</label>
                <select value={newClass} onChange={e => setNewClass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm" style={{ fontFamily: "var(--font-nunito)" }}>
                  {CLASSES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              {newUrl && (
                <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-100">
                  <img src={newUrl} alt="preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
              <button onClick={handleAdd} disabled={saving || !newTitle.trim() || !newUrl.trim()}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ background: "#FF6B6B", fontFamily: "var(--font-nunito)" }}>
                {saving ? "Adding…" : "Add Photo"}
              </button>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-400" style={{ fontFamily: "var(--font-nunito)" }}>Loading gallery…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 font-semibold" style={{ fontFamily: "var(--font-nunito)" }}>No photos yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => (
              <div key={item.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="w-full h-36 bg-gray-100 cursor-pointer" onClick={() => setPreview(item)}>
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-bold text-navy truncate" style={{ fontFamily: "var(--font-nunito)" }}>{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: "var(--font-nunito)" }}>
                    {item.class_filter ?? "All classes"} · {new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <button onClick={() => handleDelete(item.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white items-center justify-center hidden group-hover:flex">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setPreview(null)}>
          <div className="relative max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
            <img src={preview.image_url} alt={preview.title} className="w-full max-h-[80vh] object-contain rounded-2xl" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4 rounded-b-2xl">
              <p className="font-bold" style={{ fontFamily: "var(--font-nunito)" }}>{preview.title}</p>
              <p className="text-xs text-white/70 mt-0.5" style={{ fontFamily: "var(--font-nunito)" }}>{preview.class_filter ?? "All classes"}</p>
            </div>
            <button onClick={() => setPreview(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </ERPShell>
  );
}
