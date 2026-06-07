import type { FormEvent } from "react"
import { useEffect, useMemo, useState } from "react"
//import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { api } from "../lib/api"
import { getAccessToken } from "../lib/auth"

type Skill = { id: number; name: string; category: string }
type UserSkill = { id: number; skill: Skill; proficiency: number; can_teach: boolean; can_learn: boolean }

type Me = {
  id: number
  username: string
  profile: { reputation_points: number; rank: string; institution: string; department: string; level: string }
  skills: UserSkill[]
}

type Match = { id: number; username: string; rank: string; reputation_points: number; workload: number; score: number }

export default function Dashboard() {
  const nav = useNavigate()
  const authed = !!getAccessToken()
  const [me, setMe] = useState<Me | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [skillId, setSkillId] = useState<number | "">("")
  const [matches, setMatches] = useState<Match[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authed) return
    api
      .get("/me/")
      .then((r) => setMe(r.data))
      .catch(() => setMe(null))
  }, [authed])

  useEffect(() => {
    api.get("/skills/").then((r) => setSkills(r.data)).catch(() => {})
  }, [])

  const teachSkills = useMemo(() => me?.skills?.filter((s) => s.can_teach) || [], [me])

  async function suggest() {
    setError(null)
    setMatches([])
    try {
      if (!skillId) {
        setError("Choose a skill first.")
        return
      }
      const r = await api.get(`/matching/suggest/?skill_id=${skillId}`)
      setMatches(r.data)
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to get suggestions")
    }
  }

  if (!authed) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold text-slate-100">Peer learning & skill sharing</h1>
        <p className="mt-2 text-sm text-slate-400">
          Create an account, add skills you can teach/learn, and get matched to high‑reputation peers with low workload.
        </p>
        <div className="mt-4 flex gap-3">
          <Link className="rounded-xl bg-sky-500/80 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500" to="/register">
            Get started
          </Link>
          <Link className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 hover:bg-white/[0.07]" to="/login">
            Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-100">Welcome back, {me?.username}</h1>
            <p className="mt-1 text-sm text-slate-400">
              Reputation: <span className="font-medium text-sky-300">{me?.profile?.reputation_points ?? 0}</span> • Rank:{" "}
              <span className="font-medium text-slate-200">{me?.profile?.rank ?? "Starter"}</span>
            </p>
          </div>
          <Link className="rounded-xl bg-sky-500/80 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500" to="/qa">
            + Ask a Question
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">Reputation Score</div>
          <div className="mt-2 text-2xl font-semibold text-sky-300">{me?.profile?.reputation_points ?? 0}</div>
          <div className="mt-1 text-xs text-slate-500">Build it by helping others</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">Answers Given</div>
          <div className="mt-2 text-2xl font-semibold text-slate-100">—</div>
          <div className="mt-1 text-xs text-slate-500">Coming from forum stats</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">Questions Asked</div>
          <div className="mt-2 text-2xl font-semibold text-slate-100">—</div>
          <div className="mt-1 text-xs text-slate-500">Coming from forum stats</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">Peer Rating</div>
          <div className="mt-2 text-2xl font-semibold text-slate-100">—</div>
          <div className="mt-1 text-xs text-slate-500">Coming from sessions</div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Skills</h2>
            <Link className="text-xs text-sky-300 hover:text-sky-200" to="/skills">
              Manage
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {teachSkills.length === 0 ? (
              <span className="text-sm text-slate-400">Add skills to start matching.</span>
            ) : (
              teachSkills.slice(0, 6).map((s) => (
                <span key={s.id} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                  {s.skill.name}
                </span>
              ))
            )}
          </div>
          <div className="mt-4">
            <Link className="inline-flex rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 hover:bg-white/[0.07]" to="/matching">
              Find peers
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Link className="text-xs text-slate-400 hover:text-slate-200" to="/qa">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">Your activity feed will appear here.</div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">As you post, answer, and complete sessions, we’ll summarize it.</div>
          </div>
        </div>
      </section>
    </div>
  )
}

