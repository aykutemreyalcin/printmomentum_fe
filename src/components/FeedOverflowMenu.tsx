import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import './FeedOverflowMenu.css'

type Props = {
  canExportAll: boolean
  canExportSelected: boolean
  exporting: 'all' | 'selected' | null
  onExportAll: () => void
  onExportSelected: () => void
}

export function FeedOverflowMenu({
  canExportAll,
  canExportSelected,
  exporting,
  onExportAll,
  onExportSelected,
}: Props) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div className="feed-overflow" ref={rootRef}>
      <button
        type="button"
        className="feed-toolbar-btn feed-overflow-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('feed.moreActions')}
        onClick={() => setOpen((value) => !value)}
      >
        ⋯
      </button>
      {open ? (
        <div className="feed-overflow-menu" role="menu">
          <button
            type="button"
            role="menuitem"
            disabled={!canExportAll}
            onClick={() => {
              setOpen(false)
              onExportAll()
            }}
          >
            {exporting === 'all' ? t('feed.exporting') : t('feed.exportAll')}
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={!canExportSelected}
            onClick={() => {
              setOpen(false)
              onExportSelected()
            }}
          >
            {exporting === 'selected' ? t('feed.exporting') : t('feed.exportSelected')}
          </button>
        </div>
      ) : null}
    </div>
  )
}
