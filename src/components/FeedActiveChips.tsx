import { Link } from 'react-router'
import type { NicheWindowState } from '../api/types'
import { useI18n } from '../i18n/I18nProvider'
import type { MessageKey } from '../i18n/messages'
import './FeedActiveChips.css'

const PRESET_LABELS: Record<string, MessageKey> = {
  'seen-today': 'filters.seenToday',
  'created-today': 'filters.openedToday',
  'created-7d': 'filters.opened7d',
  'reviewed-24h': 'filters.newReview',
  climbing: 'filters.climbing',
}

type Props = {
  q: string
  preset: string
  bestseller: boolean
  maxDaysToTop: string
  minScore: string
  nicheSlug: string
  nicheWindow: NicheWindowState | ''
  onClearQ: () => void
  onClearPreset: () => void
  onClearBestseller: () => void
  onClearMaxDays: () => void
  onClearMinScore: () => void
  onClearNiche: () => void
  onClearNicheWindow: () => void
}

export function FeedActiveChips({
  q,
  preset,
  bestseller,
  maxDaysToTop,
  minScore,
  nicheSlug,
  nicheWindow,
  onClearQ,
  onClearPreset,
  onClearBestseller,
  onClearMaxDays,
  onClearMinScore,
  onClearNiche,
  onClearNicheWindow,
}: Props) {
  const { t } = useI18n()
  const chips: Array<{ key: string; label: string; onClear: () => void }> = []

  if (q) {
    chips.push({ key: 'q', label: t('filters.chipSearch', { q }), onClear: onClearQ })
  }
  if (preset) {
    const labelKey = PRESET_LABELS[preset]
    chips.push({
      key: 'preset',
      label: labelKey ? t(labelKey) : preset,
      onClear: onClearPreset,
    })
  }
  if (bestseller) {
    chips.push({ key: 'bestseller', label: t('filters.bestsellersOnly'), onClear: onClearBestseller })
  }
  if (maxDaysToTop) {
    chips.push({
      key: 'maxDays',
      label: t('filters.chipMaxDays', { days: maxDaysToTop }),
      onClear: onClearMaxDays,
    })
  }
  if (minScore) {
    chips.push({
      key: 'minScore',
      label: t('filters.chipMinScore', { score: minScore }),
      onClear: onClearMinScore,
    })
  }
  if (nicheSlug) {
    chips.push({
      key: 'niche',
      label: t('filters.chipNiche', { slug: nicheSlug }),
      onClear: onClearNiche,
    })
  }
  if (nicheWindow) {
    chips.push({
      key: 'nicheWindow',
      label: t(`niches.window.${nicheWindow}` as MessageKey),
      onClear: onClearNicheWindow,
    })
  }

  if (chips.length === 0) {
    return null
  }

  return (
    <div className="feed-active-chips" aria-label={t('filters.activeLabel')}>
      {chips.map((chip) => (
        <span key={chip.key} className="feed-chip">
          {chip.key === 'niche' ? (
            <Link to={`/niches/${encodeURIComponent(nicheSlug)}`} className="feed-chip-link">
              {chip.label}
            </Link>
          ) : (
            chip.label
          )}
          <button type="button" className="feed-chip-clear" onClick={chip.onClear} aria-label={t('filters.clearChip')}>
            ×
          </button>
        </span>
      ))}
    </div>
  )
}
