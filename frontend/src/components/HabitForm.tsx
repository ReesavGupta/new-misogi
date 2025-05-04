
import type React from 'react'

import { useState, useEffect } from 'react'
import type { Habit } from '../types'
import { Calendar } from 'lucide-react'

interface HabitFormProps {
  initialData?: Partial<Habit>
  onSubmit: (data: Partial<Habit>) => void
  isSubmitting: boolean
}

const HabitForm = ({ initialData, onSubmit, isSubmitting }: HabitFormProps) => {
  const [name, setName] = useState(initialData?.name || '')
  const [targetDays, setTargetDays] = useState(
    initialData?.targetDays || 'everyday'
  )
  const [customDays, setCustomDays] = useState<number[]>([])
  const [startDate, setStartDate] = useState(
    initialData?.startDate
      ? new Date(initialData.startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    if (initialData?.customDays) {
      try {
        setCustomDays(JSON.parse(initialData.customDays))
      } catch (e) {
        console.error('Failed to parse customDays:', e)
        setCustomDays([])
      }
    }
  }, [initialData?.customDays])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formData: Partial<Habit> = {
      name,
      targetDays,
      startDate: new Date(startDate).toISOString(),
    }

    if (targetDays === 'custom') {
      formData.customDays = JSON.stringify(customDays)
    }

    onSubmit(formData)
  }

  const toggleCustomDay = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    )
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Habit Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input mt-1"
          placeholder="e.g., Drink 2L water"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Target Days
        </label>
        <div className="mt-1 space-y-2">
          <div className="flex items-center">
            <input
              type="radio"
              id="everyday"
              name="targetDays"
              value="everyday"
              checked={targetDays === 'everyday'}
              onChange={() => setTargetDays('everyday')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <label
              htmlFor="everyday"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Every day
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="radio"
              id="weekdays"
              name="targetDays"
              value="weekdays"
              checked={targetDays === 'weekdays'}
              onChange={() => setTargetDays('weekdays')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <label
              htmlFor="weekdays"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Weekdays (Mon-Fri)
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="radio"
              id="custom"
              name="targetDays"
              value="custom"
              checked={targetDays === 'custom'}
              onChange={() => setTargetDays('custom')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <label
              htmlFor="custom"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Custom days
            </label>
          </div>

          {targetDays === 'custom' && (
            <div className="ml-6 mt-2">
              <div className="flex space-x-1">
                {dayNames.map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleCustomDay(index)}
                    className={`w-10 h-10 rounded-full text-xs font-medium flex items-center justify-center ${
                      customDays.includes(index)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              {customDays.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Please select at least one day
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="startDate"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Start Date
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input pl-10"
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={
            isSubmitting || (targetDays === 'custom' && customDays.length === 0)
          }
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? 'Saving...'
            : initialData?.id
            ? 'Update Habit'
            : 'Create Habit'}
        </button>
      </div>
    </form>
  )
}

export default HabitForm
