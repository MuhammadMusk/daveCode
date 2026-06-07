const ACCESS_KEY = "peershare_access"
const REFRESH_KEY = "peershare_refresh"

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY)
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_KEY, access)
  localStorage.setItem(REFRESH_KEY, refresh)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function logout() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

