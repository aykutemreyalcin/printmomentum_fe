import { createTheme, type Theme } from '@mui/material/styles'
import type { ThemeMode } from './ThemeModeProvider'

export function createAppTheme(mode: ThemeMode): Theme {
  const isDark = mode === 'dark'
  return createTheme({
    palette: {
      mode,
      primary: { main: '#1B84FF', dark: '#056EE9', light: '#50A5FF', contrastText: '#FFFFFF' },
      secondary: { main: isDark ? '#94A3B8' : '#334155', contrastText: '#FFFFFF' },
      success: { main: '#15803D' },
      warning: { main: '#B45309' },
      error: { main: '#B91C1C' },
      background: {
        default: isDark ? '#0f1419' : '#F5F7FA',
        paper: isDark ? '#151b23' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#E2E8F0' : '#1E293B',
        secondary: isDark ? '#94A3B8' : '#64748B',
      },
      divider: isDark ? '#2a3441' : '#E2E8F0',
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: `'Inter Tight', system-ui, -apple-system, 'Segoe UI', sans-serif`,
      fontSize: 13,
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { fontSize: 12 },
        },
      },
    },
  })
}

/** @deprecated use createAppTheme */
export const theme = createAppTheme('light')
