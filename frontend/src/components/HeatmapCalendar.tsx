
import { useMemo } from 'react'
import type { HeatmapData } from '../types'

interface HeatmapCalendarProps {
  data: HeatmapData[]
  year: number
  month: number
}

const HeatmapCalendar = ({ data, year, month }: HeatmapCalendarProps) => {
  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate()
  }, [year, month])

  const firstDayOfMonth = useMemo(() => {
    return new Date(year, month, 1).getDay()
  }, [year, month])

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  // Create a map of date strings to completion status
  const dateMap = useMemo(() => {
    const map = new Map<string, number>()
    data.forEach((item) => {
      const date = new Date(item.date)
      if (date.getFullYear() === year && date.getMonth() === month) {
        const day = date.getDate()
        map.set(day.toString(), item.value)
      }
    })
    return map
  }, [data, year, month])

  const getColorClass = (value: number | undefined) => {
    if (value === undefined) return 'bg-gray-100 dark:bg-gray-800'
    if (value === 1) return 'bg-green-500 dark:bg-green-600'
    return 'bg-red-300 dark:bg-red-800'
  }

  const renderCalendarDays = () => {
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-10 w-10"
        ></div>
      )
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const value = dateMap.get(day.toString())
      const isToday =
        new Date().getFullYear() === year &&
        new Date().getMonth() === month &&
        new Date().getDate() === day

      days.push(
        <div
          key={day}
          className={`h-10 w-10 flex items-center justify-center rounded-full ${
            isToday ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''
          } ${getColorClass(value)}`}
        >
          {day}
        </div>
      )
    }

    return days
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {monthNames[month]} {year}
        </h3>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-sm">
        {renderCalendarDays()}
      </div>

      <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 dark:bg-green-600 rounded mr-1"></div>
          <span className="text-gray-700 dark:text-gray-300">Completed</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-300 dark:bg-red-800 rounded mr-1"></div>
          <span className="text-gray-700 dark:text-gray-300">Missed</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 rounded mr-1"></div>
          <span className="text-gray-700 dark:text-gray-300">No data</span>
        </div>
      </div>
    </div>
  )
}

export default HeatmapCalendar
