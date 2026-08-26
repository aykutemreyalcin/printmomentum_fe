import { Link, NavLink, Outlet } from 'react-router'
import { useAuth } from '../auth/AuthProvider'
import { ApiStatus } from './ApiStatus'
import './Layout.css'

export function Layout() {
  const { currentUser, logout } = useAuth()

  return (
    <div className="shell">
      <header className="shell-head">
        <h1 className="shell-mark">
          <Link to="/">PrintMomentum</Link>
        </h1>
        <p className="label shell-tagline">Print-tee index</p>
        <ApiStatus />
        <div className="shell-session">
          {currentUser && <span className="shell-email">{currentUser.email}</span>}
          <button type="button" className="label shell-logout" onClick={() => void logout()}>
            Log out
          </button>
        </div>
      </header>

      <nav className="shell-nav" aria-label="Primary">
        <NavLink to="/" end>
          Feed
        </NavLink>
        <NavLink to="/favorites">Favorites</NavLink>
      </nav>

      <main className="shell-main">
        <Outlet />
      </main>
    </div>
  )
}
