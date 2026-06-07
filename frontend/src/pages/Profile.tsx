import type { FormEvent } from "react"
import { useEffect, useState } from "react"

import { api } from "../lib/api"

type Profile = {
  institution: string
  department: string
  level: string
  location: string
  bio: string
  phone: string
  avatar_url: string
  reputation_points: number
  rank: string
}

type Me = { id: number; username: string; email: string; profile: Profile }

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null)
  const [form, setForm] = useState<Omit<Profile, "reputation_points" | "rank">>({
    institution: "",
    department: "",
    level: "",
    location: "",
    bio: "",
    phone: "",
    avatar_url: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api
      .get("/me/")
      .then((r) => {
        setMe(r.data)
        const p: Profile = r.data.profile
        setForm({
          institution: p.institution || "",
          department: p.department || "",
          level: p.level || "",
          location: p.location || "",
          bio: p.bio || "",
          phone: p.phone || "",
          avatar_url: p.avatar_url || "",
        })
      })
      .catch(() => setError("Failed to load profile"))
  }, [])

  async function save(e: FormEvent) {
    e.preventDefault()
    setSaved(false)
    setError(null)
    setSaving(true)
    try {
      const r = await api.put("/me/profile/", form)
      setMe((prev) => (prev ? { ...prev, profile: { ...prev.profile, ...r.data } } : prev))
      setSaved(true)
    } catch (e: any) {
      const data = e?.response?.data
      const msg =
        data && typeof data === "object"
          ? (Object.values(data).flat().find((v) => typeof v === "string") as string | undefined)
          : undefined
      setError(msg || data?.detail || "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">My Profile</h1>
          <p className="mt-1 text-sm text-slate-400">Your academic identity and reputation</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold text-slate-100">{me?.username || "—"}</div>
          <div className="mt-1 text-xs text-slate-400">{me?.email || ""}</div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-slate-400">Reputation</div>
              <div className="mt-1 text-lg font-semibold text-sky-300">{me?.profile?.reputation_points?.toLocaleString?.() ?? 0}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-slate-400">Rank</div>
              <div className="mt-1 text-lg font-semibold text-slate-100">{me?.profile?.rank ?? "starter"}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:col-span-2">
          <div className="text-sm font-semibold text-slate-100">Edit Profile</div>
          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={save}>
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/40"
              placeholder="Display / Avatar URL"
              value={form.avatar_url}
              onChange={(e) => setForm((p) => ({ ...p, avatar_url: e.target.value }))}
            />
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/40"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            />
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/40"
              placeholder="Institution"
              value={form.institution}
              onChange={(e) => setForm((p) => ({ ...p, institution: e.target.value }))}
            />
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/40"
              placeholder="Department"
              value={form.department}
              onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
            />
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/40"
              placeholder="Level (e.g. 300L)"
              value={form.level}
              onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
            />
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/40"
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            />
            <textarea
              className="md:col-span-2 h-28 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/40"
              placeholder="Bio"
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
            />
            {error && <div className="md:col-span-2 text-sm text-red-300">{error}</div>}
            {saved && <div className="md:col-span-2 text-sm text-emerald-200">Saved.</div>}
            <div className="md:col-span-2">
              <button
                className="rounded-xl bg-sky-500/80 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

