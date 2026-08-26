import { AuthProvider } from './auth/AuthProvider'
import { AppRoutes } from './AppRoutes'
import { AppTheme } from './theme/AppTheme'
import { BrowserRouter } from 'react-router'

export default function App() {
  return (
    <AppTheme>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </AppTheme>
  )
}
