import { Link, useParams } from 'react-router'
import { Reveal } from '../components/Reveal'
import './ListingDetailPage.css'

export function ListingDetailPage() {
  const { listingId } = useParams()

  return (
    <div className="detail">
      <Link to="/" className="detail-back label">
        ← Back to feed
      </Link>

      <Reveal>
        <p className="label">Listing {listingId}</p>
        <h2 className="detail-title">Listing detail</h2>
      </Reveal>

      <hr className="hairline" />

      <Reveal delay={120} className="detail-grid">
        <div>
          <span className="label">Days to top</span>
          <p className="detail-value numeric">—</p>
        </div>
        <div>
          <span className="label">Momentum</span>
          <p className="detail-value numeric">—</p>
        </div>
        <div>
          <span className="label">Favourites</span>
          <p className="detail-value numeric">—</p>
        </div>
      </Reveal>
    </div>
  )
}
