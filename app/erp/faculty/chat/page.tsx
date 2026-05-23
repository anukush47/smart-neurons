"use client";

import { useState, useEffect, useRef } from "react";
import ERPShell from "@/components/erp/ERPShell";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, Send, User, Search } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  role: string;
  studentName?: string;
  unread: number;
}

interface Message {
  id: string;
  from_user_id: string;
  from_name: string;
  from_role: string;
  to_user_id: string;
  body: string;
  sent_at: string;
  read: boolean;
}

export default function FacultyChatPage() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      const u = data.user;
      setUser({ id: u.id, name: u.app_metadata?.name || u.email || "Faculty" });

      // Load parent contacts from students in faculty's class
      const classAssigned = u.app_metadata?.class_assigned;
      const res = await fetch(classAssigned ? `/api/students?class=${classAssigned}` : "/api/students");
      const json = await res.json();
      const students = json.students ?? [];

      // Get unique parents
      const parentMap: Record<string, Contact> = {};
      for (const s of students) {
        if (s.parent_user_id && !parentMap[s.parent_user_id]) {
          parentMap[s.parent_user_id] = {
            id: s.parent_user_id,
            name: s.parent_name || "Parent",
            role: "parent",
            studentName: s.name,
            unread: 0,
          };
        }
      }
      setContacts(Object.values(parentMap));
      setLoadingContacts(false);
    }
    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selected) return;
    loadMessages(selected.id);
    pollRef.current = setInterval(() => loadMessages(selected.id), 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selected]);

  async function loadMessages(withId: string) {
    const res = await fetch(`/api/messages?with=${withId}`);
    const json = await res.json();
    setMessages(json.messages ?? []);
  }

  async function handleSend() {
    if (!body.trim() || !selected || !user) return;
    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_user_id: selected.id, body: body.trim() }),
    });
    const json = await res.json();
    setSending(false);
    if (json.message) {
      setMessages(prev => [...prev, json.message]);
      setBody("");
    }
  }

  const filtered = contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.studentName?.toLowerCase().includes(search.toLowerCase()) ?? false));

  return (
    <ERPShell role="faculty" userName={user?.name}>
      <div className="flex h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 border-r border-gray-100 flex flex-col">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border text-xs" style={{ fontFamily: "var(--font-nunito)" }}
                placeholder="Search parents…" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingContacts ? (
              <div className="p-4 text-xs text-gray-400 text-center" style={{ fontFamily: "var(--font-nunito)" }}>Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-xs text-gray-400 text-center" style={{ fontFamily: "var(--font-nunito)" }}>No contacts</div>
            ) : filtered.map(c => (
              <button key={c.id} onClick={() => setSelected(c)}
                className="w-full text-left px-3 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50"
                style={{ background: selected?.id === c.id ? "rgba(107,203,119,0.08)" : undefined }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-navy truncate" style={{ fontFamily: "var(--font-nunito)" }}>{c.name}</p>
                  {c.studentName && (
                    <p className="text-xs text-gray-400 truncate" style={{ fontFamily: "var(--font-nunito)" }}>Parent of {c.studentName}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare size={40} className="text-gray-300 mb-3" />
              <p className="font-bold text-gray-500 text-sm" style={{ fontFamily: "var(--font-nunito)" }}>Select a parent to start messaging</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: "#6BCB77", fontFamily: "var(--font-nunito)" }}>
                  {selected.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-navy" style={{ fontFamily: "var(--font-nunito)" }}>{selected.name}</p>
                  {selected.studentName && (
                    <p className="text-xs text-gray-400" style={{ fontFamily: "var(--font-nunito)" }}>Parent of {selected.studentName}</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-xs text-gray-400 mt-8" style={{ fontFamily: "var(--font-nunito)" }}>No messages yet. Say hello!</div>
                ) : messages.map(m => {
                  const mine = m.from_user_id === user?.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm`}
                        style={{
                          background: mine ? "#6BCB77" : "rgba(26,26,46,0.06)",
                          color: mine ? "white" : "#1a1a2e",
                          fontFamily: "var(--font-nunito)",
                          borderRadius: mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        }}>
                        <p>{m.body}</p>
                        <p className="text-xs mt-1 opacity-60" style={{ fontFamily: "var(--font-nunito)" }}>
                          {new Date(m.sent_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-100 flex gap-2">
                <input value={body} onChange={e => setBody(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-sm" style={{ fontFamily: "var(--font-nunito)" }}
                  placeholder="Type a message…" />
                <button onClick={handleSend} disabled={sending || !body.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-50"
                  style={{ background: "#6BCB77" }}>
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </ERPShell>
  );
}
