import apiClient from './apiClient'
import { StatsData, HeatmapDataPoint, ApiResponse } from '../types'

export const getStats = async (
  period: 'week' | 'month' | 'year' = 'week'
): Promise<ApiResponse<StatsData>> => {
  const response = await apiClient.get<ApiResponse<StatsData>>(
    `/stats?period=${period}`
  )
  return response.data
}

export const getHeatmapData = async (
  habitId?: string,
  year?: number,
  month?: number
): Promise<ApiResponse<HeatmapDataPoint[]>> => {
  let url = '/stats/heatmap'

  // Add query parameters if provided
  const params = new URLSearchParams()
  if (habitId) params.append('habitId', habitId)
  if (year) params.append('year', year.toString())
  if (month) params.append('month', month.toString())

  if (params.toString()) {
    url += `?${params.toString()}`
  }

  const response = await apiClient.get<ApiResponse<HeatmapDataPoint[]>>(url)
  return response.data
}
