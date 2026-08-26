import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from './ApiError'
import { changePassword, getHealth, getListing, getListings, getQueryStats, getShop, registerUser } from './client'
import type { ListingPage } from './types'

const listing = {
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
}

function jsonResponse(body: unknown, status = 200, contentType = 'application/json') {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    headers: new Headers({ 'content-type': contentType }),
  }
}

describe('api client', () => {
  afterEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('maps a listings page from GET /api/v1/listings', async () => {
    const page: ListingPage = { items: [listing], page: 0, size: 20, total: 1 }
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(page))
    vi.stubGlobal('fetch', fetchMock)

    const result = await getListings({ q: 'graphic', size: 20 })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/listings?size=20&q=graphic',
      expect.objectContaining({ credentials: 'include' }),
    )
    expect(result.items).toHaveLength(1)
    expect(result.items[0].listingId).toBe(9101)
    expect(result.items[0].daysToTop).toBe(2.0)
    expect(result.items[0].momentumScore).toBe(0.9)
  })

  it('throws ApiError with status 500 when the list request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          { title: 'Internal Server Error', status: 500, detail: 'upstream failed' },
          500,
          'application/problem+json',
        ),
      ),
    )

    const error = await getListings().catch((cause: unknown) => cause)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 500,
      title: 'Internal Server Error',
      detail: 'upstream failed',
      message: 'upstream failed',
    })
  })

  it('maps health from GET /api/v1/health', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ status: 'ok', service: 'printmomentum-be' }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(getHealth()).resolves.toEqual({ status: 'ok', service: 'printmomentum-be' })
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/health',
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('maps listing detail including snapshots', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        ...listing,
        snapshots: [
          { observedAt: '2026-08-20T10:00:00Z', position: 5, numFavorers: 20 },
          { observedAt: '2026-08-21T10:00:00Z', position: 40, numFavorers: 31 },
        ],
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const detail = await getListing(9101)

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/listings/9101',
      expect.objectContaining({ credentials: 'include' }),
    )
    expect(detail.snapshots).toHaveLength(2)
    expect(detail.snapshots[1].position).toBe(40)
  })

  it('maps shop and query-stats', async () => {
    const shop = {
      shopId: 44,
      name: 'Atlas Prints',
      url: 'https://www.etsy.com/shop/AtlasPrints',
      indexedListingCount: 1,
    }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(shop))
      .mockResolvedValueOnce(jsonResponse([{ query: 'graphic tee', observedDay: '2026-08-26', listingCount: 4 }]))
    vi.stubGlobal('fetch', fetchMock)

    await expect(getShop(44)).resolves.toEqual(shop)
    await expect(getQueryStats()).resolves.toEqual([
      { query: 'graphic tee', observedDay: '2026-08-26', listingCount: 4 },
    ])
    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/v1/shops/44', expect.objectContaining({ credentials: 'include' }))
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/v1/query-stats',
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('sends Bearer token when auth is stored', async () => {
    localStorage.setItem('printmomentum-auth-v1', JSON.stringify({ token: 'jwt-token' }))
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ items: [], page: 0, size: 20, total: 0 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await getListings()

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/listings', {
      credentials: 'include',
      headers: { Accept: 'application/json', Authorization: 'Bearer jwt-token' },
    })
  })

  it('sends PUT when favoriting a listing', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => ({}),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { setListingFavorite } = await import('./client')
    await setListingFavorite(9101, true)

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/listings/9101/favorite',
      expect.objectContaining({ method: 'PUT', credentials: 'include' }),
    )
  })

  it('patches the current user password', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 202,
      json: async () => ({}),
    })
    vi.stubGlobal('fetch', fetchMock)

    await changePassword({
      currentPassword: 'User123!',
      newPassword: 'NewPass1',
      confirmationPassword: 'NewPass1',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/user',
      expect.objectContaining({
        method: 'PATCH',
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: 'User123!',
          newPassword: 'NewPass1',
          confirmationPassword: 'NewPass1',
        }),
      }),
    )
  })

  it('posts a new user to register', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(4))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      registerUser({
        email: 'fresh@printmomentum.local',
        password: 'Secret1',
        name: 'Fresh',
        role: 'user',
      }),
    ).resolves.toBe(4)

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/user/register',
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    )
  })
})
