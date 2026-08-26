import { useState, type FormEvent } from 'react'
import { ApiError } from '../api/ApiError'
import { registerUser } from '../api/client'
import './AccountForm.css'

const MIN_PASSWORD_LENGTH = 6

export function CreateUserPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'user' | 'admin'>('user')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required')
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setSubmitting(true)
    try {
      await registerUser({
        email: email.trim(),
        password,
        name: name.trim(),
        displayName: name.trim(),
        role,
      })
      setSuccess('User registered successfully')
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setRole('user')
    } catch (cause) {
      setError(cause instanceof ApiError ? (cause.detail ?? cause.message) : 'Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="account-page">
      <div className="account-card account-card-wide">
        <p className="label">Members</p>
        <h2>Register New User</h2>
        <p className="account-copy">Create a new user account with appropriate access</p>
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
          <div className="account-grid">
            <label>
              <span className="label">
                Display Name <span className="account-required">*</span>
              </span>
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
            <label>
              <span className="label">
                Email <span className="account-required">*</span>
              </span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label>
              <span className="label">User Role</span>
              <select value={role} onChange={(event) => setRole(event.target.value as 'user' | 'admin')}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <span />
            <label>
              <span className="label">
                Password <span className="account-required">*</span>
              </span>
              <span className="account-password">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button type="button" className="account-reveal" onClick={() => setShowPassword((open) => !open)}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </span>
            </label>
            <label>
              <span className="label">
                Confirm Password <span className="account-required">*</span>
              </span>
              <span className="account-password">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
                <button type="button" className="account-reveal" onClick={() => setShowConfirm((open) => !open)}>
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </span>
            </label>
          </div>
          <div className="account-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? 'Registering…' : 'Register User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
