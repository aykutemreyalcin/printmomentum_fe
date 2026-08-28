import { AuthProvider } from './auth/AuthProvider'
import { AppRoutes } from './AppRoutes'
import { AppTheme } from './theme/AppTheme'
import { ToastProvider } from './components/Toast'
import { SelectionProvider } from './selection/SelectionProvider'
import { FavoritesCountProvider } from './favorites/FavoritesCountProvider'
import { I18nProvider } from './i18n/I18nProvider'
import { ThemeModeProvider } from './theme/ThemeModeProvider'
import { BrowserRouter } from 'react-router'

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export default function App() {
  return (
    <I18nProvider>
      <ThemeModeProvider>
        <AppTheme>
          <ToastProvider>
            <AuthProvider>
              <FavoritesCountProvider>
                <SelectionProvider>
                  <BrowserRouter basename={routerBasename}>
                    <AppRoutes />
                  </BrowserRouter>
                </SelectionProvider>
              </FavoritesCountProvider>
            </AuthProvider>
          </ToastProvider>
        </AppTheme>
      </ThemeModeProvider>
    </I18nProvider>
  )
}
