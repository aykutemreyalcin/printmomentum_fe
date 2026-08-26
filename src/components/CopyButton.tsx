import Check from '@mui/icons-material/Check'
import ContentCopy from '@mui/icons-material/ContentCopy'
import { useState, type MouseEvent } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import './CopyButton.css'

type Props = {
  text: string
  label?: string
}

export function CopyButton({ text, label }: Props) {
  const { t } = useI18n()
  const resolvedLabel = label ?? t('copy.label')
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
      aria-label={copied ? t('copy.copied') : resolvedLabel}
      title={copied ? t('copy.copied') : t('copy.clipboard')}
    >
      {copied ? <Check fontSize="inherit" /> : <ContentCopy fontSize="inherit" />}
    </button>
  )
}
