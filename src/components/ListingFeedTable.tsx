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
import { formatAgeDays, formatCount, formatDays, formatDelta, formatMoney, formatScore, formatShortDate } from '../lib/format'
import { withRanks, type RankedListing } from '../lib/sortListings'
import { truncateText } from '../lib/truncateText'
import { BestsellerBadge, bestsellerFilterValue } from './BestsellerBadge'
import { CopyButton } from './CopyButton'
import { FavoriteButton } from './FavoriteButton'
import { ImageZoom } from './ImageZoom'
import './ListingFeedTable.css'

type Props = {
  items: ListingFeedItem[]
  loading: boolean
  error: string | null
  onRetry: () => void
  search: string
  onSearch: (value: string) => void
  onToggleFavorite: (listing: ListingFeedItem) => void | Promise<void>
  emptyMessage?: string
}

const VISIBILITY_KEY = 'printmomentum-table-columns-feed-v3'
const ORDER_KEY = 'printmomentum-table-order-feed-v3'
const PAGE_SIZE_KEY = 'printmomentum-table-pagesize-feed-v2'

const DEFAULT_ORDER = [
  'mrt-row-expand',
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

const DEFAULT_VISIBILITY: MRT_VisibilityState = {
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
  loading,
  error,
  onRetry,
  search,
  onSearch,
  onToggleFavorite,
  emptyMessage = 'No printable tees match. Widen filters.',
}: Props) {
  const ranked = useMemo(() => withRanks(items), [items])
  const momentumMax = Math.max(...ranked.map((item) => item.momentumScore ?? 0), 0.01)
  const columns = useMemo(
    () => listingColumns(momentumMax, onToggleFavorite),
    [momentumMax, onToggleFavorite],
  )

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(() => ({
    ...DEFAULT_VISIBILITY,
    ...loadJson<MRT_VisibilityState>(VISIBILITY_KEY, {}),
  }))
  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>(loadJson(ORDER_KEY, DEFAULT_ORDER))
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: loadPageSize() })

  useEffect(() => saveJson(VISIBILITY_KEY, columnVisibility), [columnVisibility])
  useEffect(() => saveJson(ORDER_KEY, columnOrder), [columnOrder])
  useEffect(() => localStorage.setItem(PAGE_SIZE_KEY, String(pagination.pageSize)), [pagination.pageSize])

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
    enableRowActions: false,
    columnFilterDisplayMode: 'popover',
    positionGlobalFilter: 'left',
    layoutMode: 'semantic',
    defaultColumn: { minSize: 88, size: 140 },
    initialState: {
      density: 'compact',
      showGlobalFilter: true,
      showColumnFilters: false,
      columnPinning: { left: ['mrt-row-expand', 'favorite', 'rank', 'image'] },
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
    onPaginationChange: (updater) => setPagination((prev) => apply(updater, prev)),
    onGlobalFilterChange: (value) => onSearch(typeof value === 'string' ? value : ''),
    globalFilterFn: 'contains',
    muiSearchTextFieldProps: {
      variant: 'outlined',
      size: 'small',
      placeholder: 'Search in all columns...',
      sx: { minWidth: 260 },
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        width: '100%',
        maxWidth: '100%',
        border: '1px solid var(--hair)',
        borderRadius: '8px',
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
    muiTableBodyRowProps: {
      hover: true,
    },
    muiCircularProgressProps: { color: 'primary', size: 40 },
    muiSkeletonProps: { animation: 'wave', height: 28 },
    localization: {
      noRecordsToDisplay: emptyMessage,
    },
    renderDetailPanel: ({ row }) => (
      <ListingDetailPanel listing={row.original} onToggleFavorite={onToggleFavorite} />
    ),
  })

  return (
    <div className="listing-feed-table" data-testid={loading ? 'feed-skeleton' : undefined}>
      {error && (
        <div className="listing-feed-error" role="alert">
          <span>{error}</span>
          <button type="button" className="label listing-retry" onClick={onRetry}>
            Retry
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
): MRT_ColumnDef<RankedListing>[] {
  return [
    {
      id: 'favorite',
      header: 'Fav',
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
      header: '#',
      size: 56,
      enableColumnFilter: false,
      Cell: ({ cell }) => String(cell.getValue<number>()).padStart(2, '0'),
    },
    {
      id: 'image',
      header: 'Image',
      size: 96,
      enableColumnFilter: false,
      enableSorting: false,
      Cell: ({ row }) =>
        row.original.imageUrl ? <ImageZoom src={row.original.imageUrl} alt="" /> : null,
    },
    {
      accessorKey: 'title',
      header: 'Listing',
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
            <CopyButton text={row.original.title} label="Copy listing title" />
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'shopName',
      header: 'Shop',
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
      header: 'Price',
      size: 110,
      filterVariant: 'range',
      Cell: ({ row }) => formatMoney(row.original.price, row.original.currency),
    },
    {
      accessorKey: 'numFavorers',
      header: 'Favs',
      size: 90,
      filterVariant: 'range',
      Cell: ({ cell }) => formatCount(cell.getValue<number>()),
    },
    {
      accessorKey: 'views',
      header: 'Views',
      size: 100,
      filterVariant: 'range',
      Cell: ({ cell }) => formatCount(cell.getValue<number | null>()),
    },
    {
      accessorKey: 'reviews30d',
      header: 'Reviews 30d',
      size: 140,
      filterVariant: 'range',
      Cell: ({ cell }) => formatCount(cell.getValue<number | null>()),
    },
    {
      accessorKey: 'estSales30d',
      header: 'Est. 30d sales',
      size: 160,
      filterVariant: 'range',
      Cell: ({ cell }) => formatCount(cell.getValue<number | null>()),
    },
    {
      accessorKey: 'deltaFavorers7d',
      header: 'Δ fav 7d',
      size: 120,
      filterVariant: 'range',
      Cell: ({ cell }) => formatDelta(cell.getValue<number | null>()),
    },
    {
      accessorKey: 'deltaViews7d',
      header: 'Δ views 7d',
      size: 130,
      filterVariant: 'range',
      Cell: ({ cell }) => formatDelta(cell.getValue<number | null>()),
    },
    {
      accessorKey: 'daysToTop',
      header: 'Days to top',
      size: 148,
      filterVariant: 'range',
      Cell: ({ cell }) => formatDays(cell.getValue<number | null>()),
    },
    {
      accessorKey: 'ageDays',
      header: 'Age',
      size: 90,
      filterVariant: 'range',
      Cell: ({ cell }) => formatAgeDays(cell.getValue<number | null>()),
    },
    {
      accessorKey: 'shopSales',
      header: 'Shop sales',
      size: 140,
      filterVariant: 'range',
      Cell: ({ cell }) => formatCount(cell.getValue<number | null>()),
    },
    {
      id: 'bestseller',
      accessorFn: (row) => bestsellerFilterValue(row),
      header: 'Bestseller',
      size: 130,
      filterVariant: 'select',
      filterSelectOptions: [
        { label: 'Etsy', value: 'etsy' },
        { label: 'Likely (PM)', value: 'pm' },
        { label: 'Was bestseller', value: 'was' },
        { label: 'No', value: 'no' },
      ],
      Cell: ({ row }) => <BestsellerBadge listing={row.original} />,
    },
    {
      accessorKey: 'momentumScore',
      header: 'Momentum',
      size: 140,
      filterVariant: 'range',
      Cell: ({ cell }) => {
        const value = cell.getValue<number | null>()
        const bar = Math.max(8, Math.round(((value ?? 0) / momentumMax) * 100))
        return (
          <div className="listing-momentum">
            <span className="numeric">{formatScore(value)}</span>
            <span className="listing-mom-track" aria-hidden="true">
              <span className="listing-mom-fill" style={{ width: `${bar}%` }} />
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'listingId',
      header: 'Listing ID',
      size: 120,
      filterVariant: 'text',
      Cell: ({ cell }) => (
        <span className="listing-id-cell">
          <span className="numeric">{cell.getValue<number>()}</span>
          <CopyButton text={String(cell.getValue<number>())} label="Copy listing ID" />
        </span>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Qty',
      size: 80,
      filterVariant: 'range',
      Cell: ({ cell }) => formatCount(cell.getValue<number | null>()),
    },
    {
      accessorKey: 'whoMade',
      header: 'Who made',
      size: 120,
      filterVariant: 'text',
      Cell: ({ cell }) => cell.getValue<string | null>() || '—',
    },
    {
      accessorKey: 'whenMade',
      header: 'When made',
      size: 120,
      filterVariant: 'text',
      Cell: ({ cell }) => cell.getValue<string | null>() || '—',
    },
    {
      accessorKey: 'shopRating',
      header: 'Shop rating',
      size: 120,
      filterVariant: 'range',
      Cell: ({ cell }) => {
        const value = cell.getValue<number | null>()
        return value == null ? '—' : value.toFixed(2)
      },
    },
    {
      accessorKey: 'shopReviewCount',
      header: 'Shop reviews',
      size: 120,
      filterVariant: 'range',
      Cell: ({ cell }) => formatCount(cell.getValue<number | null>()),
    },
    {
      accessorKey: 'shopId',
      header: 'Shop ID',
      size: 110,
      filterVariant: 'text',
    },
    {
      accessorKey: 'firstSeenAt',
      header: 'First seen',
      size: 130,
      filterVariant: 'text',
      Cell: ({ cell }) => formatShortDate(cell.getValue<string | null>()),
    },
    {
      accessorKey: 'originalCreatedAt',
      header: 'Created',
      size: 130,
      filterVariant: 'text',
      Cell: ({ cell }) => formatShortDate(cell.getValue<string | null>()),
    },
    {
      accessorKey: 'lastSeenAt',
      header: 'Last seen',
      size: 130,
      filterVariant: 'text',
      Cell: ({ cell }) => formatShortDate(cell.getValue<string | null>()),
    },
    {
      accessorKey: 'lastReviewAt',
      header: 'Last review',
      size: 130,
      filterVariant: 'text',
      Cell: ({ cell }) => formatShortDate(cell.getValue<string | null>()),
    },
  ]
}

function ListingDetailPanel({
  listing,
  onToggleFavorite,
}: {
  listing: RankedListing
  onToggleFavorite: (listing: ListingFeedItem) => void | Promise<void>
}) {
  return (
    <div className="listing-detail-panel">
      {listing.imageUrl ? <img src={listing.imageUrl} alt="" /> : null}
      <div>
        {listing.shopId ? (
          <Link className="label" to={`/shops/${listing.shopId}`}>
            {listing.shopName}
          </Link>
        ) : (
          <p className="label">{listing.shopName}</p>
        )}
        <p className="listing-detail-title">{listing.title}</p>
        <div className="listing-detail-metrics">
          <span>{formatMoney(listing.price, listing.currency)}</span>
          <span>{formatCount(listing.numFavorers)} favs</span>
          <span>{formatCount(listing.views)} views</span>
          <span>{formatCount(listing.reviews30d)} reviews / 30d</span>
          <span>{formatCount(listing.estSales30d)} est. sales / 30d</span>
          <span>{formatDelta(listing.deltaFavorers7d)} fav / 7d</span>
          <span>{formatDays(listing.daysToTop)} days to top</span>
          <span className="listing-detail-mom">{formatScore(listing.momentumScore)} momentum</span>
          <BestsellerBadge listing={listing} />
        </div>
        <div className="listing-detail-links">
          <FavoriteButton favorite={Boolean(listing.favorite)} onToggle={() => onToggleFavorite(listing)} />
          <Link to={`/listings/${listing.listingId}`}>Open listing</Link>
          <a href={listing.etsyUrl} target="_blank" rel="noreferrer">
            View on Etsy
          </a>
        </div>
      </div>
    </div>
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

function loadPageSize(): number {
  const stored = Number(localStorage.getItem(PAGE_SIZE_KEY))
  return Number.isFinite(stored) && stored > 0 ? stored : 25
}
