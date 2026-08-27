import { useMemo } from 'react'
import {
  chartExtents,
  pointsToPolyline,
  type ChartMetric,
  type ChartSeries,
} from '../lib/chartSeries'

const WIDTH = 960
const HEIGHT = 420
const PAD = 28

type Props = {
  series: ChartSeries[]
  metric: ChartMetric
  selectedId: number | null
  hoveredId: number | null
  onSelect: (id: number) => void
  onHover: (id: number | null) => void
  emptyLabel: string
}

export function MultiLineChart({
  series,
  metric,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  emptyLabel,
}: Props) {
  const extents = useMemo(() => chartExtents(series), [series])

  if (series.length === 0) {
    return <p className="charts-empty">{emptyLabel}</p>
  }

  const focusId = selectedId ?? hoveredId

  return (
    <svg
      className="multi-line-chart"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={metric === 'numFavorers' ? 'Favorites over time' : 'Views over time'}
    >
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1={PAD}
            x2={WIDTH - PAD}
            y1={HEIGHT - PAD - ratio * (HEIGHT - PAD * 2)}
            y2={HEIGHT - PAD - ratio * (HEIGHT - PAD * 2)}
            className="multi-line-chart-grid"
          />
        ))}
      {series.map((item) => {
        const active = focusId == null || focusId === item.id
        const polyline = pointsToPolyline(
          item.points,
          WIDTH,
          HEIGHT,
          PAD,
          extents.minT,
          extents.maxT,
          extents.minV,
          extents.maxV,
        )
        const isSelected = selectedId === item.id
        const isHovered = hoveredId === item.id
        return (
          <g key={item.id} opacity={active ? 1 : 0.12}>
            <polyline
              fill="none"
              stroke={item.color}
              strokeWidth={isSelected ? 3.5 : isHovered ? 2.8 : 1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polyline}
              className="multi-line-chart-line"
              onMouseEnter={() => onHover(item.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelect(item.id)}
            />
            <polyline
              fill="none"
              stroke="transparent"
              strokeWidth={14}
              points={polyline}
              className="multi-line-chart-hit"
              onMouseEnter={() => onHover(item.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelect(item.id)}
            />
          </g>
        )
      })}
    </svg>
  )
}
