import { Link, useParams } from 'react-router'
import { useEffect, useState } from 'react'
import { getNicheDetail } from '../api/client'
import type { NicheDetail } from '../api/types'
import { useI18n } from '../i18n/I18nProvider'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatCount, formatDays, formatScore } from '../lib/format'
import './NicheDetailPage.css'

function formatRatio(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return `${Math.round(value * 100)}%`
}

export function NicheDetailPage() {
  const { t } = useI18n()
  const slug = useParams().slug ?? ''
  const [detail, setDetail] = useState<NicheDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  usePageTitle(detail?.label ? `${detail.label} · PrintMomentum` : 'title.nicheDetail')

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setNotFound(false)
    void getNicheDetail(slug)
      .then((value) => {
        if (!cancelled) setDetail(value)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 404) {
          setNotFound(true)
        } else {
          setError(t('niches.error'))
        }
        setDetail(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug, t])

  if (loading) {
    return <p className="label niche-detail-loading">{t('niches.loading')}</p>
  }

  if (notFound) {
    return (
      <div className="niche-detail">
        <Link to="/niches" className="label">{t('niches.back')}</Link>
        <h2>{t('niches.notFound')}</h2>
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="niche-detail">
        <p className="label" role="alert">{error ?? t('niches.error')}</p>
      </div>
    )
  }

  return (
    <div className="niche-detail">
      <div className="page-toolbar">
        <Link to="/niches" className="label">{t('niches.back')}</Link>
        <Link to={`/?nicheSlug=${encodeURIComponent(detail.slug)}`} className="label niche-detail-feed-link">
          {t('niches.viewFeed')}
        </Link>
      </div>

      <section className="page-card niche-detail-card">
        <div className="niche-detail-head">
          <div>
            <h2>{detail.label}</h2>
            <span className={`niche-window-pill is-${detail.window.toLowerCase().replace('_', '-')}`}>
              {t(`niches.window.${detail.window}`)}
            </span>
          </div>
          {detail.etsyCount != null ? (
            <p className="label">{t('niches.etsyCount', { count: formatCount(detail.etsyCount) })}</p>
          ) : null}
        </div>

        <dl className="niche-detail-metrics">
          <div><dt>{t('niches.colListings')}</dt><dd>{formatCount(detail.listingCount)}</dd></div>
          <div><dt>{t('niches.colEntrants')}</dt><dd>{formatCount(detail.newEntrants14d)}</dd></div>
          <div><dt>{t('niches.colClone')}</dt><dd>{formatRatio(detail.cloneDensity7d)}</dd></div>
          <div><dt>{t('niches.breakIn')}</dt><dd>{formatRatio(detail.breakInRate)}</dd></div>
          <div><dt>{t('niches.incumbentAge')}</dt><dd>{formatDays(detail.incumbentAgeDays)} {t('table.climbDaysUnit')}</dd></div>
          <div><dt>{t('niches.colMomentum')}</dt><dd>{formatScore(detail.entrantMomentum)}</dd></div>
        </dl>
      </section>

      {detail.relatedTerms.length > 0 ? (
        <section className="page-card niche-related">
          <h3>{t('niches.related')}</h3>
          <div className="niche-related-list">
            {detail.relatedTerms.map((term) => (
              <Link key={term.slug} to={`/niches/${term.slug}`} className="niche-related-chip">
                {term.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="page-card niche-top-listings">
        <h3>{t('niches.topListings')}</h3>
        {detail.topListings.length === 0 ? (
          <p className="label">{t('niches.noListings')}</p>
        ) : (
          <ul className="niche-top-list">
            {detail.topListings.map((listing) => (
              <li key={listing.listingId}>
                <Link to={`/listings/${listing.listingId}`} className="niche-top-item">
                  {listing.imageUrl ? <img src={listing.imageUrl} alt="" loading="lazy" /> : null}
                  <div>
                    <p>{listing.title}</p>
                    <span className="label">{formatScore(listing.momentumScore)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
