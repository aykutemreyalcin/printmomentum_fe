import { describe, expect, it } from 'vitest'
import {
  buildChartSeries,
  chartExtents,
  filterSnapshotsByWindow,
  normalizePoints,
  pointsToPolyline,
  seriesColor,
} from './chartSeries'
import type { TopChartItem } from '../api/types'

const baseItem: TopChartItem = {
  listingId: 1,
  title: 'A',
  imageUrl: null,
  etsyUrl: 'https://etsy.com/1',
  momentumScore: 2,
  daysToTop: 2,
  numFavorers: 10,
  views: 100,
  snapshots: [
    { observedAt: '2026-08-01T10:00:00Z', position: 40, numFavorers: 10, views: 100 },
    { observedAt: '2026-08-15T10:00:00Z', position: 20, numFavorers: 20, views: 150 },
    { observedAt: '2026-08-21T10:00:00Z', position: 5, numFavorers: 31, views: 520 },
  ],
}

describe('chartSeries', () => {
  it('builds favorers series from snapshots', () => {
    const series = buildChartSeries([baseItem], 'numFavorers', 'absolute', 90, Date.parse('2026-08-30T00:00:00Z'))
    expect(series).toHaveLength(1)
    expect(series[0].points).toHaveLength(3)
    expect(series[0].points[2].value).toBe(31)
  })

  it('filters snapshots to the selected window', () => {
    const filtered = filterSnapshotsByWindow(baseItem.snapshots, 30, Date.parse('2026-09-03T00:00:00Z'))
    expect(filtered).toHaveLength(2)
    expect(filtered[0].observedAt).toBe('2026-08-15T10:00:00Z')
  })

  it('normalizes favorers to index 100 at start', () => {
    const points = normalizePoints(
      [
        { t: 1, value: 10 },
        { t: 2, value: 20 },
      ],
      'numFavorers',
    )
    expect(points[0].value).toBe(100)
    expect(points[1].value).toBe(200)
  })

  it('normalizes position so rank improvement trends up', () => {
    const points = normalizePoints(
      [
        { t: 1, value: 40 },
        { t: 2, value: 20 },
      ],
      'position',
    )
    expect(points[0].value).toBe(100)
    expect(points[1].value).toBe(200)
  })

  it('assigns distinct colors', () => {
    expect(seriesColor(0)).not.toBe(seriesColor(1))
  })

  it('computes chart extents', () => {
    const extents = chartExtents([
      {
        id: 1,
        label: 'A',
        color: '#000',
        points: [
          { t: 100, value: 5 },
          { t: 200, value: 15 },
        ],
      },
    ])
    expect(extents.minT).toBe(100)
    expect(extents.maxT).toBe(200)
    expect(extents.minV).toBe(5)
    expect(extents.maxV).toBe(15)
  })

  it('renders polyline with chart padding', () => {
    const polyline = pointsToPolyline(
      [
        { t: 0, value: 0 },
        { t: 100, value: 100 },
      ],
      200,
      100,
      20,
      10,
      10,
      20,
      0,
      100,
      0,
      100,
    )
    expect(polyline).toContain('20,')
    expect(polyline.split(' ')).toHaveLength(2)
  })
})
