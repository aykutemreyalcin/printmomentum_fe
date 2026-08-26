import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { messages, type Locale, type MessageKey } from './messages'

const STORAGE_KEY = 'printmomentum-locale'

export type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string

type I18nValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Translate
  dateLocale: string
  numberLocale: string
}

const I18nContext = createContext<I18nValue | null>(null)

export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    vars[name] == null ? `{${name}}` : String(vars[name]),
  )
}

export function translate(locale: Locale, key: MessageKey, vars?: Record<string, string | number>): string {
  const table = messages[locale] as Record<MessageKey, string>
  return interpolate(table[key] ?? messages.en[key], vars)
}

export const tEn: Translate = (key, vars) => translate('en', key, vars)

function readLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'tr' || stored === 'en') return stored
  } catch {
    /* ignore */
  }
  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('tr')) {
    return 'tr'
  }
  return 'en'
}

export function I18nProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>(() => readLocale())

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const t = useCallback<Translate>((key, vars) => translate(locale, key, vars), [locale])

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      t,
      dateLocale: locale === 'tr' ? 'tr-TR' : 'en-GB',
      numberLocale: locale === 'tr' ? 'tr-TR' : 'en-US',
    }),
    [locale, setLocale, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

const API_ERRORS: Record<string, MessageKey> = {
  'Wrong password': 'errors.wrongPassword',
  'Email already in use': 'errors.emailInUse',
  'This account is deactivated': 'errors.inactive',
  'Invalid credentials': 'errors.invalidCredentials',
  'Name is required': 'errors.nameRequired',
  'Current password is required': 'errors.currentPassword',
  'Cannot deactivate your own account': 'errors.selfDeactivate',
  'Cannot deactivate the last admin': 'errors.lastAdmin',
}

export function translateApiError(detail: string | undefined, t: Translate, fallbackKey: MessageKey): string {
  if (!detail) return t(fallbackKey)
  const key = API_ERRORS[detail]
  return key ? t(key) : detail
}
