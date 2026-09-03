import { useEffect, useMemo, useState } from 'react'
import { FeedCardGrid } from '../components/FeedCardGrid'
import { FeedFilters, type FeedDensity, type FeedViewMode } from '../components/FeedFilters'
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
import { formatCount, formatIstanbulClock } from '../lib/format'
import './FeedPage.css'

const VIEW_MODE_KEY = 'printmomentum-feed-view'
const DENSITY_KEY = 'printmomentum-feed-density'

function loadViewMode(): FeedViewMode {
  try {
    const stored = localStorage.getItem(VIEW_MODE_KEY)
    if (stored === 'table' || stored === 'cards') return stored
  } catch {
    /* ignore */
  }
  return 'table'
}

function loadDensity(): FeedDensity {
  try {
    const stored = localStorage.getItem(DENSITY_KEY)
    if (stored === 'compact' || stored === 'comfortable') return stored
  } catch {
    /* ignore */
  }
  return 'compact'
}

export function FeedPage() {
  usePageTitle('title.feed')
  const { t } = useI18n()
  const { ids: selectedIds } = useSelection()
  const filters = useFeedFilters()
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: loadFeedPageSize() })
  const [exporting, setExporting] = useState<'all' | 'selected' | null>(null)
  const [viewMode, setViewMode] = useState<FeedViewMode>(() => loadViewMode())
  const [density, setDensity] = useState<FeedDensity>(() => loadDensity())
  const filterKey = useMemo(
    () =>
      `${filters.maxDaysToTop ?? ''}|${filters.minScore ?? ''}|${filters.q}|${filters.preset ?? ''}|${filters.bestseller ? '1' : ''}|${filters.nicheSlug}|${filters.nicheWindow}|${filters.momentumPeriod}`,
    [filters.maxDaysToTop, filters.minScore, filters.q, filters.preset, filters.bestseller, filters.nicheSlug, filters.nicheWindow, filters.momentumPeriod],
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

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode)
  }, [viewMode])

  useEffect(() => {
    localStorage.setItem(DENSITY_KEY, density)
  }, [density])

  const indexEmpty = (health?.indexedListings ?? 0) === 0
  const filtersOn = Boolean(
    filters.q || filters.preset || filters.bestseller || filters.maxDaysToTop || filters.minScore || filters.nicheSlug || filters.nicheWindow,
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

  const insightTime = health?.lastCrawlAt
    ? formatIstanbulClock(health.lastCrawlAt)
    : health?.nextCrawlAt
      ? formatIstanbulClock(health.nextCrawlAt)
      : null

  const pageCount = Math.max(1, Math.ceil((page?.total ?? 0) / pagination.pageSize))
  const canPrev = pagination.pageIndex > 0
  const canNext = pagination.pageIndex + 1 < pageCount

  return (
    <div className="feed">
      <div className="page-toolbar feed-toolbar-head">
        <div>
          <h2>{t('feed.title')}</h2>
          <p className="label feed-insight">
            {loading
              ? t('feed.loading')
              : t('feed.insight', {
                  count: page?.total ?? 0,
                  indexed: formatCount(health?.indexedListings ?? 0),
                  time: insightTime ?? '—',
                })}
          </p>
        </div>
        {sample ? <p className="feed-sample label">{t('feed.sample')}</p> : null}
      </div>

      <FeedFilters
        q={filters.q}
        maxDaysToTop={filters.maxDaysToTop}
        minScore={filters.minScore}
        preset={filters.preset}
        bestseller={filters.bestseller}
        nicheSlug={filters.nicheSlug}
        nicheWindow={filters.nicheWindow}
        momentumPeriod={filters.momentumPeriod}
        viewMode={viewMode}
        density={density}
        canExportAll={canExportAll}
        canExportSelected={canExportSelected}
        exporting={exporting}
        onQ={filters.setQ}
        onMaxDaysToTop={filters.setMaxDaysToTop}
        onMinScore={filters.setMinScore}
        onPreset={filters.setPreset}
        onBestseller={filters.setBestseller}
        onClearNiche={filters.clearNiche}
        onClearNicheWindow={() => filters.setNicheWindow('')}
        onMomentumPeriod={filters.setMomentumPeriod}
        onViewMode={setViewMode}
        onDensity={setDensity}
        onExportAll={() => void exportAll()}
        onExportSelected={() => void exportSelected()}
      />

      {viewMode === 'cards' ? (
        <>
          <FeedCardGrid items={items} onToggleFavorite={toggleFavorite} emptyMessage={emptyMessage} />
          {(page?.total ?? 0) > pagination.pageSize ? (
            <div className="feed-card-pagination">
              <button
                type="button"
                className="feed-toolbar-btn"
                disabled={!canPrev || loading}
                onClick={() => setPagination((current) => ({ ...current, pageIndex: current.pageIndex - 1 }))}
              >
                {t('feed.prevPage')}
              </button>
              <span className="label">
                {t('feed.pageOf', { page: pagination.pageIndex + 1, total: pageCount })}
              </span>
              <button
                type="button"
                className="feed-toolbar-btn"
                disabled={!canNext || loading}
                onClick={() => setPagination((current) => ({ ...current, pageIndex: current.pageIndex + 1 }))}
              >
                {t('feed.nextPage')}
              </button>
            </div>
          ) : null}
        </>
      ) : (
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
          hideGlobalFilter
          density={density}
        />
      )}
    </div>
  )
}
