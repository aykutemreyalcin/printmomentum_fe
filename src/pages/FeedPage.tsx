import { FeedFilters } from '../components/FeedFilters'
import { ListingRow } from '../components/ListingRow'
import { Reveal } from '../components/Reveal'
import { useFeedFilters } from '../hooks/useFeedFilters'
import { useListings } from '../hooks/useListings'
import './FeedPage.css'

const columns = ['Rank', 'Listing', 'Days to top', 'Momentum']

export function FeedPage() {
  const filters = useFeedFilters()
  const { page, error, loading, sample, retry } = useListings(filters.query)
  const items = page?.items ?? []

  return (
    <div className="feed">
      <section className="feed-hero">
        <Reveal>
          <h2 className="feed-headline">
            Tees that <i>climbed</i>,
            <br />
            not tees that sat.
          </h2>
        </Reveal>
        <Reveal delay={140} className="feed-hero-side">
          <p>
            Ranked by momentum — how fast a printable tee climbed into our top 100, not how long it
            has sat there. Backend default is print-tee only.
          </p>
        </Reveal>
      </section>

      {sample && (
        <p className="feed-sample label">Sample data — API unreachable</p>
      )}

      <hr className="hairline" />

      <FeedFilters
        maxDaysToTop={filters.maxDaysToTop}
        minScore={filters.minScore}
        q={filters.q}
        onMaxDaysToTop={filters.setMaxDaysToTop}
        onMinScore={filters.setMinScore}
        onQ={filters.setQ}
      />

      <div className="feed-table">
        <div className="feed-row feed-row-head">
          {columns.map((column) => (
            <span className="label" key={column}>
              {column}
            </span>
          ))}
        </div>

        {loading && <FeedSkeleton />}

        {!loading && error && (
          <div className="feed-error" role="alert">
            <p className="feed-note">{error}</p>
            <button type="button" className="feed-retry label" onClick={retry}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="feed-empty">No printable tees match. Widen filters.</p>
        )}

        {!loading &&
          !error &&
          items.map((listing, index) => (
            <ListingRow
              key={listing.listingId}
              listing={listing}
              rank={index + 1}
              eager={index < 3}
            />
          ))}
      </div>
    </div>
  )
}

function FeedSkeleton() {
  return (
    <div data-testid="feed-skeleton" aria-busy="true">
      {[0, 1, 2].map((row) => (
        <div className="feed-row feed-row-skeleton" key={row} aria-hidden="true">
          <span className="feed-bar" style={{ width: '40%' }} />
          <span className="feed-bar" style={{ width: '82%' }} />
          <span className="feed-bar" style={{ width: '48%' }} />
          <span className="feed-bar" style={{ width: '52%' }} />
        </div>
      ))}
    </div>
  )
}
