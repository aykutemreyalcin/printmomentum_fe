import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './AppRoutes'
import { stubApi } from './test/stubApi'

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )

describe('AppRoutes', () => {
  beforeEach(() => {
    stubApi({ items: [] })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the PrintMomentum heading on the feed route', () => {
    renderAt('/')

    expect(screen.getByRole('heading', { name: 'PrintMomentum' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /not tees that sat/i })).toBeInTheDocument()
  })

  it('renders the listing detail route for an id', async () => {
    renderAt('/listings/1147645830')

    expect(await screen.findByRole('heading', { name: 'Graphic DTG Print Tee' })).toBeInTheDocument()
  })

  it('navigates from detail back to the feed', async () => {
    renderAt('/listings/1147645830')

    await userEvent.click(await screen.findByRole('link', { name: /back to feed/i }))

    expect(screen.getByRole('heading', { name: /not tees that sat/i })).toBeInTheDocument()
  })

  it('shows a not found page for unknown routes', () => {
    renderAt('/nope')

    expect(screen.getByText('Error 404')).toBeInTheDocument()
  })
})
