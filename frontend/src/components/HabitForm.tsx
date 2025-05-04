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
      className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg max-w-lg mx-auto"
    >
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
        >
          Habit Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g., Drink 2L water"
          required
        />
      </div>

      <div>
        <p className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
          Target Days
        </p>
        <div className="mt-2 space-y-2">
          {['everyday', 'weekdays', 'custom'].map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="radio"
                name="targetDays"
                value={option}
                checked={targetDays === option}
                onChange={() => setTargetDays(option)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-700 dark:text-gray-300 capitalize">
                {option === 'everyday'
                  ? 'Every day'
                  : option === 'weekdays'
                  ? 'Weekdays (Mon–Fri)'
                  : 'Custom days'}
              </span>
            </label>
          ))}

          {targetDays === 'custom' && (
            <div className="ml-6 mt-3">
              <div className="flex flex-wrap gap-2">
                {dayNames.map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleCustomDay(index)}
                    className={`w-10 h-10 rounded-full text-xs font-semibold flex items-center justify-center transition ${
                      customDays.includes(index)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              {customDays.length === 0 && (
                <p className="text-xs text-red-500 mt-2">
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
          className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
        >
          Start Date
        </label>
        <div className="relative mt-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
