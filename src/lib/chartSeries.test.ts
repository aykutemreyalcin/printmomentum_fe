import { describe, expect, it } from 'vitest'
import { buildChartSeries, chartExtents, seriesColor } from './chartSeries'

describe('chartSeries', () => {
  it('builds favorers series from snapshots', () => {
    const series = buildChartSeries(
      [
        {
          listingId: 1,
          title: 'A',
          imageUrl: null,
          etsyUrl: 'https://etsy.com/1',
          momentumScore: 2,
          daysToTop: 2,
          numFavorers: 10,
          views: 100,
          snapshots: [
            { observedAt: '2026-08-20T10:00:00Z', position: 1, numFavorers: 10, views: 100 },
            { observedAt: '2026-08-21T10:00:00Z', position: 2, numFavorers: 20, views: 150 },
          ],
        },
      ],
      'numFavorers',
    )
    expect(series).toHaveLength(1)
    expect(series[0].points).toHaveLength(2)
    expect(series[0].points[1].value).toBe(20)
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
})
