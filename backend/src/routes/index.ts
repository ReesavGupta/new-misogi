import { Router } from 'express'

const router = Router()

import authRouter from '../routes/auth.routes'
import habitRouter from '../routes/habit.routes'
import settingsRouter from '../routes/userSettings.routes'
import dashboardRouter from '../routes/dashboard.routes'

router.use('/auth', authRouter)
router.use('/habit', habitRouter)
router.use('/settings', settingsRouter)
router.use('/dashboard', settingsRouter)

export default router
