import { useCallback, useEffect, useState } from 'react'
import { getShop } from '../api/client'
import { ApiError } from '../api/ApiError'
import type { Shop } from '../api/types'

export function useShop(shopId: number) {
  const [shop, setShop] = useState<Shop | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!Number.isFinite(shopId) || shopId <= 0) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    setNotFound(false)
    try {
      setShop(await getShop(shopId))
    } catch (cause) {
      setShop(null)
      if (cause instanceof ApiError && cause.status === 404) {
        setNotFound(true)
      } else {
        setError(cause instanceof Error ? cause.message : 'Request failed')
      }
    } finally {
      setLoading(false)
    }
  }, [shopId])

  useEffect(() => {
    void load()
  }, [load])

  return { shop, error, notFound, loading }
}
