import type { PropsWithChildren, ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AuthProvider } from '../auth/AuthProvider'
import { CompareProvider } from '../compare/CompareProvider'
import { FavoritesCountProvider } from '../favorites/FavoritesCountProvider'
import { I18nProvider } from '../i18n/I18nProvider'
import { AppTheme } from '../theme/AppTheme'
import { ThemeModeProvider } from '../theme/ThemeModeProvider'
import { ToastProvider } from '../components/Toast'

export function TestProviders({
  children,
  route = '/',
}: PropsWithChildren<{ route?: string }>) {
  return (
    <I18nProvider>
      <ThemeModeProvider>
        <AppTheme>
          <ToastProvider>
            <AuthProvider>
              <FavoritesCountProvider>
                <CompareProvider>
                  <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
                </CompareProvider>
              </FavoritesCountProvider>
            </AuthProvider>
          </ToastProvider>
        </AppTheme>
      </ThemeModeProvider>
    </I18nProvider>
  )
}

export function renderWithProviders(ui: ReactElement, route = '/') {
  return render(ui, {
    wrapper: ({ children }) => <TestProviders route={route}>{children}</TestProviders>,
  })
}
