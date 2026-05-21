"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import ERPShell from "@/components/erp/ERPShell";
import { Send, Bell, Search, CheckCheck } from "lucide-react";

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
  role: string;
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
  time: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  pinned?: boolean;
}

const CONVOS: Conversation[] = [
  {
    id: "C1", name: "Ms. Priya Sharma", role: "Class Teacher · JKG-A", avatar: "👩‍🏫",
    lastMsg: "Lovely drawing of a cat 🐱", lastTime: "9:15 AM", unread: 0,
    messages: [
      { id: "m1", from: "me",   text: "Good morning Ms. Priya. Is Aarav's drawing homework submitted?", time: "9:10 AM", read: true },
      { id: "m2", from: "them", text: "Good morning! Yes, Aarav submitted it yesterday. Lovely drawing of a cat 🐱", time: "9:15 AM", read: true },
    ],
  },
  {
    id: "C2", name: "School Admin", role: "Smart Neurons · Admin", avatar: "📊",
    lastMsg: "Please ensure timely fee payment.", lastTime: "Yesterday", unread: 1,
    messages: [
      { id: "m3", from: "them", text: "Dear Parent, this is a reminder that the June instalment of ₹20,000 is due by June 1. Please ensure timely fee payment.", time: "Yesterday, 10:00 AM", read: false },
    ],
  },
];

const ANNOUNCEMENTS: Announcement[] = [
  { id: "A1", title: "School Closed — Eid al-Adha", body: "The school will remain closed on Monday, June 17, 2026 on account of Eid al-Adha. Classes will resume on Tuesday, June 18. Wishing everyone a blessed Eid.", time: "Today, 9:00 AM", tag: "Holiday", tagColor: "#7c3aed", tagBg: "rgba(124,58,237,0.10)", pinned: true },
  { id: "A2", title: "Annual Sports Day — May 28", body: "We are excited to invite all parents to our Annual Sports Day on May 28, 2026 at 9:00 AM. Children should wear their house colour t-shirts.", time: "Yesterday", tag: "Event", tagColor: "#6BCB77", tagBg: "rgba(107,203,119,0.10)", pinned: true },
  { id: "A3", title: "Fee Reminder — June Instalment", body: "The June instalment is due by June 1, 2026. Kindly ensure timely payment to avoid a late fee. Pay online via the ERP or in person at the school office.", time: "May 18", tag: "Fee", tagColor: "#FF6B6B", tagBg: "rgba(255,107,107,0.10)" },
  { id: "A4", title: "Parent-Teacher Meeting — June 5", body: "PTM will be held on June 5, 2026 from 10:00 AM to 1:00 PM. Individual time slots will be shared soon. Attendance is compulsory for at least one parent.", time: "May 16", tag: "Academic", tagColor: "#d97706", tagBg: "rgba(255,217,61,0.15)" },
  { id: "A5", title: "Summer Camp Registration Open", body: "Registrations for our Summer Activity Camp (June 10–20) are now open. Activities include art, yoga, storytelling, and nature walks. Limited seats — register by May 25.", time: "May 15", tag: "Event", tagColor: "#6BCB77", tagBg: "rgba(107,203,119,0.10)" },
];

