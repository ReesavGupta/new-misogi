import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logHabitCompletion } from '../api/habits'
import type { Habit } from '../types'
import { CheckCircle, XCircle, ChevronRight, Award } from 'lucide-react'
import toast from 'react-hot-toast'
import { queryKeys } from '../api/query-keys/queryKeys'

interface HabitCardProps {
  habit: Habit
  isToday: boolean
}

export const HabitCard = ({ habit, isToday }: HabitCardProps) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Debug: Log the initial habit state
  console.log(
    `HabitCard ${habit.id} rendering with todayCompleted:`,
    habit.todayCompleted
  )

  // Use a ref to store the current completion state to avoid issues with stale closures
  const completionStateRef = useRef<boolean>(Boolean(habit.todayCompleted))

  // Track completed state for UI rendering
  const [isCompleted, setIsCompleted] = useState<boolean>(
    Boolean(habit.todayCompleted)
  )

  // Always sync with the incoming props - this is critical
  useEffect(() => {
    console.log(
      `HabitCard ${habit.id} props updated, todayCompleted:`,
      habit.todayCompleted
    )

    // Important: Always treat null as false, but maintain existing state if it's truly undefined
    if (habit.todayCompleted === null || habit.todayCompleted === undefined) {
      // Only log the preservation of state
      console.log(
        `Preserving existing state: ${isCompleted} for habit ${habit.id}`
      )
    } else {
      // Only update if we have a definitive value
      const newState = Boolean(habit.todayCompleted)
      setIsCompleted(newState)
      completionStateRef.current = newState
      console.log(`Updated state to: ${newState} for habit ${habit.id}`)
    }
  }, [habit.todayCompleted, habit.id, isCompleted])

  const { mutate: logCompletion, isPending } = useMutation({
    mutationFn: ({
      habitId,
      completed,
    }: {
      habitId: string
      completed: boolean
    }) => {
      const today = new Date()
      // today.setHours(0, 0, 0, 0)
      return logHabitCompletion(habitId, {
        date: today.toISOString().split('T')[0],
        completed,
      })
    },
    onMutate: async (variables) => {
      console.log(
        `onMutate called for habit ${variables.habitId}, setting to ${variables.completed}`
      )

      // Cancel any outgoing refetches for ALL related queries
      await queryClient.cancelQueries({ queryKey: queryKeys.habits.today() })
      await queryClient.cancelQueries({ queryKey: queryKeys.habits.all })
      await queryClient.cancelQueries({
        queryKey: queryKeys.habits.detail(variables.habitId),
      })

      // Snapshot previous values for potential rollback
      const previousTodayHabits = queryClient.getQueryData(
        queryKeys.habits.today()
      )
      const previousAllHabits = queryClient.getQueryData(queryKeys.habits.all)
      const previousHabitDetail = queryClient.getQueryData(
        queryKeys.habits.detail(variables.habitId)
      )

      // Optimistically update ALL relevant caches to ensure consistency

      // 1. Update today's habits
      queryClient.setQueryData(queryKeys.habits.today(), (oldData: any) => {
        if (!oldData || !oldData.data) return oldData

        console.log('Updating today habits cache:', oldData)

        return {
          ...oldData,
          data: oldData.data.map((h: Habit) =>
            h.id === variables.habitId
              ? { ...h, todayCompleted: variables.completed }
              : h
          ),
        }
      })

      // 2. Update all habits list if it exists
      queryClient.setQueryData(queryKeys.habits.all, (oldData: any) => {
        if (!oldData || !oldData.data) return oldData

        console.log('Updating all habits cache')

        return {
          ...oldData,
          data: oldData.data.map((h: Habit) =>
            h.id === variables.habitId
              ? { ...h, todayCompleted: variables.completed }
              : h
          ),
        }
      })

      // 3. Update the specific habit detail if it exists
      queryClient.setQueryData(
        queryKeys.habits.detail(variables.habitId),
        (oldData: any) => {
          if (!oldData) return oldData

          console.log('Updating habit detail cache')

          // Handle both nested and direct data structures
          if (oldData.data) {
            return {
              ...oldData,
              data: { ...oldData.data, todayCompleted: variables.completed },
            }
          }

          return { ...oldData, todayCompleted: variables.completed }
        }
      )

      // Return context for potential rollback
      return {
        previousTodayHabits,
        previousAllHabits,
        previousHabitDetail,
      }
    },
    onError: (_, variables, context) => {
      console.log(`onError called for habit ${variables.habitId}`)

      // Roll back to the snapshot on error for ALL caches
      if (context?.previousTodayHabits) {
        queryClient.setQueryData(
          queryKeys.habits.today(),
          context.previousTodayHabits
        )
      }

      if (context?.previousAllHabits) {
        queryClient.setQueryData(
          queryKeys.habits.all,
          context.previousAllHabits
        )
      }

      if (context?.previousHabitDetail) {
        queryClient.setQueryData(
          queryKeys.habits.detail(variables.habitId),
          context.previousHabitDetail
        )
      }

      // Reset local state and ref to match the correct state
      const cachedHabit = queryClient.getQueryData<any>(
        queryKeys.habits.detail(variables.habitId)
      )
      let correctState = Boolean(habit.todayCompleted)

      if (cachedHabit) {
        // Handle both nested and direct data structures
        if (cachedHabit.data) {
          correctState = Boolean(cachedHabit.data.todayCompleted)
        } else {
          correctState = Boolean(cachedHabit.todayCompleted)
        }
      }

      console.log(`Resetting local state to ${correctState}`)
      setIsCompleted(correctState)
      completionStateRef.current = correctState

      toast.error('Failed to update habit status')
    },
    onSettled: (_, error, variables) => {
      // Fix: Pass the variables properly to onSettled
      console.log(`onSettled called for habit ${variables?.habitId}`)

      // Always refetch ALL related queries after either error or success
      // This ensures data consistency across the app

      // Set a small delay to allow the backend to fully process the change
      setTimeout(() => {
        // Habit-specific queries
        queryClient.invalidateQueries({ queryKey: queryKeys.habits.today() })
        queryClient.invalidateQueries({ queryKey: queryKeys.habits.all })
        queryClient.invalidateQueries({
          queryKey: queryKeys.habits.detail(variables?.habitId),
        })
        queryClient.invalidateQueries({
          queryKey: queryKeys.habits.logs(variables?.habitId),
        })
        queryClient.invalidateQueries({
          queryKey: queryKeys.habits.streak(variables?.habitId),
        })

        // Global stats and visualizations
        queryClient.invalidateQueries({
          queryKey: [queryKeys.habits.all, 'heatmap'],
        })
        queryClient.invalidateQueries({ queryKey: queryKeys.stats.all })
        queryClient.invalidateQueries({
          queryKey: queryKeys.stats.byPeriod('week'),
        })
        queryClient.invalidateQueries({
          queryKey: queryKeys.stats.byPeriod('month'),
        })
        queryClient.invalidateQueries({
          queryKey: queryKeys.stats.byPeriod('year'),
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.stats.all, 'heatmap'],
        })

        console.log('All queries invalidated, fresh data will be fetched')
      }, 100) // Small delay to ensure backend processing
    },
    onSuccess: (_, variables) => {
      console.log(
        `onSuccess called for habit ${variables.habitId}, completed: ${variables.completed}`
      )

      // After successful update, ensure our local state is consistent
      setIsCompleted(variables.completed)
      completionStateRef.current = variables.completed

      toast.success(
        variables.completed
          ? 'Habit marked as complete!'
          : 'Habit marked as incomplete'
      )
    },
  })

  const handleToggleCompletion = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isToday || isPending) return

    // Use ref for current state to avoid stale closure issues
    const currentState = completionStateRef.current
    const newCompletedState = !currentState

    console.log(
      `Toggling habit ${habit.id} from ${currentState} to ${newCompletedState}`
    )

    // Update local state immediately for responsive UI
    setIsCompleted(newCompletedState)
    completionStateRef.current = newCompletedState

    // Then make the API call
    logCompletion({ habitId: habit.id, completed: newCompletedState })
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 10)
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    if (streak >= 5)
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-2 border-transparent transition-all hover:shadow-lg habit-card cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600"
      onClick={() => navigate(`/habits/${habit.id}`)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {habit.name}
          </h3>
          <div className="flex items-center mt-1 space-x-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStreakColor(
                habit.currentStreak
              )}`}
            >
              <Award className="w-3 h-3 mr-1" />
              {habit.currentStreak} day{habit.currentStreak !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Best: {habit.longestStreak} day
              {habit.longestStreak !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isToday && (
            <button
              onClick={handleToggleCompletion}
              disabled={isPending}
              className={`p-1 rounded-full transition-colors ${
                isPending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-label={
                isCompleted ? 'Mark as incomplete' : 'Mark as complete'
              }
              data-testid={`toggle-habit-${habit.id}`}
            >
              {isCompleted ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
              )}
            </button>
          )}
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  )
}
