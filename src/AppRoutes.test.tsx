import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './AppRoutes'
import { seedAuth, stubApi, adminBody } from './test/stubApi'
import { renderWithApp } from './test/renderWithApp'

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
    renderWithApp(<AppRoutes />, '/')

    expect(await screen.findByRole('heading', { name: 'PrintMomentum' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Feed' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Favorites/i })).toHaveAttribute('href', '/favorites')
  })

  it('renders the favorites route', async () => {
    renderWithApp(<AppRoutes />, '/favorites')

    expect(await screen.findByRole('heading', { name: 'Favorites' })).toBeInTheDocument()
  })

  it('renders the listing detail route for an id', async () => {
    renderWithApp(<AppRoutes />, '/listings/1147645830')

    expect(await screen.findByRole('heading', { name: 'Graphic DTG Print Tee' })).toBeInTheDocument()
  })

  it('renders the shop route for an id', async () => {
    renderWithApp(<AppRoutes />, '/shops/9101')

    expect(await screen.findByRole('heading', { name: 'Shop High' })).toBeInTheDocument()
  })

  it('navigates from detail back to the feed', async () => {
    renderWithApp(<AppRoutes />, '/listings/1147645830')

    await userEvent.click(await screen.findByRole('link', { name: /back to feed/i }))

    expect(screen.getByRole('heading', { name: 'Feed' })).toBeInTheDocument()
  })

  it('shows a not found page for unknown routes', async () => {
    renderWithApp(<AppRoutes />, '/nope')

    expect(await screen.findByText('Error 404')).toBeInTheDocument()
  })

  it('opens change password from the profile menu', async () => {
    renderWithApp(<AppRoutes />, '/')

    await userEvent.click(await screen.findByRole('button', { name: 'User' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Change Password' }))

    expect(await screen.findByRole('heading', { name: 'Change Password' })).toBeInTheDocument()
  })

  it('hides members from a regular user and redirects the route', async () => {
    renderWithApp(<AppRoutes />, '/account/members/register-user')

    expect(await screen.findByRole('heading', { name: 'Feed' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Members' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Register New User' })).not.toBeInTheDocument()
  })

  it('lets admin open members then create-user', async () => {
    stubApi({ items: [], user: adminBody })
    renderWithApp(<AppRoutes />, '/')

    await userEvent.click(await screen.findByRole('link', { name: 'Members' }))

    expect(await screen.findByRole('heading', { name: 'Accounts' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'Create user' }))
    expect(await screen.findByRole('heading', { name: 'Register New User' })).toBeInTheDocument()
  })

  it('opens account from the profile menu', async () => {
    renderWithApp(<AppRoutes />, '/')

    await userEvent.click(await screen.findByRole('button', { name: 'User' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Account' }))

    expect(await screen.findByRole('heading', { name: 'Account' })).toBeInTheDocument()
  })
})
