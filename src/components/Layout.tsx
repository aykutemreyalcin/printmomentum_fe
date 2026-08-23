import { Link, NavLink, Outlet } from 'react-router'
import { ApiStatus } from './ApiStatus'
import './Layout.css'

export function Layout() {
  return (
    <div className="shell">
      <header className="shell-head">
        <h1 className="shell-mark">
          <Link to="/">PrintMomentum</Link>
        </h1>
        <p className="label shell-tagline">Momentum index — printable tees</p>
        <nav className="shell-nav">
          <NavLink to="/" end className="label">
            Feed
          </NavLink>
        </nav>
      </header>

      <main className="shell-main">
        <Outlet />
      </main>

      <footer className="shell-foot">
        <span className="label">Data: Etsy Open API v3</span>
        <ApiStatus />
      </footer>
    </div>
  )
}
