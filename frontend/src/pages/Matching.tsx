import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { api } from "../lib/api"

type Skill = { id: number; name: string; category: string }
type Me = { username: string; profile: { reputation_points: number; rank: string } }
type Match = { id: number; username: string; rank: string; reputation_points: number; workload: number; score: number }

export default function Matching() {
  const nav = useNavigate()
  const [me, setMe] = useState<Me | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [skillId, setSkillId] = useState<number | "">("")
  const [matches, setMatches] = useState<Match[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get("/me/").then((r) => setMe(r.data)).catch(() => setMe(null))
  }, [])

  useEffect(() => {
    api.get("/skills/").then((r) => setSkills(r.data)).catch(() => {})
  }, [])

  const subtitle = useMemo(() => {
    const rep = me?.profile?.reputation_points ?? 0
    const rank = me?.profile?.rank ?? "starter"
    return `Reputation ${rep.toLocaleString()} • ${rank}`
  }, [me])

  async function suggest() {
    setError(null)
    setMatches([])
    setLoading(true)
    try {
      if (!skillId) {
        setError("Choose a skill first.")
        return
      }
      const r = await api.get(`/matching/suggest/?skill_id=${skillId}`)
      setMatches(r.data)
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to get suggestions")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Peer Matching</h1>
          <p className="mt-1 text-sm text-slate-400">AI-powered matching based on skills, availability & reputation</p>
          {me?.username && <p className="mt-1 text-xs text-slate-500">Signed in as {me.username} • {subtitle}</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-slate-100">Smart Matching Algorithm</div>
        <div className="mt-1 text-sm text-slate-400">Matches ranked by skill-points + reputation + proficiency − active workload</div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            className="min-w-[260px] rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/40"
            value={skillId}
            onChange={(e) => setSkillId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Select a skill you need help with</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.category})
              </option>
            ))}
          </select>
          <button
            disabled={loading}
            className="rounded-xl bg-sky-500/80 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
            onClick={suggest}
          >
            {loading ? "Finding…" : "Find Peers"}
          </button>
          {error && <div className="w-full text-sm text-red-300">{error}</div>}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {matches.map((m) => (
          <div key={m.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold">{m.username}</div>
              <div className="text-xs text-slate-400">{m.rank}</div>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Reputation: {m.reputation_points} • Workload: {m.workload} • Match score: {m.score.toFixed(1)}
            </div>
            <button
              className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 hover:bg-white/[0.07]"
              onClick={async () => {
                const r = await api.post("/chat/conversations/", { peer_id: m.id })
                nav("/messages", { state: { openConversationId: r.data.id } })
              }}
            >
              Request Session
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

