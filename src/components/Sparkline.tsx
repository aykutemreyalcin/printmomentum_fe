import type { ListingSnapshot } from '../api/types'

type Props = {
  snapshots: ListingSnapshot[]
}

const WIDTH = 320
const HEIGHT = 72
const PAD = 4

export function Sparkline({ snapshots }: Props) {
  if (snapshots.length === 0) {
    return <p className="detail-spark-empty">No snapshots yet.</p>
  }

  const positions = snapshots.map((snapshot) => snapshot.position)
  const min = Math.min(...positions)
  const max = Math.max(...positions)
  const span = Math.max(max - min, 1)
  const last = snapshots.length - 1
  const points = snapshots.map((snapshot, index) => {
    const x = PAD + (last === 0 ? (WIDTH - PAD * 2) / 2 : (index / last) * (WIDTH - PAD * 2))
    const y = PAD + ((snapshot.position - min) / span) * (HEIGHT - PAD * 2)
    return `${x},${y}`
  })

  return (
    <svg
      className="detail-spark"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Search position over time"
    >
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points.join(' ')} />
    </svg>
  )
}
