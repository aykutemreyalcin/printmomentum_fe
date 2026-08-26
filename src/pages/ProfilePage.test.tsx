import { ProfilePage } from './ProfilePage'
import { seedAuth, stubApi } from '../test/stubApi'
import { renderWithApp } from '../test/renderWithApp'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('ProfilePage', () => {
  afterEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('saves a display name', async () => {
    seedAuth()
    stubApi()
    const user = userEvent.setup()

    renderWithApp(<ProfilePage />)

    const name = await screen.findByLabelText(/^Name/)
    await user.clear(name)
    await user.type(name, 'Pat')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Profile saved')
  })
})
