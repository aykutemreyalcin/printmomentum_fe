import { Link, useSearchParams } from 'react-router'
import { useEffect, useState } from 'react'
import { getNicheStats, getNiches } from '../api/client'
import type { NicheTermItem, NicheWindowState } from '../api/types'
import { useI18n } from '../i18n/I18nProvider'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatCount, formatScore } from '../lib/format'
import './NicheWindowsPage.css'

const WINDOWS: Array<NicheWindowState | ''> = ['', 'OPEN', 'CLOSING', 'CLOSED', 'LOW_DATA']

function formatRatio(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return `${Math.round(value * 100)}%`
}

export function NicheWindowsPage() {
  usePageTitle('title.niches')
  const { t } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()
  const window = (searchParams.get('window') ?? '') as NicheWindowState | ''
  const [items, setItems] = useState<NicheTermItem[]>([])
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<{ open: number; closing: number; closed: number; lowData: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([
      getNiches({ window, sort: 'momentum', page: 0, size: 100 }),
      getNicheStats(),
    ])
      .then(([page, nicheStats]) => {
        if (!cancelled) {
          setItems(page.items)
          setTotal(page.total)
          setStats({
            open: nicheStats.open,
            closing: nicheStats.closing,
            closed: nicheStats.closed,
            lowData: nicheStats.lowData,
          })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(t('niches.error'))
          setItems([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [window, t])

  function setWindow(next: NicheWindowState | '') {
    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous)
        if (next === '') params.delete('window')
        else params.set('window', next)
        return params
      },
      { replace: true },
    )
  }

  return (
    <div className="niches-page">
      <div className="niches-head">
        <div>
          <h2>{t('niches.title')}</h2>
          <p className="label niches-copy">{t('niches.copy')}</p>
        </div>
        {stats ? (
          <div className="niches-stats" aria-label={t('niches.statsLabel')}>
            <span className="niche-window-pill is-open">{t('niches.openCount', { count: stats.open })}</span>
            <span className="niche-window-pill is-closing">{t('niches.closingCount', { count: stats.closing })}</span>
            <span className="niche-window-pill is-closed">{t('niches.closedCount', { count: stats.closed })}</span>
          </div>
        ) : null}
      </div>

      <div className="niches-toolbar" role="group" aria-label={t('niches.windowFilter')}>
        {WINDOWS.map((value) => (
          <button
            key={value || 'all'}
            type="button"
            className={['niches-window-btn', window === value && 'is-on'].filter(Boolean).join(' ')}
            aria-pressed={window === value}
            onClick={() => setWindow(value)}
          >
            {value === '' ? t('niches.allWindows') : t(`niches.window.${value}`)}
          </button>
        ))}
      </div>

      {loading ? <p className="niches-loading">{t('niches.loading')}</p> : null}
      {error ? <p className="niches-error">{error}</p> : null}

      {!loading && !error ? (
        <section className="page-card niches-table-wrap">
          {items.length === 0 ? (
            <p className="label niches-empty">{t('niches.empty')}</p>
          ) : (
            <>
              <p className="label niches-meta">{t('niches.count', { count: total })}</p>
              <table className="niches-table">
                <thead>
                  <tr>
                    <th>{t('niches.colTerm')}</th>
                    <th>{t('niches.colWindow')}</th>
                    <th>{t('niches.colListings')}</th>
                    <th>{t('niches.colEntrants')}</th>
                    <th>{t('niches.colClone')}</th>
                    <th>{t('niches.colMomentum')}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.slug}>
                      <td>
                        <Link to={`/niches/${item.slug}`} className="niches-term-link">
                          {item.label}
                        </Link>
                        {item.etsyCount != null ? (
                          <span className="label niches-etsy">{t('niches.etsyCount', { count: formatCount(item.etsyCount) })}</span>
                        ) : null}
                      </td>
                      <td>
                        <span className={`niche-window-pill is-${item.window.toLowerCase().replace('_', '-')}`}>
                          {t(`niches.window.${item.window}`)}
                        </span>
                      </td>
                      <td>{formatCount(item.listingCount)}</td>
                      <td>{formatCount(item.newEntrants14d)}</td>
                      <td>{formatRatio(item.cloneDensity7d)}</td>
                      <td>{formatScore(item.entrantMomentum)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>
      ) : null}
    </div>
  )
}
