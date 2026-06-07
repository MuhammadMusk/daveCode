import { Navigate, Outlet, useLocation } from "react-router-dom"

import { getAccessToken } from "../lib/auth"

export default function RequireAuth() {
  const loc = useLocation()
  const authed = !!getAccessToken()
  if (!authed) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  return <Outlet />
}

