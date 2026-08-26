import { Link, useParams } from 'react-router'
import { BestsellerBadge } from '../components/BestsellerBadge'
import { CopyButton } from '../components/CopyButton'
import { FavoriteButton } from '../components/FavoriteButton'
import { Sparkline } from '../components/Sparkline'
import { TagPack } from '../components/TagPack'
import { setListingFavorite } from '../api/client'
import { useListing } from '../hooks/useListing'
import {
  formatAgeDays,
  formatCount,
  formatDays,
  formatDelta,
  formatMoney,
  formatScore,
  formatShortDate,
} from '../lib/format'
import './ListingDetailPage.css'

export function ListingDetailPage() {
  const listingId = Number(useParams().listingId)
  const { listing, error, notFound, loading, setListing } = useListing(listingId)

  if (loading) {
    return (
      <div className="detail">
        <DetailToolbar />
        <div className="page-card detail-card" data-testid="detail-skeleton" aria-busy="true">
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
        <h2>This listing is not on the index.</h2>
        <Link to="/" className="detail-back label">
          ← Back to feed
        </Link>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="detail">
        <DetailToolbar />
        <p className="detail-note" role="alert">
          {error ?? 'Request failed'}
        </p>
      </div>
    )
  }

  const tags = listing.tags ?? []
  const takeaway = listing.takeaway ?? []
  const peers = listing.queryPeers ?? []
  const timeline = listing.timeline ?? []

  return (
    <div className="detail">
      <DetailToolbar
        etsyUrl={listing.etsyUrl}
        favorite={Boolean(listing.favorite)}
        onToggleFavorite={async () => {
          const next = !listing.favorite
          await setListingFavorite(listing.listingId, next)
          setListing({ ...listing, favorite: next })
        }}
      />

      <section className="page-card detail-card">
        <div className="detail-workspace">
          {listing.imageUrl ? (
            <img className="detail-image" src={listing.imageUrl} alt="" width={320} height={320} />
          ) : (
            <span className="detail-image is-empty" aria-hidden="true" />
          )}

          <div className="detail-body">
            {listing.shopId ? (
              <Link className="label" to={`/shops/${listing.shopId}`}>
                {listing.shopName}
              </Link>
            ) : (
              <p className="label">{listing.shopName}</p>
            )}
            <div className="detail-title-row">
              <h2 className="detail-title">{listing.title}</h2>
              <CopyButton text={listing.title} label="Copy listing title" />
            </div>
            <p className="detail-price numeric">{formatMoney(listing.price, listing.currency)}</p>
            <div className="detail-id-row">
              <span className="label">ID {listing.listingId}</span>
              <CopyButton text={String(listing.listingId)} label="Copy listing ID" />
              <BestsellerBadge listing={listing} />
            </div>

            {takeaway.length > 0 ? (
              <section className="detail-block" aria-label="Printify takeaway">
                <h3 className="detail-section-title">Takeaway</h3>
                <ul className="detail-takeaway">
                  {takeaway.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div className="detail-grid">
              <Metric label="Days to top" value={formatDays(listing.daysToTop)} />
              <Metric label="Momentum" value={formatScore(listing.momentumScore)} accent />
              <Metric label="Favourites" value={formatCount(listing.numFavorers)} />
              <Metric label="Δ fav 7d" value={formatDelta(listing.deltaFavorers7d)} />
              <Metric label="Views" value={formatCount(listing.views)} />
              <Metric label="Δ views 7d" value={formatDelta(listing.deltaViews7d)} />
              <Metric label="Reviews 30d" value={formatCount(listing.reviews30d)} />
              <Metric label="Est. 30d sales" value={formatCount(listing.estSales30d)} />
              <Metric label="Est. 30d revenue" value={formatMoney(listing.estRevenue30d, listing.currency)} />
              <Metric label="Age" value={formatAgeDays(listing.ageDays)} />
              <Metric label="Shop sales" value={formatCount(listing.shopSales)} />
              <Metric
                label="Quantity"
                value={
                  listing.quantityDelta == null
                    ? formatCount(listing.quantity)
                    : `${formatCount(listing.quantity)} (${formatDelta(listing.quantityDelta)})`
                }
              />
            </div>
            <p className="label detail-opened">
              Listed {formatShortDate(listing.originalCreatedAt)}
              {listing.whoMade ? ` · ${listing.whoMade}` : ''}
              {listing.whenMade ? ` · ${listing.whenMade}` : ''}
            </p>
          </div>
        </div>
      </section>

      <section className="page-card detail-card detail-section">
        <h3 className="detail-section-title">Timeline</h3>
        {timeline.length === 0 ? (
          <p className="detail-note">No events yet.</p>
        ) : (
          <ol className="detail-timeline">
            {timeline.map((point) => (
              <li key={`${point.kind}-${point.at}`}>
                <span className="label">{formatShortDate(point.at)}</span>
                <p>{point.label}</p>
              </li>
            ))}
          </ol>
        )}
        <div className="detail-sparks">
          <div>
            <span className="label">Position</span>
            <Sparkline snapshots={listing.snapshots} metric="position" label="Search position over time" />
          </div>
          <div>
            <span className="label">Favourites</span>
            <Sparkline snapshots={listing.snapshots} metric="numFavorers" label="Favourites over time" />
          </div>
          <div>
            <span className="label">Views</span>
            <Sparkline snapshots={listing.snapshots} metric="views" label="Views over time" />
          </div>
        </div>
      </section>

      <section className="page-card detail-card detail-section">
        <h3 className="detail-section-title">Tags</h3>
        <TagPack tags={tags} />
      </section>

      <section className="page-card detail-card detail-section">
        <h3 className="detail-section-title">Same query</h3>
        {peers.length === 0 ? (
          <p className="detail-note">No query peers yet. They appear after a crawl.</p>
        ) : (
          <ul className="detail-peers">
            {peers.map((peer) => (
              <li key={peer.query}>
                <Link to={`/?q=${encodeURIComponent(peer.query)}`}>
                  Rank {peer.position} for “{peer.query}”
                </Link>
                <p className="label">
                  {formatCount(peer.etsyCount)} on Etsy · median {formatMoney(peer.medianPrice, listing.currency)} ·{' '}
                  {formatCount(peer.medianFavorers)} favs
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function DetailToolbar({
  etsyUrl,
  favorite,
  onToggleFavorite,
}: {
  etsyUrl?: string
  favorite?: boolean
  onToggleFavorite?: () => void | Promise<void>
}) {
  return (
    <div className="page-toolbar">
      <Link to="/" className="detail-back label">
        ← Back to feed
      </Link>
      <div className="detail-toolbar-actions">
        {onToggleFavorite ? (
          <FavoriteButton favorite={Boolean(favorite)} onToggle={() => onToggleFavorite()} />
        ) : null}
        {etsyUrl ? (
          <a className="detail-etsy label" href={etsyUrl} target="_blank" rel="noreferrer">
            View on Etsy
          </a>
        ) : null}
      </div>
    </div>
  )
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="detail-metric">
      <span className="label">{label}</span>
      <p className={['detail-value', 'numeric', accent && 'is-accent'].filter(Boolean).join(' ')}>{value}</p>
    </div>
  )
}
