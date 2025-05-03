import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { UserSettings } from '../types'
import { getUserSettings, updateUserSettings } from '../api/settingService'
import { useAuth } from './AuthContext'

interface SettingsContextType {
  settings: UserSettings | null
  isLoading: boolean
  error: string | null
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>
  applyTheme: (theme: 'light' | 'dark' | 'system') => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
)

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

interface SettingsProviderProps {
  children: ReactNode
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchSettings = async () => {
      if (!isAuthenticated) {
        // Use default settings if not authenticated
        setSettings({
          id: '',
          userId: '',
          theme: 'light',
          reminderTime: null,
        })
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await getUserSettings()
        if (response.success) {
          setSettings(response.data)
        }
      } catch (err: any) {
        console.error('Error fetching settings:', err)
        setError(err.response?.data?.message || 'Failed to fetch settings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [isAuthenticated])

  useEffect(() => {
    // Apply theme when settings change
    if (settings) {
      applyTheme(settings.theme)
    }
  }, [settings])

  const handleUpdateSettings = async (
    updatedSettings: Partial<UserSettings>
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      if (!isAuthenticated) {
        // Update local settings only if not authenticated
        setSettings((prev) => ({
          ...prev!,
          ...updatedSettings,
        }))
        return
      }

      const response = await updateUserSettings(updatedSettings)

      if (response.success) {
        setSettings(response.data)
      } else {
        setError(
          response.message || 'An error occurred while updating settings'
        )
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update settings')
    } finally {
      setIsLoading(false)
    }
  }

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement

    // Remove existing theme classes
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      // Use system preference
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
      root.classList.add(prefersDark ? 'dark' : 'light')
    } else {
      // Use specified theme
      root.classList.add(theme)
    }
  }

  const value = {
    settings,
    isLoading,
    error,
    updateSettings: handleUpdateSettings,
    applyTheme,
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}
