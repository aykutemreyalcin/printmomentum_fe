import type { FeedPreset } from '../api/types'
import { useI18n } from '../i18n/I18nProvider'
import type { MessageKey } from '../i18n/messages'
import './FeedFiltersDrawer.css'

const DRAWER_PRESETS: { id: FeedPreset; key: MessageKey }[] = [
  { id: 'seen-today', key: 'filters.seenToday' },
  { id: 'created-7d', key: 'filters.opened7d' },
  { id: 'reviewed-24h', key: 'filters.newReview' },
]

type Props = {
  open: boolean
  onClose: () => void
  maxDaysToTop: string
  minScore: string
  preset: string
  onMaxDaysToTop: (value: string) => void
  onMinScore: (value: string) => void
  onPreset: (value: string) => void
}

export function FeedFiltersDrawer({
  open,
  onClose,
  maxDaysToTop,
  minScore,
  preset,
  onMaxDaysToTop,
  onMinScore,
  onPreset,
}: Props) {
  const { t } = useI18n()

  if (!open) {
    return null
  }

  return (
    <div className="feed-drawer-backdrop" onClick={onClose} role="presentation">
      <aside
        className="feed-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={t('filters.advancedTitle')}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="feed-drawer-head">
          <h3>{t('filters.advancedTitle')}</h3>
          <button type="button" className="feed-drawer-close" onClick={onClose} aria-label={t('filters.close')}>
            ×
          </button>
        </header>

        <section className="feed-drawer-section">
          <span className="label">{t('filters.presets')}</span>
          <div className="feed-presets" role="group" aria-label={t('filters.presets')}>
            {DRAWER_PRESETS.map((item) => (
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
        </section>

        <section className="feed-drawer-fields">
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
        </section>
      </aside>
    </div>
  )
}