export default function ParentChatPage() {
  const [user, setUser] = useState("");
  const [convos, setConvos] = useState<Conversation[]>(CONVOS);
  const [active, setActive] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<"messages" | "announcements">("announcements");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUser(user.user_metadata?.name || "Parent");
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.id, active?.messages.length]);

  function openConvo(c: Conversation) {
    const updated = { ...c, unread: 0, messages: c.messages.map(m => ({ ...m, read: true })) };
    setConvos(prev => prev.map(cv => cv.id === c.id ? updated : cv));
    setActive(updated);
    setInput("");
  }

  function sendMsg() {
    if (!input.trim() || !active) return;
    const msg: ChatMsg = { id: `m${Date.now()}`, from: "me", text: input.trim(), time: "Just now", read: false };
    const updated = { ...active, messages: [...active.messages, msg], lastMsg: input.trim(), lastTime: "Just now" };
    setActive(updated);
    setConvos(prev => prev.map(c => c.id === active.id ? updated : c));
    setInput("");
  }

  const unread = convos.reduce((a, c) => a + c.unread, 0);
  const pinned = ANNOUNCEMENTS.filter(a => a.pinned);
  const rest   = ANNOUNCEMENTS.filter(a => !a.pinned);

  return (
    <ERPShell role="parent" userName={user}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy" style={{ fontFamily: "var(--font-playfair)" }}>Messages & Notices</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>
          Stay connected with Aarav's school
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {([
          { key: "announcements", label: `Notices (${ANNOUNCEMENTS.length})` },
          { key: "messages",      label: `Messages${unread > 0 ? ` (${unread} new)` : ""}` },
        ] as const).map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150"
            style={{
              background: tab === t.key ? "rgba(217,119,6,0.12)" : "rgba(26,26,46,0.05)",
              color: tab === t.key ? "#d97706" : "rgba(26,26,46,0.55)",
              fontFamily: "var(--font-nunito)",
              border: tab === t.key ? "1.5px solid rgba(217,119,6,0.28)" : "1.5px solid transparent",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ANNOUNCEMENTS */}
      {tab === "announcements" && (
        <div className="space-y-3">
          {[...pinned, ...rest].map(a => (
            <div key={a.id} className="glass-card p-5"
              style={{ border: a.pinned ? "1.5px solid rgba(217,119,6,0.22)" : "1.5px solid rgba(255,255,255,0.60)" }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: a.tagBg, color: a.tagColor, fontFamily: "var(--font-nunito)" }}>{a.tag}</span>
                  {a.pinned && <span className="text-xs font-bold" style={{ color: "#d97706", fontFamily: "var(--font-nunito)" }}>📌 Pinned</span>}
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: "rgba(26,26,46,0.35)", fontFamily: "var(--font-inter)" }}>{a.time}</span>
              </div>
              <p className="text-sm font-bold text-navy mb-1.5" style={{ fontFamily: "var(--font-nunito)" }}>{a.title}</p>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(26,26,46,0.65)", fontFamily: "var(--font-inter)" }}>{a.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* MESSAGES */}
      {tab === "messages" && (
        <div className="grid lg:grid-cols-5 gap-4" style={{ height: "calc(100vh - 280px)", minHeight: 460 }}>
          {/* Conversation list */}
          <div className="lg:col-span-2 flex flex-col gap-2">
            {convos.map(c => (
              <button key={c.id} type="button" onClick={() => openConvo(c)}
                className="glass-card text-left w-full"
                style={{
                  borderRadius: "1.25rem",
                  border: active?.id === c.id ? "1.5px solid rgba(217,119,6,0.35)" : c.unread > 0 ? "1.5px solid rgba(255,107,107,0.22)" : "1.5px solid rgba(255,255,255,0.60)",
                  background: active?.id === c.id ? "rgba(217,119,6,0.05)" : undefined,
                }}>
                <div className="flex items-center gap-3 p-3.5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: "rgba(107,203,119,0.10)" }}>
                    {c.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-navy truncate" style={{ fontFamily: "var(--font-nunito)" }}>{c.name}</p>
                      <p className="text-xs flex-shrink-0 ml-1" style={{ color: "rgba(26,26,46,0.35)", fontFamily: "var(--font-inter)" }}>{c.lastTime}</p>
                    </div>
                    <p className="text-xs truncate mt-0.5" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{c.role}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs truncate" style={{ color: "rgba(26,26,46,0.50)", fontFamily: "var(--font-inter)" }}>{c.lastMsg}</p>
                      {c.unread > 0 && (
                        <span className="ml-1 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white font-bold"
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

          {/* Chat area */}
          <div className="lg:col-span-3 glass-card flex flex-col overflow-hidden" style={{ borderRadius: "1.25rem" }}>
            {!active ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: "rgba(255,217,61,0.15)" }}>💬</div>
                <p className="text-sm font-semibold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>Select a conversation</p>
                <p className="text-xs" style={{ color: "rgba(26,26,46,0.40)", fontFamily: "var(--font-inter)" }}>Chat with Aarav's teacher or the school admin</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
                  style={{ borderBottom: "1px solid rgba(26,26,46,0.06)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: "rgba(107,203,119,0.10)" }}>{active.avatar}</div>
                  <div>
                    <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{active.name}</p>
                    <p className="text-xs" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "var(--font-inter)" }}>{active.role}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {active.messages.map(m => (
                    <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[75%]">
                        <div className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                          style={{
                            background: m.from === "me" ? "linear-gradient(135deg,#d97706,#f59e0b)" : "rgba(255,255,255,0.85)",
                            color: m.from === "me" ? "white" : "rgba(26,26,46,0.80)",
                            fontFamily: "var(--font-inter)",
                            borderRadius: m.from === "me" ? "1.25rem 1.25rem 0.25rem 1.25rem" : "1.25rem 1.25rem 1.25rem 0.25rem",
                            boxShadow: m.from === "me" ? "0 2px 10px rgba(217,119,6,0.25)" : "0 2px 8px rgba(26,26,46,0.06)",
                          }}>
                          {m.text}
                        </div>
                        <p className={`text-xs mt-1 ${m.from === "me" ? "text-right" : "text-left"}`}
                          style={{ color: "rgba(26,26,46,0.35)", fontFamily: "var(--font-inter)" }}>
                          {m.time} {m.from === "me" && <CheckCheck size={10} className="inline ml-0.5" style={{ color: m.read ? "#d97706" : "rgba(26,26,46,0.30)" }} />}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

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
                    style={{ background: "linear-gradient(135deg,#d97706,#f59e0b)", boxShadow: "0 3px 10px rgba(217,119,6,0.28)" }}>
                    <Send size={16} style={{ color: "white" }} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </ERPShell>
  );
}
