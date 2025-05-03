import { Router } from 'express'
import * as settingsController from '../controllers/userSettings.controller'
import authenticateToken from '../middlewares/auth.middleware'

const router = Router()

// Apply authentication middleware to all settings routes
router.use(authenticateToken)

// User settings
router.get('/', settingsController.getUserSettings)
router.put('/', settingsController.updateUserSettings)

export default router
