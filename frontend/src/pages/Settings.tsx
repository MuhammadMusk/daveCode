import { useEffect, useState } from "react"

type Prefs = {
  notifications_new_match: boolean
  notifications_answer: boolean
  notifications_reminders: boolean
  notifications_digest: boolean
  privacy_show_in_search: boolean
  privacy_display_reputation: boolean
  privacy_accept_requests: boolean
  preferred_session_mode: "async" | "live"
  data_saving_mode: "auto" | "on" | "off"
}

const KEY = "peershare_prefs_v1"

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return {
    notifications_new_match: true,
    notifications_answer: true,
    notifications_reminders: false,
    notifications_digest: false,
    privacy_show_in_search: true,
    privacy_display_reputation: true,
    privacy_accept_requests: false,
    preferred_session_mode: "async",
    data_saving_mode: "auto",
  }
}

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs())
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(prefs))
    setSaved(true)
    const t = setTimeout(() => setSaved(false), 900)
    return () => clearTimeout(t)
  }, [prefs])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">Manage your account preferences</p>
        {saved && <div className="mt-1 text-xs text-emerald-200">Saved</div>}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:col-span-2">
          <div className="text-sm font-semibold text-slate-100">Notifications</div>
          <div className="mt-4 space-y-3">
            <Toggle
              label="New peer match found"
              value={prefs.notifications_new_match}
              onChange={(v) => setPrefs((p) => ({ ...p, notifications_new_match: v }))}
            />
            <Toggle
              label="Answer to your question"
              value={prefs.notifications_answer}
              onChange={(v) => setPrefs((p) => ({ ...p, notifications_answer: v }))}
            />
            <Toggle
              label="Session reminders"
              value={prefs.notifications_reminders}
              onChange={(v) => setPrefs((p) => ({ ...p, notifications_reminders: v }))}
            />
            <Toggle
              label="Weekly digest"
              value={prefs.notifications_digest}
              onChange={(v) => setPrefs((p) => ({ ...p, notifications_digest: v }))}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold text-slate-100">Privacy & Matching</div>
          <div className="mt-4 space-y-3">
            <Toggle
              label="Show me in peer search"
              value={prefs.privacy_show_in_search}
              onChange={(v) => setPrefs((p) => ({ ...p, privacy_show_in_search: v }))}
            />
            <Toggle
              label="Display reputation publicly"
              value={prefs.privacy_display_reputation}
              onChange={(v) => setPrefs((p) => ({ ...p, privacy_display_reputation: v }))}
            />
            <Toggle
              label="Accept session requests"
              value={prefs.privacy_accept_requests}
              onChange={(v) => setPrefs((p) => ({ ...p, privacy_accept_requests: v }))}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:col-span-3">
          <div className="text-sm font-semibold text-slate-100">Accessibility & Performance</div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-300">
              Preferred session mode
              <select
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/40"
                value={prefs.preferred_session_mode}
                onChange={(e) => setPrefs((p) => ({ ...p, preferred_session_mode: e.target.value as Prefs["preferred_session_mode"] }))}
              >
                <option value="async">Async (Chat only)</option>
                <option value="live">Live (Video/Voice)</option>
              </select>
            </label>

            <label className="text-sm text-slate-300">
              Data saving mode
              <select
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/40"
                value={prefs.data_saving_mode}
                onChange={(e) => setPrefs((p) => ({ ...p, data_saving_mode: e.target.value as Prefs["data_saving_mode"] }))}
              >
                <option value="auto">Auto (recommended)</option>
                <option value="on">On</option>
                <option value="off">Off</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
      <span className="text-sm text-slate-200">{label}</span>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

