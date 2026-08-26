import { describe, expect, it } from 'vitest'
import { listingFixture } from '../test/stubApi'
import { cycleSort, sortListings, withRanks } from './sortListings'

describe('sortListings', () => {
  const items = withRanks([
    listingFixture({ listingId: 1, title: 'Zebra', momentumScore: 0.4, daysToTop: 9, numFavorers: 10 }),
    listingFixture({ listingId: 2, title: 'Alpha', momentumScore: 2.1, daysToTop: 1.5, numFavorers: 80 }),
  ])

  it('keeps API order when sort is empty', () => {
    expect(sortListings(items, null).map((item) => item.listingId)).toEqual([1, 2])
  })

  it('sorts by momentum descending and keeps original rank', () => {
    const sorted = sortListings(items, { key: 'momentumScore', dir: 'desc' })
    expect(sorted.map((item) => item.listingId)).toEqual([2, 1])
    expect(sorted[0].rank).toBe(2)
  })

  it('cycles a numeric column desc → asc → desc', () => {
    const first = cycleSort(null, 'momentumScore')
    expect(first).toEqual({ key: 'momentumScore', dir: 'desc' })
    const second = cycleSort(first, 'momentumScore')
    expect(second).toEqual({ key: 'momentumScore', dir: 'asc' })
  })
})
