import { Router } from 'express'
import * as habitController from '../controllers/habit.controller'
import authenticateToken from '../middlewares/auth.middleware'

const router = Router()

// Apply authentication middleware to all habit routes
router.use(authenticateToken)

// Habit management
router.post('/', habitController.createHabit)
router.get('/', habitController.getHabits)
router.get('/:id', habitController.getHabitById)
router.put('/:id', habitController.updateHabit)
router.delete('/:id', habitController.deleteHabit)

// Habit logging
router.post('/:id/log', habitController.logHabitCompletion)
router.get('/:id/logs', habitController.getHabitLogs)

// Streak information
router.get('/:id/streak', habitController.getHabitStreak)

// Get habits for today
router.get('/daily/today', habitController.getTodayHabits)

export default router
