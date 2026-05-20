"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ERPShell from "@/components/erp/ERPShell";
import {
  Bell, Send, Plus, X, Users, ChevronDown,
  ChevronUp, Search, Megaphone, MessageSquare,
  CheckCheck, Clock, Pin,
} from "lucide-react";

type AudType  = "All" | "Parents" | "Staff" | "Class";
type AnnoTag  = "Holiday" | "Event" | "Fee" | "Academic" | "General" | "Urgent";
type MsgStatus = "sent" | "draft";

interface Announcement {
  id: string;
  title: string;
  body: string;
  tag: AnnoTag;
  audience: AudType;
  audienceDetail?: string;
  sentOn: string;
  sentBy: string;
  status: MsgStatus;
  readCount: number;
  totalCount: number;
  pinned: boolean;
}

interface InboxMsg {
  id: string;
  from: string;
  fromRole: "parent" | "faculty";
  subject: string;
  body: string;
  time: string;
  read: boolean;
  avatar: string;
}

const TAG_STYLE: Record<AnnoTag, { bg: string; color: string }> = {
  Holiday:  { bg: "rgba(124,58,237,0.12)", color: "#7c3aed" },
  Event:    { bg: "rgba(107,203,119,0.12)", color: "#6BCB77" },
  Fee:      { bg: "rgba(255,107,107,0.10)", color: "#FF6B6B" },
  Academic: { bg: "rgba(255,217,61,0.15)",  color: "#d97706" },
  General:  { bg: "rgba(26,26,46,0.07)",    color: "rgba(26,26,46,0.55)" },
  Urgent:   { bg: "rgba(220,38,38,0.12)",   color: "#dc2626" },
};

const AUD_STYLE: Record<AudType, { bg: string; color: string }> = {
  All:     { bg: "rgba(124,58,237,0.10)", color: "#7c3aed" },
  Parents: { bg: "rgba(255,217,61,0.15)", color: "#d97706" },
  Staff:   { bg: "rgba(107,203,119,0.12)",color: "#6BCB77" },
  Class:   { bg: "rgba(255,107,107,0.10)",color: "#FF6B6B" },
};

const ANNOUNCEMENTS: Announcement[] = [
  { id: "A001", title: "School Closed — Eid al-Adha", body: "Dear Parents, the school will remain closed on Monday, June 17, 2026 on account of Eid al-Adha. Classes will resume on Tuesday, June 18. Wishing everyone a blessed Eid.", tag: "Holiday", audience: "All", sentOn: "2026-05-20", sentBy: "Admin", status: "sent", readCount: 31, totalCount: 35, pinned: true },
  { id: "A002", title: "Annual Sports Day — May 28", body: "We are excited to announce our Annual Sports Day on May 28, 2026 at 9:00 AM in the school ground. All parents are warmly invited. Children should wear their house colour t-shirts.", tag: "Event", audience: "All", sentOn: "2026-05-19", sentBy: "Admin", status: "sent", readCount: 28, totalCount: 35, pinned: true },
  { id: "A003", title: "Fee Reminder — June Instalment", body: "This is a reminder that the June instalment of ₹20,000 (JKG/SKG) or ₹18,000 (Nursery) is due by June 1, 2026. Kindly ensure timely payment to avoid a late fee of ₹200/day.", tag: "Fee", audience: "Parents", sentOn: "2026-05-18", sentBy: "Admin", status: "sent", readCount: 22, totalCount: 27, pinned: false },
  { id: "A004", title: "Staff Meeting — May 21 at 3 PM", body: "All teaching and support staff are requested to attend a mandatory meeting on May 21, 2026 at 3:00 PM in the conference room. Please arrange class coverage in advance.", tag: "General", audience: "Staff", sentOn: "2026-05-17", sentBy: "Admin", status: "sent", readCount: 6, totalCount: 6, pinned: false },
  { id: "A005", title: "Parent-Teacher Meeting — June 5", body: "Parent-Teacher Meetings (PTM) will be held on June 5, 2026 from 10:00 AM to 1:00 PM. Individual time slots will be shared separately. Attendance is compulsory for at least one parent.", tag: "Academic", audience: "Parents", sentOn: "2026-05-16", sentBy: "Admin", status: "sent", readCount: 19, totalCount: 27, pinned: false },
  { id: "A006", title: "Summer Camp Registration Open", body: "Registrations for our Summer Activity Camp (June 10–20) are now open. Activities include art, yoga, storytelling, and nature walks. Limited seats — register by May 25.", tag: "Event", audience: "Parents", sentOn: "2026-05-15", sentBy: "Admin", status: "draft", readCount: 0, totalCount: 0, pinned: false },
];

