import { AppRoutes } from '../AppRoutes'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../test/renderWithApp'
import { seedAuth, stubApi } from '../test/stubApi'
import { NicheWindowsPage } from './NicheWindowsPage'

describe('NicheWindowsPage', () => {
  it('renders niche table without copy blurb', async () => {
    seedAuth()
    stubApi({
      niches: [
        {
          slug: 'dolly-parton',
          label: 'dolly parton',
          window: 'OPEN',
          listingCount: 3,
          newEntrants14d: 2,
          cloneDensity7d: 0.1,
          breakInRate: 0.5,
          incumbentAgeDays: 14,
          entrantMomentum: 0.7,
          etsyCount: 1200,
          windowComputedAt: '2026-08-30T12:00:00Z',
          topListing: null,
        },
      ],
    })

    renderWithApp(<NicheWindowsPage />, '/niches')

    await waitFor(() => {
      expect(screen.getByText('dolly parton')).toBeInTheDocument()
    })
    expect(screen.queryByText(/Buyer-intent phrases/i)).not.toBeInTheDocument()
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
    expect(screen.getAllByText('Open').length).toBeGreaterThan(0)
  })

  it('filters niches via search', async () => {
    seedAuth()
    stubApi({
      niches: [
        {
          slug: 'dolly-parton',
          label: 'dolly parton',
          window: 'OPEN',
          listingCount: 3,
          newEntrants14d: 2,
          cloneDensity7d: 0.1,
          breakInRate: 0.5,
          incumbentAgeDays: 14,
          entrantMomentum: 0.7,
          etsyCount: 1200,
          windowComputedAt: '2026-08-30T12:00:00Z',
          topListing: null,
        },
        {
          slug: 'retired-teacher',
          label: 'retired teacher',
          window: 'CLOSING',
          listingCount: 5,
          newEntrants14d: 1,
          cloneDensity7d: 0.2,
          breakInRate: 0.3,
          incumbentAgeDays: 20,
          entrantMomentum: 0.4,
          etsyCount: 800,
          windowComputedAt: '2026-08-30T12:00:00Z',
          topListing: null,
        },
      ],
    })
    const user = userEvent.setup()

    renderWithApp(<NicheWindowsPage />, '/niches')

    await screen.findByText('dolly parton')
    await user.type(screen.getByRole('searchbox'), 'retired')

    await waitFor(() => {
      expect(screen.getByText('retired teacher')).toBeInTheDocument()
      expect(screen.queryByText('dolly parton')).not.toBeInTheDocument()
    })
  })

  it('navigates to feed when a row is clicked', async () => {
    seedAuth()
    stubApi({
      niches: [
        {
          slug: 'dolly-parton',
          label: 'dolly parton',
          window: 'OPEN',
          listingCount: 3,
          newEntrants14d: 2,
          cloneDensity7d: 0.1,
          breakInRate: 0.5,
          incumbentAgeDays: 14,
          entrantMomentum: 0.7,
          etsyCount: 1200,
          windowComputedAt: '2026-08-30T12:00:00Z',
          topListing: null,
        },
      ],
      items: [],
    })
    const user = userEvent.setup()

    renderWithApp(<AppRoutes />, '/niches')

    await screen.findByText('dolly parton')
    const row = document.querySelector('.niches-row')
    expect(row).not.toBeNull()
    await user.click(row!)

    expect(await screen.findByRole('heading', { name: 'Feed' })).toBeInTheDocument()
    expect(screen.getByText('Niche: dolly-parton')).toBeInTheDocument()
  })
})
