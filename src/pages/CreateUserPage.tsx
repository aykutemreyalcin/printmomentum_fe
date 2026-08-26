import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ApiError } from '../api/ApiError'
import { registerUser } from '../api/client'
import { usePageTitle } from '../hooks/usePageTitle'
import { translateApiError, useI18n } from '../i18n/I18nProvider'
import { useToast } from '../components/Toast'
import './AccountForm.css'

const MIN_PASSWORD_LENGTH = 6

export function CreateUserPage() {
  usePageTitle('title.createUser')
  const { t } = useI18n()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'user' | 'admin'>('user')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (!name.trim() || !email.trim()) {
      setError(t('register.nameEmail'))
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t('account.minPassword', { n: MIN_PASSWORD_LENGTH }))
      return
    }
    if (password !== confirmPassword) {
      setError(t('account.mismatch'))
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
      showToast(t('register.ok'))
      navigate('/account/members')
    } catch (cause) {
      const detail = cause instanceof ApiError ? cause.detail : undefined
      setError(translateApiError(detail, t, 'register.fail'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="account-page">
      <div className="account-card account-card-wide">
        <p className="label">{t('members.label')}</p>
        <h2>{t('register.title')}</h2>
        <p className="account-copy">{t('register.copy')}</p>
        <p className="account-copy">
          <Link to="/account/members">{t('register.back')}</Link>
        </p>
        {error && (
          <p className="account-alert account-alert-error" role="alert">
            {error}
          </p>
        )}
        <form className="account-form" onSubmit={onSubmit} noValidate>
          <div className="account-grid">
            <label>
              <span className="label">
                {t('register.displayName')} <span className="account-required">*</span>
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
                {t('register.email')} <span className="account-required">*</span>
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
              <span className="label">{t('register.role')}</span>
              <select value={role} onChange={(event) => setRole(event.target.value as 'user' | 'admin')}>
                <option value="user">{t('register.roleUser')}</option>
                <option value="admin">{t('register.roleAdmin')}</option>
              </select>
            </label>
            <span />
            <label>
              <span className="label">
                {t('register.password')} <span className="account-required">*</span>
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
                  {showPassword ? t('account.hide') : t('account.show')}
                </button>
              </span>
            </label>
            <label>
              <span className="label">
                {t('register.confirm')} <span className="account-required">*</span>
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
                  {showConfirm ? t('account.hide') : t('account.show')}
                </button>
              </span>
            </label>
          </div>
          <div className="account-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? t('register.busy') : t('register.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
