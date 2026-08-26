import Tooltip from '@mui/material/Tooltip'
import type { ReactNode } from 'react'

type Props = {
  title: string
  children: ReactNode
}

export function MetricTip({ title, children }: Props) {
  return (
    <Tooltip title={title} enterDelay={250} describeChild>
      <span className="metric-tip">{children}</span>
    </Tooltip>
  )
}
