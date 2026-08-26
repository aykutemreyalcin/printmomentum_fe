import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { createAppTheme } from './theme'
import { useThemeMode } from './ThemeModeProvider'

export function AppTheme({ children }: { children: ReactNode }) {
  const { mode } = useThemeMode()
  const { locale } = useI18n()
  const theme = useMemo(() => createAppTheme(mode), [mode])
  const dayjsLocale = locale === 'tr' ? 'tr' : 'en'

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={dayjsLocale}>
        <CssBaseline />
        {children}
      </LocalizationProvider>
    </ThemeProvider>
  )
}
