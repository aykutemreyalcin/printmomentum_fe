import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { ApiError } from '../api/ApiError'
import { useAuth } from '../auth/AuthProvider'
import { usePageTitle } from '../hooks/usePageTitle'
import { translateApiError, useI18n } from '../i18n/I18nProvider'
import { ShellControls } from '../components/ShellControls'
import './LoginPage.css'

export function LoginPage() {
  usePageTitle('title.signIn')
  const { t } = useI18n()
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
      const detail = cause instanceof ApiError ? cause.detail : undefined
      setError(translateApiError(detail, t, 'auth.loginFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-shell">
      <header className="login-head">
        <p className="login-mark">
          <img src="/pm-logo.png" alt="" width={28} height={28} className="login-logo" />
          PrintMomentum
        </p>
        <span className="label">{t('brand.tagline')}</span>
        <ShellControls />
      </header>
      <div className="login">
        <p className="label">{t('auth.account')}</p>
        <h1>{t('auth.signIn')}</h1>
        <p className="login-copy">{t('auth.copy')}</p>
        <form className="login-form" onSubmit={onSubmit}>
          <label>
            <span className="label">{t('auth.email')}</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            <span className="label">{t('auth.password')}</span>
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
            {submitting ? t('auth.signInBusy') : t('auth.signIn')}
          </button>
        </form>
      </div>
    </div>
  )
}
