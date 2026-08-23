import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FeedPage } from './FeedPage'
import { listingFixture, stubApi } from '../test/stubApi'

describe('FeedPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows titles and days-to-top for two listings', async () => {
    stubApi({
      items: [
        listingFixture({ listingId: 1, title: 'Y2K Chrome Butterfly Baby Tee', daysToTop: 1.6 }),
        listingFixture({ listingId: 2, title: 'Retro Sunset Cassette Graphic Tee', daysToTop: 2.1 }),
      ],
    })

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Y2K Chrome Butterfly Baby Tee')).toBeInTheDocument()
    expect(screen.getByText('Retro Sunset Cassette Graphic Tee')).toBeInTheDocument()
    expect(screen.getByText('1.6')).toBeInTheDocument()
    expect(screen.getByText('2.1')).toBeInTheDocument()
  })

  it('shows empty-state copy when the list is empty', async () => {
    stubApi({ items: [] })

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('No printable tees match. Widen filters.')).toBeInTheDocument()
  })

  it('shows skeletons while the feed is loading', () => {
    stubApi({ items: [] })
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    )

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('feed-skeleton')).toBeInTheDocument()
  })
})
