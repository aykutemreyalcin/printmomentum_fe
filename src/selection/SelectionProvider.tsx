import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react'

const STORAGE_KEY = 'printmomentum-selected'

type SelectionValue = {
  ids: number[]
  toggle: (id: number) => void
  clear: () => void
}

const SelectionContext = createContext<SelectionValue | null>(null)

function readIds(): number[] {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    const parsed = stored ? (JSON.parse(stored) as number[]) : []
    return parsed.filter((id) => Number.isFinite(id))
  } catch {
    return []
  }
}

export function SelectionProvider({ children }: PropsWithChildren) {
  const [ids, setIds] = useState<number[]>(() => readIds())

  const persist = useCallback((next: number[]) => {
    setIds(next)
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }, [])

  const toggle = useCallback(
    (id: number) => {
      setIds((current) => {
        const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        } catch {
          /* ignore */
        }
        return next
      })
    },
    [],
  )

  const clear = useCallback(() => persist([]), [persist])

  const value = useMemo(() => ({ ids, toggle, clear }), [ids, toggle, clear])
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>
}

export function useSelection(): SelectionValue {
  const context = useContext(SelectionContext)
  if (!context) {
    throw new Error('useSelection must be used within SelectionProvider')
  }
  return context
}
