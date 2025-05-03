import apiClient from './apiClient'
import { LoginData, RegisterData, ApiResponse, AuthResponse } from '../types'

export const login = async (
  data: LoginData
): Promise<ApiResponse<AuthResponse>> => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    '/auth/login',
    data
  )
  return response.data
}

export const register = async (
  data: RegisterData
): Promise<ApiResponse<AuthResponse>> => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    '/auth/register',
    data
  )
  return response.data
}

export const logout = async (): Promise<ApiResponse<string>> => {
  const refreshToken = localStorage.getItem('refreshToken')
  const response = await apiClient.post<ApiResponse<string>>('/auth/logout', {
    refreshToken,
  })

  // Clear local storage
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')

  return response.data
}
