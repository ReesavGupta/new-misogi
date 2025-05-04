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

  // Fixed date mapping logic to handle date conversions correctly
  const dateMap = useMemo(() => {
    const map = new Map<string, number>()
    data.forEach((item) => {
      const date = new Date(item.date)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}` // LOCAL date string
      map.set(dateStr, item.value)
    })
    return map
  }, [data])
  // const dateMap = useMemo(() => {
  //   const map = new Map<string, number>()
  //   data.forEach((item) => {
  //     // Create a date that's timezone-safe
  //     const dateStr = new Date(item.date).toISOString().split('T')[0]
  //     map.set(dateStr, item.value)
  //   })
  //   return map
  // }, [data])
  console.log('this is data:', data)

  const getColorClass = (value: number | undefined) => {
    if (value === undefined) return 'bg-gray-100 dark:bg-gray-800'
    if (value === 1) return 'bg-green-500 dark:bg-green-600'
    return 'bg-red-300 dark:bg-red-800'
  }

  const renderCalendarDays = () => {
    const days = []
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-10 w-10"
        />
      )
    }

    for (let day = 1; day <= daysInMonth; day++) {
      // Create date string in YYYY-MM-DD format without timezone conversion

      const padMonth = (month + 1).toString().padStart(2, '0')
      const padDay = day.toString().padStart(2, '0')
      const key = `${year}-${padMonth}-${padDay}`

      const value = dateMap.get(key)

      const today = new Date()
      const isToday =
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === day

      // console.log(this is )

      console.log('datemap: ', dateMap)
      console.log('value: ', value)
      console.log('key: ', key)
      console.log('today: ', today)

      days.push(
        <div
          key={day}
          className={`h-10 w-10 flex items-center justify-center rounded-full ${
            isToday ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''
          } ${getColorClass(value)}`}
        >
          <p>{day}</p>
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
