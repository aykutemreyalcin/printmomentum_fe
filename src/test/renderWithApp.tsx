import type { ReactElement, ReactNode } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AppTheme } from '../theme/AppTheme'

export function renderWithApp(ui: ReactElement, route = '/') {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AppTheme>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </AppTheme>
    )
  }
  return render(ui, { wrapper: Wrapper })
}
