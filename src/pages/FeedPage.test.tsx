import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FeedPage } from './FeedPage'
import { renderWithApp } from '../test/renderWithApp'
import { listingFixture, stubApi } from '../test/stubApi'

describe('FeedPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('shows titles and days-to-top for two listings', async () => {
    stubApi({
      items: [
        listingFixture({ listingId: 1, title: 'Y2K Chrome Butterfly Baby Tee', daysToTop: 1.6 }),
        listingFixture({ listingId: 2, title: 'Retro Sunset Cassette Graphic Tee', daysToTop: 2.1 }),
      ],
    })

    renderWithApp(<FeedPage />)

    expect(await screen.findByText('Y2K Chrome...')).toBeInTheDocument()
    expect(screen.getByText('Retro Sunset...')).toBeInTheDocument()
    expect(screen.queryByText('Y2K Chrome Butterfly Baby Tee')).not.toBeInTheDocument()
    expect(screen.getByText('1.6')).toBeInTheDocument()
    expect(screen.getByText('2.1')).toBeInTheDocument()
  })

  it('shows empty-state copy when the list is empty', async () => {
    stubApi({ items: [] })

    renderWithApp(<FeedPage />)

    expect(await screen.findByText('No printable tees match. Widen filters.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeDisabled()
  })

  it('explains a pending first crawl when the index has zero listings', async () => {
    stubApi({
      items: [],
      health: {
        status: 'ok',
        service: 'printmomentum-be',
        indexedListings: 0,
        lastCrawlAt: null,
        nextCrawlAt: '2026-08-26T21:00:00.000Z',
        lastOutcome: 'never',
      },
    })

    renderWithApp(<FeedPage />)

    expect(await screen.findByText(/Index is empty/)).toBeInTheDocument()
    expect(screen.getByText(/Europe\/Istanbul/)).toBeInTheDocument()
  })

  it('shows skeletons while the feed is loading', () => {
    stubApi({ items: [] })
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    )

    renderWithApp(<FeedPage />)

    expect(screen.getByTestId('feed-skeleton')).toBeInTheDocument()
  })

  it('renders a listings table instead of a marketing grid', async () => {
    stubApi({ items: [] })

    renderWithApp(<FeedPage />)

    await screen.findByText('No printable tees match. Widen filters.')
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /momentum/i })).toBeInTheDocument()
  })

  it('expands a listing row to show the detail panel', async () => {
    stubApi({
      items: [listingFixture({ listingId: 2, title: 'Fast Tee', momentumScore: 2.4 })],
    })
    const user = userEvent.setup()

    renderWithApp(<FeedPage />)

    await screen.findByText('Fast Tee')
    await user.click(screen.getByRole('button', { name: 'Expand' }))

    expect(await screen.findByRole('link', { name: 'View on Etsy' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open listing' })).toHaveAttribute('href', '/listings/2')
  })

  it('filters the feed to bestsellers without clearing other presets', async () => {
    stubApi({ items: [] })
    const fetchMock = vi.mocked(fetch)
    const user = userEvent.setup()

    renderWithApp(<FeedPage />)

    await user.click(await screen.findByRole('button', { name: 'Bestsellers only' }))

    await waitFor(() => {
      expect(fetchMock.mock.calls.some((call) => String(call[0]).includes('bestseller=true'))).toBe(true)
    })
  })

  it('calls the listings API with maxDaysToTop=7 when the filter is set', async () => {
    stubApi({ items: [] })
    const fetchMock = vi.mocked(fetch)
    const user = userEvent.setup()

    renderWithApp(<FeedPage />)

    await user.type(screen.getByLabelText('Max days to top'), '7')

    await waitFor(() => {
      expect(fetchMock.mock.calls.some((call) => String(call[0]).includes('maxDaysToTop=7'))).toBe(true)
    })
  })

  it('reads maxDaysToTop from the URL on load', async () => {
    stubApi({ items: [] })
    const fetchMock = vi.mocked(fetch)

    renderWithApp(<FeedPage />, '/?maxDaysToTop=7')

    await waitFor(() => {
      expect(fetchMock.mock.calls.some((call) => String(call[0]).includes('maxDaysToTop=7'))).toBe(true)
    })
  })

  it('recovers the feed after retrying a 503', async () => {
    const listing = listingFixture({ title: 'Y2K Chrome Butterfly Baby Tee' })
    let listingsCalls = 0
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/v1/query-stats')) {
        return { ok: true, status: 200, json: async () => [] }
      }
      listingsCalls += 1
      if (listingsCalls === 1) {
        return {
          ok: false,
          status: 503,
          json: async () => ({
            title: 'Service Unavailable',
            status: 503,
            detail: 'Etsy Open API is unavailable',
          }),
        }
      }
      return { ok: true, status: 200, json: async () => ({ items: [listing], page: 0, size: 20, total: 1 }) }
    })
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()

    renderWithApp(<FeedPage />)

    expect(await screen.findByText('Service Unavailable')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('Y2K Chrome...')).toBeInTheDocument()
  })

  it('shows the full listing title on hover and copies it', async () => {
    stubApi({
      items: [listingFixture({ listingId: 1, title: 'Y2K Chrome Butterfly Baby Tee' })],
    })
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(writeText)

    renderWithApp(<FeedPage />)

    const truncated = await screen.findByText('Y2K Chrome...')
    await user.hover(truncated)
    expect(await screen.findByRole('tooltip', { name: 'Y2K Chrome Butterfly Baby Tee' })).toBeInTheDocument()

    await user.unhover(truncated)
    await user.click(screen.getByRole('button', { name: 'Copy listing title' }))
    expect(writeText).toHaveBeenCalledWith('Y2K Chrome Butterfly Baby Tee')
  })

  it('favorites a listing from the feed table', async () => {
    stubApi({
      items: [listingFixture({ listingId: 1, title: 'Y2K Chrome Butterfly Baby Tee', favorite: false })],
    })
    const user = userEvent.setup()

    renderWithApp(<FeedPage />)

    const heart = await screen.findByRole('button', { name: 'Add to favorites' })
    await user.click(heart)

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      '/api/v1/listings/1/favorite',
      expect.objectContaining({ method: 'PUT', credentials: 'include' }),
    )
    expect(await screen.findByRole('button', { name: 'Remove from favorites' })).toBeInTheDocument()
  })

  it('filters the feed when a competition query is selected', async () => {
    stubApi({
      items: [],
      queryStats: [
        {
          query: 'teacher shirt',
          observedDay: '2026-08-26',
          listingCount: 8,
          etsyCount: 4200,
          medianPrice: 26.5,
        },
      ],
    })
    const user = userEvent.setup()

    renderWithApp(<FeedPage />)

    await user.click(await screen.findByRole('button', { name: /teacher shirt/i }))

    await waitFor(() => {
      expect(vi.mocked(fetch).mock.calls.some((call) => String(call[0]).includes('q=teacher+shirt'))).toBe(true)
    })
  })
})
