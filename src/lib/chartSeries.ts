import type { TopChartItem } from '../api/types'

export type ChartMetric = 'numFavorers' | 'views'

export type ChartPoint = { t: number; value: number }

export type ChartSeries = {
  id: number
  label: string
  color: string
  points: ChartPoint[]
}

const GOLDEN_ANGLE = 137.508

export function seriesColor(index: number): string {
  const hue = (index * GOLDEN_ANGLE) % 360
  return `hsl(${hue.toFixed(1)} 62% 48%)`
}

export function buildChartSeries(items: TopChartItem[], metric: ChartMetric): ChartSeries[] {
  return items
    .map((item, index) => {
      const points = item.snapshots.flatMap((snapshot) => {
        const raw = metric === 'numFavorers' ? snapshot.numFavorers : snapshot.views
        if (raw == null) {
          return []
        }
        return [{ t: Date.parse(snapshot.observedAt), value: raw }]
      })
      return {
        id: item.listingId,
        label: item.title,
        color: seriesColor(index),
        points,
      }
    })
    .filter((series) => series.points.length > 0)
}

export function chartExtents(series: ChartSeries[]): {
  minT: number
  maxT: number
  minV: number
  maxV: number
} {
  const times = series.flatMap((item) => item.points.map((point) => point.t))
  const values = series.flatMap((item) => item.points.map((point) => point.value))
  if (times.length === 0 || values.length === 0) {
    return { minT: 0, maxT: 1, minV: 0, maxV: 1 }
  }
  const minT = Math.min(...times)
  const maxT = Math.max(...times)
  const minV = Math.min(...values)
  const maxV = Math.max(...values)
  return {
    minT,
    maxT: minT === maxT ? minT + 86_400_000 : maxT,
    minV,
    maxV: minV === maxV ? minV + 1 : maxV,
  }
}

export function pointsToPolyline(
  points: ChartPoint[],
  width: number,
  height: number,
  pad: number,
  minT: number,
  maxT: number,
  minV: number,
  maxV: number,
): string {
  if (points.length === 0) {
    return ''
  }
  const spanT = Math.max(maxT - minT, 1)
  const spanV = Math.max(maxV - minV, 1)
  return points
    .map((point) => {
      const x = pad + ((point.t - minT) / spanT) * (width - pad * 2)
      const y = height - pad - ((point.value - minV) / spanV) * (height - pad * 2)
      return `${x},${y}`
    })
    .join(' ')
}
