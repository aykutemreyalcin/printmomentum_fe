import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { ApiError } from '../api/ApiError'
import { useAuth } from '../auth/AuthProvider'
import './LoginPage.css'

export function LoginPage() {
  const { auth, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (auth) {
    return <Navigate to={from} replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (cause) {
      setError(cause instanceof ApiError ? (cause.detail ?? cause.message) : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-shell">
      <header className="login-head">
        <p className="login-mark">PrintMomentum</p>
        <span className="label">Print-tee index</span>
      </header>
      <div className="login">
        <p className="label">Account</p>
        <h1>Sign in</h1>
        <p className="login-copy">Same feed for every account. Admin and user both see the ranked print-tee list.</p>
        <form className="login-form" onSubmit={onSubmit}>
          <label>
            <span className="label">Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            <span className="label">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
