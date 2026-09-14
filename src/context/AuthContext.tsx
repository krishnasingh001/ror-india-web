import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, ensureCsrf } from '@/lib/api'
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
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      await ensureCsrf()
      const res = await api.me()
      setUser(res.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password)
    setUser(res.user)
    return { redirect_to: res.redirect_to }
  }, [])

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
    await api.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, refresh, login, register, logout, setUser }),
    [user, loading, refresh, login, register, logout],
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
