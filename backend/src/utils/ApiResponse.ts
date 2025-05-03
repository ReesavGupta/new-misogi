export class ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  statusCode?: number
  message?: string

  constructor(
    success: boolean = true,
    statusCode: number,
    data?: T,
    error?: string,
    message?: string
  ) {
    this.success = success
    this.statusCode = statusCode
    this.data = data
    this.error = error
    this.message = message
  }

  static success<T>(data: T): ApiResponse<T> {
    return new ApiResponse<T>(true, 200, data, undefined, 'Success')
  }

  static error(error: string): ApiResponse<null> {
    return new ApiResponse<null>(
      false,
      500,
      undefined,
      error,
      'Internal Server Error'
    )
  }
}
