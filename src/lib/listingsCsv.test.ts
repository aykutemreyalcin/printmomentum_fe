import { describe, expect, it } from 'vitest'
import { listingsToCsv } from './listingsCsv'
import { listingFixture } from '../test/stubApi'

describe('listingsToCsv', () => {
  it('quotes titles with commas and includes query hits', () => {
    const csv = listingsToCsv([
      listingFixture({
        title: 'Teacher, Nurse, Dog Mom Tee',
        shopId: 44,
        queryHits: [{ query: 'teacher shirt', position: 3 }],
      }),
    ])

    expect(csv).toContain('"Teacher, Nurse, Dog Mom Tee"')
    expect(csv).toContain('teacher shirt#3')
    expect(csv.split('\n')).toHaveLength(2)
  })
})
