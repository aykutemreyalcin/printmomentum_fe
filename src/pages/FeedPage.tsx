import { useEffect, useMemo, useState } from 'react'
import { FeedFilters } from '../components/FeedFilters'
import { ListingFeedTable, loadFeedPageSize } from '../components/ListingFeedTable'
import { getHealth } from '../api/client'
import type { Health } from '../api/types'
import { useSelection } from '../selection/SelectionProvider'
import { useFeedFilters } from '../hooks/useFeedFilters'
import { useListings } from '../hooks/useListings'
import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/I18nProvider'
import { fetchAllListings, fetchListingsByIds } from '../lib/exportListings'
import { downloadCsv, listingsToCsv } from '../lib/listingsCsv'
import { formatIstanbulClock } from '../lib/format'
import './FeedPage.css'

export function FeedPage() {
  usePageTitle('title.feed')
  const { t } = useI18n()
  const { ids: selectedIds } = useSelection()
  const filters = useFeedFilters()
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: loadFeedPageSize() })
  const [exporting, setExporting] = useState<'all' | 'selected' | null>(null)
  const filterKey = useMemo(
    () =>
      `${filters.maxDaysToTop ?? ''}|${filters.minScore ?? ''}|${filters.q}|${filters.preset ?? ''}|${filters.bestseller ? '1' : ''}|${filters.momentumPeriod}`,
    [filters.maxDaysToTop, filters.minScore, filters.q, filters.preset, filters.bestseller, filters.momentumPeriod],
  )
  useEffect(() => {
    setPagination((current) => ({ ...current, pageIndex: 0 }))
  }, [filterKey])
  const { page, error, loading, sample, retry, toggleFavorite } = useListings(
    filters.query,
    'feed',
    pagination,
  )
  const items = page?.items ?? []
  const [health, setHealth] = useState<Health | null>(null)

  useEffect(() => {
    let cancelled = false
    void getHealth()
      .then((value) => {
        if (!cancelled) setHealth(value)
      })
      .catch(() => {
        if (!cancelled) setHealth(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const indexEmpty = (health?.indexedListings ?? 0) === 0
  const filtersOn = Boolean(
    filters.q || filters.preset || filters.bestseller || filters.maxDaysToTop || filters.minScore,
  )
  const emptyMessage =
    indexEmpty && !filtersOn
      ? t('feed.emptyIndex', { time: formatIstanbulClock(health?.nextCrawlAt) })
      : t('feed.emptyFilters')

  const exportDate = new Date().toISOString().slice(0, 10)
  const exportBusy = exporting !== null
  const canExportAll = (page?.total ?? 0) > 0 && !exportBusy
  const canExportSelected = selectedIds.length > 0 && !exportBusy

  async function exportAll() {
    setExporting('all')
    try {
      const all = await fetchAllListings(filters.query)
      downloadCsv(`printmomentum-feed-all-${exportDate}.csv`, listingsToCsv(all))
    } finally {
      setExporting(null)
    }
  }

  async function exportSelected() {
    setExporting('selected')
    try {
      const onPage = items.filter((item) => selectedIds.includes(item.listingId))
      const missingIds = selectedIds.filter((id) => !onPage.some((item) => item.listingId === id))
      const fetched = missingIds.length > 0 ? await fetchListingsByIds(missingIds) : []
      const selected = selectedIds
        .map((id) => onPage.find((item) => item.listingId === id) ?? fetched.find((item) => item.listingId === id))
        .filter((item): item is NonNullable<typeof item> => item != null)
      downloadCsv(`printmomentum-feed-selected-${exportDate}.csv`, listingsToCsv(selected))
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="feed">
      <div className="page-toolbar">
        <div>
          <h2>{t('feed.title')}</h2>
          <p className="label page-meta">
            {loading ? t('feed.loading') : t('feed.listings', { count: page?.total ?? 0 })}
            <span aria-hidden="true"> · </span>
            {t('feed.ranked')}
            {health?.nextCrawlAt ? (
              <>
                <span aria-hidden="true"> · </span>
                {t('feed.nextCrawl', { time: formatIstanbulClock(health.nextCrawlAt) })}
              </>
            ) : null}
          </p>
        </div>
        {sample && <p className="feed-sample label">{t('feed.sample')}</p>}
        <div className="feed-export-group">
          <button
            type="button"
            className="feed-export"
            disabled={!canExportAll}
            onClick={() => void exportAll()}
          >
            {exporting === 'all' ? t('feed.exporting') : t('feed.exportAll')}
          </button>
          <button
            type="button"
            className="feed-export"
            disabled={!canExportSelected}
            onClick={() => void exportSelected()}
          >
            {exporting === 'selected' ? t('feed.exporting') : t('feed.exportSelected')}
          </button>
        </div>
      </div>

      <FeedFilters
        maxDaysToTop={filters.maxDaysToTop}
        minScore={filters.minScore}
        preset={filters.preset}
        bestseller={filters.bestseller}
        momentumPeriod={filters.momentumPeriod}
        onMaxDaysToTop={filters.setMaxDaysToTop}
        onMinScore={filters.setMinScore}
        onPreset={filters.setPreset}
        onBestseller={filters.setBestseller}
        onMomentumPeriod={filters.setMomentumPeriod}
      />

      <ListingFeedTable
        items={items}
        rowCount={page?.total ?? 0}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={setPagination}
        loading={loading}
        error={error}
        onRetry={retry}
        search={filters.q}
        onSearch={filters.setQ}
        onToggleFavorite={toggleFavorite}
        emptyMessage={emptyMessage}
      />
    </div>
  )
}
