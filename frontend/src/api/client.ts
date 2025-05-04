// api/authClient.ts
// Utility to add auth headers to API requests

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

/**
 * Creates an authenticated fetch request
 * @param endpoint API endpoint
 * @param options Fetch options
 * @returns Promise with the response
 */
export const authFetch = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem('accessToken')

  // Set up headers with authorization token
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  return response
}

/**
 * Handles API requests with authentication
 */
export const authClient = {
  /**
   * Send a GET request
   */
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await authFetch(endpoint, {
      method: 'GET',
      ...options,
    })

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'An error occurred' }))
      throw new Error(
        error.message || `Request failed with status ${response.status}`
      )
    }

    return response.json()
  },

  /**
   * Send a POST request
   */
  async post<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await authFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    })

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'An error occurred' }))
      throw new Error(
        error.message || `Request failed with status ${response.status}`
      )
    }

    return response.json()
  },

  /**
   * Send a PUT request
   */
  async put<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await authFetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    })

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'An error occurred' }))
      throw new Error(
        error.message || `Request failed with status ${response.status}`
      )
    }

    return response.json()
  },

  /**
   * Send a DELETE request
   */
  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await authFetch(endpoint, {
      method: 'DELETE',
      ...options,
    })

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'An error occurred' }))
      throw new Error(
        error.message || `Request failed with status ${response.status}`
      )
    }

    return response.json()
  },
}
