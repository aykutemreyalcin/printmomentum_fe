import { vi } from 'vitest'

export const healthBody = { status: 'ok', service: 'printmomentum-be' }

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
    ...overrides,
  }
}

export function detailFixture(overrides: Record<string, unknown> = {}) {
  return listingFixture({
    snapshots: [
      { observedAt: '2026-08-20T10:00:00Z', position: 5, numFavorers: 20 },
      { observedAt: '2026-08-21T10:00:00Z', position: 40, numFavorers: 31 },
    ],
    ...overrides,
  })
}

export function stubApi(
  options: {
    items?: unknown[]
    detail?: unknown
    ok?: boolean
    status?: number
    detailOk?: boolean
    detailStatus?: number
  } = {},
) {
  const items = options.items ?? []
  const ok = options.ok ?? true
  const status = options.status ?? (ok ? 200 : 500)
  const detailOk = options.detailOk ?? true
  const detailStatus = options.detailStatus ?? (detailOk ? 200 : 404)
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
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
