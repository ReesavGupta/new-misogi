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
import { Sun, Moon } from 'lucide-react'

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

    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return 'light'
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme())
  const [isThemeLoading, setIsThemeLoading] = useState(true)
  const { isAuthenticated } = useAuth()

  // Apply theme to DOM whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Applying theme to document:', theme)
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(theme)
      localStorage.setItem('theme', theme)
    }
  }, [theme])

  // Fetch user theme preference when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserTheme = async () => {
        setIsThemeLoading(true)
        try {
          const response = await getUserSettings()
          console.log('Fetched user settings:', response)
          if (
            response?.data?.theme &&
            (response.data.theme === 'light' || response.data.theme === 'dark')
          ) {
            setTheme(response.data.theme)
          }
        } catch (error) {
          console.error('Failed to fetch user theme:', error)
        } finally {
          setIsThemeLoading(false)
        }
      }

      fetchUserTheme()
    } else {
      // If not authenticated, just apply the initial theme from localStorage
      setIsThemeLoading(false)
    }
  }, [isAuthenticated])

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    console.log('Toggling theme from', theme, 'to', newTheme)

    // Update state immediately for responsive UI
    setTheme(newTheme)

    // Save preference to API if authenticated
    if (isAuthenticated) {
      try {
        await updateUserSettings({ theme: newTheme })
        console.log('Theme preference saved to API')
      } catch (error) {
        console.error('Failed to update theme preference:', error)
        toast.error('Failed to save theme preference')

        // Revert theme if API call fails
        setTheme(theme)
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

// Demo component to show how the theme toggle works
const ThemeToggle = () => {
  const { theme, toggleTheme, isThemeLoading } = useTheme()

  if (isThemeLoading) {
    return <div className="animate-pulse">Loading theme...</div>
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleTheme}
        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 dark:bg-gray-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <span className="sr-only">Toggle theme</span>
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <div className="flex items-center">
        {theme === 'dark' ? (
          <Moon className="h-5 w-5 text-gray-400" />
        ) : (
          <Sun className="h-5 w-5 text-yellow-500" />
        )}
        <span className="ml-2 text-sm text-gray-900 dark:text-white">
          {theme === 'dark' ? 'Dark' : 'Light'} Mode
        </span>
      </div>  
    </div>
  )
}

export default ThemeToggle
