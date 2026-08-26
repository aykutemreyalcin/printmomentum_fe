import type { ListingFeedItem } from '../api/types'

const HEADERS = [
  'listingId',
  'title',
  'shopName',
  'shopId',
  'price',
  'currency',
  'numFavorers',
  'views',
  'reviews30d',
  'estSales30d',
  'daysToTop',
  'momentumScore',
  'ageDays',
  'shopSales',
  'etsyBestseller',
  'queries',
  'etsyUrl',
] as const

export function listingsToCsv(items: ListingFeedItem[]): string {
  const lines = [HEADERS.join(',')]
  for (const item of items) {
    lines.push(
      HEADERS.map((header) => {
        if (header === 'queries') {
          return csvCell(
            (item.queryHits ?? []).map((hit) => `${hit.query}#${hit.position}`).join('|'),
          )
        }
        return csvCell(item[header as keyof ListingFeedItem])
      }).join(','),
    )
  }
  return lines.join('\n')
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function csvCell(value: unknown): string {
  if (value == null || value === '') {
    return ''
  }
  const text = String(value)
  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`
  }
  return text
}
