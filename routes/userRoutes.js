import express from 'express'
import protect from '../middleware/auth.js'
import {
    getWallet,
    getTransactions,
    createRazorpayOrder,
    verifyPaymentAndAddMoney,
    addMoneyDemo,
    getPaymentGatewayStatus
} from '../controllers/walletController.js'

const router = express.Router()

// Wallet routes (all protected)
router.get('/wallet', protect, getWallet)
router.get('/transactions', protect, getTransactions)
router.get('/wallet/payment-status', protect, getPaymentGatewayStatus)
router.post('/wallet/create-order', protect, createRazorpayOrder)
router.post('/wallet/verify-payment', protect, verifyPaymentAndAddMoney)
router.post('/wallet/add', protect, addMoneyDemo) // Demo mode fallback

// Add other user routes here as needed
// Example: profile, settings, etc.

export default router