import { getListing, getListings } from '../api/client'
import type { ListingFeedItem, ListingsQuery } from '../api/types'

const EXPORT_PAGE_SIZE = 200

export async function fetchAllListings(
  query: Omit<ListingsQuery, 'page' | 'size'>,
): Promise<ListingFeedItem[]> {
  const first = await getListings({ ...query, page: 0, size: EXPORT_PAGE_SIZE })
  const items = [...first.items]
  const pages = Math.ceil(first.total / EXPORT_PAGE_SIZE)
  for (let page = 1; page < pages; page += 1) {
    const next = await getListings({ ...query, page, size: EXPORT_PAGE_SIZE })
    items.push(...next.items)
  }
  return items
}

export async function fetchListingsByIds(ids: number[]): Promise<ListingFeedItem[]> {
  if (ids.length === 0) {
    return []
  }
  return Promise.all(ids.map((id) => getListing(id)))
}
