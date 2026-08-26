import { useEffect, useState } from 'react'
import { getQueryStats } from '../api/client'
import type { QueryStats } from '../api/types'
import { useI18n } from '../i18n/I18nProvider'
import { formatCount, formatMoney } from '../lib/format'
import { MetricTip } from './MetricTip'
import './QueryStatsStrip.css'

type Props = {
  selectedQuery: string
  onSelect: (query: string) => void
}

export function QueryStatsStrip({ selectedQuery, onSelect }: Props) {
  const { t } = useI18n()
  const [stats, setStats] = useState<QueryStats[] | null>(null)

  useEffect(() => {
    let cancelled = false
    void getQueryStats()
      .then((rows) => {
        if (!cancelled) {
          setStats(rows)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStats([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!stats || stats.length === 0) {
    return null
  }

  return (
    <div className="query-stats" role="group" aria-label={t('query.group')}>
      {stats.map((row) => (
        <button
          key={row.query}
          type="button"
          className={['query-stat', selectedQuery === row.query && 'is-on'].filter(Boolean).join(' ')}
          aria-pressed={selectedQuery === row.query}
          title={t('query.filter', { query: row.query })}
          onClick={() => onSelect(selectedQuery === row.query ? '' : row.query)}
        >
          <MetricTip
            title={t('query.hint', {
              count: formatCount(row.listingCount),
              favs: formatCount(row.medianFavorers),
              views: formatCount(row.medianViews),
            })}
          >
            <span className="query-stat-name">{row.query}</span>
          </MetricTip>
          <span className="label">
            {formatCount(row.etsyCount)} Etsy · median {formatMoney(row.medianPrice, 'USD')}
          </span>
        </button>
      ))}
    </div>
  )
}
