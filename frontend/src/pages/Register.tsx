import type { FormEvent } from "react"
import { useState } from "react"
//import { FormEvent, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { api } from "../lib/api"
 
export default function Register() {
  const nav = useNavigate()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post("/auth/register/", { username, email, password })
      nav("/login")
    } catch (err: any) {
      const data = err?.response?.data
      const msgFromObject =
        data && typeof data === "object"
          ? (Object.values(data).flat().find((v) => typeof v === "string") as string | undefined)
          : undefined
      setError(msgFromObject || (typeof data === "string" ? data : null) || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Create account</h1>
      <p className="mt-1 text-sm text-slate-600">Join and start sharing skills.</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm font-medium">Username</span>
          <input
            required
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Email (optional)</span>
          <input
            type="email"
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            required
            minLength={8}
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>}
        <button disabled={loading} className="w-full rounded-md bg-black px-3 py-2 text-white disabled:opacity-60">
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="underline" to="/login">
          Login
        </Link>
      </p>
    </div>
  )
}

