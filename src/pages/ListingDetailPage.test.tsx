import { screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ListingDetailPage } from './ListingDetailPage'
import { detailFixture, stubApi } from '../test/stubApi'
import { renderWithApp } from '../test/renderWithApp'

function renderDetail(path: string) {
  return renderWithApp(
    <Routes>
      <Route path="/listings/:listingId" element={<ListingDetailPage />} />
    </Routes>,
    path,
  )
}

describe('ListingDetailPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the listing and an outbound Etsy link', async () => {
    stubApi({
      detail: detailFixture({
        title: 'Graphic DTG Print Tee',
        etsyUrl: 'https://www.etsy.com/listing/9101',
      }),
    })

    renderDetail('/listings/9101')

    expect(await screen.findByRole('heading', { name: 'Graphic DTG Print Tee' })).toBeInTheDocument()
    const etsy = screen.getByRole('link', { name: 'View on Etsy' })
    expect(etsy).toHaveAttribute('href', 'https://www.etsy.com/listing/9101')
    expect(etsy).toHaveAttribute('target', '_blank')
    expect(etsy).toHaveAttribute('rel', 'noreferrer')
    expect(screen.getByRole('button', { name: 'Copy all tags' })).toBeInTheDocument()
    expect(screen.getByText('Entered our top-N in 2.0 days.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Rank 3 for “graphic tee”/ })).toBeInTheDocument()
    expect(screen.getByText('Listed —')).toBeInTheDocument()
  })

  it('shows a 404 message when the listing is missing', async () => {
    stubApi({ detailOk: false, detailStatus: 404 })

    renderDetail('/listings/999')

    expect(await screen.findByText('Error 404')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'This listing is not on the index.' })).toBeInTheDocument()
  })
})
