import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { TestProviders } from './TestProviders'

export function renderWithApp(ui: ReactElement, route = '/') {
  return render(ui, {
    wrapper: ({ children }) => <TestProviders route={route}>{children}</TestProviders>,
  })
}
