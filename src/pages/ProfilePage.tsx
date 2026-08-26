import { useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../api/ApiError'
import { updateProfile } from '../api/client'
import { usePageTitle } from '../hooks/usePageTitle'
import { translateApiError, useI18n } from '../i18n/I18nProvider'
import { useToast } from '../components/Toast'
import './AccountForm.css'

export function ProfilePage() {
  usePageTitle('title.account')
  const { t } = useI18n()
  const { currentUser, setCurrentUser, logout } = useAuth()
  const { showToast } = useToast()
  const [name, setName] = useState(currentUser?.name ?? '')
  const [displayName, setDisplayName] = useState(currentUser?.displayName ?? currentUser?.name ?? '')
  const [email, setEmail] = useState(currentUser?.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    setName(currentUser.name ?? '')
    setDisplayName(currentUser.displayName ?? currentUser.name ?? '')
    setEmail(currentUser.email)
  }, [currentUser])

  const emailChanged = email.trim().toLowerCase() !== (currentUser?.email ?? '').toLowerCase()

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError(t('profile.nameRequired'))
      return
    }
    if (emailChanged && !currentPassword) {
      setError(t('errors.currentPassword'))
      return
    }
    setSubmitting(true)
    try {
      const body: Parameters<typeof updateProfile>[0] = {
        name: name.trim(),
        displayName: displayName.trim() || name.trim(),
      }
      if (emailChanged) {
        body.email = email.trim()
        body.currentPassword = currentPassword
      }
      const updated = await updateProfile(body)
      if (emailChanged) {
        showToast(t('profile.emailChanged'))
        await logout()
        return
      }
      setCurrentUser(updated)
      showToast(t('profile.saved'))
    } catch (cause) {
      const detail = cause instanceof ApiError ? cause.detail : undefined
      const message = translateApiError(detail, t, 'profile.saveFail')
      setError(message)
      showToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="account-page">
      <div className="account-card">
        <p className="label">{t('profile.title')}</p>
        <h2>{t('menu.account')}</h2>
        <p className="account-copy">{t('profile.copy')}</p>
        {error && (
          <p className="account-alert account-alert-error" role="alert">
            {error}
          </p>
        )}
        <form className="account-form" onSubmit={onSubmit} noValidate>
          <label>
            <span className="label">
              {t('profile.name')} <span className="account-required">*</span>
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
            <span className="label">{t('profile.displayName')}</span>
            <input
              type="text"
              autoComplete="nickname"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </label>
          <label>
            <span className="label">{t('profile.email')}</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          {emailChanged ? (
            <>
              <p className="account-copy">{t('profile.emailHint')}</p>
              <label>
                <span className="label">{t('profile.currentPassword')}</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
              </label>
            </>
          ) : null}
          <button type="submit" disabled={submitting}>
            {submitting ? t('profile.saving') : t('profile.save')}
          </button>
        </form>
      </div>
    </div>
  )
}
import { useAuth } from '../auth/AuthProvider'