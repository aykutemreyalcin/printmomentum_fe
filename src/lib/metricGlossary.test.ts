import { describe, expect, it } from 'vitest'
import { listingFixture } from '../test/stubApi'
import { daysToTopHover, estSalesHover, queryHitHover, viewsHover } from './metricGlossary'

describe('metricGlossary', () => {
  it('uses plan copy for days-to-top and query rank', () => {
    const listing = listingFixture({
      firstSeenInTopAt: '2026-08-12T00:00:00Z',
      reviews30d: 4,
      estSales30d: 40,
      views: 200,
      ageDays: 10,
      deltaViews7d: 12,
    })
    expect(daysToTopHover(listing)).toContain('Reached top-N on')
    expect(estSalesHover(listing)).toContain('0.10')
    expect(queryHitHover('graphic tee', 3)).toBe('Rank 3 for “graphic tee” at last crawl')
    expect(viewsHover(listing)).toContain('200')
  })
})
