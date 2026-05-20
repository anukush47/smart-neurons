"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ERPShell from "@/components/erp/ERPShell";
import { Send, Bell, Search, CheckCheck, Clock } from "lucide-react";

interface ChatMsg {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
  read: boolean;
}

interface Conversation {
  id: string;
  name: string;
  role: "parent" | "admin";
  avatar: string;
  lastMsg: string;
  lastTime: string;
  unread: number;
  messages: ChatMsg[];
}

interface Announcement {
  id: string;
  title: string;
  body: string;
  from: string;
  time: string;
  tag: string;
  tagColor: string;
  tagBg: string;
}

const CONVOS: Conversation[] = [
  {
    id: "C1", name: "Rohit Sharma", role: "parent", avatar: "👨", lastMsg: "Thank you for the update!", lastTime: "9:30 AM", unread: 0,
    messages: [
      { id: "m1", from: "them", text: "Good morning Ms. Priya. Is Aarav's drawing homework submitted?", time: "9:10 AM", read: true },
      { id: "m2", from: "me",   text: "Good morning! Yes, Aarav submitted it yesterday. Lovely drawing of a cat 🐱", time: "9:15 AM", read: true },
      { id: "m3", from: "them", text: "Oh wonderful! He worked very hard on it. Thank you for the update!", time: "9:30 AM", read: true },
    ],
  },
  {
    id: "C2", name: "Manish Gupta", role: "parent", avatar: "👨", lastMsg: "When is the PTM?", lastTime: "8:55 AM", unread: 1,
    messages: [
      { id: "m4", from: "them", text: "Hello ma'am. When is the PTM scheduled?", time: "8:55 AM", read: false },
    ],
  },
  {
    id: "C3", name: "Anil Singh", role: "parent", avatar: "👨", lastMsg: "Will do, thanks!", lastTime: "Yesterday", unread: 0,
    messages: [
      { id: "m5", from: "me",   text: "Priya's Hindi vowels practice needs more attention. Please revise at home.", time: "Yesterday, 4:00 PM", read: true },
      { id: "m6", from: "them", text: "Sure ma'am, we will practise daily. Will do, thanks!", time: "Yesterday, 5:10 PM", read: true },
    ],
  },
  {
    id: "C4", name: "School Admin", role: "admin", avatar: "📊", lastMsg: "Please submit work plan by 9 AM.", lastTime: "8:00 AM", unread: 1,
    messages: [
      { id: "m7", from: "them", text: "Good morning Ms. Priya. Please submit your daily work plan by 9 AM.", time: "8:00 AM", read: false },
    ],
  },
];

const ANNOUNCEMENTS: Announcement[] = [
  { id: "A1", title: "School Closed — Eid al-Adha", body: "The school will remain closed on Monday, June 17 on account of Eid al-Adha.", from: "Admin", time: "Today, 9:00 AM", tag: "Holiday", tagColor: "#7c3aed", tagBg: "rgba(124,58,237,0.10)" },
  { id: "A2", title: "Annual Sports Day — May 28", body: "Annual Sports Day on May 28 at 9:00 AM. Students must wear house colour t-shirts.", from: "Admin", time: "Yesterday", tag: "Event", tagColor: "#6BCB77", tagBg: "rgba(107,203,119,0.10)" },
  { id: "A3", title: "Staff Meeting — May 21 at 3 PM", body: "All staff are requested to attend a mandatory meeting on May 21 at 3:00 PM in the conference room.", from: "Admin", time: "May 17", tag: "General", tagColor: "rgba(26,26,46,0.55)", tagBg: "rgba(26,26,46,0.07)" },
];

