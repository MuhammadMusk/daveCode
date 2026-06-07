import axios from "axios"
import { getAccessToken, getRefreshToken, logout, setTokens } from "./auth"

export const API_BASE = "/api" 
//export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api"
 
export const api = axios.create({
  baseURL: API_BASE, 
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing: Promise<string> | null = null

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true
      const refresh = getRefreshToken()
      if (!refresh) {
        logout()
        throw error
      }
      refreshing =
        refreshing ||
        api
          .post("/auth/token/refresh/", { refresh })
          .then((res) => {
            const access = res.data?.access
            if (!access) throw new Error("No access token returned")
            setTokens(access, refresh)
            return access as string
          })
          .finally(() => {
            refreshing = null
          })
      const newAccess = await refreshing
      original.headers.Authorization = `Bearer ${newAccess}`
      return api.request(original)
    }
    throw error
  },
)

