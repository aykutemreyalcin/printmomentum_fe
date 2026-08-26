import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { useToast } from '../components/Toast'

const STORAGE_KEY = 'printmomentum-compare'

type CompareValue = {
  ids: number[]
  toggle: (id: number) => void
  clear: () => void
}

const CompareContext = createContext<CompareValue | null>(null)

function readIds(): number[] {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    const parsed = stored ? (JSON.parse(stored) as number[]) : []
    return parsed.filter((id) => Number.isFinite(id)).slice(0, 2)
  } catch {
    return []
  }
}

export function CompareProvider({ children }: PropsWithChildren) {
  const { t } = useI18n()
  const { showToast } = useToast()
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
        let next: number[]
        if (current.includes(id)) {
          next = current.filter((item) => item !== id)
        } else if (current.length >= 2) {
          showToast(t('compare.max'), 'error')
          return current
        } else {
          next = [...current, id]
        }
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        } catch {
          /* ignore */
        }
        return next
      })
    },
    [showToast, t],
  )

  const clear = useCallback(() => persist([]), [persist])

  const value = useMemo(() => ({ ids, toggle, clear }), [ids, toggle, clear])
  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}

export function useCompare(): CompareValue {
  const context = useContext(CompareContext)
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider')
  }
  return context
}
