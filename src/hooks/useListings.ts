import { useEffect, useState } from 'react'
import { ApiError } from '../api/ApiError'
import { getListings } from '../api/client'
import { sampleDataEnabled, sampleListingPage } from '../api/sampleListings'
import type { ListingPage, ListingsQuery } from '../api/types'

export function useListings(query: ListingsQuery = {}) {
  const maxDaysToTop = query.maxDaysToTop
  const minScore = query.minScore
  const q = query.q
  const [attempt, setAttempt] = useState(0)
  const requestKey = `${maxDaysToTop ?? ''}|${minScore ?? ''}|${q ?? ''}|${attempt}`
  const [result, setResult] = useState<FeedResult>({
    key: '',
    page: null,
    error: null,
    sample: false,
  })

  useEffect(() => {
    let cancelled = false
    getListings({ maxDaysToTop, minScore, q })
      .then((page) => {
        if (cancelled) return
        setResult({ key: requestKey, page, error: null, sample: false })
      })
      .catch((cause: unknown) => {
        if (cancelled) return
        if (sampleDataEnabled() && !(cause instanceof ApiError)) {
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
  }, [maxDaysToTop, minScore, q, attempt, requestKey])

  return {
    page: result.page,
    error: result.error,
    sample: result.sample,
    loading: result.key !== requestKey,
    retry: () => setAttempt((current) => current + 1),
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
