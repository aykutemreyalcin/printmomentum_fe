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
}
