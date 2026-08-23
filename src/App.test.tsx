import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { stubApi } from './test/stubApi'

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows API health when the backend responds', async () => {
    stubApi({ items: [] })

    render(<App />)
    expect(await screen.findByTestId('health')).toHaveTextContent('API ok')
  })
})
