import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './AppRoutes'
import { AuthProvider } from './auth/AuthProvider'
import { seedAuth, stubApi, adminBody } from './test/stubApi'
import { AppTheme } from './theme/AppTheme'

const renderAt = (path: string) =>
  render(
    <AppTheme>
      <AuthProvider>
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>
      </AuthProvider>
    </AppTheme>,
  )

describe('AppRoutes', () => {
  beforeEach(() => {
    seedAuth()
    stubApi({ items: [] })
  })

  afterEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('renders the PrintMomentum heading on the feed route', async () => {
    renderAt('/')

    expect(await screen.findByRole('heading', { name: 'PrintMomentum' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Feed' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Favorites' })).toHaveAttribute('href', '/favorites')
  })

  it('renders the favorites route', async () => {
    renderAt('/favorites')

    expect(await screen.findByRole('heading', { name: 'Favorites' })).toBeInTheDocument()
  })

  it('renders the listing detail route for an id', async () => {
    renderAt('/listings/1147645830')

    expect(await screen.findByRole('heading', { name: 'Graphic DTG Print Tee' })).toBeInTheDocument()
  })

  it('renders the shop route for an id', async () => {
    renderAt('/shops/9101')

    expect(await screen.findByRole('heading', { name: 'Shop High' })).toBeInTheDocument()
  })

  it('navigates from detail back to the feed', async () => {
    renderAt('/listings/1147645830')

    await userEvent.click(await screen.findByRole('link', { name: /back to feed/i }))

    expect(screen.getByRole('heading', { name: 'Feed' })).toBeInTheDocument()
  })

  it('shows a not found page for unknown routes', async () => {
    renderAt('/nope')

    expect(await screen.findByText('Error 404')).toBeInTheDocument()
  })

  it('opens change password from the profile menu', async () => {
    renderAt('/')

    await userEvent.click(await screen.findByRole('button', { name: 'User' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Change Password' }))

    expect(await screen.findByRole('heading', { name: 'Change Password' })).toBeInTheDocument()
  })

  it('hides create-user from a regular user and redirects the route', async () => {
    renderAt('/account/members/register-user')

    expect(await screen.findByRole('heading', { name: 'Feed' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Create User' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Register New User' })).not.toBeInTheDocument()
  })

  it('lets admin open the create-user page from the nav', async () => {
    stubApi({ items: [], user: adminBody })
    renderAt('/')

    await userEvent.click(await screen.findByRole('link', { name: 'Create User' }))

    expect(await screen.findByRole('heading', { name: 'Register New User' })).toBeInTheDocument()
  })
})
