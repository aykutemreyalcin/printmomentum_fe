import { useEffect, useState } from 'react'
import { getHealth } from '../api/client'
import type { Health } from '../api/types'
import './ApiStatus.css'

export function ApiStatus() {
  const [health, setHealth] = useState<Health | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getHealth()
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
