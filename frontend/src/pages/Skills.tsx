import { useEffect, useMemo, useState } from "react"

import { api } from "../lib/api"

type Skill = { id: number; name: string; category: string; description?: string }
type UserSkill = {
  id: number
  skill: { id: number; name: string; category: string }
  proficiency: number
  can_teach: boolean
  can_learn: boolean
  skill_points: number
}

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [mine, setMine] = useState<UserSkill[]>([])
  const [skillId, setSkillId] = useState<number | "">("")
  const [proficiency, setProficiency] = useState(3)
  const [canTeach, setCanTeach] = useState(true)
  const [canLearn, setCanLearn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    const [s, m] = await Promise.all([api.get("/skills/"), api.get("/user-skills/")])
    setSkills(s.data)
    setMine(m.data)
  }

  useEffect(() => {
    load().catch(() => setError("Failed to load skills"))
  }, [])

  const categories = useMemo(() => Array.from(new Set(skills.map((s) => s.category))).sort(), [skills])

  async function addSkill() {
    setError(null)
    if (!skillId) {
      setError("Select a skill first.")
      return
    }
    setSaving(true)
    try {
      await api.post("/user-skills/", { skill_id: skillId, proficiency, can_teach: canTeach, can_learn: canLearn })
      setSkillId("")
      await load()
    } catch (e: any) {
      const data = e?.response?.data
      const msg =
        data && typeof data === "object"
          ? (Object.values(data).flat().find((v) => typeof v === "string") as string | undefined)
          : undefined
      setError(msg || data?.detail || "Failed to add skill")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Skill Sharing</h1>
          <p className="mt-1 text-sm text-slate-400">Offer your skills or find someone to help you learn</p>
        </div>
        <button
          className="rounded-xl bg-sky-500/80 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
          onClick={addSkill}
          disabled={saving}
        >
          + Offer a Skill
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:col-span-1">
          <div className="text-sm font-semibold text-slate-100">Add a skill</div>
          <div className="mt-4 space-y-3">
            <select
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/40"
              value={skillId}
              onChange={(e) => setSkillId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Select skill</option>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-300">Proficiency</label>
              <input
                type="range"
                min={1}
                max={5}
                value={proficiency}
                onChange={(e) => setProficiency(Number(e.target.value))}
                className="flex-1"
              />
              <div className="w-6 text-right text-sm text-slate-200">{proficiency}</div>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input type="checkbox" checked={canTeach} onChange={(e) => setCanTeach(e.target.checked)} />
              I can teach this
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input type="checkbox" checked={canLearn} onChange={(e) => setCanLearn(e.target.checked)} />
              I want to learn this
            </label>
            {error && <div className="text-sm text-red-300">{error}</div>}
            <button
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 hover:bg-white/[0.07] disabled:opacity-60"
              onClick={addSkill}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold text-slate-100">Your skills</div>
            <div className="text-xs text-slate-400">{mine.length} total</div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {mine.map((s) => (
              <div key={s.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">{s.skill.name}</div>
                  <div className="text-xs text-slate-400">{s.skill.category}</div>
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  Proficiency {s.proficiency}/5 • Skill points {s.skill_points}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {s.can_teach && <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-200">Teaching</span>}
                  {s.can_learn && <span className="rounded-full bg-sky-500/15 px-2 py-1 text-sky-200">Learning</span>}
                </div>
              </div>
            ))}
            {mine.length === 0 && <div className="py-6 text-sm text-slate-400">No skills yet. Add one on the left.</div>}
          </div>

          <div className="mt-6 text-xs text-slate-500">
            Categories: {categories.length ? categories.join(", ") : "—"}
          </div>
        </div>
      </div>
    </div>
  )
}

