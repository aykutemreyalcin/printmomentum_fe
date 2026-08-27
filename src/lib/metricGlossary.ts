import type { ListingFeedItem } from '../api/types'
import { tEn, type Translate } from '../i18n/I18nProvider'
import { formatAgeDays, formatCount, formatDelta, formatScore, formatShortDate } from './format'

export function createMetricGlossary(t: Translate) {
  return {
    momentum: t('glossary.momentum'),
    daysToTop: t('glossary.daysToTop'),
    age: t('glossary.age'),
    estSales: t('glossary.estSales'),
    lastReview: t('glossary.lastReview'),
    quantity: t('glossary.quantity'),
    daysToTopHover(listing: ListingFeedItem) {
      if (listing.firstSeenInTopAt) {
        return t('glossary.daysToTopOn', { date: formatShortDate(listing.firstSeenInTopAt) })
      }
      return t('glossary.daysToTop')
    },
    ageHover(listing: ListingFeedItem) {
      return t('glossary.ageListed', { date: formatShortDate(listing.originalCreatedAt) })
    },
    viewsHover(listing: ListingFeedItem) {
      const perDay =
        listing.viewsPerDay != null
          ? formatScore(listing.viewsPerDay)
          : listing.views != null && listing.ageDays && listing.ageDays > 0
            ? formatScore(listing.views / listing.ageDays)
            : '—'
      return t('glossary.views', {
        views: formatCount(listing.views),
        perDay,
        delta: formatDelta(listing.deltaViews7d),
      })
    },
    favsHover(listing: ListingFeedItem) {
      return t('glossary.favs', {
        count: formatCount(listing.numFavorers),
        delta: formatDelta(listing.deltaFavorers7d),
      })
    },
    shopSalesHover(listing: ListingFeedItem) {
      const opened = listing.shopAgeDays != null ? formatAgeDays(listing.shopAgeDays) : '—'
      const rating = listing.shopRating == null ? '—' : formatScore(listing.shopRating)
      return t('glossary.shopSales', {
        sales: formatCount(listing.shopSales),
        opened,
        rating,
      })
    },
    lastReviewHover(listing: ListingFeedItem) {
      return t('glossary.lastReviewOn', { date: formatShortDate(listing.lastReviewAt) })
    },
    quantityHover(listing: ListingFeedItem, quantityDelta?: number | null) {
      const delta = quantityDelta ?? null
      const deltaText = delta == null ? '—' : formatDelta(delta)
      const base = t('glossary.quantityDetail', {
        qty: formatCount(listing.quantity),
        delta: deltaText,
      })
      return delta != null && delta < 0 ? base + t('glossary.quantityDrop') : base
    },
    queryHitHover(query: string, position: number) {
      return t('glossary.queryHit', { query, position })
    },
    estSalesHover(listing: ListingFeedItem) {
      return t('glossary.estSalesDetail', {
        reviews: formatCount(listing.reviews30d),
        sales: formatCount(listing.estSales30d),
      })
    },
  }
}

/** @deprecated use createMetricGlossary */
export const METRIC_COPY = {
  momentum: '1/daysToTop + recency + Δfav (formula does not use views)',
  daysToTop: 'Days from Etsy listing open until first seen in our top-N',
  age: 'Age from the original Etsy created date',
  estSales: 'reviews30d / 0.10. Always an estimate, not a sale count.',
  lastReview: 'Last public review · purchase floor, not last sale',
  quantity: 'Listed quantity · delta since the previous crawl (stock proxy)',
}

export function daysToTopHover(listing: ListingFeedItem): string {
  return createMetricGlossary(tEn).daysToTopHover(listing)
}

export function ageHover(listing: ListingFeedItem): string {
  return createMetricGlossary(tEn).ageHover(listing)
}

export function viewsHover(listing: ListingFeedItem): string {
  return createMetricGlossary(tEn).viewsHover(listing)
}

export function favsHover(listing: ListingFeedItem): string {
  return createMetricGlossary(tEn).favsHover(listing)
}

export function shopSalesHover(listing: ListingFeedItem): string {
  return createMetricGlossary(tEn).shopSalesHover(listing)
}

export function lastReviewHover(listing: ListingFeedItem): string {
  return createMetricGlossary(tEn).lastReviewHover(listing)
}

export function quantityHover(listing: ListingFeedItem, quantityDelta?: number | null): string {
  return createMetricGlossary(tEn).quantityHover(listing, quantityDelta)
}

export function queryHitHover(query: string, position: number): string {
  return createMetricGlossary(tEn).queryHitHover(query, position)
}

export function estSalesHover(listing: ListingFeedItem): string {
  return createMetricGlossary(tEn).estSalesHover(listing)
}
