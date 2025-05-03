# HabitVault - Daily Habit Tracker

HabitVault is a minimalist habit tracking application focused on consistency and visual progress tracking.

## Getting Started

### Prerequisites

- Node.js v14+
- PostgreSQL database
- bun or npm

### Installation

1. Clone the repository
2. Install dependencies
   ```bash
   bun install
   ```
3. Set up environment variables (create a `.env` file)
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/habitvault"
   ACCESS_TOKEN_SECRET="your_access_token_secret"
   REFRESH_TOKEN_SECRET="your_refresh_token_secret"
   ```
4. Run Prisma migrations
   ```bash
   bunx prisma migrate dev
   ```
5. Start the server
   ```bash
   bun run dev
   ```

## API Documentation

### Authentication

#### Register a new user

```
POST /api/auth/signup
```

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

Response:

```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### Login

```
POST /api/auth/login
```

Request body:

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

Response:

```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### Logout

```
POST /api/auth/logout
```

Response:

```json
{
  "status": "success",
  "data": {
    "message": "Logged out successfully"
  }
}
```

#### Refresh Token

```
POST /api/auth/refresh-token
```

Response:

```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Habits

#### Create a new habit

```
POST /api/habits
```

Request body:

```json
{
  "name": "Drink 2L water",
  "targetDays": "everyday",
  "startDate": "2025-05-01"
}
```

For custom days (e.g., Monday, Wednesday, Friday):

```json
{
  "name": "Go to gym",
  "targetDays": "custom",
  "customDays": "[1,3,5]",
  "startDate": "2025-05-01"
}
```

Response:

```json
{
  "status": "success",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
    "name": "Drink 2L water",
    "targetDays": "everyday",
    "customDays": null,
    "startDate": "2025-05-01T00:00:00.000Z",
    "createdAt": "2025-05-03T12:34:56.789Z",
    "updatedAt": "2025-05-03T12:34:56.789Z",
    "userId": "user123"
  }
}
```

#### Get all habits

```
GET /api/habits
```

Response:

```json
{
  "status": "success",
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
      "name": "Drink 2L water",
      "targetDays": "everyday",
      "customDays": null,
      "startDate": "2025-05-01T00:00:00.000Z",
      "createdAt": "2025-05-03T12:34:56.789Z",
      "updatedAt": "2025-05-03T12:34:56.789Z",
      "userId": "user123",
      "habitLogs": [...],
      "currentStreak": 3,
      "longestStreak": 5
    },
    ...
  ]
}
```

#### Get a specific habit

```
GET /api/habits/:id
```

Response:

```json
{
  "status": "success",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
    "name": "Drink 2L water",
    "targetDays": "everyday",
    "customDays": null,
    "startDate": "2025-05-01T00:00:00.000Z",
    "createdAt": "2025-05-03T12:34:56.789Z",
    "updatedAt": "2025-05-03T12:34:56.789Z",
    "userId": "user123",
    "habitLogs": [...],
    "currentStreak": 3,
    "longestStreak": 5
  }
}
```

#### Update a habit

```
PUT /api/habits/:id
```

Request body:

```json
{
  "name": "Drink 3L water",
  "targetDays": "weekdays"
}
```

Response:

```json
{
  "status": "success",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
    "name": "Drink 3L water",
    "targetDays": "weekdays",
    "customDays": null,
    "startDate": "2025-05-01T00:00:00.000Z",
    "createdAt": "2025-05-03T12:34:56.789Z",
    "updatedAt": "2025-05-03T13:45:67.890Z",
    "userId": "user123"
  }
}
```

#### Delete a habit

```
DELETE /api/habits/:id
```

Response:

```json
{
  "status": "success",
  "data": {
    "message": "Habit deleted successfully"
  }
}
```

#### Log habit completion

```
POST /api/habits/:id/log
```

Request body:

```json
{
  "date": "2025-05-03",
  "completed": true
}
```

Response:

