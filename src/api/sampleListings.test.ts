import { describe, expect, it } from 'vitest'
import { sampleDataEnabled, sampleListingPage } from './sampleListings'

describe('sample listings', () => {
  it('is enabled only for a dev build outside tests', () => {
    expect(sampleDataEnabled({ DEV: true, MODE: 'development' })).toBe(true)
    expect(sampleDataEnabled({ DEV: true, MODE: 'test' })).toBe(false)
    expect(sampleDataEnabled({ DEV: false, MODE: 'production' })).toBe(false)
  })

  it('returns a page whose total matches the items', () => {
    const page = sampleListingPage()

    expect(page.items.length).toBeGreaterThan(0)
    expect(page.total).toBe(page.items.length)
    expect(page.items[0].momentumScore).toBeGreaterThan(page.items[1].momentumScore!)
  })
})
