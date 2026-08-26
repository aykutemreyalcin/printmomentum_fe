export type Health = {
  status: string
  service: string
  indexedListings?: number
  lastCrawlAt?: string | null
  lastAttemptAt?: string | null
  nextCrawlAt?: string | null
  lastOutcome?: string | null
  lastStored?: number | null
  lastSkipped?: number | null
  lastError?: string | null
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
  shopId?: number | null
  shopSales?: number | null
  shopRating?: number | null
  shopReviewCount?: number | null
  views?: number | null
  quantity?: number | null
  ageDays?: number | null
  originalCreatedAt?: string | null
  firstSeenAt?: string | null
  lastSeenAt?: string | null
  lastReviewAt?: string | null
  whoMade?: string | null
  whenMade?: string | null
  etsyBestseller?: boolean
  etsyBestsellerSince?: string | null
  etsyBestsellerEndedAt?: string | null
  pmBestseller?: boolean
  favorite?: boolean
  reviews30d?: number | null
  estSales30d?: number | null
  estRevenue30d?: number | null
  deltaFavorers7d?: number | null
  deltaViews7d?: number | null
  viewsPerDay?: number | null
  queryHits?: { query: string; position: number }[]
  shopUrl?: string | null
  shopAgeDays?: number | null
  listingActiveCount?: number | null
  firstSeenInTopAt?: string | null
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
  views?: number | null
  quantity?: number | null
}

export type QueryPeer = {
  query: string
  position: number
  listingCount: number
  etsyCount?: number | null
  medianPrice?: number | null
  medianFavorers?: number | null
  medianViews?: number | null
}

export type TimelinePoint = {
  kind: string
  at: string
  label: string
}

export type QueryStats = {
  query: string
  observedDay: string
  listingCount: number
  etsyCount?: number | null
  medianPrice?: number | null
  medianFavorers?: number | null
  medianViews?: number | null
}

export type Shop = {
  shopId: number
  name: string
  url: string
  iconUrl?: string | null
  transactionSoldCount?: number | null
  listingActiveCount?: number | null
  reviewCount?: number | null
  reviewAverage?: number | null
  etsyCreatedAt?: string | null
  ageDays?: number | null
  indexedListingCount: number
}

export type ListingDetail = ListingFeedItem & {
  snapshots: ListingSnapshot[]
  tags?: string[]
  takeaway?: string[]
  queryPeers?: QueryPeer[]
  timeline?: TimelinePoint[]
  quantityDelta?: number | null
  rejectReasons?: string[]
}

export type FeedPreset =
  | 'seen-today'
  | 'created-today'
  | 'created-7d'
  | 'reviewed-24h'
  | 'climbing'

export type ListingsQuery = {
  page?: number
  size?: number
  maxDaysToTop?: number
  minScore?: number
  q?: string
  shopId?: number
  preset?: FeedPreset | string
  bestseller?: boolean
}

export type ListingDetailQuery = {
  snapshotLimit?: number
  debug?: boolean
}
