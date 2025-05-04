import type { ApiResponse } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

export const loginUser = async (
  email: string,
  password: string
): Promise<any> => {
  // Using any here to match the actual response format
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to login')
  }

  return response.json()
}

export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to register')
  }

  return response.json()
}

export const logoutUser = async (): Promise<ApiResponse> => {
  const token = localStorage.getItem('accessToken')
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to logout')
  }

  return response.json()
}

export const refreshToken = async (): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to refresh token')
  }

  return response.json()
}
