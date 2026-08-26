import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ShopPage } from './ShopPage'
import { listingFixture, stubApi } from '../test/stubApi'
import { renderWithApp } from '../test/renderWithApp'

function renderShop(path: string) {
  return renderWithApp(
    <Routes>
      <Route path="/shops/:shopId" element={<ShopPage />} />
    </Routes>,
    path,
  )
}

describe('ShopPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows shop sales, age, and climbers', async () => {
    stubApi({
      shop: {
        shopId: 44001,
        name: 'Atlas Prints',
        url: 'https://www.etsy.com/shop/AtlasPrints',
        transactionSoldCount: 1280,
        listingActiveCount: 42,
        reviewCount: 310,
        reviewAverage: 4.8,
        ageDays: 1600,
        indexedListingCount: 1,
      },
      items: [listingFixture({ listingId: 2, title: 'Fast Tee', shopId: 44001, shopName: 'Atlas Prints' })],
    })

    renderShop('/shops/44001')

    expect(await screen.findByRole('heading', { name: 'Atlas Prints' })).toBeInTheDocument()
    expect(screen.getByText('1,280')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View shop on Etsy' })).toHaveAttribute(
      'href',
      'https://www.etsy.com/shop/AtlasPrints',
    )
    expect(screen.getByText('Fast Tee')).toBeInTheDocument()
  })

  it('shows a 404 when the shop is missing', async () => {
    stubApi({ shopOk: false, shopStatus: 404 })

    renderShop('/shops/9')

    expect(await screen.findByText('Error 404')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'This shop is not on the index.' })).toBeInTheDocument()
  })
})