const INBOX: InboxMsg[] = [
  { id: "M001", from: "Rohit Sharma", fromRole: "parent", subject: "Query about Aarav's attendance", body: "Hello, I noticed that Aarav was marked absent on May 14 but he was present. Could you please check and update?", time: "Today, 9:15 AM", read: false, avatar: "👨" },
  { id: "M002", from: "Ms. Priya Sharma", fromRole: "faculty", subject: "Leave application follow-up", body: "Respected Ma'am, I had applied for leave on June 10–11. Kindly review at your earliest convenience.", time: "Today, 8:42 AM", read: false, avatar: "👩‍🏫" },
  { id: "M003", from: "Nikhil Patel", fromRole: "parent", subject: "Uniform query", body: "We have not received Diya's summer uniform yet even though we paid. Please advise.", time: "Yesterday, 4:30 PM", read: true, avatar: "👨" },
  { id: "M004", from: "Ms. Kavya Reddy", fromRole: "faculty", subject: "Classroom supplies needed", body: "We are running low on chart papers and crayons for Nursery A. Could we get a fresh stock before Friday?", time: "Yesterday, 11:00 AM", read: true, avatar: "👩‍🏫" },
  { id: "M005", from: "Manish Gupta", fromRole: "parent", subject: "Transport route change request", body: "We have moved to a new address in Arera Colony. Can Ishaan's bus route be updated please?", time: "May 18, 6:20 PM", read: true, avatar: "👨" },
];

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminCommunicationPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [tab, setTab] = useState<"announcements" | "inbox">("announcements");
  const [announcements, setAnnouncements] = useState<Announcement[]>(ANNOUNCEMENTS);
  const [inbox, setInbox] = useState<InboxMsg[]>(INBOX);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedMsg, setSelectedMsg] = useState<InboxMsg | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [replyText, setReplyText] = useState("");

  // Compose form
  const [form, setForm] = useState({
    title: "", body: "", tag: "General" as AnnoTag,
    audience: "All" as AudType, audienceDetail: "",
  });
  const [drafts, setDrafts] = useState<Announcement[]>([]);

  useEffect(() => {
    const role = sessionStorage.getItem("erp_role");
    const u = sessionStorage.getItem("erp_user");
    if (role !== "admin") { router.replace("/erp/login"); return; }
    setUser(u || "admin@smartneurons.in");
  }, []);

  function saveDraft() {
    if (!form.title.trim()) return;
    const meta = TAG_STYLE[form.tag] || TAG_STYLE["General"];
    const draft: Announcement = {
      id: `D${Date.now()}`, title: form.title, body: form.body,
      tag: form.tag, audience: form.audience,
      sentOn: "Draft", sentBy: "Admin", status: "draft",
      readCount: 0, totalCount: 0, pinned: false,
    };
    setDrafts(prev => [draft, ...prev]);
    setForm({ title: "", tag: "General", audience: "All", body: "", audienceDetail: "" });
    setShowCompose(false);
  }

  function sendAnnouncement() {
    if (!form.title.trim() || !form.body.trim()) return;
    const newA: Announcement = {
      id: `A${String(Date.now()).slice(-4)}`,
      title: form.title.trim(),
      body: form.body.trim(),
      tag: form.tag,
      audience: form.audience,
      audienceDetail: form.audienceDetail || undefined,
      sentOn: "2026-05-20",
      sentBy: "Admin",
      status: "sent",
      readCount: 0,
      totalCount: form.audience === "All" ? 35 : form.audience === "Parents" ? 27 : form.audience === "Staff" ? 6 : 8,
      pinned: false,
    };
    setAnnouncements(prev => [newA, ...prev]);
    setForm({ title: "", body: "", tag: "General", audience: "All", audienceDetail: "" });
    setShowCompose(false);
  }

  function openMsg(msg: InboxMsg) {
    setSelectedMsg(msg);
    setInbox(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
    setReplyText("");
  }

  const unread = inbox.filter(m => !m.read).length;
  const filtered = announcements.filter(a =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.body.toLowerCase().includes(search.toLowerCase())
  );
  const pinned  = filtered.filter(a => a.pinned);
  const rest    = filtered.filter(a => !a.pinned);

  return (
    <ERPShell role="admin" userName={user}>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Communication</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
            Announcements · Messages · Notices
          </p>
        </div>
        <button type="button" onClick={() => setShowCompose(v => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg,#FF6B6B,#ff8e53)", boxShadow: "0 4px 14px rgba(255,107,107,0.28)", fontFamily: "var(--font-nunito)" }}>
          <Megaphone size={15} /> New Announcement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Announcements", value: announcements.filter(a => a.status === "sent").length, color: "#7c3aed", bg: "rgba(167,139,250,0.10)" },
          { label: "Unread Messages", value: unread, color: unread > 0 ? "#FF6B6B" : "#6BCB77", bg: unread > 0 ? "rgba(255,107,107,0.08)" : "rgba(107,203,119,0.10)" },
          { label: "Pinned Notices", value: announcements.filter(a => a.pinned).length, color: "#d97706", bg: "rgba(255,217,61,0.12)" },
          { label: "Drafts", value: announcements.filter(a => a.status === "draft").length, color: "rgba(26,26,46,0.45)", bg: "rgba(26,26,46,0.05)" },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-xs font-semibold mb-1" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-nunito)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Compose panel */}
      {showCompose && (
        <div className="glass-card p-5 mb-5" style={{ border: "1.5px solid rgba(255,107,107,0.28)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-navy flex items-center gap-2" style={{ fontFamily: "var(--font-nunito)" }}>
              <Megaphone size={14} style={{ color: "#FF6B6B" }} /> New Announcement
            </h2>
            <button type="button" onClick={() => setShowCompose(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(26,26,46,0.06)" }}>
              <X size={14} style={{ color: "rgba(26,26,46,0.50)" }} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1" htmlFor="ann-title"
                style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>Title</label>
              <input id="ann-title" type="text" placeholder="e.g. School closed on June 17"
                value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm"
                style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }}
              />
            </div>

            {/* Tag */}
            <div>
              <p className="text-xs font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>Tag</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(TAG_STYLE) as AnnoTag[]).map(t => (
                  <button key={t} type="button" onClick={() => setForm(p => ({ ...p, tag: t }))}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150"
                    style={{ background: form.tag === t ? TAG_STYLE[t].bg : "rgba(26,26,46,0.05)", color: form.tag === t ? TAG_STYLE[t].color : "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Audience */}
            <div>
              <p className="text-xs font-semibold mb-1.5" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>Send To</p>
              <div className="flex flex-wrap gap-1.5">
                {(["All","Parents","Staff","Class"] as AudType[]).map(a => (
                  <button key={a} type="button" onClick={() => setForm(p => ({ ...p, audience: a }))}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150"
                    style={{ background: form.audience === a ? AUD_STYLE[a].bg : "rgba(26,26,46,0.05)", color: form.audience === a ? AUD_STYLE[a].color : "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>
                    {a}
                  </button>
                ))}
              </div>
              {form.audience === "Class" && (
                <input type="text" placeholder="e.g. JKG-A, Nursery-B" value={form.audienceDetail}
                  onChange={e => setForm(p => ({ ...p, audienceDetail: e.target.value }))}
                  className="mt-2 w-full px-3 py-1.5 rounded-xl text-xs"
                  style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }}
                />
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold mb-1" htmlFor="ann-body"
              style={{ color: "rgba(26,26,46,0.55)", fontFamily: "var(--font-nunito)" }}>Message</label>
            <textarea id="ann-body" rows={4} placeholder="Write the full announcement here…"
              value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl text-sm resize-none"
              style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }}
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={sendAnnouncement}
              disabled={!form.title.trim() || !form.body.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg,#FF6B6B,#ff8e53)", boxShadow: "0 4px 14px rgba(255,107,107,0.28)", fontFamily: "var(--font-nunito)" }}>
              <Send size={14} /> Send Now
            </button>
            <button type="button" onClick={saveDraft}
              className="px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-150"
              style={{ background: "rgba(26,26,46,0.06)", color: "rgba(26,26,46,0.60)", fontFamily: "var(--font-nunito)" }}>
              Save Draft
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {([
          { key: "announcements", label: `Announcements (${announcements.filter(a=>a.status==="sent").length})` },
          { key: "inbox",         label: `Inbox ${unread > 0 ? `(${unread} new)` : `(${inbox.length})`}` },
        ] as const).map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150"
            style={{
              background: tab === t.key ? "rgba(124,58,237,0.12)" : "rgba(26,26,46,0.05)",
              color: tab === t.key ? "#7c3aed" : "rgba(26,26,46,0.55)",
              fontFamily: "var(--font-nunito)",
              border: tab === t.key ? "1.5px solid rgba(124,58,237,0.25)" : "1.5px solid transparent",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ANNOUNCEMENTS TAB */}
      {tab === "announcements" && (
        <>
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(26,26,46,0.35)" }} />
            <input type="text" placeholder="Search announcements…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-sm"
              style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }}
            />
          </div>

          <div className="space-y-3">
            {[...pinned, ...rest].map(a => {
              const isOpen = expanded === a.id;
              const ts = TAG_STYLE[a.tag];
              const as_ = AUD_STYLE[a.audience];
              const readPct = a.totalCount > 0 ? Math.round((a.readCount / a.totalCount) * 100) : 0;
              return (
                <div key={a.id} className="glass-card overflow-hidden"
                  style={{ border: a.pinned ? "1.5px solid rgba(217,119,6,0.28)" : a.status === "draft" ? "1.5px dashed rgba(26,26,46,0.18)" : "1.5px solid rgba(255,255,255,0.60)" }}>
                  <button type="button" className="w-full flex items-center gap-3 p-4 text-left"
                    onClick={() => setExpanded(isOpen ? null : a.id)}>
                    {a.pinned && <Pin size={13} style={{ color: "#d97706", flexShrink: 0 }} />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{a.title}</p>
                        {a.status === "draft" && (
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(26,26,46,0.08)", color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-nunito)" }}>Draft</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ ...ts, fontFamily: "var(--font-nunito)" }}>{a.tag}</span>
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{ ...as_, fontFamily: "var(--font-nunito)" }}>→ {a.audience}{a.audienceDetail ? ` (${a.audienceDetail})` : ""}</span>
                        <span className="text-xs" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>{fmt(a.sentOn)}</span>
                      </div>
                    </div>
                    {a.status === "sent" && (
                      <div className="hidden sm:block text-right flex-shrink-0 mr-2">
                        <p className="text-xs font-bold" style={{ color: readPct >= 75 ? "#6BCB77" : "#d97706", fontFamily: "var(--font-nunito)" }}>{readPct}% read</p>
                        <p className="text-xs" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>{a.readCount}/{a.totalCount}</p>
                      </div>
                    )}
                    {isOpen ? <ChevronUp size={15} style={{ color: "rgba(26,26,46,0.40)", flexShrink: 0 }} /> : <ChevronDown size={15} style={{ color: "rgba(26,26,46,0.40)", flexShrink: 0 }} />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(26,26,46,0.06)" }}>
                      <p className="text-sm leading-relaxed mt-3 mb-4"
                        style={{ color: "rgba(26,26,46,0.70)", fontFamily: "var(--font-inter)" }}>{a.body}</p>
                      {a.status === "sent" && (
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-xs font-semibold" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>Read receipt</p>
                            <p className="text-xs font-bold" style={{ color: readPct >= 75 ? "#6BCB77" : "#d97706", fontFamily: "var(--font-nunito)" }}>{a.readCount} of {a.totalCount}</p>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(26,26,46,0.06)" }}>
                            <div className="h-full rounded-full" style={{ width: `${readPct}%`, background: readPct >= 75 ? "#6BCB77" : "#d97706" }} />
                          </div>
                        </div>
                      )}
                      {a.status === "draft" && (
                        <button type="button"
                          className="mt-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                          style={{ background: "linear-gradient(135deg,#FF6B6B,#ff8e53)", fontFamily: "var(--font-nunito)" }}>
                          <Send size={13} className="inline mr-1.5" /> Send Now
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* INBOX TAB */}
      {tab === "inbox" && (
        <div className={`grid gap-5 ${selectedMsg ? "lg:grid-cols-5" : "grid-cols-1"}`}>
          {/* Message list */}
          <div className={selectedMsg ? "lg:col-span-2" : ""}>
            <div className="space-y-2">
              {inbox.map(m => (
                <button key={m.id} type="button" onClick={() => openMsg(m)}
                  className="w-full text-left glass-card"
                  style={{
                    borderRadius: "1.25rem",
                    border: selectedMsg?.id === m.id ? "1.5px solid rgba(124,58,237,0.35)" : !m.read ? "1.5px solid rgba(255,107,107,0.22)" : "1.5px solid rgba(255,255,255,0.60)",
                    background: selectedMsg?.id === m.id ? "rgba(124,58,237,0.04)" : undefined,
                  }}>
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: m.fromRole === "parent" ? "rgba(255,217,61,0.15)" : "rgba(107,203,119,0.10)" }}>
                      {m.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-navy truncate" style={{ fontFamily: "var(--font-nunito)" }}>{m.from}</p>
                        {!m.read && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#FF6B6B" }} />}
                      </div>
                      <p className="text-xs font-semibold truncate" style={{ color: "rgba(26,26,46,0.65)", fontFamily: "var(--font-nunito)" }}>{m.subject}</p>
                      <p className="text-xs truncate" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>{m.time}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message reader */}
          {selectedMsg && (
            <div className="lg:col-span-3">
              <div className="glass-card p-5 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: selectedMsg.fromRole === "parent" ? "rgba(255,217,61,0.15)" : "rgba(107,203,119,0.10)" }}>
                      {selectedMsg.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{selectedMsg.from}</p>
                      <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
                        {selectedMsg.fromRole === "parent" ? "Parent" : "Faculty"} · {selectedMsg.time}
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelectedMsg(null)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(26,26,46,0.06)" }}>
                    <X size={14} style={{ color: "rgba(26,26,46,0.50)" }} />
                  </button>
                </div>

                <p className="text-base font-bold text-navy mb-3" style={{ fontFamily: "var(--font-nunito)" }}>{selectedMsg.subject}</p>
                <p className="text-sm leading-relaxed mb-5"
                  style={{ color: "rgba(26,26,46,0.70)", fontFamily: "var(--font-inter)" }}>{selectedMsg.body}</p>

                <div className="pt-4" style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-nunito)" }}>Reply</p>
                  <textarea rows={3} placeholder={`Reply to ${selectedMsg.from}…`}
                    value={replyText} onChange={e => setReplyText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm resize-none mb-3"
                    style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }}
                  />
                  <button type="button"
                    disabled={!replyText.trim()}
                    onClick={() => { setReplyText(""); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", boxShadow: "0 4px 12px rgba(124,58,237,0.25)", fontFamily: "var(--font-nunito)" }}>
                    <Send size={14} /> Send Reply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </ERPShell>
  );
}
