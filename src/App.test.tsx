import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { stubApi, seedAuth } from './test/stubApi'

describe('App', () => {
  afterEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('shows API health when the backend responds', async () => {
    seedAuth()
    stubApi({ items: [] })

    render(<App />)
    expect(await screen.findByTestId('health', {}, { timeout: 5000 })).toHaveTextContent('API ok')
  })
})
