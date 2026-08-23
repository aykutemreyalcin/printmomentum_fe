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

export function stubApi(options: { items?: unknown[]; ok?: boolean; status?: number } = {}) {
  const items = options.items ?? []
  const ok = options.ok ?? true
  const status = options.status ?? (ok ? 200 : 500)
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
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
