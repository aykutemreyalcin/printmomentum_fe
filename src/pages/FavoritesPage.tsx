import { ListingFeedTable } from '../components/ListingFeedTable'
import { useListings } from '../hooks/useListings'
import { useState } from 'react'
import './FeedPage.css'

export function FavoritesPage() {
  const { page, error, loading, retry, toggleFavorite } = useListings({}, 'favorites')
  const [search, setSearch] = useState('')
  const items = page?.items ?? []

  return (
    <div className="feed">
      <div className="page-toolbar">
        <div>
          <h2>Favorites</h2>
          <p className="label page-meta">
            {loading ? 'Loading favorites' : `${page?.total ?? 0} saved listings`}
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
        emptyMessage="No favorites yet. Heart a listing in the feed to pin it here."
      />
    </div>
  )
}
