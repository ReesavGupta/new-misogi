import { Router } from 'express'
import * as dashboardController from '../controllers/dashboard.controller'
import authenticateToken from '../middlewares/auth.middleware'

const router = Router()

// Apply authentication middleware to all dashboard routes
router.use(authenticateToken)

// Dashboard routes
router.get('/stats', dashboardController.getStats)
router.get('/heatmap', dashboardController.getHeatmapData)

export default router
