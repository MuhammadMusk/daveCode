import { useEffect, useState } from "react"

import { api } from "../lib/api"

type Row = { id: number; username: string; reputation_points: number; rank: string }

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get("/reputation/leaderboard/")
      .then((r) => setRows(r.data))
      .catch((e) => setError(e?.response?.data?.detail || "Failed to load leaderboard"))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Leaderboard</h1>
          <p className="mt-1 text-sm text-slate-400">Top contributors in the peer learning community</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        {error ? (
          <div className="text-sm text-red-300">{error}</div>
        ) : (
          <div className="divide-y divide-white/10">
            {rows.map((r, idx) => (
              <div key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm text-slate-200">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-100">{r.username}</div>
                    <div className="text-xs text-slate-400">{r.rank}</div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-sky-300">{r.reputation_points.toLocaleString()}</div>
              </div>
            ))}
            {rows.length === 0 && <div className="py-6 text-sm text-slate-400">No data yet.</div>}
          </div>
        )}
      </div>
    </div>
  )
}

