import type { ListingPage } from './types'

/**
 * Stand-in feed for local development while the Etsy ingest has no data yet.
 * Only used when the API cannot be reached, and the UI labels it as sample data.
 */
export function sampleListingPage(): ListingPage {
  return { items: samples, page: 0, size: 20, total: samples.length }
}

/** Sample data is for dev only: never in a production bundle, never in tests. */
export function sampleDataEnabled(env: { DEV?: boolean; MODE?: string } = import.meta.env): boolean {
  return Boolean(env.DEV) && env.MODE !== 'test'
}

function thumbnail(index: number): string {
  const marks = [
    '<circle cx="56" cy="56" r="26" fill="#111112"/>',
    '<rect x="26" y="40" width="60" height="8" fill="#111112"/><rect x="26" y="58" width="36" height="8" fill="#111112"/>',
    '<path d="M30 82 L56 28 L82 82 Z" fill="#111112"/>',
    '<circle cx="44" cy="56" r="18" fill="#111112"/><circle cx="70" cy="56" r="18" fill="#1b84ff"/>',
    '<rect x="32" y="32" width="48" height="48" fill="none" stroke="#111112" stroke-width="8"/>',
    '<path d="M28 70 Q56 20 84 70" fill="none" stroke="#111112" stroke-width="8"/>',
  ]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112" viewBox="0 0 112 112"><rect width="112" height="112" fill="#efece5"/>${marks[index % marks.length]}</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const samples: ListingPage['items'] = [
  {
    listingId: 1147645830,
    title: 'Y2K Chrome Butterfly Baby Tee',
    price: 22.4,
    currency: 'USD',
    imageUrl: thumbnail(0),
    etsyUrl: 'https://www.etsy.com/listing/1147645830',
    daysToTop: 1.6,
    momentumScore: 2.31,
    numFavorers: 523,
    shopName: 'GlossEraCo',
  },
  {
    listingId: 1198220417,
    title: 'Retro Sunset Cassette Graphic Tee',
    price: 26.5,
    currency: 'USD',
    imageUrl: thumbnail(1),
    etsyUrl: 'https://www.etsy.com/listing/1198220417',
    daysToTop: 2.1,
    momentumScore: 1.94,
    numFavorers: 412,
    shopName: 'InkAndAtlasCo',
  },
  {
    listingId: 1205331902,
    title: 'Cosmic Cowgirl Western Print Shirt',
    price: 24,
    currency: 'USD',
    imageUrl: thumbnail(2),
    etsyUrl: 'https://www.etsy.com/listing/1205331902',
    daysToTop: 3.4,
    momentumScore: 1.51,
    numFavorers: 287,
    shopName: 'DustAndDenimStudio',
  },
  {
    listingId: 1216408755,
    title: 'Brutalist Type Oversized Boxy Tee',
    price: 32,
    currency: 'USD',
    imageUrl: thumbnail(3),
    etsyUrl: 'https://www.etsy.com/listing/1216408755',
    daysToTop: 4.8,
    momentumScore: 1.28,
    numFavorers: 198,
    shopName: 'NullFormApparel',
  },
  {
    listingId: 1223977160,
    title: 'Vintage Botanical Line Art DTG Tee',
    price: 28.75,
    currency: 'USD',
    imageUrl: thumbnail(4),
    etsyUrl: 'https://www.etsy.com/listing/1223977160',
    daysToTop: 6.2,
    momentumScore: 0.97,
    numFavorers: 341,
    shopName: 'FernAndFoldPrints',
  },
  {
    listingId: 1231544028,
    title: 'Hand Drawn Mushroom Cottagecore Tee',
    price: 25.5,
    currency: 'USD',
    imageUrl: thumbnail(5),
    etsyUrl: 'https://www.etsy.com/listing/1231544028',
    daysToTop: 7.5,
    momentumScore: 0.82,
    numFavorers: 164,
    shopName: 'SpoolAndSporeCo',
  },
]
