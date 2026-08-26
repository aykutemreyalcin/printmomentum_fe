import { FeedFilters } from '../components/FeedFilters'
import { ListingFeedTable } from '../components/ListingFeedTable'
import { QueryStatsStrip } from '../components/QueryStatsStrip'
import { useFeedFilters } from '../hooks/useFeedFilters'
import { useListings } from '../hooks/useListings'
import { downloadCsv, listingsToCsv } from '../lib/listingsCsv'
import './FeedPage.css'

export function FeedPage() {
  const filters = useFeedFilters()
  const { page, error, loading, sample, retry, toggleFavorite } = useListings(filters.query)
  const items = page?.items ?? []

  return (
    <div className="feed">
      <div className="page-toolbar">
        <div>
          <h2>Feed</h2>
          <p className="label page-meta">
            {loading ? 'Loading print tees' : `${page?.total ?? 0} listings`}
            <span aria-hidden="true"> · </span>
            ranked by climb, not occupancy
          </p>
        </div>
        {sample && <p className="feed-sample label">Sample data — API unreachable</p>}
        <button
          type="button"
          className="feed-export"
          disabled={items.length === 0}
          onClick={() =>
            downloadCsv(`printmomentum-feed-${new Date().toISOString().slice(0, 10)}.csv`, listingsToCsv(items))
          }
        >
          Export CSV
        </button>
      </div>

      <QueryStatsStrip selectedQuery={filters.q} onSelect={filters.setQ} />

      <FeedFilters
        maxDaysToTop={filters.maxDaysToTop}
        minScore={filters.minScore}
        preset={filters.preset}
        bestseller={filters.bestseller}
        onMaxDaysToTop={filters.setMaxDaysToTop}
        onMinScore={filters.setMinScore}
        onPreset={filters.setPreset}
        onBestseller={filters.setBestseller}
      />

      <ListingFeedTable
        items={items}
        loading={loading}
        error={error}
        onRetry={retry}
        search={filters.q}
        onSearch={filters.setQ}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  )
}
