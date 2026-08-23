export type Health = {
  status: string
  service: string
}

export type ListingFeedItem = {
  listingId: number
  title: string
  price: number | null
  currency: string | null
  imageUrl: string | null
  etsyUrl: string
  daysToTop: number | null
  momentumScore: number | null
  numFavorers: number
  shopName: string
}

export type ListingPage = {
  items: ListingFeedItem[]
  page: number
  size: number
  total: number
}

export type ListingSnapshot = {
  observedAt: string
  position: number
  numFavorers: number
}

export type ListingDetail = ListingFeedItem & {
  snapshots: ListingSnapshot[]
  rejectReasons?: string[]
}

export type ListingsQuery = {
  page?: number
  size?: number
  maxDaysToTop?: number
  minScore?: number
  q?: string
}

export type ListingDetailQuery = {
  snapshotLimit?: number
  debug?: boolean
}
