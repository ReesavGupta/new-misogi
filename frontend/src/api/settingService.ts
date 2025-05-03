import apiClient from './apiClient'
import { UserSettings, ApiResponse } from '../types'

export const getUserSettings = async (): Promise<ApiResponse<UserSettings>> => {
  const response = await apiClient.get<ApiResponse<UserSettings>>(
    '/user/settings'
  )
  return response.data
}

export const updateUserSettings = async (
  settings: Partial<UserSettings>
): Promise<ApiResponse<UserSettings>> => {
  const response = await apiClient.put<ApiResponse<UserSettings>>(
    '/user/settings',
    settings
  )
  return response.data
}
