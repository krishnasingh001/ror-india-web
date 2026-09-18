import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { api, clearAuthToken, clearCsrf, ensureCsrf, setAuthToken } from '@/lib/api'
import type { User } from '@/types'

type AuthContextValue = {
  user: User | null
  loading: boolean
  refresh: () => Promise<void>
  login: (email: string, password: string) => Promise<{ redirect_to: string }>
  register: (payload: {
    name: string
    email: string
    password: string
    password_confirmation: string
    role: string
  }) => Promise<{ message: string; requires_confirmation: boolean }>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  applySession: (user: User, authToken?: string | null) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const refreshGeneration = useRef(0)

  const refresh = useCallback(async () => {
    const generation = ++refreshGeneration.current
    try {
      await ensureCsrf()
      const res = await api.me()
      if (generation !== refreshGeneration.current) return
      setUser(res.user)
    } catch {
      if (generation !== refreshGeneration.current) return
      setUser(null)
    } finally {
      if (generation === refreshGeneration.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const applySession = useCallback(async (nextUser: User, authToken?: string | null) => {
    // Invalidate any in-flight /auth/me from the initial page load so it cannot
    // overwrite a successful login/impersonate with user: null.
    refreshGeneration.current += 1
    if (authToken) setAuthToken(authToken)
    clearCsrf()
    await ensureCsrf(true)
    setUser(nextUser)
    setLoading(false)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.login(email, password)
      await applySession(res.user, res.auth_token)
      return { redirect_to: res.redirect_to }
    },
    [applySession],
  )

  const register = useCallback(
    async (payload: {
      name: string
      email: string
      password: string
      password_confirmation: string
      role: string
    }) => {
      const res = await api.register(payload)
      return {
        message: res.message,
        requires_confirmation: res.requires_confirmation,
      }
    },
    [],
  )

  const logout = useCallback(async () => {
    refreshGeneration.current += 1
    try {
      await api.logout()
    } finally {
      clearAuthToken()
      clearCsrf()
      setUser(null)
      setLoading(false)
    }
  }, [])

  const value = useMemo(
    () => ({ user, loading, refresh, login, register, logout, setUser, applySession }),
    [user, loading, refresh, login, register, logout, applySession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useIsRecruiter() {
  const { user } = useAuth()
  const role = user?.role?.toString().toLowerCase().trim()
  return role === 'recruiter' || role === 'admin'
}

/** Full job/company catalog (pagination + detail) requires a developer profile. Recruiters/admins bypass. */
export function useCanBrowseFullCatalog() {
  const { user } = useAuth()
  const isRecruiter = useIsRecruiter()
  if (isRecruiter) return true
  return Boolean(user?.has_profile)
}
