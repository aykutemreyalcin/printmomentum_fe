import type { FeedPreset } from '../api/types'
import './FeedFilters.css'

const PRESETS: { id: FeedPreset; label: string }[] = [
  { id: 'seen-today', label: 'Seen today' },
  { id: 'created-today', label: 'Opened today' },
  { id: 'created-7d', label: 'Opened in 7d' },
  { id: 'reviewed-24h', label: 'New review' },
  { id: 'climbing', label: 'Climbing' },
]

type Props = {
  maxDaysToTop: string
  minScore: string
  preset: string
  bestseller: boolean
  onMaxDaysToTop: (value: string) => void
  onMinScore: (value: string) => void
  onPreset: (value: string) => void
  onBestseller: (value: boolean) => void
}

export function FeedFilters({
  maxDaysToTop,
  minScore,
  preset,
  bestseller,
  onMaxDaysToTop,
  onMinScore,
  onPreset,
  onBestseller,
}: Props) {
  return (
    <form className="feed-filters" onSubmit={(event) => event.preventDefault()}>
      <div className="feed-presets" role="group" aria-label="Presets">
        {PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={['feed-preset', preset === item.id && 'is-on'].filter(Boolean).join(' ')}
            aria-pressed={preset === item.id}
            onClick={() => onPreset(preset === item.id ? '' : item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="feed-presets feed-bestseller-filter" role="group" aria-label="Bestseller">
        <button
          type="button"
          className={['feed-preset', bestseller && 'is-on'].filter(Boolean).join(' ')}
          aria-pressed={bestseller}
          onClick={() => onBestseller(!bestseller)}
        >
          Bestsellers only
        </button>
      </div>
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
    </form>
  )
}
