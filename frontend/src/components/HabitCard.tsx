
import type React from 'react'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logHabitCompletion } from '../api/habits'
import type { Habit } from '../types'
import { CheckCircle, XCircle, ChevronRight, Award } from 'lucide-react'
import toast from 'react-hot-toast'

interface HabitCardProps {
  habit: Habit
  isToday: boolean
}

const HabitCard = ({ habit, isToday }: HabitCardProps) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isCompleted, setIsCompleted] = useState(habit.todayCompleted || false)

  const { mutate: logCompletion, isPending } = useMutation({
    mutationFn: ({
      habitId,
      completed,
    }: {
      habitId: string
      completed: boolean
    }) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return logHabitCompletion(habitId, {
        date: today.toISOString().split('T')[0],
        completed,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      queryClient.invalidateQueries({ queryKey: ['habits', 'today'] })
      queryClient.invalidateQueries({ queryKey: ['habits', habit.id] })
    },
    onError: () => {
      setIsCompleted(!isCompleted) // Revert UI state on error
      toast.error('Failed to update habit status')
    },
  })

  const handleToggleCompletion = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isToday || isPending) return

    const newCompletedState = !isCompleted
    setIsCompleted(newCompletedState)
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
      className="habit-card cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600"
      onClick={() => navigate(`/habit/${habit.id}`)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {habit.name}
          </h3>
          <div className="flex items-center mt-1 space-x-2">
            <span
              className={`streak-badge ${getStreakColor(habit.currentStreak)}`}
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
            >
              {isCompleted ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <XCircle className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              )}
            </button>
          )}
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  )
}

export default HabitCard
