import Favorite from '@mui/icons-material/Favorite'
import FavoriteBorder from '@mui/icons-material/FavoriteBorder'
import { useState, type MouseEvent } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import './FavoriteButton.css'

type Props = {
  favorite: boolean
  onToggle: () => void
  disabled?: boolean
}

export function FavoriteButton({ favorite, onToggle, disabled }: Props) {
  const { t } = useI18n()
  const [busy, setBusy] = useState(false)
  const label = favorite ? t('fav.remove') : t('fav.add')

  async function onClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    if (busy || disabled) return
    setBusy(true)
    try {
      await Promise.resolve(onToggle())
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      className={['favorite-btn', favorite && 'is-on'].filter(Boolean).join(' ')}
      onClick={(event) => void onClick(event)}
      disabled={disabled || busy}
      aria-pressed={favorite}
      aria-label={label}
      title={label}
    >
      {favorite ? <Favorite fontSize="inherit" /> : <FavoriteBorder fontSize="inherit" />}
    </button>
  )
}
