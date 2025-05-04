import type React from 'react'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserSettings, updateUserSettings } from '../api/settings'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Moon, Sun } from 'lucide-react'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user } = useAuth()
  const { theme, toggleTheme, isThemeLoading } = useTheme()
  const queryClient = useQueryClient()
  const [reminderTime, setReminderTime] = useState('')

  // Use React Query to fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getUserSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })

  const { mutate: updateSettings } = useMutation({
    mutationFn: updateUserSettings,
    onSuccess: () => {
      toast.success('Settings updated successfully!')
      // Invalidate and refetch settings after update
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: () => {
      toast.error('Failed to update settings')
    },
  })

  useEffect(() => {
    if (settings?.data?.reminderTime) {
      setReminderTime(settings.data.reminderTime)
    }
  }, [settings])

  // const handleReminderTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setReminderTime(e.target.value)
  // }

  // const handleSaveReminderTime = () => {
  //   updateSettings({ reminderTime })
  // }

  if (isLoading || isThemeLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">
          Loading settings...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Settings
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Account
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <div className="mt-1 text-gray-900 dark:text-white">
                {user?.name}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="mt-1 text-gray-900 dark:text-white">
                {user?.email}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-gray-400 mr-2" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-500 mr-2" />
              )}
              <span className="text-gray-900 dark:text-white">
                {theme === 'dark' ? 'Dark' : 'Light'} Mode
              </span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 dark:bg-gray-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label={`Switch to ${
                theme === 'dark' ? 'light' : 'dark'
              } mode`}
            >
              <span className="sr-only">Toggle theme</span>
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <Bell className="h-5 w-5 text-gray-400 mr-2" />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor="reminder-time"
                  className="font-medium text-gray-700 dark:text-gray-300"
                >
                  Daily Reminder
                </label>
                <p className="text-gray-500 dark:text-gray-400">
                  Set a time to receive a daily reminder to check in on your
                  habits.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="time"
                id="reminder-time"
                value={reminderTime}
                onChange={handleReminderTimeChange}
                className="input max-w-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSaveReminderTime}
                disabled={isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default Settings
