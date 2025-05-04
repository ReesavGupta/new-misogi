import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTodayHabits, createHabit } from '../api/habits'
import { HabitCard } from '../components/HabitCard'
import HabitForm from '../components/HabitForm'
import { Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Habit } from '../types'
import { queryKeys } from '../api/query-keys/queryKeys'

export const Dashboard = () => {
  const [showAddForm, setShowAddForm] = useState(false)
  const queryClient = useQueryClient()

  const {
    data: habits,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.habits.today(),
    queryFn: getTodayHabits,
  })
  const { mutate: addHabit, isPending } = useMutation({
    mutationFn: createHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all })
      setShowAddForm(false)
      toast.success('Habit created successfully!')
    },
    onError: () => {
      toast.error('Failed to create habit')
    },
  })

  // console.log('this is habits inside dashboard: ', habits)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-gray-500 dark:text-gray-400">
          Loading habits...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <p className="text-red-800 dark:text-red-200">
          Error loading habits. Please try again.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Today's Habits
        </h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary flex items-center px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition"
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Habit
            </>
          )}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Create New Habit
          </h2>
          <HabitForm
            onSubmit={addHabit}
            isSubmitting={isPending}
          />
        </div>
      )}

      <div className="space-y-4">
        {habits && habits.data.length > 0 ? (
          habits.data.map((habit: Habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              isToday
            />
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You don't have any habits for today.
            </p>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add your first habit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
