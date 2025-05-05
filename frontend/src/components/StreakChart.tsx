import { useMemo } from 'react'
import type { TimeSeriesData } from '../types'

interface StreakChartProps {
  data: TimeSeriesData[]
  period: 'week' | 'month' | 'year'
}

const StreakChart = ({ data, period }: StreakChartProps) => {
  const chartData = useMemo(() => {
    if (period !== 'year') {
      // For week and month views, process data normally
      return data.map((item) => ({
        date: new Date(item.date),
        completed: item.completed,
        missed: item.missed,
        total: item.total,
        completionRate:
          item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0,
      }))
    } else {
      // For year view, group data by month
      const monthlyData = new Map()

      data.forEach((item) => {
        const date = new Date(item.date)
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`

        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, {
            date: new Date(date.getFullYear(), date.getMonth(), 1), // First day of month
            completed: 0,
            missed: 0,
            total: 0,
          })
        }

        const monthData = monthlyData.get(monthKey)
        monthData.completed += item.completed
        monthData.missed += item.missed
        monthData.total += item.total
      })

      // Convert map to array and sort by date
      return Array.from(monthlyData.values())
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map((item) => ({
          ...item,
          completionRate:
            item.total > 0
              ? Math.round((item.completed / item.total) * 100)
              : 0,
        }))
    }
  }, [data, period])

  const formatDate = (date: Date) => {
    if (period === 'week') {
      return date.toLocaleDateString('en-US', { weekday: 'short' }) // e.g., "Mon"
    } else if (period === 'month') {
      return date.getDate().toString() // e.g., "1", "2", ..., "31"
    } else {
      return date.toLocaleDateString('en-US', { month: 'short' }) // e.g., "Jan", "Feb"
    }
  }

  const maxValue = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.total))
    return max > 0 ? max : 5 // Default to 5 if no data
  }, [chartData])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Habit Completion
      </h3>

      <div className="h-64">
        <div className="flex h-full">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between pr-2 text-xs text-gray-500 dark:text-gray-400">
            {Array.from({ length: 6 }, (_, i) => {
              const value = Math.round((maxValue / 5) * (5 - i))
              return <div key={i}>{value}</div>
            })}
          </div>

          {/* Chart */}
          <div className="flex-1">
            <div className="flex h-full">
              {chartData.map((item, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col"
                >
                  <div className="flex-1 flex flex-col-reverse">
                    <div
                      className="bg-green-500 dark:bg-green-600 w-full"
                      style={{
                        height: `${(item.completed / maxValue) * 100}%`,
                        transition: 'height 0.3s ease-in-out',
                      }}
                    ></div>
                    <div
                      className="bg-red-300 dark:bg-red-800 w-full"
                      style={{
                        height: `${(item.missed / maxValue) * 100}%`,
                        transition: 'height 0.3s ease-in-out',
                      }}
                    ></div>
                  </div>
                  <div className="text-center text-xs mt-2 text-gray-500 dark:text-gray-400">
                    {formatDate(item.date)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
      </div>
    </div>
  )
}

export default StreakChart
