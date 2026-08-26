import { AuthProvider } from '../auth/AuthProvider'
import { LoginPage } from './LoginPage'
import { stubApi } from '../test/stubApi'
import { AppTheme } from '../theme/AppTheme'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('LoginPage', () => {
  afterEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('signs in and stores the access token', async () => {
    stubApi()
    const user = userEvent.setup()

    render(
      <AppTheme>
        <AuthProvider>
          <MemoryRouter>
            <LoginPage />
          </MemoryRouter>
        </AuthProvider>
      </AppTheme>,
    )

    await user.type(screen.getByLabelText('Email'), 'user@printmomentum.local')
    await user.type(screen.getByLabelText('Password'), 'User123!')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await vi.waitFor(() => {
      expect(localStorage.getItem('printmomentum-auth-v1')).toContain('test-token')
    })
  })
})
