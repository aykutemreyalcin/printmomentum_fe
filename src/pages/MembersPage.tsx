import { Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ApiError } from '../api/ApiError'
import { listMembers, listUserSessions, setUserActive } from '../api/client'
import { useAuth } from '../auth/AuthProvider'
import type { UserResponse, UserSessionView } from '../auth/_models'
import { usePageTitle } from '../hooks/usePageTitle'
import { translateApiError, useI18n } from '../i18n/I18nProvider'
import { useToast } from '../components/Toast'
import { formatShortDate } from '../lib/format'
import './AccountForm.css'

export function MembersPage() {
  usePageTitle('title.members')
  const { t } = useI18n()
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const [members, setMembers] = useState<UserResponse[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [sessions, setSessions] = useState<Record<number, UserSessionView[] | 'loading' | 'error'>>({})

  useEffect(() => {
    let cancelled = false
    void listMembers()
      .then((rows) => {
        if (!cancelled) setMembers(rows)
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          const detail = cause instanceof ApiError ? cause.detail : undefined
          setError(translateApiError(detail, t, 'members.loadFail'))
        }
      })
    return () => {
      cancelled = true
    }
  }, [t])

  async function loadSessions(userId: number) {
    setSessions((current) => ({ ...current, [userId]: 'loading' }))
    try {
      const rows = await listUserSessions(userId)
      setSessions((current) => ({ ...current, [userId]: rows }))
    } catch {
      setSessions((current) => ({ ...current, [userId]: 'error' }))
    }
  }

  function toggleSessions(userId: number) {
    if (expandedId === userId) {
      setExpandedId(null)
      return
    }
    setExpandedId(userId)
    if (!sessions[userId]) {
      void loadSessions(userId)
    }
  }

  async function toggleActive(member: UserResponse) {
    const next = !member.active
    if (!next && confirmId !== member.id) {
      setConfirmId(member.id)
      return
    }
    setConfirmId(null)
    setPendingId(member.id)
    setError(null)
    try {
      await setUserActive(member.id, next)
      setMembers((rows) =>
        (rows ?? []).map((row) => (row.id === member.id ? { ...row, active: next } : row)),
      )
      showToast(next ? t('members.activated', { email: member.email }) : t('members.deactivatedToast', { email: member.email }))
    } catch (cause) {
      const detail = cause instanceof ApiError ? cause.detail : undefined
      const message = translateApiError(detail, t, 'members.updateFail')
      setError(message)
      showToast(message, 'error')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="account-page">
      <div className="account-card account-card-wide">
        <div className="account-toolbar">
          <div>
            <p className="label">{t('members.label')}</p>
            <h2>{t('members.title')}</h2>
            <p className="account-copy">{t('members.copy')}</p>
          </div>
          <Link className="account-secondary" to="/account/members/register-user">
            {t('members.create')}
          </Link>
        </div>
        {error && (
          <p className="account-alert account-alert-error" role="alert">
            {error}
          </p>
        )}
        {!members ? (
          <p className="account-copy">{t('members.loading')}</p>
        ) : members.length === 0 ? (
          <p className="account-copy">{t('members.empty')}</p>
        ) : (
          <table className="account-table">
            <thead>
              <tr>
                <th>{t('members.name')}</th>
                <th>{t('members.email')}</th>
                <th>{t('members.role')}</th>
                <th>{t('members.status')}</th>
                <th>{t('members.lastLogin')}</th>
                <th>{t('members.sessions')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const self = member.id === currentUser?.id
                const sessionRows = sessions[member.id]
                return (
                  <Fragment key={member.id}>
                    <tr className={member.active ? undefined : 'is-inactive'}>
                      <td>{member.displayName || member.name || '—'}</td>
                      <td>{member.email}</td>
                      <td className="label">{member.role}</td>
                      <td>{member.active ? t('members.active') : t('members.deactivated')}</td>
                      <td>{member.lastLoginAt ? formatShortDate(member.lastLoginAt) : '—'}</td>
                      <td>
                        <button type="button" className="account-row-action" onClick={() => toggleSessions(member.id)}>
                          {expandedId === member.id ? t('members.hideSessions') : t('members.sessions')}
                        </button>
                      </td>
                      <td>
                        {self ? (
                          <span className="label">{t('members.you')}</span>
                        ) : (
                          <button
                            type="button"
                            className="account-row-action"
                            disabled={pendingId === member.id}
                            onClick={() => void toggleActive(member)}
                          >
                            {!member.active
                              ? t('members.activate')
                              : confirmId === member.id
                                ? t('members.confirm')
                                : t('members.deactivate')}
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedId === member.id ? (
                      <tr className="account-sessions-row">
                        <td colSpan={7}>
                          <SessionsPanel rows={sessionRows} t={t} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function SessionsPanel({
  rows,
  t,
}: {
  rows: UserSessionView[] | 'loading' | 'error' | undefined
  t: ReturnType<typeof useI18n>['t']
}) {
  if (rows === 'loading' || rows === undefined) {
    return <p className="account-copy">{t('members.loading')}</p>
  }
  if (rows === 'error') {
    return <p className="account-copy">{t('errors.generic')}</p>
  }
  if (rows.length === 0) {
    return <p className="account-copy">{t('members.noSessions')}</p>
  }
  return (
    <table className="account-table account-sessions-table">
      <thead>
        <tr>
          <th>{t('members.sessionDevice')}</th>
          <th>{t('members.sessionIp')}</th>
          <th>{t('members.sessionLast')}</th>
          <th>{t('members.sessionCreated')}</th>
          <th>{t('members.status')}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((session) => (
          <tr key={session.id}>
            <td>{session.userAgent || session.deviceId || t('members.unknownDevice')}</td>
            <td>{session.ipAddress || '—'}</td>
            <td>{session.lastUsedAt ? formatShortDate(session.lastUsedAt) : '—'}</td>
            <td>{session.createdAt ? formatShortDate(session.createdAt) : '—'}</td>
            <td>{session.active ? t('members.sessionActive') : t('members.sessionRevoked')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
