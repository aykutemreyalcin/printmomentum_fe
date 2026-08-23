import { Link } from 'react-router'
import type { ListingFeedItem } from '../api/types'

type Props = {
  listing: ListingFeedItem
  rank: number
  eager: boolean
}

export function ListingRow({ listing, rank, eager }: Props) {
  return (
    <article className="feed-card">
      <span className="feed-rank label numeric">{String(rank).padStart(2, '0')}</span>
      <Link className="feed-listing" to={`/listings/${listing.listingId}`}>
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt=""
            width={360}
            height={360}
            loading={eager ? 'eager' : 'lazy'}
          />
        ) : (
          <span className="feed-thumb" aria-hidden="true" />
        )}
        <h3>{listing.title}</h3>
        <p className="label">
          {listing.shopName}
          {listing.price != null ? ` · ${money(listing.price, listing.currency)}` : ''}
        </p>
      </Link>
      <div className="feed-card-metrics">
        <div className="feed-num numeric">
          {listing.daysToTop == null ? '—' : listing.daysToTop.toFixed(1)}
          <small>Days to top</small>
        </div>
        <div className="feed-num feed-momentum numeric">
          {listing.momentumScore == null ? '—' : listing.momentumScore.toFixed(2)}
          <small>Momentum</small>
        </div>
      </div>
    </article>
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
