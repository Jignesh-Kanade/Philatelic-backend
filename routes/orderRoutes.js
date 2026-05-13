import express from 'express'
import {
    createOrder,
    getUserOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder
} from '../controllers/orderController.js'
import protect from '../middleware/auth.js'
import admin from '../middleware/admin.js'

const router = express.Router()

// Protected routes
router.use(protect)

// User routes
router.post('/', createOrder)
router.get('/my-orders', getUserOrders)
router.get('/:id', getOrderById)
router.put('/:id/cancel', cancelOrder)

// Admin routes
router.get('/', admin, getAllOrders)
router.put('/:id/status', admin, updateOrderStatus)

export default router