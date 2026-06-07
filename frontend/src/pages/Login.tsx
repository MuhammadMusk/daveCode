import type { FormEvent } from "react"
import { useState } from "react"
//import { FormEvent, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { api } from "../lib/api"
import { setTokens } from "../lib/auth" 

export default function Login() {
  const nav = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post("/auth/token/", { username, password })
      setTokens(res.data.access, res.data.refresh)
      nav("/")
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Login</h1>
      <p className="mt-1 text-sm text-slate-600">Access your peer learning dashboard.</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm font-medium">Username</span>
          <input className="mt-1 w-full rounded-md border px-3 py-2" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>}
        <button disabled={loading} className="w-full rounded-md bg-black px-3 py-2 text-white disabled:opacity-60">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        No account?{" "}
        <Link className="underline" to="/register">
          Register
        </Link>
      </p>
    </div>
  )
}

