import type { FormEvent } from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { api } from "../lib/api"

type Post = {
  id: number
  title: string
  body: string
  vote_score: number
  answers_count: number
  created_at: string
  author: { id: number; username: string }
}

export default function Forum() {
  const [posts, setPosts] = useState<Post[]>([])
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [openForm, setOpenForm] = useState(false)

  async function load() {
    const r = await api.get("/forum/posts/")
    setPosts(r.data)
  }

  useEffect(() => {
    load().catch(() => {})
  }, [])

  async function createPost(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await api.post("/forum/posts/", { title, body, tag_names: ["general"] })
      setTitle("")
      setBody("")
      await load()
      setOpenForm(false)
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to create post (login required).")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Q&amp;A Board</h1>
          <p className="mt-1 text-sm text-slate-400">Ask questions, share knowledge, build reputation</p>
        </div>
        <button
          className="rounded-xl bg-sky-500/80 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
          onClick={() => setOpenForm((v) => !v)}
        >
          + Ask a Question
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative w-full sm:max-w-lg">
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-400/40"
                  placeholder="Search questions, tags, courses..."
                />
              </div>
              <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">All Courses</button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {posts.map((p) => (
              <Link key={p.id} to={`/qa/posts/${p.id}`} className="block rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/[0.07]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-100">{p.title}</div>
                    <div className="mt-2 line-clamp-2 text-sm text-slate-300">{p.body}</div>
                  </div>
                  <div className="text-xs text-slate-500">{new Date(p.created_at).toLocaleString()}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                  <span>By {p.author.username}</span>
                  <span>{p.answers_count} answers</span>
                  <span>{p.vote_score} votes</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <aside className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Ask a question</h2>
            <button className="text-xs text-slate-400 hover:text-slate-200" onClick={() => setOpenForm((v) => !v)}>
              {openForm ? "Hide" : "Show"}
            </button>
          </div>
          {openForm ? (
            <form className="mt-3 space-y-3" onSubmit={createPost}>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-400/40"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                className="h-28 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-400/40"
                placeholder="Describe your problem..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
              {error && <div className="text-sm text-red-300">{error}</div>}
              <button className="w-full rounded-xl bg-sky-500/80 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500">Post</button>
            </form>
          ) : (
            <div className="mt-3 text-sm text-slate-400">Use “Ask a Question” to open the form.</div>
          )}
        </aside>
      </div>
    </div>
  )
}

