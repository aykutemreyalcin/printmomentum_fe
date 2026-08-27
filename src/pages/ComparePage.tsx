import { Link } from 'react-router'
import { useEffect, useState } from 'react'
import { getListing } from '../api/client'
import type { ListingDetail } from '../api/types'
import { useCompare } from '../compare/CompareProvider'
import { useI18n } from '../i18n/I18nProvider'
import { usePageTitle } from '../hooks/usePageTitle'
import {
  formatAgeDays,
  formatCount,
  formatDays,
  formatMoney,
  formatScore,
} from '../lib/format'
import { createMetricGlossary } from '../lib/metricGlossary'
import './ComparePage.css'

const ROWS = [
  'price',
  'momentumScore',
  'daysToTop',
  'numFavorers',
  'views',
  'reviews30d',
  'estSales30d',
  'ageDays',
  'shopSales',
  'shopName',
] as const

export function ComparePage() {
  usePageTitle('title.compare')
  const { t } = useI18n()
  const glossary = createMetricGlossary(t)
  const { ids } = useCompare()
  const [left, setLeft] = useState<ListingDetail | null>(null)
  const [right, setRight] = useState<ListingDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (ids.length !== 2) {
      setLeft(null)
      setRight(null)
      return
    }
    let cancelled = false
    setError(null)
    void Promise.all([getListing(ids[0]), getListing(ids[1])])
      .then(([a, b]) => {
        if (!cancelled) {
          setLeft(a)
          setRight(b)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(t('compare.missing'))
          setLeft(null)
          setRight(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [ids, t])

  if (ids.length !== 2) {
    return (
      <div className="compare-page">
        <Link to="/" className="label">
          {t('detail.back')}
        </Link>
        <h2>{t('compare.title')}</h2>
        <p className="compare-copy">{t('compare.needTwo')}</p>
      </div>
    )
  }

  return (
    <div className="compare-page">
      <Link to="/" className="label">
        {t('detail.back')}
      </Link>
      <h2>{t('compare.title')}</h2>
      {error ? (
        <p className="compare-copy" role="alert">
          {error}
        </p>
      ) : !left || !right ? (
        <p className="compare-copy">{t('feed.loading')}</p>
      ) : (
        <table className="compare-table">
          <colgroup>
            <col className="compare-col-label" />
            <col className="compare-col-listing" />
            <col className="compare-col-listing" />
          </colgroup>
          <tbody>
            <tr className="compare-header-row">
              <td className="compare-corner" aria-hidden="true" />
              <td className="compare-listing-cell">
                <CompareCard listing={left} t={t} />
              </td>
              <td className="compare-listing-cell">
                <CompareCard listing={right} t={t} />
              </td>
            </tr>
            {ROWS.map((key) => (
              <tr key={key}>
                <th scope="row" title={rowHint(key, left, glossary)}>
                  {rowLabel(key, t)}
                </th>
                <td className="numeric">{rowValue(key, left)}</td>
                <td className="numeric">{rowValue(key, right)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function CompareCard({ listing, t }: { listing: ListingDetail; t: ReturnType<typeof useI18n>['t'] }) {
  return (
    <article className="compare-card">
      {listing.imageUrl ? <img src={listing.imageUrl} alt="" width={160} height={160} /> : null}
      <h3>
        <Link to={`/listings/${listing.listingId}`}>{listing.title}</Link>
      </h3>
      <p className="label">{listing.shopName}</p>
      <a href={listing.etsyUrl} target="_blank" rel="noreferrer">
        {t('detail.viewEtsy')}
      </a>
    </article>
  )
}

function rowLabel(key: (typeof ROWS)[number], t: ReturnType<typeof useI18n>['t']) {
  const map: Record<(typeof ROWS)[number], Parameters<typeof t>[0]> = {
    price: 'table.price',
    momentumScore: 'table.momentum',
    daysToTop: 'table.daysToTop',
    numFavorers: 'table.favs',
    views: 'table.views',
    reviews30d: 'table.reviews30d',
    estSales30d: 'table.estSales',
    ageDays: 'table.age',
    shopSales: 'table.shopSales',
    shopName: 'table.shop',
  }
  return t(map[key])
}

function rowValue(key: (typeof ROWS)[number], listing: ListingDetail) {
  switch (key) {
    case 'price':
      return formatMoney(listing.price, listing.currency)
    case 'momentumScore':
      return formatScore(listing.momentumScore)
    case 'daysToTop':
      return formatDays(listing.daysToTop)
    case 'numFavorers':
      return formatCount(listing.numFavorers)
    case 'views':
      return formatCount(listing.views)
    case 'reviews30d':
      return formatCount(listing.reviews30d)
    case 'estSales30d':
      return formatCount(listing.estSales30d)
    case 'ageDays':
      return formatAgeDays(listing.ageDays)
    case 'shopSales':
      return formatCount(listing.shopSales)
    case 'shopName':
      return listing.shopName
    default:
      return '—'
  }
}

function rowHint(
  key: (typeof ROWS)[number],
  listing: ListingDetail,
  glossary: ReturnType<typeof createMetricGlossary>,
) {
  switch (key) {
    case 'momentumScore':
      return glossary.momentum
    case 'daysToTop':
      return glossary.daysToTopHover(listing)
    case 'numFavorers':
      return glossary.favsHover(listing)
    case 'views':
      return glossary.viewsHover(listing)
    case 'reviews30d':
      return glossary.lastReviewHover(listing)
    case 'estSales30d':
      return glossary.estSalesHover(listing)
    case 'ageDays':
      return glossary.ageHover(listing)
    case 'shopSales':
      return glossary.shopSalesHover(listing)
    default:
      return undefined
  }
}
