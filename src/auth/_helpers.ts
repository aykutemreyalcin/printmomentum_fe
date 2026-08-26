import type { AuthModel } from './_models'

export const AUTH_LOCAL_STORAGE_KEY = 'printmomentum-auth-v1'
export const AUTH_DEVICE_ID_STORAGE_KEY = 'auth-device-id'
export const AUTH_V2_LOGIN = '/api/v2/auth/login'
export const AUTH_V2_REFRESH = '/api/v2/auth/refresh'
export const AUTH_V2_LOGOUT = '/api/v2/auth/logout'

const TOKEN_REFRESH_LEEWAY_MS = 60 * 1000

let refreshInFlight: Promise<string | null> | null = null
let proactiveRefreshTimer: ReturnType<typeof setTimeout> | null = null

export function getAuth(): AuthModel | undefined {
  try {
    const raw = localStorage.getItem(AUTH_LOCAL_STORAGE_KEY)
    if (!raw) return undefined
    return JSON.parse(raw) as AuthModel
  } catch {
    return undefined
  }
}

export function setAuth(auth: AuthModel): void {
  localStorage.setItem(AUTH_LOCAL_STORAGE_KEY, JSON.stringify(auth))
  scheduleProactiveRefresh(auth.token)
}

export function removeAuth(): void {
  localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY)
  if (proactiveRefreshTimer) {
    clearTimeout(proactiveRefreshTimer)
    proactiveRefreshTimer = null
  }
}

export function getOrCreateDeviceId(): string {
  try {
    const existing = localStorage.getItem(AUTH_DEVICE_ID_STORAGE_KEY)
    if (existing) return existing
    const newId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(AUTH_DEVICE_ID_STORAGE_KEY, newId)
    return newId
  } catch {
    return `device-${Date.now()}`
  }
}

export function tokenExpiresAt(token: string): number | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number }
    return typeof json.exp === 'number' ? json.exp * 1000 : null
  } catch {
    return null
  }
}

export function isTokenExpired(token: string, leewayMs = 0): boolean {
  const expiresAt = tokenExpiresAt(token)
  if (expiresAt == null) return false
  return Date.now() + leewayMs >= expiresAt
}

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = (async () => {
    try {
      const response = await fetch(AUTH_V2_REFRESH, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ deviceId: getOrCreateDeviceId() }),
      })
      if (!response.ok) {
        removeAuth()
        return null
      }
      const data = (await response.json()) as { token?: string }
      if (!data.token) {
        removeAuth()
        return null
      }
      setAuth({ token: data.token })
      return data.token
    } catch {
      removeAuth()
      return null
    } finally {
      refreshInFlight = null
    }
  })()
  return refreshInFlight
}

export function scheduleProactiveRefresh(token: string): void {
  if (proactiveRefreshTimer) {
    clearTimeout(proactiveRefreshTimer)
    proactiveRefreshTimer = null
  }
  const expiresAt = tokenExpiresAt(token)
  if (expiresAt == null) return
  const wait = expiresAt - Date.now() - TOKEN_REFRESH_LEEWAY_MS
  if (wait <= 0) {
    void refreshAccessToken()
    return
  }
  proactiveRefreshTimer = setTimeout(() => {
    void refreshAccessToken()
  }, wait)
}

export function clearAuthAndRedirect(): void {
  removeAuth()
  if (!window.location.pathname.startsWith('/auth/')) {
    window.location.href = '/auth/login'
  }
}

export function shouldSkipRefresh(path: string): boolean {
  return path.includes('/auth/refresh') || path.includes('/auth/login') || path.includes('/auth/logout')
}
