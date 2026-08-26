import Tooltip from '@mui/material/Tooltip'
import { Link, useParams } from 'react-router'
import { useMemo } from 'react'
import { BestsellerBadge } from '../components/BestsellerBadge'
import { CopyButton } from '../components/CopyButton'
import { FavoriteButton } from '../components/FavoriteButton'
import { Sparkline } from '../components/Sparkline'
import { TagPack } from '../components/TagPack'
import { setListingFavorite } from '../api/client'
import { useListing } from '../hooks/useListing'
import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/I18nProvider'
import {
  formatAgeDays,
  formatCount,
  formatDays,
  formatDelta,
  formatMoney,
  formatScore,
  formatShortDate,
} from '../lib/format'
import { createMetricGlossary } from '../lib/metricGlossary'
import './ListingDetailPage.css'

export function ListingDetailPage() {
  const { t } = useI18n()
  const glossary = useMemo(() => createMetricGlossary(t), [t])
  const listingId = Number(useParams().listingId)
  const { listing, error, notFound, loading, setListing } = useListing(listingId)
  usePageTitle(listing?.title ? `${listing.title} · PrintMomentum` : 'title.listing')

  if (loading) {
    return (
      <div className="detail">
        <DetailToolbar t={t} />
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
        <p className="label">{t('detail.error404')}</p>
        <h2>{t('detail.notFound')}</h2>
        <Link to="/" className="detail-back label">
          {t('detail.back')}
        </Link>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="detail">
        <DetailToolbar t={t} />
        <p className="detail-note" role="alert">
          {error ?? t('detail.failed')}
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
        t={t}
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
              <CopyButton text={listing.title} label={t('table.copyTitle')} />
            </div>
            <p className="detail-price numeric">{formatMoney(listing.price, listing.currency)}</p>
            <div className="detail-id-row">
              <span className="label">ID {listing.listingId}</span>
              <CopyButton text={String(listing.listingId)} label={t('table.copyId')} />
              <BestsellerBadge listing={listing} />
            </div>

            {takeaway.length > 0 ? (
              <section className="detail-block" aria-label={t('detail.takeaway')}>
                <h3 className="detail-section-title">{t('detail.takeaway')}</h3>
                <ul className="detail-takeaway">
                  {takeaway.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div className="detail-grid">
              <Metric
                label={t('detail.metric.daysToTop')}
                value={formatDays(listing.daysToTop)}
                hint={glossary.daysToTopHover(listing)}
              />
              <Metric
                label={t('detail.metric.momentum')}
                value={formatScore(listing.momentumScore)}
                hint={glossary.momentum}
                accent
              />
              <Metric
                label={t('detail.metric.favourites')}
                value={formatCount(listing.numFavorers)}
                hint={glossary.favsHover(listing)}
              />
              <Metric
                label={t('detail.metric.deltaFav')}
                value={formatDelta(listing.deltaFavorers7d)}
                hint={glossary.favsHover(listing)}
              />
              <Metric
                label={t('detail.metric.views')}
                value={formatCount(listing.views)}
                hint={glossary.viewsHover(listing)}
              />
              <Metric
                label={t('detail.metric.deltaViews')}
                value={formatDelta(listing.deltaViews7d)}
                hint={glossary.viewsHover(listing)}
              />
              <Metric
                label={t('detail.metric.reviews30d')}
                value={formatCount(listing.reviews30d)}
                hint={glossary.lastReviewHover(listing)}
              />
              <Metric
                label={t('detail.metric.estSales')}
                value={formatCount(listing.estSales30d)}
                hint={glossary.estSalesHover(listing)}
              />
              <Metric
                label={t('detail.metric.estRevenue')}
                value={formatMoney(listing.estRevenue30d, listing.currency)}
                hint={glossary.estSalesHover(listing)}
              />
              <Metric
                label={t('detail.metric.age')}
                value={formatAgeDays(listing.ageDays)}
                hint={glossary.ageHover(listing)}
              />
              <Metric
                label={t('detail.metric.shopSales')}
                value={formatCount(listing.shopSales)}
                hint={glossary.shopSalesHover(listing)}
              />
              <Metric
                label={t('detail.metric.quantity')}
                value={
                  listing.quantityDelta == null
                    ? formatCount(listing.quantity)
                    : `${formatCount(listing.quantity)} (${formatDelta(listing.quantityDelta)})`
                }
                hint={glossary.quantityHover(listing, listing.quantityDelta)}
              />
            </div>
            <p className="label detail-opened">
              {t('detail.listed', { date: formatShortDate(listing.originalCreatedAt) })}
              {listing.whoMade ? ` · ${listing.whoMade}` : ''}
              {listing.whenMade ? ` · ${listing.whenMade}` : ''}
            </p>
          </div>
        </div>
      </section>

      <section className="page-card detail-card detail-section">
        <h3 className="detail-section-title">{t('detail.timeline')}</h3>
        {timeline.length === 0 ? (
          <p className="detail-note">{t('detail.noEvents')}</p>
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
            <span className="label">{t('detail.position')}</span>
            <Sparkline snapshots={listing.snapshots} metric="position" label={t('detail.sparkPosition')} />
          </div>
          <div>
            <span className="label">{t('detail.favourites')}</span>
            <Sparkline snapshots={listing.snapshots} metric="numFavorers" label={t('detail.sparkFavs')} />
          </div>
          <div>
            <span className="label">{t('detail.views')}</span>
            <Sparkline snapshots={listing.snapshots} metric="views" label={t('detail.sparkViews')} />
          </div>
        </div>
      </section>

      <section className="page-card detail-card detail-section">
        <h3 className="detail-section-title">{t('detail.tags')}</h3>
        <TagPack tags={tags} />
      </section>

      <section className="page-card detail-card detail-section">
        <h3 className="detail-section-title">{t('detail.sameQuery')}</h3>
        {peers.length === 0 ? (
          <p className="detail-note">{t('detail.noPeers')}</p>
        ) : (
          <ul className="detail-peers">
            {peers.map((peer) => (
              <li key={peer.query}>
                <Link
                  to={`/?q=${encodeURIComponent(peer.query)}`}
                  title={glossary.queryHitHover(peer.query, peer.position)}
                >
                  {t('detail.rankFor', { position: peer.position, query: peer.query })}
                </Link>
                <p className="label">
                  {t('detail.peerMeta', {
                    count: formatCount(peer.etsyCount),
                    price: formatMoney(peer.medianPrice, listing.currency),
                    favs: formatCount(peer.medianFavorers),
                  })}
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
  t,
  etsyUrl,
  favorite,
  onToggleFavorite,
}: {
  t: ReturnType<typeof useI18n>['t']
  etsyUrl?: string
  favorite?: boolean
  onToggleFavorite?: () => void | Promise<void>
}) {
  return (
    <div className="page-toolbar">
      <Link to="/" className="detail-back label">
        {t('detail.back')}
      </Link>
      <div className="detail-toolbar-actions">
        {onToggleFavorite ? (
          <FavoriteButton favorite={Boolean(favorite)} onToggle={() => onToggleFavorite()} />
        ) : null}
        {etsyUrl ? (
          <a className="detail-etsy label" href={etsyUrl} target="_blank" rel="noreferrer">
            {t('detail.viewEtsy')}
          </a>
        ) : null}
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: string
  hint: string
  accent?: boolean
}) {
  return (
    <Tooltip title={hint} enterDelay={250}>
      <div className="detail-metric">
        <span className="label">{label}</span>
        <p className={['detail-value', 'numeric', accent && 'is-accent'].filter(Boolean).join(' ')}>{value}</p>
      </div>
    </Tooltip>
  )
}
