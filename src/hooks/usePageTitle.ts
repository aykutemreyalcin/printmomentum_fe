import { useEffect } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { messages, type MessageKey } from '../i18n/messages'

function isMessageKey(value: string): value is MessageKey {
  return value in messages.en
}

export function usePageTitle(title: MessageKey | string, vars?: Record<string, string | number>) {
  const { t } = useI18n()
  useEffect(() => {
    document.title = isMessageKey(title) ? t(title, vars) : title
  }, [t, title, vars])
}
