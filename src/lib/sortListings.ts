import type { ListingFeedItem } from '../api/types'

export type ListingSortKey = 'rank' | 'title' | 'price' | 'numFavorers' | 'daysToTop' | 'momentumScore'
export type SortDir = 'asc' | 'desc'

export type RankedListing = ListingFeedItem & { rank: number }

export type ListingSort = {
  key: ListingSortKey
  dir: SortDir
} | null

export function withRanks(items: ListingFeedItem[]): RankedListing[] {
  return items.map((item, index) => ({ ...item, rank: index + 1 }))
}

export function sortListings(items: RankedListing[], sort: ListingSort): RankedListing[] {
  if (!sort) {
    return items
  }
  const copy = [...items]
  copy.sort((left, right) => compare(left, right, sort.key) * (sort.dir === 'asc' ? 1 : -1))
  return copy
}

export function cycleSort(current: ListingSort, key: ListingSortKey): ListingSort {
  if (current?.key !== key) {
    return { key, dir: key === 'title' ? 'asc' : 'desc' }
  }
  return { key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
}

function compare(left: RankedListing, right: RankedListing, key: ListingSortKey): number {
  if (key === 'title') {
    return left.title.localeCompare(right.title)
  }
  if (key === 'rank') {
    return left.rank - right.rank
  }
  const a = numeric(left, key)
  const b = numeric(right, key)
  if (a == null && b == null) {
    return 0
  }
  if (a == null) {
    return 1
  }
  if (b == null) {
    return -1
  }
  return a - b
}

function numeric(
  item: RankedListing,
  key: Exclude<ListingSortKey, 'title' | 'rank'>,
): number | null {
  const value = item[key]
  return value == null ? null : value
}
