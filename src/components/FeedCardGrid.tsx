import { Link } from 'react-router'
import type { ListingFeedItem } from '../api/types'
import { useI18n } from '../i18n/I18nProvider'
import { formatDelta, formatDays, formatScore } from '../lib/format'
import { withRanks } from '../lib/sortListings'
import { truncateText } from '../lib/truncateText'
import { FavoriteButton } from './FavoriteButton'
import './FeedCardGrid.css'

type Props = {
  items: ListingFeedItem[]
  onToggleFavorite: (listing: ListingFeedItem) => void | Promise<void>
  emptyMessage: string
}

export function FeedCardGrid({ items, onToggleFavorite, emptyMessage }: Props) {
  const { t } = useI18n()
  const ranked = withRanks(items)

  if (ranked.length === 0) {
    return <p className="feed-card-empty">{emptyMessage}</p>
  }

  return (
    <div className="feed-card-grid">
      {ranked.map((listing) => (
        <article key={listing.listingId} className="feed-card">
          <div className="feed-card-top">
            <span className="feed-card-rank">{String(listing.rank).padStart(2, '0')}</span>
            <FavoriteButton
              favorite={Boolean(listing.favorite)}
              onToggle={() => onToggleFavorite(listing)}
            />
          </div>
          {listing.imageUrl ? (
            <Link to={`/listings/${listing.listingId}`} className="feed-card-image">
              <img src={listing.imageUrl} alt="" loading="lazy" />
            </Link>
          ) : null}
          <h3>
            <Link to={`/listings/${listing.listingId}`}>{truncateText(listing.title, 3)}</Link>
          </h3>
          <dl className="feed-card-stats">
            <div>
              <dt>{t('table.momentum')}</dt>
              <dd>{formatScore(listing.momentumScore)}</dd>
            </div>
            <div>
              <dt>{t('table.deltaFav')}</dt>
              <dd>{formatDelta(listing.deltaFavorers7d)}</dd>
            </div>
            <div>
              <dt>{t('table.daysToTop')}</dt>
              <dd>
                {formatDays(listing.daysToTop)} {t('table.climbDaysUnit')}
              </dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  )
}
