/** HTTP failure from `/api`. Carries status and RFC 7807 title/detail when present. */
export class ApiError extends Error {
  readonly status: number
  readonly title: string | undefined
  readonly detail: string | undefined

  constructor(status: number, title?: string, detail?: string) {
    super(detail ?? title ?? `HTTP ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.title = title
    this.detail = detail
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    let title: string | undefined
    let detail: string | undefined
    try {
      const body: unknown = await response.json()
      if (isRecord(body)) {
        title = stringField(body, 'title')
        detail = stringField(body, 'detail')
      }
    } catch {
      // Non-JSON bodies still become an ApiError with the status code.
    }
    return new ApiError(response.status, title, detail)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function stringField(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}
