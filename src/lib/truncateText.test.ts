import { describe, expect, it } from 'vitest'
import { truncateText } from './truncateText'

describe('truncateText', () => {
  it('keeps short titles intact', () => {
    expect(truncateText('Fast Tee')).toBe('Fast Tee')
  })

  it('keeps the first two words and ellipsis', () => {
    expect(truncateText('Y2K Chrome Butterfly Baby Tee')).toBe('Y2K Chrome...')
  })
})
