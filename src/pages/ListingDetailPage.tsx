import { Link, useParams } from 'react-router'
import { Reveal } from '../components/Reveal'
import { Sparkline } from '../components/Sparkline'
import { useListing } from '../hooks/useListing'
import './ListingDetailPage.css'

export function ListingDetailPage() {
  const listingId = Number(useParams().listingId)
  const { listing, error, notFound, loading } = useListing(listingId)

  if (loading) {
    return (
      <div className="detail">
        <Link to="/" className="detail-back label">
          ← Back to feed
        </Link>
        <div data-testid="detail-skeleton" aria-busy="true">
          <span className="detail-bar" style={{ width: '28%' }} />
          <span className="detail-bar" style={{ width: '72%' }} />
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="detail">
        <p className="label">Error 404</p>
        <h2 className="detail-title">This listing is not on the index.</h2>
        <Link to="/" className="detail-back label">
          ← Back to feed
        </Link>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="detail">
        <Link to="/" className="detail-back label">
          ← Back to feed
        </Link>
        <p className="detail-note" role="alert">
          {error ?? 'Request failed'}
        </p>
      </div>
    )
  }

  return (
    <div className="detail">
      <Link to="/" className="detail-back label">
        ← Back to feed
      </Link>

      <Reveal>
        <p className="label">
          {listing.shopName}
          {listing.price != null ? ` · ${money(listing.price, listing.currency)}` : ''}
        </p>
        <h2 className="detail-title">{listing.title}</h2>
      </Reveal>

      {listing.imageUrl ? (
        <img
          className="detail-image"
          src={listing.imageUrl}
          alt=""
          width={320}
          height={320}
        />
      ) : null}

      <hr className="hairline" />

      <Reveal delay={120} className="detail-grid">
        <div>
          <span className="label">Days to top</span>
          <p className="detail-value numeric">
            {listing.daysToTop == null ? '—' : listing.daysToTop.toFixed(1)}
          </p>
        </div>
        <div>
          <span className="label">Momentum</span>
          <p className="detail-value numeric">
            {listing.momentumScore == null ? '—' : listing.momentumScore.toFixed(2)}
          </p>
        </div>
        <div>
          <span className="label">Favourites</span>
          <p className="detail-value numeric">{listing.numFavorers}</p>
        </div>
      </Reveal>

      <section className="detail-trend">
        <span className="label">Position</span>
        <Sparkline snapshots={listing.snapshots} />
      </section>

      <a className="detail-etsy label" href={listing.etsyUrl} target="_blank" rel="noreferrer">
        View on Etsy
      </a>
    </div>
  )
}

function money(price: number, currency: string | null) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price)
  } catch {
    return `${price} ${currency ?? ''}`.trim()
  }
}
