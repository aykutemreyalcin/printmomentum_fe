import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../test/renderWithApp'
import { seedAuth, stubApi } from '../test/stubApi'
import { NicheWindowsPage } from './NicheWindowsPage'

describe('NicheWindowsPage', () => {
  it('renders niche table', async () => {
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
    expect(screen.getAllByText('Open').length).toBeGreaterThan(0)
  })
})
