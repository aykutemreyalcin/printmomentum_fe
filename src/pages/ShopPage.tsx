import { Link, useParams } from 'react-router'
import { useState } from 'react'
import { ListingFeedTable } from '../components/ListingFeedTable'
import { useListings } from '../hooks/useListings'
import { useShop } from '../hooks/useShop'
import { formatAgeDays, formatCount, formatScore } from '../lib/format'
import './ShopPage.css'

export function ShopPage() {
  const shopId = Number(useParams().shopId)
  const { shop, error, notFound, loading } = useShop(shopId)
  const listings = useListings({ shopId: Number.isFinite(shopId) ? shopId : undefined, page: 0, size: 100 })
  const [search, setSearch] = useState('')

  if (loading) {
    return (
      <div className="shop">
        <div className="page-card shop-card" data-testid="shop-skeleton" aria-busy="true">
          <span className="shop-bar" style={{ width: '32%' }} />
          <span className="shop-bar" style={{ width: '70%' }} />
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="shop">
        <p className="label">Error 404</p>
        <h2>This shop is not on the index.</h2>
        <Link to="/" className="label">
          ← Back to feed
        </Link>
      </div>
    )
  }

  if (error || !shop) {
    return (
      <div className="shop">
        <p className="label" role="alert">
          {error ?? 'Request failed'}
        </p>
      </div>
    )
  }

  return (
    <div className="shop">
      <div className="page-toolbar">
        <Link to="/" className="label">
          ← Back to feed
        </Link>
        {shop.url ? (
          <a className="shop-etsy label" href={shop.url} target="_blank" rel="noreferrer">
            View shop on Etsy
          </a>
        ) : null}
      </div>

      <section className="page-card shop-card">
        <h2>{shop.name}</h2>
        <p className="label">
          {formatCount(shop.indexedListingCount)} indexed print tees
          {shop.listingActiveCount != null ? ` · ${formatCount(shop.listingActiveCount)} active on Etsy` : ''}
        </p>
        <div className="shop-metrics">
          <ShopMetric label="Lifetime sales" value={formatCount(shop.transactionSoldCount)} />
          <ShopMetric label="Age" value={formatAgeDays(shop.ageDays)} />
          <ShopMetric label="Rating" value={shop.reviewAverage == null ? '—' : formatScore(shop.reviewAverage)} />
          <ShopMetric label="Reviews" value={formatCount(shop.reviewCount)} />
        </div>
      </section>

      <h3 className="shop-climbers">Climbers in this shop</h3>
      <ListingFeedTable
        items={listings.page?.items ?? []}
        loading={listings.loading}
        error={listings.error}
        onRetry={listings.retry}
        search={search}
        onSearch={setSearch}
        onToggleFavorite={listings.toggleFavorite}
        emptyMessage="No print tees indexed for this shop yet."
      />
    </div>
  )
}

function ShopMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="label">{label}</span>
      <p className="shop-value numeric">{value}</p>
    </div>
  )
}
