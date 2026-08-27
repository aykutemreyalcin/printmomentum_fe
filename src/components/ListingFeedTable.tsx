import Tooltip from '@mui/material/Tooltip'
import { Link } from 'react-router'
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnOrderState,
  type MRT_Updater,
  type MRT_VisibilityState,
} from 'material-react-table'
import { useEffect, useMemo, useState } from 'react'
import type { ListingFeedItem } from '../api/types'
import { useCompare } from '../compare/CompareProvider'
import { useI18n, type Translate } from '../i18n/I18nProvider'
import { formatAgeDays, formatCount, formatDays, formatDelta, formatMoney, formatScore, formatShortDate } from '../lib/format'
import { createMetricGlossary } from '../lib/metricGlossary'
import { withRanks, type RankedListing } from '../lib/sortListings'
import { truncateText } from '../lib/truncateText'
import { BestsellerBadge, bestsellerFilterValue } from './BestsellerBadge'
import { CopyButton } from './CopyButton'
import { FavoriteButton } from './FavoriteButton'
import { ImageZoom } from './ImageZoom'
import { MetricTip } from './MetricTip'
import './ListingFeedTable.css'

type Props = {
  items: ListingFeedItem[]
  rowCount: number
  pageIndex: number
  pageSize: number
  onPaginationChange: (value: { pageIndex: number; pageSize: number }) => void
  loading: boolean
  error: string | null
  onRetry: () => void
  search: string
  onSearch: (value: string) => void
  onToggleFavorite: (listing: ListingFeedItem) => void | Promise<void>
  emptyMessage?: string
}

const VISIBILITY_KEY = 'printmomentum-table-columns-feed-v4'
const ORDER_KEY = 'printmomentum-table-order-feed-v3'
const PAGE_SIZE_KEY = 'printmomentum-table-pagesize-feed-v2'

const DEFAULT_ORDER = [
  'mrt-row-expand',
  'compare',
  'favorite',
  'rank',
  'image',
  'title',
  'shopName',
  'price',
  'numFavorers',
  'views',
  'reviews30d',
  'estSales30d',
  'deltaFavorers7d',
  'deltaViews7d',
  'daysToTop',
  'ageDays',
  'shopSales',
  'bestseller',
  'momentumScore',
]

/** Main table: core scan columns. All other fields live in the expand panel. */
const DEFAULT_VISIBILITY: MRT_VisibilityState = {
  reviews30d: false,
  estSales30d: false,
  deltaFavorers7d: false,
  deltaViews7d: false,
  daysToTop: false,
  ageDays: false,
  shopSales: false,
  listingId: false,
  quantity: false,
  whoMade: false,
  whenMade: false,
  firstSeenAt: false,
  originalCreatedAt: false,
  lastReviewAt: false,
  lastSeenAt: false,
  shopRating: false,
  shopReviewCount: false,
  shopId: false,
}

