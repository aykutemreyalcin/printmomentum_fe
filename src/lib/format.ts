export function formatMoney(price: number | null | undefined, currency: string | null | undefined): string {
  if (price == null) {
    return '—'
  }
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price)
  } catch {
    return `${price} ${currency ?? ''}`.trim()
  }
}

export function formatDays(value: number | null | undefined): string {
  return value == null ? '—' : value.toFixed(1)
}

export function formatScore(value: number | null | undefined): string {
  return value == null ? '—' : value.toFixed(2)
}

export function formatCount(value: number | null | undefined): string {
  if (value == null) {
    return '—'
  }
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatDelta(value: number | null | undefined): string {
  if (value == null) {
    return '—'
  }
  if (value > 0) {
    return `+${formatCount(value)}`
  }
  return formatCount(value)
}

export function formatAgeDays(value: number | null | undefined): string {
  if (value == null) {
    return '—'
  }
  if (value < 1) {
    return `${Math.max(1, Math.round(value * 24))}h`
  }
  return `${value.toFixed(1)}d`
}

export function formatShortDate(value: string | null | undefined): string {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}
