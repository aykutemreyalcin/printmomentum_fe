import { useMemo } from 'react'
import {
  chartExtents,
  formatChartAxisDate,
  formatChartAxisValue,
  pointsToPolyline,
  type ChartMetric,
  type ChartMode,
  type ChartSeries,
} from '../lib/chartSeries'

const WIDTH = 960
const HEIGHT = 420
const PAD_LEFT = 52
const PAD_RIGHT = 16
const PAD_TOP = 16
const PAD_BOTTOM = 36

type Props = {
  series: ChartSeries[]
  metric: ChartMetric
  mode: ChartMode
  locale: string
  numberLocale: string
  selectedId: number | null
  hoveredId: number | null
  onSelect: (id: number) => void
  onHover: (id: number | null) => void
  emptyLabel: string
  ariaLabel: string
}

export function MultiLineChart({
  series,
  metric,
  mode,
  locale,
  numberLocale,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  emptyLabel,
  ariaLabel,
}: Props) {
  const extents = useMemo(() => chartExtents(series), [series])
  const yTicks = useMemo(() => {
    const span = Math.max(extents.maxV - extents.minV, 1)
    return [0, 0.25, 0.5, 0.75, 1].map((ratio) => extents.minV + ratio * span)
  }, [extents.maxV, extents.minV])

  if (series.length === 0) {
    return <p className="charts-empty">{emptyLabel}</p>
  }

  const focusId = selectedId ?? hoveredId
  const chartHeight = HEIGHT - PAD_TOP - PAD_BOTTOM

  return (
    <svg
      className="multi-line-chart"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={ariaLabel}
    >
      {yTicks.map((value, index) => {
        const ratio = index / (yTicks.length - 1)
        const y = PAD_TOP + chartHeight - ratio * chartHeight
        return (
          <g key={value}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={y}
              y2={y}
              className="multi-line-chart-grid"
            />
            <text
              x={PAD_LEFT - 8}
              y={y + 4}
              className="multi-line-chart-axis"
              textAnchor="end"
            >
              {formatChartAxisValue(value, metric, mode, numberLocale)}
            </text>
          </g>
        )
      })}
      <text
        x={PAD_LEFT}
        y={HEIGHT - 8}
        className="multi-line-chart-axis"
        textAnchor="start"
      >
        {formatChartAxisDate(extents.minT, locale)}
      </text>
      <text
        x={WIDTH - PAD_RIGHT}
        y={HEIGHT - 8}
        className="multi-line-chart-axis"
        textAnchor="end"
      >
        {formatChartAxisDate(extents.maxT, locale)}
      </text>
      {series.map((item) => {
        const dimmed = focusId != null && focusId !== item.id
        const polyline = pointsToPolyline(
          item.points,
          WIDTH,
          HEIGHT,
          PAD_LEFT,
          PAD_RIGHT,
          PAD_TOP,
          PAD_BOTTOM,
          extents.minT,
          extents.maxT,
          extents.minV,
          extents.maxV,
        )
        const isSelected = selectedId === item.id
        const isHovered = hoveredId === item.id
        return (
          <g key={item.id} opacity={dimmed ? 0.48 : 1}>
            <polyline
              fill="none"
              stroke={item.color}
              strokeWidth={isSelected ? 3.5 : isHovered ? 2.8 : dimmed ? 1.8 : 2.2}
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
