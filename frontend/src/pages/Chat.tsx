import type { FormEvent } from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import { useLocation } from "react-router-dom"

import { api, API_BASE } from "../lib/api"
import { getAccessToken } from "../lib/auth"

type Conversation = { id: number; peer: { id: number; username: string } }
type Message = { id: number; sender: { id: number; username: string }; body: string; created_at: string }
 
function wsBase() {
  const apiUrl = API_BASE.replace(/\/api\/?$/, "")
  const u = new URL(apiUrl)
  u.protocol = u.protocol === "https:" ? "wss:" : "ws:"
  return u.toString().replace(/\/$/, "")
}

export default function Chat() {
  const location = useLocation() as any
  const openFromNav: number | undefined = location?.state?.openConversationId

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<number | null>(openFromNav ?? null)
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState("")

  const sockRef = useRef<WebSocket | null>(null)

  async function loadConversations() {
    const r = await api.get("/chat/conversations/")
    setConversations(r.data)
    if (!activeId && r.data.length) setActiveId(r.data[0].id)
  }

  async function loadMessages(conversationId: number) {
    const r = await api.get(`/chat/conversations/${conversationId}/messages/`)
    setMessages(r.data)
  }

  useEffect(() => {
    loadConversations().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!activeId) return
    loadMessages(activeId).catch(() => {})

    // connect websocket
    const token = getAccessToken()
    if (!token) return
    const ws = new WebSocket(`${wsBase()}/ws/chat/conversations/${activeId}/?token=${encodeURIComponent(token)}`)
    sockRef.current = ws
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        setMessages((prev) => [...prev, msg])
      } catch {
        // ignore
      }
    }
    return () => {
      ws.close()
      sockRef.current = null
    }
  }, [activeId])

  const active = useMemo(() => conversations.find((c) => c.id === activeId) || null, [conversations, activeId])

  async function send(e: FormEvent) {
    e.preventDefault()
    if (!activeId) return
    const ws = sockRef.current
    const text = body.trim()
    if (!text) return
    setBody("")
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ body: text }))
    } else {
      // fallback to REST
      await api.post(`/chat/conversations/${activeId}/messages/`, { body: text })
      await loadMessages(activeId)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <aside className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-slate-100">Messages</div>
        <div className="mt-3 space-y-1">
          {conversations.map((c) => (
            <button
              key={c.id}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                c.id === activeId ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => setActiveId(c.id)}
            >
              {c.peer?.username ?? `Conversation ${c.id}`}
            </button>
          ))}
        </div>
      </aside>

      <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="text-sm font-semibold text-slate-100">{active ? `Chat with ${active.peer.username}` : "Select a conversation"}</div>
          <div className="text-xs text-slate-500">Real-time</div>
        </div>

        <div className="mt-4 h-[420px] overflow-auto space-y-2 pr-2">
          {messages.map((m) => (
            <div key={m.id} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <div className="text-xs font-medium text-slate-200">{m.sender.username}</div>
              <div className="text-sm text-slate-100">{m.body}</div>
              <div className="text-[11px] text-slate-500">{new Date(m.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>

        <form className="mt-4 flex gap-2" onSubmit={send}>
          <input
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-400/40"
            placeholder="Type a message..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button className="rounded-xl bg-sky-500/80 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500">Send</button>
        </form>
      </section>
    </div> 
  )
}

