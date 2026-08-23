import { Reveal } from '../components/Reveal'
import './FeedPage.css'

const columns = ['Rank', 'Listing', 'Days to top', 'Momentum', 'Favourites', 'Trend']

export function FeedPage() {
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
            We snapshot Etsy search positions every hour and keep our own clock. A listing that
            reached the top 100 in two days outranks one that has been parked there for a month.
          </p>
        </Reveal>
      </section>

      <hr className="hairline" />

      <div className="feed-table">
        <div className="feed-row feed-row-head">
          {columns.map((column) => (
            <span className="label" key={column}>
              {column}
            </span>
          ))}
        </div>

        {[0, 1, 2].map((row) => (
          <div className="feed-row feed-row-skeleton" key={row} aria-hidden="true">
            <span className="feed-bar" style={{ width: '60%' }} />
            <span className="feed-bar" style={{ width: '82%' }} />
            <span className="feed-bar" style={{ width: '48%' }} />
            <span className="feed-bar" style={{ width: '52%' }} />
            <span className="feed-bar" style={{ width: '46%' }} />
            <span className="feed-bar" style={{ width: '90%' }} />
          </div>
        ))}
      </div>

      <p className="feed-note label">Ranked feed arrives with the API client.</p>
    </div>
  )
}
