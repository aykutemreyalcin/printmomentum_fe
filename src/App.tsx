import { AuthProvider } from './auth/AuthProvider'
import { AppRoutes } from './AppRoutes'
import { AppTheme } from './theme/AppTheme'
import { BrowserRouter } from 'react-router'

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export default function App() {
  return (
    <AppTheme>
      <AuthProvider>
        <BrowserRouter basename={routerBasename}>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </AppTheme>
  )
}
