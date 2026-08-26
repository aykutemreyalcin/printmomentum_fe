import { Link, useParams } from 'react-router'
import { useState } from 'react'
import { ListingFeedTable } from '../components/ListingFeedTable'
import { MetricTip } from '../components/MetricTip'
import { useListings } from '../hooks/useListings'
import { useShop } from '../hooks/useShop'
import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/I18nProvider'
import { formatAgeDays, formatCount, formatScore } from '../lib/format'
import './ShopPage.css'

export function ShopPage() {
  const { t } = useI18n()
  const shopId = Number(useParams().shopId)
  const { shop, error, notFound, loading } = useShop(shopId)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 })
  const listings = useListings(
    { shopId: Number.isFinite(shopId) ? shopId : undefined },
    'feed',
    pagination,
  )
  const [search, setSearch] = useState('')
  usePageTitle(shop?.name ? `${shop.name} · PrintMomentum` : 'title.shop')

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
        <p className="label">{t('detail.error404')}</p>
        <h2>{t('shop.notFound')}</h2>
        <Link to="/" className="label">
          {t('shop.back')}
        </Link>
      </div>
    )
  }

  if (error || !shop) {
    return (
      <div className="shop">
        <p className="label" role="alert">
          {error ?? t('shop.failed')}
        </p>
      </div>
    )
  }

  return (
    <div className="shop">
      <div className="page-toolbar">
        <Link to="/" className="label">
          {t('shop.back')}
        </Link>
        {shop.url ? (
          <a className="shop-etsy label" href={shop.url} target="_blank" rel="noreferrer">
            {t('shop.etsy')}
          </a>
        ) : null}
      </div>

      <section className="page-card shop-card">
        <h2>{shop.name}</h2>
        <p className="label">
          {t('shop.indexed', { count: formatCount(shop.indexedListingCount) })}
          {shop.listingActiveCount != null
            ? ` · ${t('shop.active', { count: formatCount(shop.listingActiveCount) })}`
            : ''}
        </p>
        <div className="shop-metrics">
          <ShopMetric label={t('shop.sales')} value={formatCount(shop.transactionSoldCount)} hint={t('shop.salesHint')} />
          <ShopMetric label={t('shop.age')} value={formatAgeDays(shop.ageDays)} hint={t('shop.ageHint')} />
          <ShopMetric
            label={t('shop.rating')}
            value={shop.reviewAverage == null ? '—' : formatScore(shop.reviewAverage)}
            hint={t('shop.ratingHint')}
          />
          <ShopMetric label={t('shop.reviews')} value={formatCount(shop.reviewCount)} hint={t('shop.reviewsHint')} />
        </div>
      </section>

      <h3 className="shop-climbers">{t('shop.climbers')}</h3>
      <ListingFeedTable
        items={listings.page?.items ?? []}
        rowCount={listings.page?.total ?? 0}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={setPagination}
        loading={listings.loading}
        error={listings.error}
        onRetry={listings.retry}
        search={search}
        onSearch={setSearch}
        onToggleFavorite={listings.toggleFavorite}
        emptyMessage={t('shop.empty')}
      />
    </div>
  )
}

function ShopMetric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  const body = (
    <div>
      <span className="label">{label}</span>
      <p className="shop-value numeric">{value}</p>
    </div>
  )
  return hint ? <MetricTip title={hint}>{body}</MetricTip> : body
}
