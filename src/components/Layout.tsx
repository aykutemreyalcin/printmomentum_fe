import { Link, NavLink, Outlet } from 'react-router'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useFavoritesCount } from '../favorites/FavoritesCountProvider'
import { useI18n } from '../i18n/I18nProvider'
import { ApiStatus } from './ApiStatus'
import { CompareBar } from './CompareBar'
import { ShellControls } from './ShellControls'
import './Layout.css'

export function Layout() {
  const { currentUser, logout } = useAuth()
  const { count: favoritesCount } = useFavoritesCount()
  const { t } = useI18n()
  const isAdmin = currentUser?.role === 'admin'
  const profileLabel = currentUser?.displayName || currentUser?.name || currentUser?.email || t('auth.account')
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
          <Link to="/" className="shell-brand">
            <img src="/pm-logo.png" alt="" width={28} height={28} className="shell-logo" />
            PrintMomentum
          </Link>
        </h1>
        <p className="label shell-tagline">{t('brand.tagline')}</p>
        <ApiStatus />
        <ShellControls />
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
                  <Link to="/account/profile" role="menuitem" onClick={() => setMenuOpen(false)}>
                    {t('menu.account')}
                  </Link>
                  <Link
                    to="/account/security/change-password"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('menu.password')}
                  </Link>
                  {isAdmin && (
                    <Link to="/account/members" role="menuitem" onClick={() => setMenuOpen(false)}>
                      {t('menu.members')}
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
                    {t('menu.logout')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <nav className="shell-nav" aria-label={t('nav.primary')}>
        <NavLink to="/" end>
          {t('nav.feed')}
        </NavLink>
        <NavLink to="/favorites" className="shell-nav-favorites">
          {t('nav.favorites')}
          {favoritesCount != null && favoritesCount > 0 ? (
            <span className="shell-nav-badge" aria-label={String(favoritesCount)}>
              {favoritesCount}
            </span>
          ) : null}
        </NavLink>
        {isAdmin && <NavLink to="/account/members">{t('nav.members')}</NavLink>}
      </nav>

      <CompareBar />

      <main className="shell-main">
        <Outlet />
      </main>
    </div>
  )
}
