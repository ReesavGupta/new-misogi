import type { ApiResponse, UserSettings } from '../types'

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

export const getUserSettings = async (): Promise<ApiResponse> => {
  const response = await fetchWithAuth('/settings')

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch user settings')
  }

  return response.json()
}

export const updateUserSettings = async (
  settingsData: Partial<UserSettings>
): Promise<ApiResponse> => {
  const response = await fetchWithAuth('/settings', {
    method: 'PUT',
    body: JSON.stringify(settingsData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update user settings')
  }

  return response.json()
}
