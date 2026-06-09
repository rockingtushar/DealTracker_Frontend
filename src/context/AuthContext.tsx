import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Influencer } from '../types'
import api from '../api/axios'

interface AuthContextType {
  token: string | null
  influencer: Influencer | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  )

  const [influencer, setInfluencer] = useState<Influencer | null>(() => {
    try {
      const saved = localStorage.getItem('influencer')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token')

      if (!savedToken) {
        setIsLoading(false)
        return
      }

      try {
        setToken(savedToken)

        const res = await api.get('/auth/me')

        setInfluencer(res.data)

        localStorage.setItem('influencer', JSON.stringify(res.data))
      } catch (err) {
        // token invalid → logout
        localStorage.removeItem('token')
        localStorage.removeItem('influencer')
        setToken(null)
        setInfluencer(null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const fetchMe = async () => {
    try {
      const res = await api.get('/auth/me')
      setInfluencer(res.data)
      localStorage.setItem('influencer', JSON.stringify(res.data))
    } catch {
      logout()
    }
  }

  const login = async (newToken: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)

    try {
      const res = await api.get('/auth/me')

      setInfluencer(res.data)
      localStorage.setItem('influencer', JSON.stringify(res.data))
    } catch {
      logout()
    }
  }
  
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('influencer')
    setToken(null)
    setInfluencer(null)
    window.location.replace('/login')
  }

  return (
    <AuthContext.Provider
      value={{ token, influencer, isAuthenticated: !!token, isLoading, login, logout, fetchMe }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
