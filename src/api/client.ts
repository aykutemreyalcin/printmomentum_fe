import { ApiError } from './ApiError'
import type {
  Health,
  ListingDetail,
  ListingDetailQuery,
  ListingPage,
  ListingsQuery,
} from './types'

const API_BASE = '/api'

export async function getHealth(): Promise<Health> {
  return request('/v1/health')
}

export async function getListings(query: ListingsQuery = {}): Promise<ListingPage> {
  return request(`/v1/listings${toQuery({
    page: query.page,
    size: query.size,
    maxDaysToTop: query.maxDaysToTop,
    minScore: query.minScore,
    q: query.q,
  })}`)
}

export async function getListing(
  listingId: number,
  query: ListingDetailQuery = {},
): Promise<ListingDetail> {
  return request(`/v1/listings/${listingId}${toQuery({
    snapshotLimit: query.snapshotLimit,
    debug: query.debug,
  })}`)
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`)
  if (!response.ok) {
    throw await ApiError.fromResponse(response)
  }
  return (await response.json()) as T
}

function toQuery(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') {
      continue
    }
    search.set(key, String(value))
  }
  const encoded = search.toString()
  return encoded ? `?${encoded}` : ''
}
