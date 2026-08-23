import { Reveal } from '../components/Reveal'
import { ListingRow } from '../components/ListingRow'
import { useListings } from '../hooks/useListings'
import './FeedPage.css'

const columns = ['Rank', 'Listing', 'Days to top', 'Momentum']

export function FeedPage() {
  const { page, error, loading, sample } = useListings()
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
          <p className="feed-note" role="alert">
            {error}
          </p>
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
