import { useEffect, useState } from 'react'
import { getListings } from '../api/client'
import { sampleDataEnabled, sampleListingPage } from '../api/sampleListings'
import type { ListingPage } from '../api/types'

export function useListings() {
  const [page, setPage] = useState<ListingPage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sample, setSample] = useState(false)

  useEffect(() => {
    let cancelled = false
    getListings()
      .then((value) => {
        if (cancelled) return
        setPage(value)
        setError(null)
        setLoading(false)
      })
      .catch((cause: unknown) => {
        if (cancelled) return
        if (sampleDataEnabled()) {
          setPage(sampleListingPage())
          setSample(true)
          setLoading(false)
          return
        }
        setError(cause instanceof Error ? cause.message : 'Request failed')
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { page, error, loading, sample }
}
