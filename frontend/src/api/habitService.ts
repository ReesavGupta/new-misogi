import apiClient from './apiClient'
import {
  Habit,
  HabitFormData,
  HabitLog,
  HabitLogData,
  HabitStreakInfo,
  ApiResponse,
} from '../types'

export const createHabit = async (
  data: HabitFormData
): Promise<ApiResponse<Habit>> => {
  // Convert customDays array to JSON string if present
  const formattedData = {
    ...data,
    customDays: data.customDays ? JSON.stringify(data.customDays) : undefined,
  }

  const response = await apiClient.post<ApiResponse<Habit>>(
    '/habits',
    formattedData
  )
  return response.data
}

export const getHabits = async (): Promise<ApiResponse<Habit[]>> => {
  const response = await apiClient.get<ApiResponse<Habit[]>>('/habits')
  return response.data
}

export const getHabitById = async (id: string): Promise<ApiResponse<Habit>> => {
  const response = await apiClient.get<ApiResponse<Habit>>(`/habits/${id}`)
  return response.data
}

export const updateHabit = async (
  id: string,
  data: Partial<HabitFormData>
): Promise<ApiResponse<Habit>> => {
  // Convert customDays array to JSON string if present
  const formattedData = {
    ...data,
    customDays: data.customDays ? JSON.stringify(data.customDays) : undefined,
  }

  const response = await apiClient.put<ApiResponse<Habit>>(
    `/habits/${id}`,
    formattedData
  )
  return response.data
}

export const deleteHabit = async (
  id: string
): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/habits/${id}`
  )
  return response.data
}

export const logHabitCompletion = async (
  habitId: string,
  data: HabitLogData
): Promise<ApiResponse<HabitLog>> => {
  const response = await apiClient.post<ApiResponse<HabitLog>>(
    `/habits/${habitId}/log`,
    data
  )
  return response.data
}

export const getHabitLogs = async (
  habitId: string,
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<HabitLog[]>> => {
  let url = `/habits/${habitId}/logs`

  // Add query parameters if provided
  if (startDate || endDate) {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    url += `?${params.toString()}`
  }

  const response = await apiClient.get<ApiResponse<HabitLog[]>>(url)
  return response.data
}

export const getHabitStreak = async (
  habitId: string
): Promise<ApiResponse<HabitStreakInfo>> => {
  const response = await apiClient.get<ApiResponse<HabitStreakInfo>>(
    `/habits/${habitId}/streak`
  )
  return response.data
}

export const getTodayHabits = async (): Promise<ApiResponse<Habit[]>> => {
  const response = await apiClient.get<ApiResponse<Habit[]>>('/habits/today')
  return response.data
}
