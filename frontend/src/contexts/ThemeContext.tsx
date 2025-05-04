import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { getUserSettings, updateUserSettings } from '../api/settings'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  isThemeLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored && (stored === 'light' || stored === 'dark')) return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return 'light'
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [isThemeLoading, setIsThemeLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // Fetch user theme preference once when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserTheme = async () => {
        setIsThemeLoading(true)
        try {
          const response = await getUserSettings()
          if (
            response.status === 'success' &&
            response.data?.theme &&
            (response.data.theme === 'light' || response.data.theme === 'dark')
          ) {
            setTheme(response.data.theme)
          }
        } catch (error) {
          console.error('Failed to fetch user theme:', error)
          // Fall back to browser preference if API fails
          const prefersDark = window.matchMedia(
            '(prefers-color-scheme: dark)'
          ).matches
          setTheme(prefersDark ? 'dark' : 'light')
        } finally {
          setIsThemeLoading(false)
        }
      }

      fetchUserTheme()
    }
  }, [isAuthenticated])

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'

    // Update state immediately for responsive UI
    setTheme(newTheme)

    // Save preference to API if authenticated
    if (isAuthenticated) {
      try {
        await updateUserSettings({ theme: newTheme })
      } catch (error) {
        console.error('Failed to update theme preference:', error)
        toast.error('Failed to save theme preference')
        // Don't revert the theme as the local change is still valid
      }
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isThemeLoading }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
