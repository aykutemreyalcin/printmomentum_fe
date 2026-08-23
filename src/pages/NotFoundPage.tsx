import { Link } from 'react-router'
import './ListingDetailPage.css'

export function NotFoundPage() {
  return (
    <div className="detail">
      <p className="label">Error 404</p>
      <h2 className="detail-title">This page is not on the index.</h2>
      <Link to="/" className="detail-back label">
        ← Back to feed
      </Link>
    </div>
  )
}
