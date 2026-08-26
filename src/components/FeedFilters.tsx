import type { FeedPreset } from '../api/types'
import { useI18n } from '../i18n/I18nProvider'
import type { MessageKey } from '../i18n/messages'
import './FeedFilters.css'

const PRESETS: { id: FeedPreset; key: MessageKey }[] = [
  { id: 'seen-today', key: 'filters.seenToday' },
  { id: 'created-today', key: 'filters.openedToday' },
  { id: 'created-7d', key: 'filters.opened7d' },
  { id: 'reviewed-24h', key: 'filters.newReview' },
  { id: 'climbing', key: 'filters.climbing' },
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
  const { t } = useI18n()

  return (
    <form className="feed-filters" onSubmit={(event) => event.preventDefault()}>
      <div className="feed-presets" role="group" aria-label={t('filters.presets')}>
        {PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={['feed-preset', preset === item.id && 'is-on'].filter(Boolean).join(' ')}
            aria-pressed={preset === item.id}
            onClick={() => onPreset(preset === item.id ? '' : item.id)}
          >
            {t(item.key)}
          </button>
        ))}
      </div>
      <div className="feed-presets feed-bestseller-filter" role="group" aria-label={t('filters.bestseller')}>
        <button
          type="button"
          className={['feed-preset', bestseller && 'is-on'].filter(Boolean).join(' ')}
          aria-pressed={bestseller}
          onClick={() => onBestseller(!bestseller)}
        >
          {t('filters.bestsellersOnly')}
        </button>
      </div>
      <label>
        <span className="label">{t('filters.maxDays')}</span>
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
        <span className="label">{t('filters.minScore')}</span>
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
