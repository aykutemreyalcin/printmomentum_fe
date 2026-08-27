import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ChartsPage } from './ChartsPage'
import { detailFixture } from '../test/stubApi'
import { renderWithApp } from '../test/renderWithApp'
import { stubApi } from '../test/stubApi'

describe('ChartsPage', () => {
  it('renders chart and selects a listing on line click', async () => {
    stubApi({
      topChart: [
        detailFixture({ listingId: 1, title: 'Fast Tee Alpha' }),
        detailFixture({ listingId: 2, title: 'Slow Tee Beta' }),
      ],
    })
    renderWithApp(<ChartsPage />, '/charts')

    expect(await screen.findByRole('heading', { name: 'Top momentum chart' })).toBeInTheDocument()
    expect(screen.getByText('Fast Tee Alpha')).toBeInTheDocument()

    const lines = document.querySelectorAll('.multi-line-chart-line')
    expect(lines.length).toBeGreaterThan(0)
    await userEvent.click(lines[1]!)
    expect(screen.getByText('Slow Tee Beta')).toBeInTheDocument()
  })
})
