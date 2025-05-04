import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getStats, getHeatmapData } from '../api/dashboard'
import { deleteHabit } from '../api/habits'
import StreakChart from '../components/StreakChart'
import HeatmapCalendar from '../components/HeatmapCalendar'
import { BarChart2, Calendar, Award, Trash2 } from 'lucide-react'
import { queryKeys } from '../api/query-keys/queryKeys'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

type Period = 'week' | 'month' | 'year'

export const Stats = () => {
  const [period, setPeriod] = useState<Period>('week')
  const [currentDate] = useState(new Date())

  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { mutate: deleteHabitMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteHabit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all })
      toast.success('Habit deleted successfully!')
    },
    onError: () => {
      toast.error('Failed to delete habit')
    },
  })

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: queryKeys.stats.byPeriod(period),
    queryFn: () => getStats(period),
  })

  const { data: heatmapData, isLoading: isLoadingHeatmap } = useQuery({
    queryKey: queryKeys.stats.heatmap(
      currentDate.getFullYear(),
      currentDate.getMonth()
    ),
    queryFn: () =>
      getHeatmapData(currentDate.getFullYear(), currentDate.getMonth() + 1),
  })
  console.log('\n\n\n\nthis is heatMapData:', heatmapData, '\n\n\n\n')
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Statistics
      </h1>

      {isLoadingStats ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">
            Loading statistics...
          </div>
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Completion Rate
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.data.summary.completionRate}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-200">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Completions
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.data.summary.totalCompletions}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-200">
                  <Award className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Active Habits
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.data.summary.totalHabits}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Habit Performance
              </h2>
              <div className="flex space-x-2">
                {(['week', 'month', 'year'] as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      period === p
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <StreakChart
              data={stats.data.timeSeriesData}
              period={period}
            />
          </div>

          {stats.data.topHabits.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Top Habits by Streak
              </h2>
              <div className="space-y-4">
                {stats.data.topHabits.map((habit: any) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-200">
                        <Award className="h-4 w-4" />
                      </div>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {habit.name}
                      </span>
                    </div>
                    <div className="inline-flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {habit.longestStreak} day streak
                      </span>
                      <button
                        onClick={() => deleteHabitMutation(habit.id)}
                        disabled={isDeleting}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:underline disabled:opacity-50"
                        title="Delete Habit"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No statistics available yet. Start tracking your habits to see your
            progress!
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Monthly Overview
        </h2>

        {isLoadingHeatmap ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500 dark:text-gray-400">
              Loading calendar data...
            </div>
          </div>
        ) : (
          <HeatmapCalendar
            data={heatmapData?.data || []}
            year={currentDate.getFullYear()}
            month={currentDate.getMonth()}
          />
        )}
      </div>
    </div>
  )
}
