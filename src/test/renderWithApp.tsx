import type { ReactElement } from 'react'
import { TestProviders } from './TestProviders'

export function renderWithApp(ui: ReactElement, route = '/') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { render } = require('@testing-library/react') as typeof import('@testing-library/react')
  return render(ui, {
    wrapper: ({ children }) => <TestProviders route={route}>{children}</TestProviders>,
  })
}
