import { Link } from 'react-router'
import './NotFoundPage.css'

export function NotFoundPage() {
  return (
    <div className="not-found">
      <p className="label">Error 404</p>
      <h2>This page is not on the index.</h2>
      <Link to="/" className="label not-found-back">
        ← Back to feed
      </Link>
    </div>
  )
}
