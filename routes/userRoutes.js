// import express from 'express'
// import protect from '../middleware/auth.js'
// import {
//     getWallet,
//     getTransactions,
//     createRazorpayOrder,
//     verifyPaymentAndAddMoney,
//     addMoneyDemo,
//     getPaymentGatewayStatus
// } from '../controllers/walletController.js'

// const router = express.Router()

// // Wallet routes (all protected)
// router.get('/wallet', protect, getWallet)
// router.get('/transactions', protect, getTransactions)
// router.get('/wallet/payment-status', protect, getPaymentGatewayStatus)
// router.post('/wallet/create-order', protect, createRazorpayOrder)
// router.post('/wallet/verify-payment', protect, verifyPaymentAndAddMoney)
// router.post('/wallet/add', protect, addMoneyDemo) // Demo mode fallback

// // Add other user routes here as needed
// // Example: profile, settings, etc.

// export default router



import express from 'express'
import protect from '../middleware/auth.js'
import admin from '../middleware/admin.js'

// User + Admin controllers
import {
    getAllUsers,
    updateUserStatus,
    deleteUser,
    getUserStats
} from '../controllers/userController.js'

// Wallet controllers (Razorpay based)
import {
    getWallet,
    getTransactions,
    createRazorpayOrder,
    verifyPaymentAndAddMoney,
    addMoneyDemo,
    getPaymentGatewayStatus
} from '../controllers/walletController.js'

const router = express.Router()

// --------------------------------------------------
// Apply authentication to all routes below
// --------------------------------------------------
router.use(protect)

// --------------------------------------------------
// Wallet Routes (User)
// --------------------------------------------------
router.get('/wallet', getWallet)
router.get('/transactions', getTransactions)
router.get('/wallet/payment-status', getPaymentGatewayStatus)

router.post('/wallet/create-order', createRazorpayOrder)
router.post('/wallet/verify-payment', verifyPaymentAndAddMoney)

// Demo / fallback (disable in production)
router.post('/wallet/add', addMoneyDemo)

// --------------------------------------------------
// Admin Routes
// --------------------------------------------------
router.get('/stats', admin, getUserStats)
router.get('/', admin, getAllUsers)
router.put('/:id/status', admin, updateUserStatus)
router.delete('/:id', admin, deleteUser)

export default router
