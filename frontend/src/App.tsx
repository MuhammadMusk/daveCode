import { Navigate, Route, Routes } from "react-router-dom"

import Dashboard from "./pages/Dashboard"
import Forum from "./pages/Forum"
import ForumPost from "./pages/ForumPost"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Chat from "./pages/Chat"
import Leaderboard from "./pages/Leaderboard"
import AppShell from "./components/AppShell"
import RequireAuth from "./components/RequireAuth"
import Matching from "./pages/Matching"
import Skills from "./pages/Skills"
import ProfilePage from "./pages/Profile"
import SettingsPage from "./pages/Settings"

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/qa" element={<Forum />} />
          <Route path="/qa/posts/:id" element={<ForumPost />} />
          <Route path="/matching" element={<Matching />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/messages" element={<Chat />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="/forum" element={<Navigate to="/qa" replace />} />
      <Route path="/forum/posts/:id" element={<Navigate to="/qa/posts/:id" replace />} />
      <Route path="/chat" element={<Navigate to="/messages" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