export function ListingFeedTable({
  items,
  rowCount,
  pageIndex,
  pageSize,
  onPaginationChange,
  loading,
  error,
  onRetry,
  search,
  onSearch,
  onToggleFavorite,
  emptyMessage,
}: Props) {
  const { t } = useI18n()
  const glossary = useMemo(() => createMetricGlossary(t), [t])
  const { ids: compareIds, toggle: toggleCompare } = useCompare()
  const resolvedEmpty = emptyMessage ?? t('feed.emptyFilters')
  const ranked = useMemo(() => withRanks(items), [items])
  const momentumMax = Math.max(...ranked.map((item) => item.momentumScore ?? 0), 0.01)
  const columns = useMemo(
    () => listingColumns(momentumMax, onToggleFavorite, t, glossary, compareIds, toggleCompare),
    [momentumMax, onToggleFavorite, t, glossary, compareIds, toggleCompare],
  )

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(() => ({
    ...DEFAULT_VISIBILITY,
    ...loadJson<MRT_VisibilityState>(VISIBILITY_KEY, {}),
  }))
  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>(loadJson(ORDER_KEY, DEFAULT_ORDER))
  const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize])

  useEffect(() => saveJson(VISIBILITY_KEY, columnVisibility), [columnVisibility])
  useEffect(() => saveJson(ORDER_KEY, columnOrder), [columnOrder])
  useEffect(() => localStorage.setItem(PAGE_SIZE_KEY, String(pageSize)), [pageSize])

  const table = useMaterialReactTable({
    columns,
    data: ranked,
    getRowId: (row) => String(row.listingId),
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableDensityToggle: true,
    enableFullScreenToggle: true,
    enableHiding: true,
    enableColumnOrdering: true,
    enableColumnPinning: true,
    enableColumnResizing: false,
    enableColumnFilters: true,
    enableColumnFilterModes: true,
    enableGlobalFilter: true,
    enableFilterMatchHighlighting: true,
    enableExpandAll: true,
    enableExpanding: true,
    enableGrouping: false,
    enableTopToolbar: true,
    enableBottomToolbar: true,
    enablePagination: true,
    manualPagination: true,
    rowCount,
    enableRowActions: false,
    columnFilterDisplayMode: 'popover',
    positionGlobalFilter: 'left',
    layoutMode: 'semantic',
    defaultColumn: { minSize: 88, size: 140 },
    initialState: {
      density: 'compact',
      showGlobalFilter: true,
      showColumnFilters: false,
      columnPinning: { left: ['mrt-row-expand', 'compare', 'favorite', 'rank', 'image'] },
    },
    state: {
      isLoading: loading,
      columnVisibility,
      columnOrder,
      pagination,
      globalFilter: search,
    },
    onColumnVisibilityChange: (updater) => setColumnVisibility((prev) => apply(updater, prev)),
    onColumnOrderChange: (updater) => setColumnOrder((prev) => apply(updater, prev)),
    onPaginationChange: (updater) => {
      const next = apply(updater, pagination)
      onPaginationChange(next)
    },
    onGlobalFilterChange: (value) => onSearch(typeof value === 'string' ? value : ''),
    globalFilterFn: 'contains',
    muiSearchTextFieldProps: {
      variant: 'outlined',
      size: 'small',
      placeholder: t('table.search'),
      sx: { minWidth: 260 },
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        width: '100%',
        maxWidth: '100%',
        border: '1px solid var(--hair)',
        borderRadius: '8px',
        overflow: 'hidden',
      },
    },
    muiTableProps: {
      sx: {
        width: 'max-content',
        minWidth: '100%',
      },
    },
    muiTableContainerProps: {
      sx: {
        maxHeight: 'calc(100svh - 260px)',
        maxWidth: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      },
    },
    muiTableHeadCellProps: {
      sx: {
        whiteSpace: 'nowrap',
        '& .Mui-TableHeadCell-Content-Labels': {
          overflow: 'visible',
          flex: '0 0 auto',
        },
        '& .Mui-TableHeadCell-Content-Wrapper': {
          overflow: 'visible',
          textOverflow: 'clip',
          whiteSpace: 'nowrap',
          width: 'auto',
          maxWidth: 'none',
        },
      },
    },
    muiTableBodyRowProps: ({ row }) => ({
      hover: true,
      onClick: (event) => {
        if (shouldIgnoreRowExpandClick(event.target)) {
          return
        }
        row.toggleExpanded()
      },
      sx: { cursor: 'pointer' },
    }),
    muiCircularProgressProps: { color: 'primary', size: 40 },
    muiSkeletonProps: { animation: 'wave', height: 28 },
    localization: {
      noRecordsToDisplay: resolvedEmpty,
      search: t('table.search'),
      showHideColumns: t('table.showColumns'),
      showHideFilters: t('table.showFilters'),
    },
    renderDetailPanel: ({ row }) => (
      <ListingDetailPanel listing={row.original} onToggleFavorite={onToggleFavorite} t={t} glossary={glossary} />
    ),
  })

  return (
    <div className="listing-feed-table" data-testid={loading ? 'feed-skeleton' : undefined}>
      {error && (
        <div className="listing-feed-error" role="alert">
          <span>{error}</span>
          <button type="button" className="label listing-retry" onClick={onRetry}>
            {t('table.retry')}
          </button>
        </div>
      )}
      <MaterialReactTable table={table} />
    </div>
  )
}

