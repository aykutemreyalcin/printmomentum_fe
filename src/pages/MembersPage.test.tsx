import { MembersPage } from './MembersPage'
import { adminBody, seedAuth, stubApi, userBody } from '../test/stubApi'
import { renderWithApp } from '../test/renderWithApp'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('MembersPage', () => {
  afterEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('lists members and deactivates after confirm', async () => {
    seedAuth()
    stubApi({ user: adminBody, members: [adminBody, userBody] })
    const user = userEvent.setup()

    renderWithApp(<MembersPage />)

    expect(await screen.findByText('user@printmomentum.local')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Deactivate' }))
    await user.click(screen.getByRole('button', { name: 'Confirm deactivate' }))
    expect(await screen.findByRole('status')).toHaveTextContent('user@printmomentum.local is deactivated')
  })
})
