import { describe, expect, it } from 'vitest'
import { formatAgeDays, formatCount, formatDays, formatDelta, formatMoney, formatScore, formatShortDate } from './format'

describe('format', () => {
  it('formats money and leaves blanks as em dash', () => {
    expect(formatMoney(24.5, 'USD')).toBe('$24.50')
    expect(formatMoney(null, 'USD')).toBe('—')
  })

  it('formats days, scores, and counts', () => {
    expect(formatDays(1.62)).toBe('1.6')
    expect(formatScore(1.841)).toBe('1.84')
    expect(formatCount(1234)).toBe('1,234')
    expect(formatDelta(12)).toBe('+12')
    expect(formatDelta(-3)).toBe('-3')
    expect(formatDays(null)).toBe('—')
    expect(formatAgeDays(0.2)).toBe('5h')
    expect(formatAgeDays(12.41)).toBe('12.4d')
    expect(formatShortDate('2026-08-12T00:00:00Z')).toMatch(/12 Aug 2026/)
  })
})
