import Tooltip from '@mui/material/Tooltip'
import { formatShortDate } from '../lib/format'
import type { ListingFeedItem } from '../api/types'
import { useI18n } from '../i18n/I18nProvider'
import './BestsellerBadge.css'

type Props = {
  listing: ListingFeedItem
}

export function BestsellerBadge({ listing }: Props) {
  const { t } = useI18n()

  if (listing.etsyBestseller) {
    const since = formatShortDate(listing.etsyBestsellerSince)
    const title =
      listing.etsyBestsellerSince != null
        ? t('badge.since', { date: since })
        : t('badge.seen')
    return (
      <Tooltip title={title}>
        <span className="bestseller-badge">{t('badge.bestseller')}</span>
      </Tooltip>
    )
  }
  if (listing.etsyBestsellerEndedAt && listing.etsyBestsellerSince) {
    return (
      <Tooltip
        title={t('badge.wasRange', {
          from: formatShortDate(listing.etsyBestsellerSince),
          to: formatShortDate(listing.etsyBestsellerEndedAt),
        })}
      >
        <span className="bestseller-badge is-past">{t('badge.was')}</span>
      </Tooltip>
    )
  }
  if (listing.pmBestseller) {
    return (
      <Tooltip title={t('badge.likelyHint')}>
        <span className="bestseller-badge is-pm">{t('badge.likely')}</span>
      </Tooltip>
    )
  }
  return <span className="bestseller-empty">—</span>
}

export function bestsellerFilterValue(listing: ListingFeedItem): string {
  if (listing.etsyBestseller) return 'etsy'
  if (listing.pmBestseller) return 'pm'
  if (listing.etsyBestsellerEndedAt) return 'was'
  return 'no'
}
