import { AuthProvider } from '../auth/AuthProvider'
import { CreateUserPage } from './CreateUserPage'
import { adminBody, seedAuth, stubApi } from '../test/stubApi'
import { AppTheme } from '../theme/AppTheme'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('CreateUserPage', () => {
  afterEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('registers a user as admin', async () => {
    seedAuth()
    stubApi({ user: adminBody })
    const user = userEvent.setup()

    render(
      <AppTheme>
        <AuthProvider>
          <MemoryRouter>
            <CreateUserPage />
          </MemoryRouter>
        </AuthProvider>
      </AppTheme>,
    )

    await user.type(screen.getByLabelText(/Display Name/), 'Fresh')
    await user.type(screen.getByLabelText(/Email/), 'fresh@printmomentum.local')
    await user.type(screen.getByLabelText(/^Password/), 'Secret1')
    await user.type(screen.getByLabelText(/Confirm Password/), 'Secret1')
    await user.click(screen.getByRole('button', { name: 'Register User' }))

    expect(await screen.findByRole('status')).toHaveTextContent('User registered successfully')
  })
})
