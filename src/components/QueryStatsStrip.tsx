import { useEffect, useState } from 'react'
import { getQueryStats } from '../api/client'
import type { QueryStats } from '../api/types'
import { formatCount, formatMoney } from '../lib/format'
import './QueryStatsStrip.css'

type Props = {
  selectedQuery: string
  onSelect: (query: string) => void
}

export function QueryStatsStrip({ selectedQuery, onSelect }: Props) {
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
    <div className="query-stats" role="group" aria-label="Query competition">
      {stats.map((row) => (
        <button
          key={row.query}
          type="button"
          className={['query-stat', selectedQuery === row.query && 'is-on'].filter(Boolean).join(' ')}
          aria-pressed={selectedQuery === row.query}
          onClick={() => onSelect(selectedQuery === row.query ? '' : row.query)}
        >
          <span className="query-stat-name">{row.query}</span>
          <span className="label">
            {formatCount(row.etsyCount)} on Etsy · median {formatMoney(row.medianPrice, 'USD')}
          </span>
        </button>
      ))}
    </div>
  )
}
