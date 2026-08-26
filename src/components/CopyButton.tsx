import Check from '@mui/icons-material/Check'
import ContentCopy from '@mui/icons-material/ContentCopy'
import { useState, type MouseEvent } from 'react'
import './CopyButton.css'

type Props = {
  text: string
  label?: string
}

export function CopyButton({ text, label = 'Copy' }: Props) {
  const [copied, setCopied] = useState(false)

  async function onCopy(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      className="copy-btn"
      onClick={(event) => void onCopy(event)}
      aria-label={copied ? 'Copied' : label}
      title={copied ? 'Copied' : 'Copy to clipboard'}
    >
      {copied ? <Check fontSize="inherit" /> : <ContentCopy fontSize="inherit" />}
    </button>
  )
}
