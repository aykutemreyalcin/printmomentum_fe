import { useEffect, useState } from 'react'
import { ApiError } from '../api/ApiError'
import { getListing } from '../api/client'
import type { ListingDetail } from '../api/types'

export function useListing(listingId: number) {
  const valid = Number.isFinite(listingId) && listingId > 0
  const requestKey = valid ? String(listingId) : 'invalid'
  const [result, setResult] = useState<DetailResult>({
    key: valid ? '' : 'invalid',
    listing: null,
    error: null,
    notFound: !valid,
  })

  useEffect(() => {
    if (!valid) return
    let cancelled = false
    getListing(listingId)
      .then((listing) => {
        if (cancelled) return
        setResult({ key: requestKey, listing, error: null, notFound: false })
      })
      .catch((cause: unknown) => {
        if (cancelled) return
        setResult({
          key: requestKey,
          listing: null,
          error: cause instanceof Error ? cause.message : 'Request failed',
          notFound: cause instanceof ApiError && cause.status === 404,
        })
      })
    return () => {
      cancelled = true
    }
  }, [listingId, valid, requestKey])

  return {
    listing: result.listing,
    error: result.error,
    notFound: !valid || (result.key === requestKey && result.notFound),
    loading: valid && result.key !== requestKey,
    setListing: (listing: ListingDetail) =>
      setResult((current) => ({ ...current, listing, error: null, notFound: false })),
  }
}

type DetailResult = {
  key: string
  listing: ListingDetail | null
  error: string | null
  notFound: boolean
}
