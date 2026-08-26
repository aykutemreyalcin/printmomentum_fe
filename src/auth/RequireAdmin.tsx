import { Navigate, Outlet } from 'react-router'
import { useAuth } from './AuthProvider'

export function RequireAdmin() {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <p className="label" style={{ padding: '48px var(--page-x)' }}>
        Checking session…
      </p>
    )
  }
  if (currentUser?.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
