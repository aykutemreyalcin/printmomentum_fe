import Favorite from '@mui/icons-material/Favorite'
import FavoriteBorder from '@mui/icons-material/FavoriteBorder'
import { useState, type MouseEvent } from 'react'
import './FavoriteButton.css'

type Props = {
  favorite: boolean
  onToggle: () => void
  disabled?: boolean
}

export function FavoriteButton({ favorite, onToggle, disabled }: Props) {
  const [busy, setBusy] = useState(false)

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
      aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
      title={favorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {favorite ? <Favorite fontSize="inherit" /> : <FavoriteBorder fontSize="inherit" />}
    </button>
  )
}
