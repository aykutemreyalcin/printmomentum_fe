import { useEffect, useState } from 'react'
import './App.css'

type Health = {
  status: string
  service: string
}

function App() {
  const [health, setHealth] = useState<Health | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/v1/health')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        return (await response.json()) as Health
      })
      .then(setHealth)
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : 'health check failed')
      })
  }, [])

  return (
    <main className="app">
      <p className="eyebrow">printmomentum.com</p>
      <h1>PrintMomentum</h1>
      <p>Printable Etsy tees ranked by how fast they climb.</p>
      {health ? (
        <p data-testid="health">API {health.status}</p>
      ) : error ? (
        <p data-testid="health-error">API offline ({error}). Start printmomentum_be.</p>
      ) : (
        <p data-testid="health-loading">Checking API…</p>
      )}
    </main>
  )
}

export default App
