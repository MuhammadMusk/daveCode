import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"

import { getAccessToken, logout } from "../lib/auth"

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/qa", label: "Q&A Board" },
  { to: "/matching", label: "Peer Matching" },
  { to: "/skills", label: "Skill Sharing" },
  { to: "/messages", label: "Messages" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/profile", label: "My Profile" },
  { to: "/settings", label: "Settings" },
]

function cx(isActive: boolean) {
  return isActive
    ? "flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-white"
    : "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
}

export default function AppShell() {
  const navigate = useNavigate()
  const authed = !!getAccessToken()

  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <Link to="/" className="block">
              <div className="text-lg font-semibold leading-tight">PeerLearn NG</div>
              <div className="text-xs text-slate-400">Collaborative learning</div>
            </Link>

            <div className="mt-6 space-y-1">
              <div className="px-3 py-2 text-[10px] font-semibold tracking-widest text-slate-500">MAIN</div>
              {navItems.slice(0, 5).map((it) => (
                <NavLink key={it.to} to={it.to} className={({ isActive }) => cx(isActive)}>
                  {it.label}
                </NavLink>
              ))}

              <div className="mt-4 px-3 py-2 text-[10px] font-semibold tracking-widest text-slate-500">COMMUNITY</div>
              {navItems.slice(5).map((it) => (
                <NavLink key={it.to} to={it.to} className={({ isActive }) => cx(isActive)}>
                  {it.label}
                </NavLink>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
              {authed ? (
                <button
                  className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15"
                  onClick={() => {
                    logout()
                    navigate("/login")
                  }}
                >
                  Logout
                </button>
              ) : (
                <div className="space-y-2">
                  <Link className="block rounded-lg bg-white/10 px-3 py-2 text-center text-sm text-white hover:bg-white/15" to="/login">
                    Login
                  </Link>
                  <Link className="block rounded-lg bg-sky-500/80 px-3 py-2 text-center text-sm text-white hover:bg-sky-500" to="/register">
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="md:hidden">
                <Link to="/" className="text-sm font-semibold">
                  PeerLearn NG
                </Link>
              </div>
              <div className="relative hidden sm:block">
                <input
                  placeholder="Search…"
                  className="w-[360px] rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-400/40"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/qa" className="rounded-xl bg-sky-500/80 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500">
                + Ask a Question
              </Link>
            </div>
          </header>

          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

