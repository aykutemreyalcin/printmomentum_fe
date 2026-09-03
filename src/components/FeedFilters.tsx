import { useMemo, useState } from 'react'
import type { FeedPreset, MomentumPeriod } from '../api/types'
import { useI18n } from '../i18n/I18nProvider'
import type { MessageKey } from '../i18n/messages'
import { FeedActiveChips } from './FeedActiveChips'
import { FeedFiltersDrawer } from './FeedFiltersDrawer'
import { FeedExportDropdown } from './FeedExportDropdown'
import './FeedFilters.css'

const MOMENTUM_PERIODS: { id: MomentumPeriod; key: MessageKey }[] = [
  { id: 'daily', key: 'filters.momentumDaily' },
  { id: 'weekly', key: 'filters.momentumWeekly' },
  { id: 'monthly', key: 'filters.momentumMonthly' },
]

const QUICK_PRESETS: Array<{ id: FeedPreset | 'bestseller'; key: MessageKey }> = [
  { id: 'climbing', key: 'filters.climbing' },
  { id: 'created-today', key: 'filters.openedToday' },
  { id: 'bestseller', key: 'filters.bestsellersOnly' },
]

export type FeedViewMode = 'table' | 'cards'

type Props = {
  q: string
  maxDaysToTop: string
  minScore: string
  preset: string
  bestseller: boolean
  nicheSlug: string
  nicheWindow: import('../api/types').NicheWindowState | ''
  momentumPeriod: MomentumPeriod
  viewMode: FeedViewMode
  canExportAll: boolean
  canExportSelected: boolean
  exporting: 'all' | 'selected' | null
  onQ: (value: string) => void
  onMaxDaysToTop: (value: string) => void
  onMinScore: (value: string) => void
  onPreset: (value: string) => void
  onBestseller: (value: boolean) => void
  onClearNiche: () => void
  onClearNicheWindow: () => void
  onMomentumPeriod: (value: MomentumPeriod) => void
  onViewMode: (value: FeedViewMode) => void
  onExportAll: () => void
  onExportSelected: () => void
}

export function FeedFilters({
  q,
  maxDaysToTop,
  minScore,
  preset,
  bestseller,
  nicheSlug,
  nicheWindow,
  momentumPeriod,
  viewMode,
  canExportAll,
  canExportSelected,
  exporting,
  onQ,
  onMaxDaysToTop,
  onMinScore,
  onPreset,
  onBestseller,
  onClearNiche,
  onClearNicheWindow,
  onMomentumPeriod,
  onViewMode,
  onExportAll,
  onExportSelected,
}: Props) {
  const { t } = useI18n()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const advancedCount = useMemo(() => {
    let count = 0
    if (['seen-today', 'created-7d', 'reviewed-24h'].includes(preset)) count += 1
    if (maxDaysToTop) count += 1
    if (minScore) count += 1
    return count
  }, [maxDaysToTop, minScore, preset])

  return (
    <div className="feed-filters">
      <div className="feed-control-row">
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

        <label className="feed-search">
          <span className="visually-hidden">{t('table.search')}</span>
          <input
            type="search"
            value={q}
            placeholder={t('table.search')}
            onChange={(event) => onQ(event.target.value)}
          />
        </label>

        <div className="feed-toolbar-group" role="group" aria-label={t('feed.viewMode')}>
          <button
            type="button"
            className={['feed-toolbar-btn', viewMode === 'table' && 'is-on'].filter(Boolean).join(' ')}
            aria-pressed={viewMode === 'table'}
            onClick={() => onViewMode('table')}
          >
            {t('feed.viewTable')}
          </button>
          <button
            type="button"
            className={['feed-toolbar-btn', viewMode === 'cards' && 'is-on'].filter(Boolean).join(' ')}
            aria-pressed={viewMode === 'cards'}
            onClick={() => onViewMode('cards')}
          >
            {t('feed.viewCards')}
          </button>
        </div>

        <button
          type="button"
          className="feed-toolbar-btn"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
        >
          {t('filters.advancedTitle')}
          {advancedCount > 0 ? <span className="feed-filter-badge">{advancedCount}</span> : null}
        </button>

        <FeedExportDropdown
          canExportAll={canExportAll}
          canExportSelected={canExportSelected}
          exporting={exporting}
          onExportAll={onExportAll}
          onExportSelected={onExportSelected}
        />
      </div>

      <div className="feed-quick-row">
        {QUICK_PRESETS.map((item) => {
          const isOn = item.id === 'bestseller' ? bestseller : preset === item.id
          return (
            <button
              key={item.id}
              type="button"
              className={['feed-preset', isOn && 'is-on'].filter(Boolean).join(' ')}
              aria-pressed={isOn}
              onClick={() => {
                if (item.id === 'bestseller') {
                  onBestseller(!bestseller)
                  return
                }
                onPreset(preset === item.id ? '' : item.id)
              }}
            >
              {t(item.key)}
            </button>
          )
        })}
      </div>

      <FeedActiveChips
        q={q}
        preset={preset}
        bestseller={bestseller}
        maxDaysToTop={maxDaysToTop}
        minScore={minScore}
        nicheSlug={nicheSlug}
        nicheWindow={nicheWindow}
        onClearQ={() => onQ('')}
        onClearPreset={() => onPreset('')}
        onClearBestseller={() => onBestseller(false)}
        onClearMaxDays={() => onMaxDaysToTop('')}
        onClearMinScore={() => onMinScore('')}
        onClearNiche={onClearNiche}
        onClearNicheWindow={onClearNicheWindow}
      />

      <FeedFiltersDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        maxDaysToTop={maxDaysToTop}
        minScore={minScore}
        preset={preset}
        onMaxDaysToTop={onMaxDaysToTop}
        onMinScore={onMinScore}
        onPreset={onPreset}
      />
    </div>
  )
}
