import express from 'express'
import {
    registerInterest,
    getUserInterests,
    removeInterest,
    getProductInterests,
    getInterestStats
} from '../controllers/interestController.js'
import protect from '../middleware/auth.js'
import admin from '../middleware/admin.js'

const router = express.Router()

// Protected routes
router.use(protect)
router.post('/', registerInterest)
router.get('/', getUserInterests)
router.delete('/:id', removeInterest)

// Admin routes
router.get('/product/:productId', admin, getProductInterests)
router.get('/stats', admin, getInterestStats)

export default router