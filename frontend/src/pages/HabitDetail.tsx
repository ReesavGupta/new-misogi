
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getHabit,
  updateHabit,
  deleteHabit,
  getHeatmapData,
} from '../api/habits'
import HabitForm from '../components/HabitForm'
import HeatmapCalendar from '../components/HeatmapCalendar'
import { Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const HabitDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())

  const { data: habit, isLoading: isLoadingHabit } = useQuery({
    queryKey: ['habits', id],
    queryFn: () => getHabit(id!),
    enabled: !!id,
  })

  const { data: heatmapData, isLoading: isLoadingHeatmap } = useQuery({
    queryKey: [
      'heatmap',
      id,
      currentDate.getFullYear(),
      currentDate.getMonth(),
    ],
    queryFn: () =>
      getHeatmapData(currentDate.getFullYear(), currentDate.getMonth() + 1, id),
    enabled: !!id,
  })

  const { mutate: updateHabitMutation, isPending: isUpdating } = useMutation({
    mutationFn: (data: any) => updateHabit(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      queryClient.invalidateQueries({ queryKey: ['habits', id] })
      setIsEditing(false)
      toast.success('Habit updated successfully!')
    },
    onError: () => {
      toast.error('Failed to update habit')
    },
  })

  const { mutate: deleteHabitMutation, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteHabit(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      navigate('/')
      toast.success('Habit deleted successfully!')
    },
    onError: () => {
      toast.error('Failed to delete habit')
    },
  })

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
  }

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
  }

  const handleDelete = () => {
    if (
      window.confirm(
        'Are you sure you want to delete this habit? This action cannot be undone.'
      )
    ) {
      deleteHabitMutation()
    }
  }

  if (isLoadingHabit) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">
          Loading habit details...
        </div>
      </div>
    )
  }

  if (!habit) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <p className="text-red-800 dark:text-red-200">
          Habit not found. Please go back to the dashboard.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </button>

      {isEditing ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Edit Habit
          </h2>
          <HabitForm
            initialData={habit.data}
            onSubmit={updateHabitMutation}
            isSubmitting={isUpdating}
          />
          <button
            onClick={() => setIsEditing(false)}
            className="mt-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {habit.data.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Started on {new Date(habit.data.startDate).toLocaleDateString()}
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  Current streak: {habit.data.currentStreak} day
                  {habit.data.currentStreak !== 1 ? 's' : ''}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Longest streak: {habit.data.longestStreak} day
                  {habit.data.longestStreak !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                <strong>Schedule:</strong>{' '}
                {habit.data.targetDays === 'everyday' && 'Every day'}
                {habit.data.targetDays === 'weekdays' && 'Weekdays (Mon-Fri)'}
                {habit.data.targetDays === 'custom' && 'Custom days'}
              </p>
              {habit.data.targetDays === 'custom' && habit.data.customDays && (
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  <strong>Days:</strong>{' '}
                  {JSON.parse(habit.data.customDays)
                    .map(
                      (day: number) =>
                        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]
                    )
                    .join(', ')}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-secondary flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn btn-danger flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Habit History
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousMonth}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-gray-600 dark:text-gray-300">
              {currentDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear()
              }
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isLoadingHeatmap ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500 dark:text-gray-400">
              Loading habit history...
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

export default HabitDetail
