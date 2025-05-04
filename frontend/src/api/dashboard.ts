import type { ApiResponse } from '../types'

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

export const getStats = async (
  period: 'week' | 'month' | 'year' = 'week'
): Promise<ApiResponse> => {
  const response = await fetchWithAuth(`/dashboard/stats?period=${period}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch statistics')
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
