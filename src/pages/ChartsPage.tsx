import { Link } from 'react-router'
import { useEffect, useMemo, useState } from 'react'
import { getTopChart } from '../api/client'
import type { TopChartItem } from '../api/types'
import { MultiLineChart } from '../components/MultiLineChart'
import { useI18n } from '../i18n/I18nProvider'
import { usePageTitle } from '../hooks/usePageTitle'
import {
  buildChartSeries,
  type ChartMetric,
  type ChartMode,
  type ChartWindowDays,
} from '../lib/chartSeries'
import { formatCount, formatDays, formatScore } from '../lib/format'
import './ChartsPage.css'

const TOP_LIMIT = 30
const DEFAULT_WINDOW_DAYS: ChartWindowDays = 30
const SNAPSHOT_LIMIT = 60

export function ChartsPage() {
  usePageTitle('title.charts')
  const { t, dateLocale, numberLocale } = useI18n()
  const [items, setItems] = useState<TopChartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metric, setMetric] = useState<ChartMetric>('numFavorers')
  const [mode, setMode] = useState<ChartMode>('normalized')
  const [windowDays, setWindowDays] = useState<ChartWindowDays>(DEFAULT_WINDOW_DAYS)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    void getTopChart({ limit: TOP_LIMIT, snapshotLimit: SNAPSHOT_LIMIT, momentumPeriod: 'weekly' })
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

  const series = useMemo(
    () => buildChartSeries(items, metric, mode, windowDays),
    [items, metric, mode, windowDays],
  )
  const selected =
    items.find((item) => item.listingId === selectedId) ??
    items.find((item) => item.listingId === hoveredId) ??
    null

  const chartAriaLabel =
    mode === 'normalized'
      ? t('charts.ariaNormalized', { metric: t(`charts.metric.${metric}`), days: windowDays })
      : t('charts.ariaAbsolute', { metric: t(`charts.metric.${metric}`), days: windowDays })

  return (
    <div className="charts-page">
      <div className="charts-head">
        <div>
          <h2>{t('charts.title')}</h2>
          <p className="label charts-copy">{t('charts.copy', { count: TOP_LIMIT })}</p>
        </div>
        <div className="charts-toolbar">
          <div className="charts-toolbar-group" role="group" aria-label={t('charts.metricGroup')}>
            {(['numFavorers', 'views', 'position'] as const).map((key) => (
              <button
                key={key}
                type="button"
                className={['charts-metric', metric === key && 'is-on'].filter(Boolean).join(' ')}
                aria-pressed={metric === key}
                onClick={() => setMetric(key)}
              >
                {t(`charts.metric.${key}`)}
              </button>
            ))}
          </div>
          <div className="charts-toolbar-group" role="group" aria-label={t('charts.modeGroup')}>
            <button
              type="button"
              className={['charts-metric', mode === 'normalized' && 'is-on'].filter(Boolean).join(' ')}
              aria-pressed={mode === 'normalized'}
              onClick={() => setMode('normalized')}
            >
              {t('charts.modeNormalized')}
            </button>
            <button
              type="button"
              className={['charts-metric', mode === 'absolute' && 'is-on'].filter(Boolean).join(' ')}
              aria-pressed={mode === 'absolute'}
              onClick={() => setMode('absolute')}
            >
              {t('charts.modeAbsolute')}
            </button>
          </div>
          <div className="charts-toolbar-group" role="group" aria-label={t('charts.windowGroup')}>
            {([30, 90] as const).map((days) => (
              <button
                key={days}
                type="button"
                className={['charts-metric', windowDays === days && 'is-on'].filter(Boolean).join(' ')}
                aria-pressed={windowDays === days}
                onClick={() => setWindowDays(days)}
              >
                {t('charts.windowDays', { days })}
              </button>
            ))}
          </div>
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
              mode={mode}
              locale={dateLocale}
              numberLocale={numberLocale}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onSelect={setSelectedId}
              onHover={setHoveredId}
              emptyLabel={t('charts.noData')}
              ariaLabel={chartAriaLabel}
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