```json
{
  "status": "success",
  "data": {
    "id": "log123",
    "habitId": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
    "userId": "user123",
    "date": "2025-05-03T00:00:00.000Z",
    "completed": true,
    "createdAt": "2025-05-03T15:30:45.678Z",
    "updatedAt": "2025-05-03T15:30:45.678Z"
  }
}
```

#### Get habit logs

```
GET /api/habits/:id/logs?startDate=2025-05-01&endDate=2025-05-31
```

Response:

```json
{
  "status": "success",
  "data": [
    {
      "id": "log123",
      "habitId": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
      "userId": "user123",
      "date": "2025-05-03T00:00:00.000Z",
      "completed": true,
      "createdAt": "2025-05-03T15:30:45.678Z",
      "updatedAt": "2025-05-03T15:30:45.678Z"
    },
    ...
  ]
}
```

#### Get habit streak information

```
GET /api/habits/:id/streak
```

Response:

```json
{
  "status": "success",
  "data": {
    "habitId": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
    "currentStreak": 3,
    "longestStreak": 5
  }
}
```

#### Get today's habits

```
GET /api/habits/daily/today
```

Response:

```json
{
  "status": "success",
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
      "name": "Drink 2L water",
      "targetDays": "everyday",
      "customDays": null,
      "startDate": "2025-05-01T00:00:00.000Z",
      "createdAt": "2025-05-03T12:34:56.789Z",
      "updatedAt": "2025-05-03T12:34:56.789Z",
      "userId": "user123",
      "habitLogs": [...],
      "currentStreak": 3,
      "longestStreak": 5,
      "todayCompleted": true
    },
    ...
  ]
}
```

### User Settings

#### Get user settings

```
GET /api/settings
```

Response:

```json
{
  "status": "success",
  "data": {
    "id": "settings123",
    "userId": "user123",
    "theme": "light",
    "reminderTime": "08:00"
  }
}
```

#### Update user settings

```
PUT /api/settings
```

Request body:

```json
{
  "theme": "dark",
  "reminderTime": "20:00"
}
```

Response:

```json
{
  "status": "success",
  "data": {
    "id": "settings123",
    "userId": "user123",
    "theme": "dark",
    "reminderTime": "20:00"
  }
}
```

### Dashboard

#### Get statistics

```
GET /api/dashboard/stats?period=week
```

Available periods: `week`, `month`, `year`

Response:

```json
{
  "status": "success",
  "data": {
    "summary": {
      "totalHabits": 5,
      "totalCompletions": 18,
      "totalMissed": 3,
      "completionRate": 86
    },
    "timeSeriesData": [
      {
        "date": "2025-04-27",
        "completed": 3,
        "missed": 0,
        "total": 3
      },
      ...
    ],
    "topHabits": [
      {
        "id": "habit123",
        "name": "Meditate",
        "longestStreak": 15
      },
      ...
    ]
  }
}
```

#### Get heatmap data

```
GET /api/dashboard/heatmap?year=2025&month=5&habitId=habit123
```

All parameters are optional. If habitId is omitted, data for all habits is returned.

Response:

```json
{
  "status": "success",
  "data": [
    {
      "date": "2025-05-01",
      "value": 1,
      "habitId": "habit123",
      "habitName": "Meditate"
    },
    {
      "date": "2025-05-02",
      "value": 1,
      "habitId": "habit123",
      "habitName": "Meditate"
    },
    {
      "date": "2025-05-03",
      "value": 0,
      "habitId": "habit123",
      "habitName": "Meditate"
    },
    ...
  ]
}
```

## Authentication

All API endpoints except authentication routes (/api/auth/\*) require authentication using a JWT token.

Include the token in the Authorization header as a Bearer token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Error Handling

All errors follow a consistent format:

```json
{
  "message": "Error message describing what went wrong"
}
```

Common status codes:

- 400: Bad Request - Invalid input
- 401: Unauthorized - Missing or invalid authentication
- 403: Forbidden - Authenticated, but not authorized for the requested resource
- 404: Not Found - Resource not found
- 500: Internal Server Error - Server-side error
