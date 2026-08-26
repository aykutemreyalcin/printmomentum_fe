import { Link, NavLink, Outlet } from 'react-router'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { ApiStatus } from './ApiStatus'
import './Layout.css'

export function Layout() {
  const { currentUser, logout } = useAuth()
  const isAdmin = currentUser?.role === 'admin'
  const profileLabel = currentUser?.displayName || currentUser?.name || currentUser?.email || 'Account'
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function onPointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [menuOpen])

  return (
    <div className="shell">
      <header className="shell-head">
        <h1 className="shell-mark">
          <Link to="/">PrintMomentum</Link>
        </h1>
        <p className="label shell-tagline">Print-tee index</p>
        <ApiStatus />
        <div className="shell-session" ref={menuRef}>
          {currentUser && (
            <div className="shell-profile">
              <button
                type="button"
                className="shell-profile-toggle"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen((open) => !open)}
              >
                {profileLabel}
              </button>
              {menuOpen && (
                <div className="shell-profile-menu" role="menu">
                  <p className="shell-profile-email">{currentUser.email}</p>
                  <Link
                    to="/account/security/change-password"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    Change Password
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/account/members/register-user"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      Create User
                    </Link>
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    className="shell-profile-logout"
                    onClick={() => {
                      setMenuOpen(false)
                      void logout()
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <nav className="shell-nav" aria-label="Primary">
        <NavLink to="/" end>
          Feed
        </NavLink>
        <NavLink to="/favorites">Favorites</NavLink>
        {isAdmin && <NavLink to="/account/members/register-user">Create User</NavLink>}
      </nav>

      <main className="shell-main">
        <Outlet />
      </main>
    </div>
  )
}
