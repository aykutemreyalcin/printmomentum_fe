import type { FeedPreset, MomentumPeriod, NicheWindowState } from '../api/types'
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

const MOMENTUM_PERIODS: { id: MomentumPeriod; key: MessageKey }[] = [
  { id: 'daily', key: 'filters.momentumDaily' },
  { id: 'weekly', key: 'filters.momentumWeekly' },
  { id: 'monthly', key: 'filters.momentumMonthly' },
]

const NICHE_WINDOWS: Array<{ id: NicheWindowState | ''; key: MessageKey }> = [
  { id: '', key: 'filters.nicheWindowAll' },
  { id: 'OPEN', key: 'niches.window.OPEN' },
  { id: 'CLOSING', key: 'niches.window.CLOSING' },
  { id: 'CLOSED', key: 'niches.window.CLOSED' },
]

type Props = {
  maxDaysToTop: string
  minScore: string
  preset: string
  bestseller: boolean
  nicheSlug: string
  nicheWindow: NicheWindowState | ''
  momentumPeriod: MomentumPeriod
  onMaxDaysToTop: (value: string) => void
  onMinScore: (value: string) => void
  onPreset: (value: string) => void
  onBestseller: (value: boolean) => void
  onNicheSlug: (value: string) => void
  onNicheWindow: (value: NicheWindowState | '') => void
  onMomentumPeriod: (value: MomentumPeriod) => void
}

export function FeedFilters({
  maxDaysToTop,
  minScore,
  preset,
  bestseller,
  nicheSlug,
  nicheWindow,
  momentumPeriod,
  onMaxDaysToTop,
  onMinScore,
  onPreset,
  onBestseller,
  onNicheSlug,
  onNicheWindow,
  onMomentumPeriod,
}: Props) {
  const { t } = useI18n()

  return (
    <form className="feed-filters" onSubmit={(event) => event.preventDefault()}>
      <section className="feed-momentum-bar">
        <span className="label feed-section-label">{t('filters.momentumPeriod')}</span>
        <div
          className="feed-momentum-segmented"
          role="group"
          aria-label={t('filters.momentumPeriod')}
        >
          {MOMENTUM_PERIODS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={['feed-momentum-segment', momentumPeriod === item.id && 'is-on']
                .filter(Boolean)
                .join(' ')}
              aria-pressed={momentumPeriod === item.id}
              onClick={() => onMomentumPeriod(item.id)}
            >
              {t(item.key)}
            </button>
          ))}
        </div>
      </section>

      <section className="feed-filter-bar">
        <span className="label feed-section-label">{t('filters.filterSection')}</span>
        <div className="feed-filter-row">
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
          <label>
            <span className="label">{t('filters.nicheSlug')}</span>
            <input
              type="text"
              value={nicheSlug}
              onChange={(event) => onNicheSlug(event.target.value)}
              placeholder={t('filters.nicheSlugPlaceholder')}
            />
          </label>
        </div>
        <div className="feed-filter-row">
          <div className="feed-presets" role="group" aria-label={t('filters.nicheWindow')}>
            {NICHE_WINDOWS.map((item) => (
              <button
                key={item.id || 'all'}
                type="button"
                className={['feed-preset', nicheWindow === item.id && 'is-on'].filter(Boolean).join(' ')}
                aria-pressed={nicheWindow === item.id}
                onClick={() => onNicheWindow(item.id)}
              >
                {t(item.key)}
              </button>
            ))}
          </div>
        </div>
      </section>
    </form>
  )
}