function listingColumns(
  momentumMax: number,
  onToggleFavorite: (listing: ListingFeedItem) => void | Promise<void>,
  t: Translate,
  glossary: ReturnType<typeof createMetricGlossary>,
  compareIds: number[],
  toggleCompare: (id: number) => void,
): MRT_ColumnDef<RankedListing>[] {
  return [
    {
      id: 'compare',
      header: t('table.compare'),
      size: 56,
      enableColumnFilter: false,
      enableSorting: false,
      enableHiding: false,
      Cell: ({ row }) => (
        <input
          type="checkbox"
          className="listing-compare-check"
          checked={compareIds.includes(row.original.listingId)}
          onChange={() => toggleCompare(row.original.listingId)}
          aria-label={t('compare.select')}
          onClick={(event) => event.stopPropagation()}
        />
      ),
    },
    {
      id: 'favorite',
      header: t('table.fav'),
      size: 56,
      enableColumnFilter: false,
      enableSorting: false,
      enableHiding: false,
      Cell: ({ row }) => (
        <FavoriteButton
          favorite={Boolean(row.original.favorite)}
          onToggle={() => onToggleFavorite(row.original)}
        />
      ),
    },
    {
      accessorKey: 'rank',
      header: t('table.rank'),
      size: 56,
      enableColumnFilter: false,
      Cell: ({ cell }) => String(cell.getValue<number>()).padStart(2, '0'),
    },
    {
      id: 'image',
      header: t('table.image'),
      size: 96,
      enableColumnFilter: false,
      enableSorting: false,
      Cell: ({ row }) =>
        row.original.imageUrl ? <ImageZoom src={row.original.imageUrl} alt="" /> : null,
    },
    {
      accessorKey: 'title',
      header: t('table.listing'),
      size: 280,
      filterVariant: 'text',
      Cell: ({ row }) => (
        <div className="listing-title-cell">
          <div className="listing-title-line">
            <Tooltip title={row.original.title} enterDelay={0}>
              <span className="listing-title-trunc">
                <Link className="listing-title-link" to={`/listings/${row.original.listingId}`}>
                  {truncateText(row.original.title, 2)}
                </Link>
              </span>
            </Tooltip>
            <CopyButton text={row.original.title} label={t('table.copyTitle')} />
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'shopName',
      header: t('table.shop'),
      size: 140,
      filterVariant: 'text',
      Cell: ({ row }) =>
        row.original.shopId ? (
          <Link className="listing-title-link" to={`/shops/${row.original.shopId}`}>
            {row.original.shopName}
          </Link>
        ) : (
          row.original.shopName
        ),
    },
    {
      accessorKey: 'price',
      header: t('table.price'),
      size: 110,
      filterVariant: 'range',
      Cell: ({ row }) => formatMoney(row.original.price, row.original.currency),
    },
    {
      accessorKey: 'numFavorers',
      header: t('table.favs'),
      Header: () => <MetricTip title={t('table.headerFavs')}>{t('table.favs')}</MetricTip>,
      size: 90,
      filterVariant: 'range',
      Cell: ({ row }) => (
        <MetricTip title={glossary.favsHover(row.original)}>{formatCount(row.original.numFavorers)}</MetricTip>
      ),
    },
    {
      accessorKey: 'views',
      header: t('table.views'),
      Header: () => <MetricTip title={t('table.headerViews')}>{t('table.views')}</MetricTip>,
      size: 100,
      filterVariant: 'range',
      Cell: ({ row }) => (
        <MetricTip title={glossary.viewsHover(row.original)}>{formatCount(row.original.views)}</MetricTip>
      ),
    },
    {
      accessorKey: 'reviews30d',
      header: t('table.reviews30d'),
      Header: () => <MetricTip title={glossary.lastReview}>{t('table.reviews30d')}</MetricTip>,
      size: 140,
      filterVariant: 'range',
      Cell: ({ row }) => (
        <MetricTip title={glossary.lastReviewHover(row.original)}>{formatCount(row.original.reviews30d)}</MetricTip>
      ),
    },
    {
      accessorKey: 'estSales30d',
      header: t('table.estSales'),
      Header: () => <MetricTip title={glossary.estSales}>{t('table.estSales')}</MetricTip>,
      size: 160,
      filterVariant: 'range',
      Cell: ({ row }) => (
        <MetricTip title={glossary.estSalesHover(row.original)}>{formatCount(row.original.estSales30d)}</MetricTip>
      ),
    },
    {
      accessorKey: 'deltaFavorers7d',
      header: t('table.deltaFav'),
      size: 120,
      filterVariant: 'range',
      Cell: ({ cell }) => formatDelta(cell.getValue<number | null>()),
    },
    {
      accessorKey: 'deltaViews7d',
      header: t('table.deltaViews'),
      size: 130,
      filterVariant: 'range',
      Cell: ({ cell }) => formatDelta(cell.getValue<number | null>()),
    },
    {
      accessorKey: 'daysToTop',
      header: t('table.daysToTop'),
      Header: () => <MetricTip title={glossary.daysToTop}>{t('table.daysToTop')}</MetricTip>,
      size: 148,
      filterVariant: 'range',
      Cell: ({ row }) => (
        <MetricTip title={glossary.daysToTopHover(row.original)}>{formatDays(row.original.daysToTop)}</MetricTip>
      ),
    },
    {
      accessorKey: 'ageDays',
      header: t('table.age'),
      Header: () => <MetricTip title={glossary.age}>{t('table.age')}</MetricTip>,
      size: 90,
      filterVariant: 'range',
      Cell: ({ row }) => (
        <MetricTip title={glossary.ageHover(row.original)}>{formatAgeDays(row.original.ageDays)}</MetricTip>
      ),
    },
    {
      accessorKey: 'shopSales',
      header: t('table.shopSales'),
      Header: () => <MetricTip title={t('table.headerShopSales')}>{t('table.shopSales')}</MetricTip>,
      size: 140,
      filterVariant: 'range',
      Cell: ({ row }) => (
        <MetricTip title={glossary.shopSalesHover(row.original)}>{formatCount(row.original.shopSales)}</MetricTip>
      ),
    },
    {
      id: 'bestseller',
      accessorFn: (row) => bestsellerFilterValue(row),
      header: t('table.bestseller'),
      size: 130,
      filterVariant: 'select',
      filterSelectOptions: [
        { label: t('badge.filterEtsy'), value: 'etsy' },
        { label: t('badge.filterPm'), value: 'pm' },
        { label: t('badge.filterWas'), value: 'was' },
        { label: t('badge.filterNo'), value: 'no' },
      ],
      Cell: ({ row }) => <BestsellerBadge listing={row.original} />,
    },
    {
      accessorKey: 'momentumScore',
      header: t('table.momentum'),
      Header: () => <MetricTip title={glossary.momentum}>{t('table.momentum')}</MetricTip>,
      size: 140,
      filterVariant: 'range',
      Cell: ({ cell }) => {
        const value = cell.getValue<number | null>()
        const bar = Math.max(8, Math.round(((value ?? 0) / momentumMax) * 100))
        return (
          <MetricTip title={glossary.momentum}>
            <div className="listing-momentum">
              <span className="numeric">{formatScore(value)}</span>
              <span className="listing-mom-track" aria-hidden="true">
                <span className="listing-mom-fill" style={{ width: `${bar}%` }} />
              </span>
            </div>
          </MetricTip>
        )
      },
    },
    {
      accessorKey: 'listingId',
      header: t('table.listingId'),
      size: 120,
      filterVariant: 'text',
      Cell: ({ cell }) => (
        <span className="listing-id-cell">
          <span className="numeric">{cell.getValue<number>()}</span>
          <CopyButton text={String(cell.getValue<number>())} label={t('table.copyId')} />
        </span>
      ),
    },
    {
      accessorKey: 'quantity',
      header: t('table.qty'),
      Header: () => <MetricTip title={glossary.quantity}>{t('table.qty')}</MetricTip>,
      size: 80,
      filterVariant: 'range',
      Cell: ({ row }) => (
        <MetricTip title={glossary.quantityHover(row.original)}>{formatCount(row.original.quantity)}</MetricTip>
      ),
    },
    {
      accessorKey: 'whoMade',
      header: t('table.whoMade'),
      size: 120,
      filterVariant: 'text',
      Cell: ({ cell }) => cell.getValue<string | null>() || '—',
    },
    {
      accessorKey: 'whenMade',
      header: t('table.whenMade'),
      size: 120,
      filterVariant: 'text',
      Cell: ({ cell }) => cell.getValue<string | null>() || '—',
    },
    {
      accessorKey: 'shopRating',
      header: t('table.shopRating'),
      size: 120,
      filterVariant: 'range',
      Cell: ({ cell }) => {
        const value = cell.getValue<number | null>()
        return value == null ? '—' : value.toFixed(2)
      },
    },
    {
      accessorKey: 'shopReviewCount',
      header: t('table.shopReviews'),
      size: 120,
      filterVariant: 'range',
      Cell: ({ cell }) => formatCount(cell.getValue<number | null>()),
    },
    {
      accessorKey: 'shopId',
      header: t('table.shopId'),
      size: 110,
      filterVariant: 'text',
    },
    {
      accessorKey: 'firstSeenAt',
      header: t('table.firstSeen'),
      size: 130,
      filterVariant: 'text',
      Cell: ({ cell }) => formatShortDate(cell.getValue<string | null>()),
    },
    {
      accessorKey: 'originalCreatedAt',
      header: t('table.created'),
      size: 130,
      filterVariant: 'text',
      Cell: ({ cell }) => formatShortDate(cell.getValue<string | null>()),
    },
    {
      accessorKey: 'lastSeenAt',
      header: t('table.lastSeen'),
      size: 130,
      filterVariant: 'text',
      Cell: ({ cell }) => formatShortDate(cell.getValue<string | null>()),
    },
    {
      accessorKey: 'lastReviewAt',
      header: t('table.lastReview'),
      Header: () => <MetricTip title={glossary.lastReview}>{t('table.lastReview')}</MetricTip>,
      size: 130,
      filterVariant: 'text',
      Cell: ({ row }) => (
        <MetricTip title={glossary.lastReviewHover(row.original)}>{formatShortDate(row.original.lastReviewAt)}</MetricTip>
      ),
    },
  ]
}

function ListingDetailPanel({
  listing,
  onToggleFavorite,
  t,
  glossary,
}: {
  listing: RankedListing
  onToggleFavorite: (listing: ListingFeedItem) => void | Promise<void>
  t: Translate
  glossary: ReturnType<typeof createMetricGlossary>
}) {
  return (
    <div className="listing-detail-panel">
      {listing.imageUrl ? <img src={listing.imageUrl} alt="" /> : null}
      <div className="listing-detail-body">
        {listing.shopId ? (
          <Link className="label" to={`/shops/${listing.shopId}`}>
            {listing.shopName}
          </Link>
        ) : (
          <p className="label">{listing.shopName}</p>
        )}
        <p className="listing-detail-title">{listing.title}</p>
        <p className="listing-detail-price numeric">{formatMoney(listing.price, listing.currency)}</p>
        <div className="listing-detail-id-row">
          <span className="label">
            {t('table.listingId')} {listing.listingId}
          </span>
          <CopyButton text={String(listing.listingId)} label={t('table.copyId')} />
          <BestsellerBadge listing={listing} />
        </div>
        <div className="listing-detail-grid">
          <ExpandMetric label={t('table.momentum')} value={formatScore(listing.momentumScore)} hint={glossary.momentum} accent />
          <ExpandMetric
            label={t('table.daysToTop')}
            value={
              listing.daysToTop == null
                ? '—'
                : `${formatDays(listing.daysToTop)} ${t('table.climbDaysUnit')}`
            }
            hint={glossary.daysToTopHover(listing)}
          />
          <ExpandMetric label={t('table.favs')} value={formatCount(listing.numFavorers)} hint={glossary.favsHover(listing)} />
          <ExpandMetric label={t('table.deltaFav')} value={formatDelta(listing.deltaFavorers7d)} hint={glossary.favsHover(listing)} />
          <ExpandMetric label={t('table.views')} value={formatCount(listing.views)} hint={glossary.viewsHover(listing)} />
          <ExpandMetric label={t('table.deltaViews')} value={formatDelta(listing.deltaViews7d)} hint={glossary.viewsHover(listing)} />
          <ExpandMetric label={t('table.reviews30d')} value={formatCount(listing.reviews30d)} hint={glossary.lastReviewHover(listing)} />
          <ExpandMetric label={t('table.estSales')} value={formatCount(listing.estSales30d)} hint={glossary.estSalesHover(listing)} />
          <ExpandMetric
            label={t('detail.metric.estRevenue')}
            value={formatMoney(listing.estRevenue30d, listing.currency)}
            hint={glossary.estSalesHover(listing)}
          />
          <ExpandMetric label={t('table.age')} value={formatAgeDays(listing.ageDays)} hint={glossary.ageHover(listing)} />
          <ExpandMetric label={t('table.shopSales')} value={formatCount(listing.shopSales)} hint={glossary.shopSalesHover(listing)} />
          <ExpandMetric label={t('table.qty')} value={formatCount(listing.quantity)} hint={glossary.quantityHover(listing)} />
          <ExpandMetric
            label={t('table.shopRating')}
            value={listing.shopRating == null ? '—' : listing.shopRating.toFixed(2)}
            hint={glossary.shopSalesHover(listing)}
          />
          <ExpandMetric label={t('table.shopReviews')} value={formatCount(listing.shopReviewCount)} hint={glossary.shopSalesHover(listing)} />
          <ExpandMetric label={t('table.shopId')} value={listing.shopId == null ? '—' : String(listing.shopId)} hint={glossary.shopSalesHover(listing)} />
          <ExpandMetric label={t('table.whoMade')} value={listing.whoMade || '—'} hint={glossary.ageHover(listing)} />
          <ExpandMetric label={t('table.whenMade')} value={listing.whenMade || '—'} hint={glossary.ageHover(listing)} />
          <ExpandMetric label={t('table.firstSeen')} value={formatShortDate(listing.firstSeenAt)} hint={glossary.daysToTopHover(listing)} />
          <ExpandMetric label={t('table.created')} value={formatShortDate(listing.originalCreatedAt)} hint={glossary.ageHover(listing)} />
          <ExpandMetric label={t('table.lastSeen')} value={formatShortDate(listing.lastSeenAt)} hint={glossary.lastReviewHover(listing)} />
          <ExpandMetric label={t('table.lastReview')} value={formatShortDate(listing.lastReviewAt)} hint={glossary.lastReviewHover(listing)} />
        </div>
        {listing.queryHits && listing.queryHits.length > 0 ? (
          <p className="label listing-detail-queries">
            {listing.queryHits.map((hit) => (
              <MetricTip key={hit.query} title={glossary.queryHitHover(hit.query, hit.position)}>
                <span className="listing-query-hit">
                  {hit.query} #{hit.position}
                </span>
              </MetricTip>
            ))}
          </p>
        ) : null}
        <div className="listing-detail-links">
          <FavoriteButton favorite={Boolean(listing.favorite)} onToggle={() => onToggleFavorite(listing)} />
          <Link to={`/listings/${listing.listingId}`}>{t('table.openListing')}</Link>
          <a href={listing.etsyUrl} target="_blank" rel="noreferrer">
            {t('table.viewEtsy')}
          </a>
        </div>
      </div>
    </div>
  )
}

function ExpandMetric({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: string
  hint: string
  accent?: boolean
}) {
  return (
    <Tooltip title={hint} enterDelay={250}>
      <div className="listing-expand-metric">
        <span className="label">{label}</span>
        <p className={['listing-expand-value', 'numeric', accent && 'is-accent'].filter(Boolean).join(' ')}>{value}</p>
      </div>
    </Tooltip>
  )
}

function shouldIgnoreRowExpandClick(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false
  }
  return Boolean(
    target.closest(
      'a, button, input, textarea, select, label, [role="button"], [contenteditable="true"], .listing-detail-panel',
    ),
  )
}

function apply<T>(updater: MRT_Updater<T>, previous: T): T {
  return typeof updater === 'function' ? (updater as (value: T) => T)(previous) : updater
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

function saveJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore quota */
  }
}

function loadStoredPageSize(): number {
  const stored = Number(localStorage.getItem(PAGE_SIZE_KEY))
  return Number.isFinite(stored) && stored > 0 ? stored : 50
}

export { loadStoredPageSize as loadFeedPageSize }
