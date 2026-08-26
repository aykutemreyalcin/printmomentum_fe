import { ApiError } from './ApiError'
import * as authHelper from '../auth/_helpers'
import type { UserResponse, UserSessionView } from '../auth/_models'
import type {
  Health,
  ListingDetail,
  ListingDetailQuery,
  ListingPage,
  ListingsQuery,
  QueryStats,
  Shop,
} from './types'

const API_BASE = '/api'

export async function getHealth(): Promise<Health> {
  return request('/v1/health')
}

export async function getCurrentUser(): Promise<UserResponse> {
  return request('/v1/user')
}

export async function changePassword(body: {
  currentPassword: string
  newPassword: string
  confirmationPassword: string
}): Promise<void> {
  await request('/v1/user', false, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function registerUser(body: {
  email: string
  password: string
  name: string
  displayName?: string
  role: 'admin' | 'user'
}): Promise<number> {
  return request('/v1/user/register', false, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function listMembers(): Promise<UserResponse[]> {
  return request('/v1/user/members')
}

export async function listUserSessions(userId: number): Promise<UserSessionView[]> {
  return request(`/v1/user/members/${userId}/sessions`)
}

export async function setUserActive(id: number, status: boolean): Promise<void> {
  await request(`/v1/user/${id}?status=${status}`, false, { method: 'PATCH' })
}

export async function updateProfile(body: {
  name: string
  displayName?: string
  email?: string
  currentPassword?: string
}): Promise<UserResponse> {
  return request('/v1/user', false, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function getListings(query: ListingsQuery = {}): Promise<ListingPage> {
  return request(`/v1/listings${toQuery({
    page: query.page,
    size: query.size,
    maxDaysToTop: query.maxDaysToTop,
    minScore: query.minScore,
    q: query.q,
    shopId: query.shopId,
    preset: query.preset,
    bestseller: query.bestseller,
  })}`)
}

export async function getFavorites(query: Pick<ListingsQuery, 'page' | 'size'> = {}): Promise<ListingPage> {
  return request(`/v1/favorites${toQuery({
    page: query.page,
    size: query.size,
  })}`)
}

export async function getListing(
  listingId: number,
  query: ListingDetailQuery = {},
): Promise<ListingDetail> {
  return request(`/v1/listings/${listingId}${toQuery({
    snapshotLimit: query.snapshotLimit,
    debug: query.debug,
  })}`)
}

export async function setListingFavorite(listingId: number, favorite: boolean): Promise<void> {
  await request(`/v1/listings/${listingId}/favorite`, false, {
    method: favorite ? 'PUT' : 'DELETE',
  })
}

export async function getShop(shopId: number): Promise<Shop> {
  return request(`/v1/shops/${shopId}`)
}

export async function getQueryStats(): Promise<QueryStats[]> {
  return request('/v1/query-stats')
}

async function request<T>(path: string, isRetry = false, init: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`
  const response = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: {
      ...apiHeaders(),
      ...(init.headers ?? {}),
    },
  })
  if (response.status === 401 && !isRetry && !authHelper.shouldSkipRefresh(url)) {
    const token = await authHelper.refreshAccessToken()
    if (token) {
      return request<T>(path, true, init)
    }
    authHelper.clearAuthAndRedirect()
  }
  if (!response.ok) {
    throw await ApiError.fromResponse(response)
  }
  if (response.status === 204 || response.status === 202) {
    return undefined as T
  }
  return (await response.json()) as T
}

export function apiHeaders(): HeadersInit {
  const headers: Record<string, string> = { Accept: 'application/json' }
  const auth = authHelper.getAuth()
  if (auth?.token) {
    headers.Authorization = `Bearer ${auth.token}`
  }
  return headers
}

function toQuery(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') {
      continue
    }
    search.set(key, String(value))
  }
  const encoded = search.toString()
  return encoded ? `?${encoded}` : ''
}
