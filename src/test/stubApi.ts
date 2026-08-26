import { expect, vi } from 'vitest'
import type { UserResponse } from '../auth/_models'
import { AUTH_LOCAL_STORAGE_KEY } from '../auth/_helpers'

export const healthBody = { status: 'ok', service: 'printmomentum-be' }

export const userBody = {
  id: 2,
  name: 'User',
  displayName: 'User',
  email: 'user@printmomentum.local',
  role: 'user' as const,
  active: true,
}

export const adminBody = {
  id: 1,
  name: 'Admin',
  displayName: 'Admin',
  email: 'admin@printmomentum.local',
  role: 'admin' as const,
  active: true,
}

export function seedAuth() {
  localStorage.setItem(AUTH_LOCAL_STORAGE_KEY, JSON.stringify({ token: 'test-token' }))
}

export function listingFixture(overrides: Record<string, unknown> = {}) {
  return {
    listingId: 9101,
    title: 'Graphic DTG Print Tee',
    price: 24.99,
    currency: 'USD',
    imageUrl: 'https://i.etsystatic.com/9101.jpg',
    etsyUrl: 'https://www.etsy.com/listing/9101',
    daysToTop: 2.0,
    momentumScore: 0.9,
    numFavorers: 12,
    shopName: 'Shop High',
    shopId: 9101,
    ...overrides,
  }
}

export function detailFixture(overrides: Record<string, unknown> = {}) {
  return listingFixture({
    snapshots: [
      { observedAt: '2026-08-20T10:00:00Z', position: 5, numFavorers: 20, views: 400, quantity: 20 },
      { observedAt: '2026-08-21T10:00:00Z', position: 40, numFavorers: 31, views: 520, quantity: 15 },
    ],
    tags: ['graphic', 'print', 'tee'],
    takeaway: ['Entered our top-N in 2.0 days.'],
    queryPeers: [
      {
        query: 'graphic tee',
        position: 3,
        listingCount: 12,
        etsyCount: 18400,
        medianPrice: 28.4,
        medianFavorers: 40,
      },
    ],
    timeline: [{ kind: 'LISTED', at: '2026-08-01T00:00:00Z', label: 'Listed' }],
    quantityDelta: -5,
    ...overrides,
  })
}

export function stubApi(
  options: {
    items?: unknown[]
    favorites?: unknown[]
    detail?: unknown
    shop?: unknown
    queryStats?: unknown[]
    user?: UserResponse
    registerStatus?: number
    changePasswordStatus?: number
    ok?: boolean
    status?: number
    detailOk?: boolean
    detailStatus?: number
    shopOk?: boolean
    shopStatus?: number
  } = {},
) {
  const items = options.items ?? []
  const ok = options.ok ?? true
  const status = options.status ?? (ok ? 200 : 500)
  const detailOk = options.detailOk ?? true
  const detailStatus = options.detailStatus ?? (detailOk ? 200 : 404)
  const shopOk = options.shopOk ?? true
  const shopStatus = options.shopStatus ?? (shopOk ? 200 : 404)
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const method = (init?.method ?? 'GET').toUpperCase()
      if (url.includes('/v1/user/register')) {
        const registerStatus = options.registerStatus ?? 200
        return {
          ok: registerStatus >= 200 && registerStatus < 300,
          status: registerStatus,
          json: async () =>
            registerStatus >= 200 && registerStatus < 300
              ? 3
              : { title: 'Forbidden', status: registerStatus, detail: 'You do not have permission to access this resource.' },
        }
      }
      if (url.includes('/v1/user') && method === 'PATCH') {
        const changePasswordStatus = options.changePasswordStatus ?? 202
        return {
          ok: changePasswordStatus >= 200 && changePasswordStatus < 300,
          status: changePasswordStatus,
          json: async () =>
            changePasswordStatus >= 200 && changePasswordStatus < 300
              ? {}
              : { title: 'Not Acceptable', status: changePasswordStatus, detail: 'Wrong password' },
        }
      }
      if (url.includes('/v1/user')) {
        return { ok: true, status: 200, json: async () => options.user ?? userBody }
      }
      if (url.includes('/v2/auth/login')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ token: 'test-token', expiresInSeconds: 7200, authVersion: 'v2' }),
        }
      }
      if (url.includes('/v2/auth/logout') || url.includes('/v2/auth/refresh')) {
        return { ok: true, status: url.includes('logout') ? 204 : 200, json: async () => ({ token: 'test-token' }) }
      }
      const favoriteMatch = url.match(/\/v1\/listings\/(\d+)\/favorite/)
      if (favoriteMatch) {
        return { ok: true, status: 204, json: async () => ({}) }
      }
      if (url.includes('/v1/favorites')) {
        const favorites = options.favorites ?? []
        return {
          ok: true,
          status: 200,
          json: async () => ({ items: favorites, page: 0, size: 20, total: favorites.length }),
        }
      }
      if (url.includes('/v1/query-stats')) {
        return { ok: true, status: 200, json: async () => options.queryStats ?? [] }
      }
      const shopMatch = url.match(/\/v1\/shops\/(\d+)/)
      if (shopMatch) {
        return {
          ok: shopOk,
          status: shopStatus,
          json: async () =>
            shopOk
              ? (options.shop ?? {
                  shopId: Number(shopMatch[1]),
                  name: 'Shop High',
                  url: 'https://www.etsy.com/shop/ShopHigh',
                  transactionSoldCount: 1280,
                  listingActiveCount: 42,
                  reviewCount: 310,
                  reviewAverage: 4.8,
                  ageDays: 1600,
                  indexedListingCount: items.length,
                })
              : { title: 'Not Found', status: shopStatus, detail: 'shop not found' },
        }
      }
      const detailMatch = url.match(/\/v1\/listings\/(\d+)/)
      if (detailMatch) {
        return {
          ok: detailOk,
          status: detailStatus,
          json: async () =>
            detailOk
              ? (options.detail ?? detailFixture({ listingId: Number(detailMatch[1]) }))
              : { title: 'Not Found', status: detailStatus, detail: 'listing not found' },
        }
      }
      if (url.includes('/v1/listings')) {
        return {
          ok,
          status,
          json: async () =>
            ok
              ? { items, page: 0, size: 20, total: items.length }
              : { title: 'Error', status, detail: 'upstream failed' },
        }
      }
      return {
        ok: true,
        status: 200,
        json: async () => healthBody,
      }
    }),
  )
}

export const authedFetch = {
  credentials: 'include',
  headers: expect.objectContaining({ Accept: 'application/json' }),
}
