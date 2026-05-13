import User from '../models/user.js'
import Wallet from '../models/Wallet.js'
import Transaction from '../models/Transaction.js'
import Order from '../models/Order.js'

// @desc    Get user wallet balance
// @route   GET /api/users/wallet
// @access  Private
export const getWalletBalance = async (req, res, next) => {
    try {
        let wallet = await Wallet.findOne({ user: req.user._id })

        // Create wallet if doesn't exist
        if (!wallet) {
            wallet = await Wallet.create({
                user: req.user._id,
                balance: 0
            })
        }

        res.status(200).json({
            success: true,
            balance: wallet.balance
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Add money to wallet
// @route   POST /api/users/wallet/add
// @access  Private
export const addMoneyToWallet = async (req, res, next) => {
    try {
        const { amount } = req.body

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid amount'
            })
        }

        let wallet = await Wallet.findOne({ user: req.user._id })

        if (!wallet) {
            wallet = await Wallet.create({
                user: req.user._id,
                balance: 0
            })
        }

        // Update wallet balance
        wallet.balance += parseFloat(amount)
        await wallet.save()

        // Create transaction record
        await Transaction.create({
            user: req.user._id,
            type: 'credit',
            amount: parseFloat(amount),
            description: 'Money added to wallet',
            balanceAfter: wallet.balance
        })

        res.status(200).json({
            success: true,
            message: 'Money added successfully',
            balance: wallet.balance
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Get user transactions
// @route   GET /api/users/transactions
// @access  Private
export const getTransactions = async (req, res, next) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('order', 'orderId')

        res.status(200).json({
            success: true,
            transactions
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 })

        // Get wallet balance for each user
        const usersWithWallet = await Promise.all(
            users.map(async (user) => {
                const wallet = await Wallet.findOne({ user: user._id })
                return {
                    ...user.toObject(),
                    walletBalance: wallet ? wallet.balance : 0
                }
            })
        )

        res.status(200).json({
            success: true,
            count: usersWithWallet.length,
            users: usersWithWallet
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Update user status (Admin)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body
        const user = await User.findById(req.params.id)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        // Don't allow deactivating admin accounts
        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot deactivate admin accounts'
            })
        }

        user.isActive = status
        await user.save()

        res.status(200).json({
            success: true,
            message: `User ${status ? 'activated' : 'deactivated'} successfully`,
            user
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        // Don't allow deleting admin accounts
        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete admin accounts'
            })
        }

        // Delete associated data
        await Wallet.deleteOne({ user: user._id })
        await Transaction.deleteMany({ user: user._id })
        await Order.deleteMany({ user: user._id })

        await user.deleteOne()

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Get user stats (Admin)
// @route   GET /api/users/stats
// @access  Private/Admin
export const getUserStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments()
        const activeUsers = await User.countDocuments({ isActive: true })
        const totalOrders = await Order.countDocuments()

        // Calculate total revenue
        const revenueResult = await Order.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                activeUsers,
                totalOrders,
                totalRevenue
            }
        })
    } catch (error) {
        next(error)
    }
}