import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { getFavorites } from '../api/client'
import { useAuth } from '../auth/AuthProvider'

type FavoritesCountValue = {
  count: number | null
  bump: (delta: number) => void
  refresh: () => void
}

const FavoritesCountContext = createContext<FavoritesCountValue | null>(null)

export function FavoritesCountProvider({ children }: PropsWithChildren) {
  const { auth } = useAuth()
  const [count, setCount] = useState<number | null>(null)

  const refresh = useCallback(() => {
    if (!auth) {
      setCount(null)
      return
    }
    void getFavorites({ page: 0, size: 1 })
      .then((page) => setCount(page.total))
      .catch(() => setCount(null))
  }, [auth])

  useEffect(() => {
    refresh()
  }, [refresh])

  const bump = useCallback((delta: number) => {
    setCount((current) => (current == null ? current : Math.max(0, current + delta)))
  }, [])

  const value = useMemo(() => ({ count, bump, refresh }), [count, bump, refresh])
  return <FavoritesCountContext.Provider value={value}>{children}</FavoritesCountContext.Provider>
}

export function useFavoritesCount(): FavoritesCountValue {
  const context = useContext(FavoritesCountContext)
  if (!context) {
    throw new Error('useFavoritesCount must be used within FavoritesCountProvider')
  }
  return context
}
