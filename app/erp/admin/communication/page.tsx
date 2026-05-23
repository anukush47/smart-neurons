"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { Plus, X, Pin, Trash2, Megaphone } from "lucide-react";

interface Announcement {
  id: string; title: string; body: string; tag: string;
  audience: string; class_filter: string | null;
  sent_by_name: string; pinned: boolean; status: string; created_at: string;
}

const TAGS = ["General", "Holiday", "Event", "Fee", "Academic", "Urgent"] as const;
const AUDIENCES = ["All", "Parents", "Staff", "Class"] as const;
const CLASSES = ["Nursery-A", "LKG-A", "UKG-A", "JKG-A", "SKG-A"];
const TAG_COLOR: Record<string, { bg: string; color: string }> = {
  General:  { bg: "rgba(26,26,46,0.07)",    color: "rgba(26,26,46,0.55)" },
  Holiday:  { bg: "rgba(107,203,119,0.12)", color: "#6BCB77" },
  Event:    { bg: "rgba(124,58,237,0.10)",  color: "#7c3aed" },
  Fee:      { bg: "rgba(255,107,107,0.10)", color: "#FF6B6B" },
  Academic: { bg: "rgba(255,217,61,0.15)",  color: "#d97706" },
  Urgent:   { bg: "rgba(220,38,38,0.12)",   color: "#dc2626" },
};

export default function AdminCommunicationPage() {
  const [userName, setUserName] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState<typeof TAGS[number]>("General");
  const [audience, setAudience] = useState<typeof AUDIENCES[number]>("All");
  const [classFilter, setClassFilter] = useState("");
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserName(user.app_metadata?.name || user.user_metadata?.name || "Admin");
    });
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await fetch("/api/announcements?limit=100").then(r => r.json());
    if (data.announcements) setAnnouncements(data.announcements);
    setLoading(false);
  }

  async function handleSend(asDraft = false) {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    await fetch("/api/announcements", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), body: body.trim(), tag, audience, class_filter: audience === "Class" ? classFilter : null, pinned, status: asDraft ? "draft" : "sent" }),
    });
    setSaving(false); setShowForm(false);
    setTitle(""); setBody(""); setTag("General"); setAudience("All"); setClassFilter(""); setPinned(false);
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  }

  async function togglePin(ann: Announcement) {
    await fetch("/api/announcements", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: ann.id, pinned: !ann.pinned }) });
    load();
  }

  return (
    <ERPShell role="admin" userName={userName}>
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Communication</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>Send announcements to parents, staff, or specific classes</p>
        </div>
        <button type="button" onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg,#1A1A2E,#2d2d4e)", color: "white", boxShadow: "0 3px 10px rgba(26,26,46,0.25)", fontFamily: "var(--font-nunito)" }}>
          <Plus size={15} /> New Announcement
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>New Announcement</p>
            <button type="button" onClick={() => setShowForm(false)}><X size={16} style={{ color: "rgba(26,26,46,0.40)" }} /></button>
          </div>
          <div className="space-y-3">
            <input type="text" placeholder="Title…" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.09)", outline: "none", fontFamily: "var(--font-nunito)", color: "#1A1A2E" }} />
            <textarea rows={3} placeholder="Write your message…" value={body} onChange={e => setBody(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm resize-none"
              style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.09)", outline: "none", fontFamily: "var(--font-inter)", color: "#1A1A2E" }} />
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-xs font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>Tag</p>
                <div className="flex gap-1 flex-wrap">
                  {TAGS.map(t => (
                    <button key={t} type="button" onClick={() => setTag(t)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold"
                      style={{ background: tag === t ? TAG_COLOR[t].bg : "rgba(26,26,46,0.05)", color: tag === t ? TAG_COLOR[t].color : "rgba(26,26,46,0.45)", border: tag === t ? `1px solid ${TAG_COLOR[t].color}30` : "1px solid transparent", fontFamily: "var(--font-nunito)" }}>{t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>Audience</p>
                <div className="flex gap-1">
                  {AUDIENCES.map(a => (
                    <button key={a} type="button" onClick={() => setAudience(a)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold"
                      style={{ background: audience === a ? "rgba(26,26,46,0.12)" : "rgba(26,26,46,0.05)", color: audience === a ? "#1A1A2E" : "rgba(26,26,46,0.45)", border: audience === a ? "1px solid rgba(26,26,46,0.20)" : "1px solid transparent", fontFamily: "var(--font-nunito)" }}>{a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {audience === "Class" && (
              <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm"
                style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.09)", outline: "none", fontFamily: "var(--font-inter)", color: "#1A1A2E" }}>
                <option value="">Select class…</option>
                {CLASSES.map(c => <option key={c} value={c}>{c.replace("-", " ")}</option>)}
              </select>
            )}
            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} />
              <span className="text-xs font-semibold" style={{ color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-nunito)" }}>Pin this announcement</span>
            </label>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => handleSend(false)} disabled={saving || !title.trim() || !body.trim()}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#1A1A2E,#2d2d4e)", fontFamily: "var(--font-nunito)" }}>
                {saving ? "Sending…" : "Send Now"}
              </button>
              <button type="button" onClick={() => handleSend(true)} disabled={saving || !title.trim() || !body.trim()}
                className="px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: "rgba(26,26,46,0.07)", color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-nunito)" }}>Save Draft</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Sent",    value: loading ? "…" : announcements.filter(a => a.status === "sent").length,  color: "#7c3aed" },
          { label: "Pinned",  value: loading ? "…" : announcements.filter(a => a.pinned).length,             color: "#d97706" },
          { label: "Drafts",  value: loading ? "…" : announcements.filter(a => a.status === "draft").length, color: "rgba(26,26,46,0.50)" },
        ].map(c => (
          <div key={c.label} className="glass-card p-4">
            <p className="text-2xl font-bold" style={{ color: c.color, fontFamily: "var(--font-nunito)" }}>{c.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{c.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="glass-card p-10 text-center"><p className="text-sm" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>Loading…</p></div>
      ) : announcements.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <Megaphone size={32} className="mx-auto mb-3" style={{ color: "rgba(26,26,46,0.20)" }} />
          <p className="text-sm font-semibold text-navy mb-1" style={{ fontFamily: "var(--font-nunito)" }}>No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {announcements.map(a => {
            const tc = TAG_COLOR[a.tag] ?? TAG_COLOR.General;
            return (
              <div key={a.id} className="glass-card p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {a.pinned && <Pin size={12} style={{ color: "#d97706" }} />}
                      <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{a.title}</p>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: tc.bg, color: tc.color, fontFamily: "var(--font-nunito)" }}>{a.tag}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(26,26,46,0.07)", color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>
                        {a.audience}{a.class_filter ? ` — ${a.class_filter}` : ""}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(26,26,46,0.65)", fontFamily: "var(--font-inter)" }}>{a.body}</p>
                    <p className="text-xs mt-2" style={{ color: "rgba(26,26,46,0.35)", fontFamily: "var(--font-inter)" }}>
                      {a.sent_by_name} · {new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button type="button" onClick={() => togglePin(a)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: a.pinned ? "rgba(217,119,6,0.12)" : "rgba(26,26,46,0.06)", color: a.pinned ? "#d97706" : "rgba(26,26,46,0.40)" }}>
                      <Pin size={12} />
                    </button>
                    <button type="button" onClick={() => handleDelete(a.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(255,107,107,0.10)", color: "#FF6B6B" }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ERPShell>
  );
}
