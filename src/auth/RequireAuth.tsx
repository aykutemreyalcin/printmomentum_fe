import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './AuthProvider'
import { useI18n } from '../i18n/I18nProvider'

export function RequireAuth() {
  const { auth, loading } = useAuth()
  const location = useLocation()
  const { t } = useI18n()

  if (loading) {
    return (
      <p className="label" style={{ padding: '48px var(--page-x)' }}>
        {t('auth.checking')}
      </p>
    )
  }
  if (!auth) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
