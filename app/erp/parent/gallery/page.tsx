"use client";

import { useState, useEffect } from "react";
import ERPShell from "@/components/erp/ERPShell";
import { createClient } from "@/lib/supabase/client";
import { ImageIcon, X, Filter } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  class_filter: string | null;
  uploaded_by_name: string | null;
  created_at: string;
}

const CLASSES = ["All", "Nursery", "LKG", "UKG", "JKG", "SKG"];

export default function ParentGalleryPage() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState("All");
  const [preview, setPreview] = useState<GalleryItem | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) setUser({ name: data.user.app_metadata?.name || data.user.email || "Parent" });
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = filterClass === "All" ? "/api/gallery" : `/api/gallery?class=${filterClass}`;
    fetch(url).then(r => r.json()).then(json => {
      setItems(json.photos ?? []);
      setLoading(false);
    });
  }, [filterClass]);

  return (
    <ERPShell role="parent" userName={user?.name}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>School Gallery</h1>
          <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: "var(--font-nunito)" }}>{items.length} photos</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-gray-400" />
          {CLASSES.map(cls => (
            <button key={cls} onClick={() => setFilterClass(cls)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              style={{
                fontFamily: "var(--font-nunito)",
                background: filterClass === cls ? "#d97706" : "rgba(26,26,46,0.06)",
                color: filterClass === cls ? "white" : "rgba(26,26,46,0.60)",
              }}>
              {cls}
            </button>
          ))}
        </div>

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
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setPreview(item)}>
                <div className="w-full h-36 bg-gray-100">
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-bold text-navy truncate" style={{ fontFamily: "var(--font-nunito)" }}>{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: "var(--font-nunito)" }}>
                    {item.class_filter ?? "All classes"} · {new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setPreview(null)}>
          <div className="relative max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
            <img src={preview.image_url} alt={preview.title} className="w-full max-h-[80vh] object-contain rounded-2xl" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4 rounded-b-2xl">
              <p className="font-bold" style={{ fontFamily: "var(--font-nunito)" }}>{preview.title}</p>
              <p className="text-xs text-white/70 mt-0.5" style={{ fontFamily: "var(--font-nunito)" }}>
                {preview.class_filter ?? "All classes"} · {new Date(preview.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
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
