import type { ApiResponse, Habit } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Helper function to make authenticated requests
const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem('accessToken')

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })
}

export const getAllHabits = async (): Promise<ApiResponse> => {
  const response = await fetchWithAuth('/habit')

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch habits')
  }

  return response.json()
}

export const getTodayHabits = async (): Promise<ApiResponse> => {
  const response = await fetchWithAuth('/habit/daily/today')

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to fetch today's habits")
  }

  return response.json()
}

export const getHabit = async (id: string): Promise<ApiResponse> => {
  const response = await fetchWithAuth(`/habit/${id}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch habit')
  }

  return response.json()
}

export const createHabit = async (
  habitData: Partial<Habit>
): Promise<ApiResponse> => {
  const response = await fetchWithAuth('/habit', {
    method: 'POST',
    body: JSON.stringify(habitData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create habit')
  }

  return response.json()
}

export const updateHabit = async (
  id: string,
  habitData: Partial<Habit>
): Promise<ApiResponse> => {
  const response = await fetchWithAuth(`/habit/${id}`, {
    method: 'PUT',
    body: JSON.stringify(habitData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update habit')
  }

  return response.json()
}

export const deleteHabit = async (id: string): Promise<ApiResponse> => {
  const response = await fetchWithAuth(`/habit/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete habit')
  }

  return response.json()
}

export const logHabitCompletion = async (
  habitId: string,
  logData: { date: string; completed: boolean }
): Promise<ApiResponse> => {
  const response = await fetchWithAuth(`/habit/${habitId}/log`, {
    method: 'POST',
    body: JSON.stringify(logData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to log habit completion')
  }

  return response.json()
}

export const getHabitLogs = async (
  habitId: string,
  startDate?: string,
  endDate?: string
): Promise<ApiResponse> => {
  let url = `/habit/${habitId}/logs`

  if (startDate || endDate) {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    url += `?${params.toString()}`
  }

  const response = await fetchWithAuth(url)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch habit logs')
  }

  return response.json()
}

export const getHabitStreak = async (habitId: string): Promise<ApiResponse> => {
  const response = await fetchWithAuth(`/habit/${habitId}/streak`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch habit streak')
  }

  return response.json()
}

export const getHeatmapData = async (
  year?: number,
  month?: number,
  habitId?: string
): Promise<ApiResponse> => {
  let url = '/dashboard/heatmap'

  const params = new URLSearchParams()
  if (year) params.append('year', year.toString())
  if (month) params.append('month', month.toString())
  if (habitId) params.append('habitId', habitId)

  if (params.toString()) {
    url += `?${params.toString()}`
  }

  const response = await fetchWithAuth(url)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch heatmap data')
  }

  return response.json()
}
