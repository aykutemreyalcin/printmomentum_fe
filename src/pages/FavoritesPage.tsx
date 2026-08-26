import { useState } from 'react'
import { ListingFeedTable } from '../components/ListingFeedTable'
import { useListings } from '../hooks/useListings'
import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/I18nProvider'
import './FeedPage.css'

export function FavoritesPage() {
  usePageTitle('title.favorites')
  const { t } = useI18n()
  const { page, error, loading, retry, toggleFavorite } = useListings({}, 'favorites')
  const [search, setSearch] = useState('')
  const items = page?.items ?? []

  return (
    <div className="feed">
      <div className="page-toolbar">
        <div>
          <h2>{t('favorites.title')}</h2>
          <p className="label page-meta">
            {loading ? t('favorites.loading') : t('favorites.saved', { count: page?.total ?? 0 })}
          </p>
        </div>
      </div>

      <ListingFeedTable
        items={items}
        loading={loading}
        error={error}
        onRetry={retry}
        search={search}
        onSearch={setSearch}
        onToggleFavorite={toggleFavorite}
        emptyMessage={t('favorites.empty')}
      />
    </div>
  )
}
