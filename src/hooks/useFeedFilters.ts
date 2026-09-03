import { useSearchParams } from 'react-router'
import type { ListingsQuery, MomentumPeriod, NicheWindowState } from '../api/types'
import { useDebouncedValue } from './useDebouncedValue'

const SEARCH_DEBOUNCE_MS = 300
const DEFAULT_MOMENTUM_PERIOD: MomentumPeriod = 'weekly'

export function useFeedFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const maxDaysToTop = searchParams.get('maxDaysToTop') ?? ''
  const minScore = searchParams.get('minScore') ?? ''
  const q = searchParams.get('q') ?? ''
  const preset = searchParams.get('preset') ?? ''
  const shopId = searchParams.get('shopId') ?? ''
  const bestseller = searchParams.get('bestseller') === 'true'
  const nicheSlug = searchParams.get('nicheSlug') ?? ''
  const nicheWindow = parseNicheWindow(searchParams.get('nicheWindow'))
  const momentumPeriod = parseMomentumPeriod(searchParams.get('momentumPeriod'))
  const debouncedQ = useDebouncedValue(q, SEARCH_DEBOUNCE_MS)

  return {
    maxDaysToTop,
    minScore,
    q,
    preset,
    shopId,
    bestseller,
    nicheSlug,
    nicheWindow,
    momentumPeriod,
    query: toListingsQuery(maxDaysToTop, minScore, debouncedQ, preset, shopId, bestseller, nicheSlug, nicheWindow, momentumPeriod),
    setMaxDaysToTop: (value: string) => patchSearchParams(setSearchParams, { maxDaysToTop: value }),
    setMinScore: (value: string) => patchSearchParams(setSearchParams, { minScore: value }),
    setQ: (value: string) => patchSearchParams(setSearchParams, { q: value }),
    setPreset: (value: string) => patchSearchParams(setSearchParams, { preset: value }),
    setShopId: (value: string) => patchSearchParams(setSearchParams, { shopId: value }),
    setBestseller: (value: boolean) => patchSearchParams(setSearchParams, { bestseller: value ? 'true' : '' }),
    setNicheSlug: (value: string) => patchSearchParams(setSearchParams, { nicheSlug: value }),
    setNicheWindow: (value: NicheWindowState | '') =>
      patchSearchParams(setSearchParams, { nicheWindow: value }),
    setMomentumPeriod: (value: MomentumPeriod) =>
      patchSearchParams(setSearchParams, { momentumPeriod: value === DEFAULT_MOMENTUM_PERIOD ? '' : value }),
    clearNiche: () =>
      patchSearchParams(setSearchParams, { nicheSlug: '', nicheWindow: '' }),
  }
}

function toListingsQuery(
  maxDaysToTop: string,
  minScore: string,
  q: string,
  preset: string,
  shopId: string,
  bestseller: boolean,
  nicheSlug: string,
  nicheWindow: NicheWindowState | '',
  momentumPeriod: MomentumPeriod,
): ListingsQuery {
  return {
    maxDaysToTop: parseOptionalNumber(maxDaysToTop),
    minScore: parseOptionalNumber(minScore),
    q: q === '' ? undefined : q,
    preset: preset === '' ? undefined : preset,
    shopId: parseOptionalNumber(shopId),
    bestseller: bestseller ? true : undefined,
    nicheSlug: nicheSlug === '' ? undefined : nicheSlug,
    nicheWindow: nicheWindow === '' ? undefined : nicheWindow,
    momentumPeriod,
    page: 0,
    size: 100,
  }
}

function parseMomentumPeriod(value: string | null): MomentumPeriod {
  if (value === 'daily' || value === 'weekly' || value === 'monthly') {
    return value
  }
  return DEFAULT_MOMENTUM_PERIOD
}

function parseNicheWindow(value: string | null): NicheWindowState | '' {
  if (value === 'OPEN' || value === 'CLOSING' || value === 'CLOSED' || value === 'LOW_DATA') {
    return value
  }
  return ''
}

function parseOptionalNumber(value: string): number | undefined {
  if (value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function patchSearchParams(
  setSearchParams: ReturnType<typeof useSearchParams>[1],
  patch: Record<string, string>,
) {
  setSearchParams(
    (previous) => {
      const next = new URLSearchParams(previous)
      for (const [key, value] of Object.entries(patch)) {
        if (value === '') {
          next.delete(key)
        } else {
          next.set(key, value)
        }
      }
      return next
    },
    { replace: true },
  )
}
