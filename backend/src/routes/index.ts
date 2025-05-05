import { Router, type Request, type Response } from 'express'

const router = Router()

import authRouter from '../routes/auth.routes'
import habitRouter from '../routes/habit.routes'
import settingsRouter from '../routes/userSettings.routes'
import dashboardRouter from '../routes/dashboard.routes'

router.use('/auth', authRouter)
router.use('/habit', habitRouter)
router.use('/settings', settingsRouter)
router.use('/dashboard', dashboardRouter)

router.get('/quote', async (req: Request, res: Response) => {
  try {
    const response = await fetch('https://zenquotes.io/api/today')
    const data = await response.json()
    console.log(`this is data:`, data)
    res.json(data)
  } catch (error) {
    console.error(error)
  }
})

export default router
