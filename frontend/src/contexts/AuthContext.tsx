// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { User, LoginData, RegisterData } from '../types'
import { login, register, logout } from '../api/authService'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('user')
    const accessToken = localStorage.getItem('accessToken')

    if (storedUser && accessToken) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (err) {
        // If there's an error parsing the user, clear the storage
        localStorage.removeItem('user')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
    }

    setIsLoading(false)
  }, [])

  const handleLogin = async (data: LoginData) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await login(data)

      if (response.success) {
        const { user, accessToken, refreshToken } = response.data

        // Save user and tokens to localStorage
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)

        setUser(user)
      } else {
        setError(response.message || 'An error occurred during login')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (data: RegisterData) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await register(data)

      if (response.success) {
        const { user, accessToken, refreshToken } = response.data

        // Save user and tokens to localStorage
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)

        setUser(user)
      } else {
        setError(response.message || 'An error occurred during registration')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await logout()
      setUser(null)
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Ensure we clear local storage even if the API call fails
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setIsLoading(false)
    }
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
