import type { ListingSnapshot, TopChartItem } from '../api/types'

export type ChartMetric = 'numFavorers' | 'views' | 'position'
export type ChartMode = 'absolute' | 'normalized'
export type ChartWindowDays = 30 | 90

export type ChartPoint = { t: number; value: number }

export type ChartSeries = {
  id: number
  label: string
  color: string
  points: ChartPoint[]
}

const GOLDEN_ANGLE = 137.508
const MS_PER_DAY = 86_400_000

export function seriesColor(index: number): string {
  const hue = (index * GOLDEN_ANGLE) % 360
  return `hsl(${hue.toFixed(1)} 62% 48%)`
}

function rawMetricValue(snapshot: ListingSnapshot, metric: ChartMetric): number | null {
  if (metric === 'numFavorers') {
    return snapshot.numFavorers
  }
  if (metric === 'views') {
    return snapshot.views ?? null
  }
  return snapshot.position
}

export function filterSnapshotsByWindow(
  snapshots: ListingSnapshot[],
  windowDays: ChartWindowDays,
  nowMs = Date.now(),
): ListingSnapshot[] {
  const minT = nowMs - windowDays * MS_PER_DAY
  return snapshots.filter((snapshot) => Date.parse(snapshot.observedAt) >= minT)
}

export function normalizePoints(points: ChartPoint[], metric: ChartMetric): ChartPoint[] {
  if (points.length === 0) {
    return []
  }
  const baseline = points[0].value
  if (baseline === 0) {
    return points.map((point) => ({ t: point.t, value: 100 }))
  }
  return points.map((point) => ({
    t: point.t,
    value:
      metric === 'position'
        ? (baseline / point.value) * 100
        : (point.value / baseline) * 100,
  }))
}

export function buildChartSeries(
  items: TopChartItem[],
  metric: ChartMetric,
  mode: ChartMode,
  windowDays: ChartWindowDays,
  nowMs = Date.now(),
): ChartSeries[] {
  return items
    .map((item, index) => {
      const snapshots = filterSnapshotsByWindow(item.snapshots, windowDays, nowMs)
      let points = snapshots.flatMap((snapshot) => {
        const raw = rawMetricValue(snapshot, metric)
        if (raw == null) {
          return []
        }
        return [{ t: Date.parse(snapshot.observedAt), value: raw }]
      })
      if (mode === 'normalized') {
        points = normalizePoints(points, metric)
      }
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
    maxT: minT === maxT ? minT + MS_PER_DAY : maxT,
    minV,
    maxV: minV === maxV ? minV + 1 : maxV,
  }
}

export function pointsToPolyline(
  points: ChartPoint[],
  width: number,
  height: number,
  padLeft: number,
  padRight: number,
  padTop: number,
  padBottom: number,
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
  const chartWidth = width - padLeft - padRight
  const chartHeight = height - padTop - padBottom
  return points
    .map((point) => {
      const x = padLeft + ((point.t - minT) / spanT) * chartWidth
      const y = padTop + chartHeight - ((point.value - minV) / spanV) * chartHeight
      return `${x},${y}`
    })
    .join(' ')
}

export function formatChartAxisDate(epochMs: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(epochMs))
}

export function formatChartAxisValue(
  value: number,
  metric: ChartMetric,
  mode: ChartMode,
  locale: string,
): string {
  if (mode === 'normalized') {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)
  }
  if (metric === 'position') {
    return `#${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)}`
  }
  return new Intl.NumberFormat(locale, { notation: value >= 10_000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(
    value,
  )
}
