import { ChangePasswordPage } from './ChangePasswordPage'
import { seedAuth, stubApi } from '../test/stubApi'
import { renderWithApp } from '../test/renderWithApp'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('ChangePasswordPage', () => {
  afterEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('submits current and new passwords', async () => {
    seedAuth()
    stubApi()
    const user = userEvent.setup()

    renderWithApp(<ChangePasswordPage />)

    await user.type(screen.getByLabelText('Current Password'), 'User123!')
    await user.type(screen.getByLabelText('New Password'), 'NewPass1')
    await user.type(screen.getByLabelText('Confirm New Password'), 'NewPass1')
    await user.click(screen.getByRole('button', { name: 'Change Password' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Your password has been changed successfully')
  })

  it('shows an error when the current password is wrong', async () => {
    seedAuth()
    stubApi({ changePasswordStatus: 406 })
    const user = userEvent.setup()

    renderWithApp(<ChangePasswordPage />)

    await user.type(screen.getByLabelText('Current Password'), 'wrong')
    await user.type(screen.getByLabelText('New Password'), 'NewPass1')
    await user.type(screen.getByLabelText('Confirm New Password'), 'NewPass1')
    await user.click(screen.getByRole('button', { name: 'Change Password' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Wrong password')
  })
})
