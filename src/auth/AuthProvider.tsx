import {
  createContext,
  type PropsWithChildren,
  type Dispatch,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { ApiError } from '../api/ApiError'
import { getCurrentUser } from '../api/client'
import type { AuthModel, UserResponse } from './_models'
import * as authHelper from './_helpers'

type AuthContextValue = {
  loading: boolean
  auth: AuthModel | undefined
  currentUser: UserResponse | undefined
  setCurrentUser: Dispatch<SetStateAction<UserResponse | undefined>>
  login: (email: string, password: string) => Promise<UserResponse>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true)
  const [auth, setAuthState] = useState<AuthModel | undefined>(() => authHelper.getAuth())
  const [currentUser, setCurrentUser] = useState<UserResponse | undefined>()

  const saveAuth = useCallback((next: AuthModel | undefined) => {
    setAuthState(next)
    if (next) {
      authHelper.setAuth(next)
    } else {
      authHelper.removeAuth()
    }
  }, [])

  useEffect(() => {
    const existing = authHelper.getAuth()
    if (!existing) {
      setLoading(false)
      return
    }
    void getCurrentUser()
      .then((user) => {
        setCurrentUser(user)
        setAuthState(existing)
      })
      .catch(() => {
        saveAuth(undefined)
        setCurrentUser(undefined)
      })
      .finally(() => setLoading(false))
  }, [saveAuth])

  const login = useCallback(
    async (email: string, password: string): Promise<UserResponse> => {
      const response = await fetch(authHelper.AUTH_V2_LOGIN, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email,
          password,
          deviceId: authHelper.getOrCreateDeviceId(),
        }),
      })
      if (!response.ok) {
        saveAuth(undefined)
        throw await ApiError.fromResponse(response)
      }
      const data = (await response.json()) as { token: string }
      saveAuth({ token: data.token })
      const user = await getCurrentUser()
      setCurrentUser(user)
      return user
    },
    [saveAuth],
  )

  const logout = useCallback(async () => {
    try {
      await fetch(authHelper.AUTH_V2_LOGOUT, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      saveAuth(undefined)
      setCurrentUser(undefined)
    }
  }, [saveAuth])

  const value = useMemo(
    () => ({ loading, auth, currentUser, setCurrentUser, login, logout }),
    [loading, auth, currentUser, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
