import type { FormEvent } from "react"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { api } from "../lib/api"
 
type Post = {
  id: number
  title: string
  body: string
  vote_score: number
  best_answer_id: number | null
  author: { id: number; username: string }
}

type Answer = {
  id: number
  body: string
  vote_score: number
  author: { id: number; username: string }
  created_at: string
}

export default function ForumPost() {
  const { id } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [body, setBody] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const p = await api.get(`/forum/posts/${id}/`)
    setPost(p.data)
    const a = await api.get(`/forum/posts/${id}/answers/`)
    setAnswers(a.data)
  }

  useEffect(() => {
    load().catch(() => setError("Failed to load post"))
  }, [id])

  async function votePost(value: 1 | -1) {
    await api.post(`/forum/posts/${id}/vote/`, { value })
    await load()
  }

  async function voteAnswer(answerId: number, value: 1 | -1) {
    await api.post(`/forum/answers/${answerId}/vote/`, { value })
    await load()
  }

  async function submitAnswer(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await api.post(`/forum/posts/${id}/answers/`, { body })
      setBody("")
      await load()
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to submit answer (login required).")
    }
  }

  async function setBestAnswer(answerId: number) {
    await api.post(`/forum/posts/${id}/set_best_answer/`, { answer_id: answerId })
    await load()
  }

  if (!post) return <div className="text-sm text-slate-400">Loading...</div>

  return (
    <div className="space-y-6">
      <Link className="text-sm text-slate-300 hover:text-white" to="/qa">
        ← Back to Q&amp;A
      </Link>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold text-slate-100">{post.title}</h1>
        <div className="mt-2 text-sm text-slate-400">By {post.author.username}</div>
        <p className="mt-4 whitespace-pre-wrap text-slate-200">{post.body}</p>
        <div className="mt-4 flex gap-2">
          <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 hover:bg-white/[0.07]" onClick={() => votePost(1)}>
            Upvote
          </button>
          <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 hover:bg-white/[0.07]" onClick={() => votePost(-1)}>
            Downvote
          </button>
          <span className="ml-auto text-sm text-slate-300">Score: {post.vote_score}</span>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-slate-100">Answers</h2>
        <div className="mt-4 space-y-3">
          {answers.map((a) => (
            <div
              key={a.id}
              className={`rounded-2xl border p-4 ${
                post.best_answer_id === a.id ? "border-emerald-400/40 bg-emerald-500/10" : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-medium text-slate-100">{a.author.username}</div>
                <div className="text-xs text-slate-500">{new Date(a.created_at).toLocaleString()}</div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">{a.body}</p>
              <div className="mt-3 flex gap-2">
                <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-100 hover:bg-white/[0.07]" onClick={() => voteAnswer(a.id, 1)}>
                  Upvote
                </button>
                <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-100 hover:bg-white/[0.07]" onClick={() => voteAnswer(a.id, -1)}>
                  Downvote
                </button>
                <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-100 hover:bg-white/[0.07]" onClick={() => setBestAnswer(a.id)}>
                  Mark best
                </button>
                <span className="ml-auto text-xs text-slate-400">Score: {a.vote_score}</span>
              </div>
            </div>
          ))}
        </div>

        <form className="mt-6 space-y-3" onSubmit={submitAnswer}>
          <textarea
            className="h-28 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-400/40"
            placeholder="Write your answer..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          {error && <div className="text-sm text-red-300">{error}</div>}
          <button className="rounded-xl bg-sky-500/80 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500">Submit answer</button>
        </form>
      </section>
    </div>
  )
}

