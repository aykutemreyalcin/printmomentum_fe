import Tooltip from '@mui/material/Tooltip'
import { formatShortDate } from '../lib/format'
import type { ListingFeedItem } from '../api/types'
import './BestsellerBadge.css'

type Props = {
  listing: ListingFeedItem
}

export function BestsellerBadge({ listing }: Props) {
  if (listing.etsyBestseller) {
    const since = formatShortDate(listing.etsyBestsellerSince)
    const title =
      listing.etsyBestsellerSince != null
        ? `Since ${since} · seen on Etsy search is_best_seller=true · temporary source`
        : 'Seen on Etsy search is_best_seller=true · temporary source'
    return (
      <Tooltip title={title}>
        <span className="bestseller-badge">Bestseller</span>
      </Tooltip>
    )
  }
  if (listing.etsyBestsellerEndedAt && listing.etsyBestsellerSince) {
    return (
      <Tooltip
        title={`Was bestseller ${formatShortDate(listing.etsyBestsellerSince)}–${formatShortDate(listing.etsyBestsellerEndedAt)}`}
      >
        <span className="bestseller-badge is-past">Was bestseller</span>
      </Tooltip>
    )
  }
  if (listing.pmBestseller) {
    return (
      <Tooltip title="Likely (PM) · reviews in the last 30 days suggest a bestseller. Not confirmed on Etsy.">
        <span className="bestseller-badge is-pm">Likely (PM)</span>
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
