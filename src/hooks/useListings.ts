import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/ApiError'
import { getFavorites, getListings, setListingFavorite } from '../api/client'
import { sampleDataEnabled, sampleListingPage } from '../api/sampleListings'
import type { ListingFeedItem, ListingPage, ListingsQuery } from '../api/types'
import { useFavoritesCount } from '../favorites/FavoritesCountProvider'

const DEFAULT_PAGE_SIZE = 50

export function useListings(
  query: ListingsQuery = {},
  source: 'feed' | 'favorites' = 'feed',
  pagination: { pageIndex: number; pageSize: number } = { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE },
) {
  const { bump } = useFavoritesCount()
  const maxDaysToTop = query.maxDaysToTop
  const minScore = query.minScore
  const q = query.q
  const preset = query.preset
  const shopId = query.shopId
  const bestseller = query.bestseller
  const momentumPeriod = query.momentumPeriod ?? 'weekly'
  const pageIndex = pagination.pageIndex
  const pageSize = pagination.pageSize
  const [attempt, setAttempt] = useState(0)
  const requestKey = `${source}|${maxDaysToTop ?? ''}|${minScore ?? ''}|${q ?? ''}|${preset ?? ''}|${shopId ?? ''}|${bestseller ? '1' : ''}|${momentumPeriod}|${pageIndex}|${pageSize}|${attempt}`
  const [result, setResult] = useState<FeedResult>({
    key: '',
    page: null,
    error: null,
    sample: false,
  })

  useEffect(() => {
    let cancelled = false
    const load =
      source === 'favorites'
        ? getFavorites({ page: pageIndex, size: pageSize })
        : getListings({
            maxDaysToTop,
            minScore,
            q,
            preset,
            shopId,
            bestseller,
            momentumPeriod,
            page: pageIndex,
            size: pageSize,
          })
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
  }, [
    source,
    maxDaysToTop,
    minScore,
    q,
    preset,
    shopId,
    bestseller,
    momentumPeriod,
    pageIndex,
    pageSize,
    attempt,
    requestKey,
  ])

  const toggleFavorite = useCallback(
    async (listing: ListingFeedItem) => {
      const next = !listing.favorite
      await setListingFavorite(listing.listingId, next)
      bump(next ? 1 : -1)
      setResult((current) => {
        if (!current.page) return current
        const items = current.page.items
          .map((item) => (item.listingId === listing.listingId ? { ...item, favorite: next } : item))
          .filter((item) => source !== 'favorites' || item.favorite)
        return {
          ...current,
          page: {
            ...current.page,
            items,
            total: source === 'favorites' ? items.length : current.page.total,
          },
        }
      })
    },
    [bump, source],
  )

  return {
    page: result.page,
    error: result.error,
    sample: result.sample,
    loading: result.key !== requestKey,
    retry: () => setAttempt((current) => current + 1),
    toggleFavorite,
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
