import type { ListingSnapshot } from '../api/types'

type Metric = 'position' | 'numFavorers' | 'views'

type Props = {
  snapshots: ListingSnapshot[]
  metric?: Metric
  label?: string
}

const WIDTH = 320
const HEIGHT = 72
const PAD = 4

export function Sparkline({ snapshots, metric = 'position', label }: Props) {
  const values = snapshots.map((snapshot) => {
    if (metric === 'numFavorers') {
      return snapshot.numFavorers
    }
    if (metric === 'views') {
      return snapshot.views ?? null
    }
    return snapshot.position
  })
  const numeric = values.filter((value): value is number => value != null)
  if (numeric.length === 0) {
    return <p className="detail-spark-empty">No snapshots yet.</p>
  }

  const min = Math.min(...numeric)
  const max = Math.max(...numeric)
  const span = Math.max(max - min, 1)
  const last = snapshots.length - 1
  const points = snapshots.flatMap((snapshot, index) => {
    const value = values[index]
    if (value == null) {
      return []
    }
    const x = PAD + (last === 0 ? (WIDTH - PAD * 2) / 2 : (index / last) * (WIDTH - PAD * 2))
    const y = PAD + ((value - min) / span) * (HEIGHT - PAD * 2)
    return [`${x},${y}`]
  })

  return (
    <svg
      className="detail-spark"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={label ?? 'Search position over time'}
    >
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points.join(' ')} />
    </svg>
  )
}
