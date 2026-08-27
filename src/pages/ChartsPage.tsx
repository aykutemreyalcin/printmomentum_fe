import { Link } from 'react-router'
import { useEffect, useMemo, useState } from 'react'
import { getTopChart } from '../api/client'
import type { TopChartItem } from '../api/types'
import { MultiLineChart } from '../components/MultiLineChart'
import { useI18n } from '../i18n/I18nProvider'
import { usePageTitle } from '../hooks/usePageTitle'
import { buildChartSeries, type ChartMetric } from '../lib/chartSeries'
import { formatCount, formatDays, formatScore } from '../lib/format'
import './ChartsPage.css'

const TOP_LIMIT = 30

export function ChartsPage() {
  usePageTitle('title.charts')
  const { t } = useI18n()
  const [items, setItems] = useState<TopChartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metric, setMetric] = useState<ChartMetric>('numFavorers')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    void getTopChart({ limit: TOP_LIMIT, snapshotLimit: 90 })
      .then((response) => {
        if (!cancelled) {
          setItems(response.items)
          setSelectedId(response.items[0]?.listingId ?? null)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(t('charts.error'))
          setItems([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [t])

  const series = useMemo(() => buildChartSeries(items, metric), [items, metric])
  const selected =
    items.find((item) => item.listingId === selectedId) ??
    items.find((item) => item.listingId === hoveredId) ??
    null

  return (
    <div className="charts-page">
      <div className="charts-head">
        <div>
          <h2>{t('charts.title')}</h2>
          <p className="label charts-copy">{t('charts.copy', { count: TOP_LIMIT })}</p>
        </div>
        <div className="charts-toolbar" role="group" aria-label={t('charts.metricGroup')}>
          <button
            type="button"
            className={['charts-metric', metric === 'numFavorers' && 'is-on'].filter(Boolean).join(' ')}
            aria-pressed={metric === 'numFavorers'}
            onClick={() => setMetric('numFavorers')}
          >
            {t('charts.metricFavorers')}
          </button>
          <button
            type="button"
            className={['charts-metric', metric === 'views' && 'is-on'].filter(Boolean).join(' ')}
            aria-pressed={metric === 'views'}
            onClick={() => setMetric('views')}
          >
            {t('charts.metricViews')}
          </button>
        </div>
      </div>

      {loading ? <p className="charts-loading">{t('charts.loading')}</p> : null}
      {error ? <p className="charts-error">{error}</p> : null}

      {!loading && !error ? (
        <div className="charts-layout">
          <section className="page-card charts-panel">
            <MultiLineChart
              series={series}
              metric={metric}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onSelect={setSelectedId}
              onHover={setHoveredId}
              emptyLabel={t('charts.noData')}
            />
            <p className="charts-hint">{t('charts.hint')}</p>
          </section>

          <aside className="page-card charts-side">
            {selected ? (
              <div className="charts-selected">
                {selected.imageUrl ? (
                  <img src={selected.imageUrl} alt="" loading="lazy" />
                ) : null}
                <h3>{selected.title}</h3>
                <dl>
                  <dt>{t('table.momentum')}</dt>
                  <dd>{formatScore(selected.momentumScore)}</dd>
                  <dt>{t('table.daysToTop')}</dt>
                  <dd>
                    {formatDays(selected.daysToTop)} {t('table.climbDaysUnit')}
                  </dd>
                  <dt>{t('table.favs')}</dt>
                  <dd>{formatCount(selected.numFavorers)}</dd>
                  <dt>{t('table.views')}</dt>
                  <dd>{formatCount(selected.views)}</dd>
                </dl>
                <div className="charts-selected-actions">
                  <Link to={`/listings/${selected.listingId}`}>{t('charts.openListing')}</Link>
                  <a href={selected.etsyUrl} target="_blank" rel="noreferrer">
                    {t('detail.viewEtsy')}
                  </a>
                </div>
              </div>
            ) : (
              <p className="charts-side-empty">{t('charts.pickLine')}</p>
            )}
          </aside>
        </div>
      ) : null}
    </div>
  )
}
