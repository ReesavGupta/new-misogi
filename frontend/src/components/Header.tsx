import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Menu, X, Sun, Moon, LogOut, Settings } from 'lucide-react'

const Header = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  // Debug theme changes
  useEffect(() => {
    console.log('Current theme in Header:', theme)
    console.log(
      'HTML class:',
      document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    )
  }, [theme])

  const handleThemeToggle = () => {
    console.log('Theme toggle clicked, current theme:', theme)
    toggleTheme()
    // Check if theme actually changed after toggle
    setTimeout(() => {
      console.log(
        'Theme after toggle:',
        document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      )
    }, 100)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              ) : (
                <Menu
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>

          <div className="flex items-center">
            <button
              type="button"
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleThemeToggle}
            >
              {theme === 'dark' ? (
                <Sun
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              ) : (
                <Moon
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              )}
            </button>

            <div className="ml-3 relative">
              <div>
                <button
                  type="button"
                  className="flex items-center max-w-xs rounded-full bg-gray-100 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  id="user-menu"
                  aria-expanded="false"
                  aria-haspopup="true"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-100">
                    {user?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                </button>
              </div>

              {isProfileMenuOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      navigate('/settings')
                    }}
                  >
                    <Settings
                      className="mr-3 h-4 w-4"
                      aria-hidden="true"
                    />
                    Settings
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <LogOut
                      className="mr-3 h-4 w-4"
                      aria-hidden="true"
                    />
                    Sign out
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
