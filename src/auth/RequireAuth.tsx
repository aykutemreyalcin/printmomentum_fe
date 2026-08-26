import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './AuthProvider'

export function RequireAuth() {
  const { auth, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <p className="label" style={{ padding: '48px var(--page-x)' }}>
        Checking session…
      </p>
    )
  }
  if (!auth) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
