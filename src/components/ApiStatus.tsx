import { useEffect, useState } from 'react'
import './ApiStatus.css'

type Health = {
  status: string
  service: string
}

export function ApiStatus() {
  const [health, setHealth] = useState<Health | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/v1/health')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        return (await response.json()) as Health
      })
      .then((value) => {
        if (!cancelled) setHealth(value)
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'health check failed')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (health) {
    return (
      <span className="api-status label" data-testid="health">
        <i className="api-status-dot" /> API {health.status}
      </span>
    )
  }

  if (error) {
    return (
      <span className="api-status is-down label" data-testid="health-error">
        <i className="api-status-dot" /> API offline ({error})
      </span>
    )
  }

  return (
    <span className="api-status label" data-testid="health-loading">
      Checking API…
    </span>
  )
}
