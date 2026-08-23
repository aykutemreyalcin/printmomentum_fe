import './FeedFilters.css'

type Props = {
  maxDaysToTop: string
  minScore: string
  q: string
  onMaxDaysToTop: (value: string) => void
  onMinScore: (value: string) => void
  onQ: (value: string) => void
}

export function FeedFilters({
  maxDaysToTop,
  minScore,
  q,
  onMaxDaysToTop,
  onMinScore,
  onQ,
}: Props) {
  return (
    <form className="feed-filters" onSubmit={(event) => event.preventDefault()}>
      <label>
        <span className="label">Max days to top</span>
        <input
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          value={maxDaysToTop}
          onChange={(event) => onMaxDaysToTop(event.target.value)}
        />
      </label>
      <label>
        <span className="label">Min score</span>
        <input
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          value={minScore}
          onChange={(event) => onMinScore(event.target.value)}
        />
      </label>
      <label className="feed-filters-search">
        <span className="label">Search</span>
        <input
          type="search"
          value={q}
          placeholder="Title"
          onChange={(event) => onQ(event.target.value)}
        />
      </label>
    </form>
  )
}
