import Wallet from '../models/Wallet.js'
import Transaction from '../models/Transaction.js'
import { getRazorpayInstance, verifyRazorpaySignature, isRazorpayConfigured } from '../config/razorpay.js'

// @desc    Get wallet details
// @route   GET /api/users/wallet
// @access  Private
export const getWallet = async (req, res, next) => {
    try {
        let wallet = await Wallet.findOne({ user: req.user._id })

        if (!wallet) {
            wallet = await Wallet.create({
                user: req.user._id,
                balance: 0
            })
        }

        res.status(200).json({
            success: true,
            balance: wallet.balance,
            wallet
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Get wallet transactions
// @route   GET /api/users/transactions
// @access  Private
export const getTransactions = async (req, res, next) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('order', 'orderId status')
            .limit(100)

        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Create Razorpay order for adding money
// @route   POST /api/users/wallet/create-order
// @access  Private
export const createRazorpayOrder = async (req, res, next) => {
    try {
        const { amount } = req.body

        // Validate amount
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid amount'
            })
        }

        // Check if Razorpay is configured
        if (!isRazorpayConfigured()) {
            return res.status(503).json({
                success: false,
                message: 'Payment gateway is not configured. Please contact administrator.',
                isConfigured: false
            })
        }

        const razorpay = getRazorpayInstance()

        if (!razorpay) {
            return res.status(503).json({
                success: false,
                message: 'Payment gateway initialization failed',
                isConfigured: false
            })
        }

        // Create Razorpay order
        const options = {
            amount: Math.round(amount * 100), // Amount in paise
            currency: 'INR',
            receipt: `w_${req.user._id.toString().slice(-6)}_${Date.now().toString().slice(-6)}`,
            notes: {
                userId: req.user._id.toString(),
                purpose: 'wallet_recharge'
            }
        }

        const order = await razorpay.orders.create(options)

        res.status(200).json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt
            },
            keyId: process.env.RAZORPAY_KEY_ID
        })
    } catch (error) {
        console.error('Razorpay order creation error:', error)
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create payment order'
        })
    }
}

// @desc    Verify payment and add money to wallet
// @route   POST /api/users/wallet/verify-payment
// @access  Private
export const verifyPaymentAndAddMoney = async (req, res, next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            amount
        } = req.body

        // Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required payment details'
            })
        }

        // Verify signature
        const isValid = verifyRazorpaySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        )

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            })
        }

        // Get or create wallet
        let wallet = await Wallet.findOne({ user: req.user._id })

        if (!wallet) {
            wallet = await Wallet.create({
                user: req.user._id,
                balance: 0
            })
        }

        // Update wallet balance
        const amountToAdd = parseFloat(amount)
        wallet.balance += amountToAdd
        await wallet.save()

        // Create transaction record
        const transaction = await Transaction.create({
            user: req.user._id,
            type: 'credit',
            amount: amountToAdd,
            description: `Money added via Razorpay - Payment ID: ${razorpay_payment_id}`,
            balanceAfter: wallet.balance,
            metadata: {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            }
        })

        res.status(200).json({
            success: true,
            message: 'Money added successfully',
            balance: wallet.balance,
            transaction
        })
    } catch (error) {
        console.error('Payment verification error:', error)
        next(error)
    }
}

// @desc    Add money to wallet (Demo mode - no payment)
// @route   POST /api/users/wallet/add
// @access  Private
export const addMoneyDemo = async (req, res, next) => {
    try {
        const { amount } = req.body

        // Validate amount
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid amount'
            })
        }

        // Get or create wallet
        let wallet = await Wallet.findOne({ user: req.user._id })

        if (!wallet) {
            wallet = await Wallet.create({
                user: req.user._id,
                balance: 0
            })
        }

        // Update balance
        const amountToAdd = parseFloat(amount)
        wallet.balance += amountToAdd
        await wallet.save()

        // Create transaction
        const transaction = await Transaction.create({
            user: req.user._id,
            type: 'credit',
            amount: amountToAdd,
            description: 'Money added (Demo mode)',
            balanceAfter: wallet.balance
        })

        res.status(200).json({
            success: true,
            message: 'Money added successfully (Demo)',
            balance: wallet.balance,
            transaction
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Check Razorpay configuration status
// @route   GET /api/users/wallet/payment-status
// @access  Private
export const getPaymentGatewayStatus = async (req, res) => {
    try {
        const isConfigured = isRazorpayConfigured()

        res.status(200).json({
            success: true,
            isConfigured,
            message: isConfigured
                ? 'Payment gateway is configured'
                : 'Payment gateway is not configured - Demo mode active'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to check payment gateway status'
        })
    }
}