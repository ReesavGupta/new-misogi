// Fixed AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { loginUser, registerUser, logoutUser, refreshToken } from '../api/auth'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // const navigate = useNavigate()
  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        console.log('Initial auth check - token exists:', !!token)

        if (token) {
          // Try to refresh the token
          try {
            const response = await refreshToken()
            console.log('Refresh token response:', response)

            if (response.success || response.status === 'success') {
              // Store the new token

              const accessToken =
                response.data?.accessToken || response.accessToken
              localStorage.setItem('accessToken', accessToken)

              // Get user data from localStorage
              const userData = localStorage.getItem('user')
              if (userData) {
                setUser(JSON.parse(userData))
                console.log('User restored from localStorage')
              }
            } else {
              // If refresh returns unsuccessful response
              console.log('Token refresh unsuccessful, clearing auth data')
              localStorage.removeItem('accessToken')
              localStorage.removeItem('user')
            }
          } catch (refreshError) {
            // Handle refresh token failure explicitly
            console.error('Token refresh failed:', refreshError)
            localStorage.removeItem('accessToken')
            localStorage.removeItem('user')
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await loginUser(email, password)
      console.log('Login response:', response)

      if (response.success || response.status === 'success') {
        const userData = response.data?.user || response.user
        const accessToken = response.data?.accessToken || response.accessToken

        console.log('Storing auth data:', {
          accessToken: !!accessToken,
          userData,
        })

        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)

        // After updating state, manually navigate
        // navigate('/')
      } else {
        throw new Error('Login failed')
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await registerUser(name, email, password)
      console.log('Register response:', response)

      if (response.status === 'success' || response.success) {
        const userData = response.data?.user || response.user
        const accessToken = response.data?.accessToken || response.accessToken

        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)

        // After updating state, manually navigate
        window.location.href = '/'
      } else {
        throw new Error('Registration failed')
      }
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await logoutUser()
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
      // Clear local storage even if API call fails
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      setUser(null)
    } finally {
      setIsLoading(false)
      // Redirect to login page after logout
      // navigate('/login')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  console.log('Auth context:', context)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
