import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchAllListings, fetchListingsByIds } from './exportListings'
import { listingFixture } from '../test/stubApi'

describe('exportListings', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches every page for export all', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('page=0')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            items: Array.from({ length: 200 }, (_, index) => listingFixture({ listingId: index + 1 })),
            page: 0,
            size: 200,
            total: 201,
          }),
        }
      }
      if (url.includes('page=1')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            items: [listingFixture({ listingId: 201 })],
            page: 1,
            size: 200,
            total: 201,
          }),
        }
      }
      throw new Error(`unexpected ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    const items = await fetchAllListings({})

    expect(items).toHaveLength(201)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('loads selected listings by id', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/v1/listings/42')) {
        return {
          ok: true,
          status: 200,
          json: async () => listingFixture({ listingId: 42, title: 'Selected tee' }),
        }
      }
      throw new Error(`unexpected ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    const items = await fetchListingsByIds([42])

    expect(items).toHaveLength(1)
    expect(items[0]?.title).toBe('Selected tee')
  })
})
