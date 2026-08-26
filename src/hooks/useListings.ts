import { useEffect, useState } from 'react'
import { ApiError } from '../api/ApiError'
import { getFavorites, getListings, setListingFavorite } from '../api/client'
import { sampleDataEnabled, sampleListingPage } from '../api/sampleListings'
import type { ListingFeedItem, ListingPage, ListingsQuery } from '../api/types'

export function useListings(query: ListingsQuery = {}, source: 'feed' | 'favorites' = 'feed') {
  const maxDaysToTop = query.maxDaysToTop
  const minScore = query.minScore
  const q = query.q
  const preset = query.preset
  const shopId = query.shopId
  const bestseller = query.bestseller
  const [attempt, setAttempt] = useState(0)
  const requestKey = `${source}|${maxDaysToTop ?? ''}|${minScore ?? ''}|${q ?? ''}|${preset ?? ''}|${shopId ?? ''}|${bestseller ? '1' : ''}|${attempt}`
  const [result, setResult] = useState<FeedResult>({
    key: '',
    page: null,
    error: null,
    sample: false,
  })

  useEffect(() => {
    let cancelled = false
    const load = source === 'favorites'
      ? getFavorites({ page: 0, size: 100 })
      : getListings({ maxDaysToTop, minScore, q, preset, shopId, bestseller, page: 0, size: 100 })
    load
      .then((page) => {
        if (cancelled) return
        setResult({ key: requestKey, page, error: null, sample: false })
      })
      .catch((cause: unknown) => {
        if (cancelled) return
        if (sampleDataEnabled() && !(cause instanceof ApiError) && source === 'feed') {
          setResult({
            key: requestKey,
            page: sampleListingPage(),
            error: null,
            sample: true,
          })
          return
        }
        setResult({
          key: requestKey,
          page: null,
          error: problemTitle(cause),
          sample: false,
        })
      })
    return () => {
      cancelled = true
    }
  }, [source, maxDaysToTop, minScore, q, preset, shopId, bestseller, attempt, requestKey])

  return {
    page: result.page,
    error: result.error,
    sample: result.sample,
    loading: result.key !== requestKey,
    retry: () => setAttempt((current) => current + 1),
    toggleFavorite: async (listing: ListingFeedItem) => {
      const next = !listing.favorite
      await setListingFavorite(listing.listingId, next)
      setResult((current) => {
        if (!current.page) return current
        const items = current.page.items
          .map((item) => (item.listingId === listing.listingId ? { ...item, favorite: next } : item))
          .filter((item) => source !== 'favorites' || item.favorite)
        return {
          ...current,
          page: { ...current.page, items, total: source === 'favorites' ? items.length : current.page.total },
        }
      })
    },
  }
}

function problemTitle(cause: unknown): string {
  if (cause instanceof ApiError) {
    return cause.title ?? cause.message
  }
  return cause instanceof Error ? cause.message : 'Request failed'
}

type FeedResult = {
  key: string
  page: ListingPage | null
  error: string | null
  sample: boolean
}
