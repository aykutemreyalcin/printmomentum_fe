import { useState, type FormEvent } from 'react'
import { ApiError } from '../api/ApiError'
import { changePassword } from '../api/client'
import { usePageTitle } from '../hooks/usePageTitle'
import { translateApiError, useI18n } from '../i18n/I18nProvider'
import { useToast } from '../components/Toast'
import './AccountForm.css'

const MIN_PASSWORD_LENGTH = 6

export function ChangePasswordPage() {
  usePageTitle('title.password')
  const { t } = useI18n()
  const { showToast } = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmationPassword, setConfirmationPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(t('account.minPassword', { n: MIN_PASSWORD_LENGTH }))
      return
    }
    if (newPassword !== confirmationPassword) {
      setError(t('account.mismatch'))
      return
    }
    setSubmitting(true)
    try {
      await changePassword({ currentPassword, newPassword, confirmationPassword })
      showToast(t('account.passwordOk'))
      setCurrentPassword('')
      setNewPassword('')
      setConfirmationPassword('')
    } catch (cause) {
      const detail = cause instanceof ApiError ? cause.detail : undefined
      setError(translateApiError(detail, t, 'account.passwordFail'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="account-page">
      <div className="account-card">
        <p className="label">{t('account.security')}</p>
        <h2>{t('account.passwordTitle')}</h2>
        <p className="account-copy">{t('account.passwordCopy')}</p>
        {error && (
          <p className="account-alert account-alert-error" role="alert">
            {error}
          </p>
        )}
        <form className="account-form" onSubmit={onSubmit} noValidate>
          <PasswordField
            label={t('account.currentPassword')}
            value={currentPassword}
            onChange={setCurrentPassword}
            shown={showCurrent}
            onToggle={() => setShowCurrent((open) => !open)}
            autoComplete="current-password"
            showLabel={t('account.show')}
            hideLabel={t('account.hide')}
          />
          <PasswordField
            label={t('account.newPassword')}
            value={newPassword}
            onChange={setNewPassword}
            shown={showNew}
            onToggle={() => setShowNew((open) => !open)}
            autoComplete="new-password"
            showLabel={t('account.show')}
            hideLabel={t('account.hide')}
          />
          <PasswordField
            label={t('account.confirmPassword')}
            value={confirmationPassword}
            onChange={setConfirmationPassword}
            shown={showConfirm}
            onToggle={() => setShowConfirm((open) => !open)}
            autoComplete="new-password"
            showLabel={t('account.show')}
            hideLabel={t('account.hide')}
          />
          <button type="submit" disabled={submitting}>
            {submitting ? t('account.processing') : t('account.changePassword')}
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
  showLabel,
  hideLabel,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  shown: boolean
  onToggle: () => void
  autoComplete: string
  showLabel: string
  hideLabel: string
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
          {shown ? hideLabel : showLabel}
        </button>
      </span>
    </label>
  )
}
