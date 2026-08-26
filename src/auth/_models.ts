export type AuthModel = {
  token: string
}

export type UserResponse = {
  id: number
  name: string | null
  displayName: string | null
  email: string
  role: 'admin' | 'user'
  active: boolean
  lastLoginAt?: string | null
}

export type UserSessionView = {
  id: number
  deviceId: string | null
  ipAddress: string | null
  userAgent: string | null
  lastUsedAt: string | null
  createdAt: string | null
  expiresAt: string | null
  active: boolean
}