export default function FacultyChatPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [convos, setConvos] = useState<Conversation[]>(CONVOS);
  const [active, setActive] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<"messages" | "announcements">("messages");
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const role = sessionStorage.getItem("erp_role");
    const u = sessionStorage.getItem("erp_user");
    if (role !== "faculty") { router.replace("/erp/login"); return; }
    setUser(u || "Ms. Priya Sharma");
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.id, active?.messages.length]);

  function openConvo(c: Conversation) {
    setConvos(prev => prev.map(cv =>
      cv.id !== c.id ? cv : { ...cv, unread: 0, messages: cv.messages.map(m => ({ ...m, read: true })) }
    ));
    setActive({ ...c, unread: 0, messages: c.messages.map(m => ({ ...m, read: true })) });
    setInput("");
  }

  function sendMsg() {
    if (!input.trim() || !active) return;
    const msg: ChatMsg = {
      id: `m${Date.now()}`,
      from: "me",
      text: input.trim(),
      time: "Just now",
      read: false,
    };
    const updated = { ...active, messages: [...active.messages, msg], lastMsg: input.trim(), lastTime: "Just now" };
    setActive(updated);
    setConvos(prev => prev.map(c => c.id === active.id ? updated : c));
    setInput("");
  }

  const totalUnread = convos.reduce((a, c) => a + c.unread, 0);
  const filtered = convos.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <ERPShell role="faculty" userName={user}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Messages</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          Chat with parents and school admin
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {([
          { key: "messages",      label: `Messages${totalUnread > 0 ? ` (${totalUnread} new)` : ""}` },
          { key: "announcements", label: `Announcements (${ANNOUNCEMENTS.length})` },
        ] as const).map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150"
            style={{
              background: tab === t.key ? "rgba(107,203,119,0.12)" : "rgba(26,26,46,0.05)",
              color: tab === t.key ? "#6BCB77" : "rgba(26,26,46,0.55)",
              fontFamily: "var(--font-nunito)",
              border: tab === t.key ? "1.5px solid rgba(107,203,119,0.30)" : "1.5px solid transparent",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "messages" && (
        <div className="grid lg:grid-cols-5 gap-4" style={{ height: "calc(100vh - 260px)", minHeight: 480 }}>
          {/* Sidebar */}
          <div className="lg:col-span-2 flex flex-col gap-2 overflow-y-auto">
            <div className="relative mb-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(26,26,46,0.35)" }} />
              <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl text-sm"
                style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }}
              />
            </div>
            {filtered.map(c => (
              <button key={c.id} type="button" onClick={() => openConvo(c)}
                className="glass-card text-left w-full"
                style={{
                  borderRadius: "1.25rem",
                  border: active?.id === c.id ? "1.5px solid rgba(107,203,119,0.40)" : c.unread > 0 ? "1.5px solid rgba(255,107,107,0.22)" : "1.5px solid rgba(255,255,255,0.60)",
                  background: active?.id === c.id ? "rgba(107,203,119,0.06)" : undefined,
                }}>
                <div className="flex items-center gap-3 p-3.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: c.role === "admin" ? "rgba(255,107,107,0.10)" : "rgba(255,217,61,0.15)" }}>
                    {c.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-navy truncate" style={{ fontFamily: "var(--font-nunito)" }}>{c.name}</p>
                      <p className="text-xs flex-shrink-0 ml-1" style={{ color: "rgba(26,26,46,0.35)", fontFamily: "var(--font-inter)" }}>{c.lastTime}</p>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs truncate" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>{c.lastMsg}</p>
                      {c.unread > 0 && (
                        <span className="ml-1 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: "#FF6B6B", fontSize: "0.6rem", fontFamily: "var(--font-nunito)" }}>
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Chat panel */}
          <div className="lg:col-span-3 glass-card flex flex-col overflow-hidden" style={{ borderRadius: "1.25rem" }}>
            {!active ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: "rgba(107,203,119,0.10)" }}>💬</div>
                <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Select a conversation</p>
                <p className="text-xs" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>Pick a chat from the left to start messaging</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
                  style={{ borderBottom: "1px solid rgba(26,26,46,0.06)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: active.role === "admin" ? "rgba(255,107,107,0.10)" : "rgba(255,217,61,0.15)" }}>
                    {active.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{active.name}</p>
                    <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>
                      {active.role === "parent" ? "Parent" : "School Admin"}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {active.messages.map(m => (
                    <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[75%]">
                        <div className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                          style={{
                            background: m.from === "me" ? "linear-gradient(135deg,#6BCB77,#4CAF50)" : "rgba(255,255,255,0.80)",
                            color: m.from === "me" ? "white" : "rgba(26,26,46,0.80)",
                            fontFamily: "var(--font-inter)",
                            borderRadius: m.from === "me" ? "1.25rem 1.25rem 0.25rem 1.25rem" : "1.25rem 1.25rem 1.25rem 0.25rem",
                            boxShadow: m.from === "me" ? "0 2px 10px rgba(107,203,119,0.25)" : "0 2px 8px rgba(26,26,46,0.06)",
                          }}>
                          {m.text}
                        </div>
                        <p className={`text-xs mt-1 ${m.from === "me" ? "text-right" : "text-left"}`}
                          style={{ color: "rgba(26,26,46,0.35)", fontFamily: "var(--font-inter)" }}>
                          {m.time} {m.from === "me" && <CheckCheck size={10} className="inline ml-0.5" style={{ color: m.read ? "#6BCB77" : "rgba(26,26,46,0.30)" }} />}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
                  style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
                  <input type="text" placeholder="Type a message…" value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMsg()}
                    className="flex-1 px-4 py-2.5 rounded-2xl text-sm"
                    style={{ background: "rgba(26,26,46,0.05)", border: "1px solid rgba(26,26,46,0.08)", outline: "none", fontFamily: "var(--font-inter)", color: "rgba(26,26,46,0.80)" }}
                  />
                  <button type="button" onClick={sendMsg} disabled={!input.trim()}
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 hover:scale-105 disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg,#6BCB77,#4CAF50)", boxShadow: "0 3px 10px rgba(107,203,119,0.30)" }}>
                    <Send size={16} style={{ color: "white" }} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === "announcements" && (
        <div className="space-y-3">
          {ANNOUNCEMENTS.map(a => (
            <div key={a.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: a.tagBg, color: a.tagColor, fontFamily: "var(--font-nunito)" }}>{a.tag}</span>
                  <span className="text-xs" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>From {a.from} · {a.time}</span>
                </div>
              </div>
              <p className="text-sm font-bold text-navy mb-1" style={{ fontFamily: "var(--font-nunito)" }}>{a.title}</p>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(26,26,46,0.65)", fontFamily: "var(--font-inter)" }}>{a.body}</p>
            </div>
          ))}
        </div>
      )}
    </ERPShell>
  );
}
