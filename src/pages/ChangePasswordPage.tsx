import { useState, type FormEvent } from 'react'
import { ApiError } from '../api/ApiError'
import { changePassword } from '../api/client'
import './AccountForm.css'

const MIN_PASSWORD_LENGTH = 6

export function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmationPassword, setConfirmationPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
      return
    }
    if (newPassword !== confirmationPassword) {
      setError('Passwords do not match')
      return
    }
    setSubmitting(true)
    try {
      await changePassword({ currentPassword, newPassword, confirmationPassword })
      setSuccess('Your password has been changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmationPassword('')
    } catch (cause) {
      setError(cause instanceof ApiError ? (cause.detail ?? cause.message) : 'Password change failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="account-page">
      <div className="account-card">
        <p className="label">Security</p>
        <h2>Change Password</h2>
        <p className="account-copy">Change your password to enhance your account security</p>
        {error && (
          <p className="account-alert account-alert-error" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="account-alert account-alert-ok" role="status">
            {success}
          </p>
        )}
        <form className="account-form" onSubmit={onSubmit} noValidate>
          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            shown={showCurrent}
            onToggle={() => setShowCurrent((open) => !open)}
            autoComplete="current-password"
          />
          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            shown={showNew}
            onToggle={() => setShowNew((open) => !open)}
            autoComplete="new-password"
          />
          <PasswordField
            label="Confirm New Password"
            value={confirmationPassword}
            onChange={setConfirmationPassword}
            shown={showConfirm}
            onToggle={() => setShowConfirm((open) => !open)}
            autoComplete="new-password"
          />
          <button type="submit" disabled={submitting}>
            {submitting ? 'Processing…' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  shown,
  onToggle,
  autoComplete,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  shown: boolean
  onToggle: () => void
  autoComplete: string
}) {
  return (
    <label>
      <span className="label">{label}</span>
      <span className="account-password">
        <input
          type={shown ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
        />
        <button type="button" className="account-reveal" onClick={onToggle}>
          {shown ? 'Hide' : 'Show'}
        </button>
      </span>
    </label>
  )
}
