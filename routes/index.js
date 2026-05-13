import express from 'express'
import authRoutes from './authRoutes.js'
import userRoutes from './userRoutes.js'
import productRoutes from './productRoutes.js'
import orderRoutes from './orderRoutes.js'
import forumRoutes from './forumRoutes.js'
import eventRoutes from './eventRoutes.js'
import interestRoutes from './interestRoutes.js'

const router = express.Router()

// API Routes
router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/products', productRoutes)
router.use('/orders', orderRoutes)
router.use('/forum', forumRoutes)
router.use('/events', eventRoutes)
router.use('/interests', interestRoutes)

// Test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'API is working!',
        timestamp: new Date().toISOString()
    })
})

export default router