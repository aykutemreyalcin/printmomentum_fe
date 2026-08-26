import { CreateUserPage } from './CreateUserPage'
import { MembersPage } from './MembersPage'
import { adminBody, seedAuth, stubApi } from '../test/stubApi'
import { renderWithApp } from '../test/renderWithApp'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('CreateUserPage', () => {
  afterEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('registers a user as admin and returns to members', async () => {
    seedAuth()
    stubApi({ user: adminBody })
    const user = userEvent.setup()

    renderWithApp(
      <Routes>
        <Route path="/account/members/register-user" element={<CreateUserPage />} />
        <Route path="/account/members" element={<MembersPage />} />
      </Routes>,
      '/account/members/register-user',
    )

    await user.type(screen.getByLabelText(/Display Name/), 'Fresh')
    await user.type(screen.getByLabelText(/Email/), 'fresh@printmomentum.local')
    await user.type(screen.getByLabelText(/^Password/), 'Secret1')
    await user.type(screen.getByLabelText(/Confirm Password/), 'Secret1')
    await user.click(screen.getByRole('button', { name: 'Register User' }))

    expect(await screen.findByRole('heading', { name: 'Accounts' })).toBeInTheDocument()
    expect(await screen.findByRole('status')).toHaveTextContent('User registered successfully')
  })
})
