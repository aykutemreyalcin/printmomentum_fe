import { useEffect, useState } from 'react'
import { getHealth } from '../api/client'
import type { Health } from '../api/types'
import { useI18n } from '../i18n/I18nProvider'
import { formatIstanbulClock } from '../lib/format'
import './ApiStatus.css'

export function ApiStatus() {
  const { t } = useI18n()
  const [health, setHealth] = useState<Health | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getHealth()
      .then((value) => {
        if (!cancelled) setHealth(value)
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : t('health.failed'))
        }
      })
    return () => {
      cancelled = true
    }
  }, [t])

  if (health) {
    const crawlLabel = crawlSummary(health, t)
    return (
      <span className="api-status label" data-testid="health" title={crawlTitle(health, t)}>
        <i className="api-status-dot" /> {t('api.ok', { status: health.status })}
        {crawlLabel ? <span className="api-status-crawl">{crawlLabel}</span> : null}
      </span>
    )
  }

  if (error) {
    return (
      <span className="api-status is-down label" data-testid="health-error">
        <i className="api-status-dot" /> {t('api.offline', { error })}
      </span>
    )
  }

  return (
    <span className="api-status label" data-testid="health-loading">
      {t('api.checking')}
    </span>
  )
}

function crawlSummary(health: Health, t: ReturnType<typeof useI18n>['t']): string | null {
  if (health.lastOutcome === 'skipped_quota') {
    return t('api.quota')
  }
  if (health.lastOutcome === 'error') {
    return t('api.crawlError')
  }
  if (health.lastCrawlAt) {
    return t('api.last', { time: formatIstanbulClock(health.lastCrawlAt) })
  }
  if (health.nextCrawlAt) {
    return t('api.next', { time: formatIstanbulClock(health.nextCrawlAt) })
  }
  return null
}

function crawlTitle(health: Health, t: ReturnType<typeof useI18n>['t']): string {
  const parts = [
    health.lastCrawlAt
      ? t('api.titleLast', { time: formatIstanbulClock(health.lastCrawlAt) })
      : t('api.titleNever'),
    health.nextCrawlAt ? t('api.titleNext', { time: formatIstanbulClock(health.nextCrawlAt) }) : null,
    health.lastOutcome && health.lastOutcome !== 'never'
      ? t('api.titleOutcome', { outcome: health.lastOutcome })
      : null,
  ]
  return parts.filter(Boolean).join(' · ')
}
