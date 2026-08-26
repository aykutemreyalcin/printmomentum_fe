import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1B84FF', dark: '#056EE9', light: '#50A5FF', contrastText: '#FFFFFF' },
    secondary: { main: '#334155', contrastText: '#FFFFFF' },
    success: { main: '#15803D' },
    warning: { main: '#B45309' },
    error: { main: '#B91C1C' },
    background: { default: '#F5F7FA', paper: '#FFFFFF' },
    text: { primary: '#1E293B', secondary: '#64748B' },
    divider: '#E2E8F0',
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
