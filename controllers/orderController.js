import Order from '../models/Order.js'
import Product from '../models/product.js'
import Wallet from '../models/Wallet.js'
import Transaction from '../models/Transaction.js'
import mongoose from 'mongoose'

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const { items, shippingAddress, totalAmount } = req.body

        // Validate items
        if (!items || items.length === 0) {
            await session.abortTransaction()
            return res.status(400).json({
                success: false,
                message: 'No items in order'
            })
        }

        // Validate shipping address
        if (!shippingAddress || !shippingAddress.street || !shippingAddress.city ||
            !shippingAddress.state || !shippingAddress.pincode) {
            await session.abortTransaction()
            return res.status(400).json({
                success: false,
                message: 'Please provide complete shipping address'
            })
        }

        // Check wallet balance
        const wallet = await Wallet.findOne({ user: req.user._id }).session(session)

        if (!wallet || wallet.balance < totalAmount) {
            await session.abortTransaction()
            return res.status(400).json({
                success: false,
                message: 'Insufficient wallet balance'
            })
        }

        // Verify products and stock
        for (const item of items) {
            const product = await Product.findById(item.product).session(session)

            if (!product) {
                await session.abortTransaction()
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.product}`
                })
            }

            if (product.stock < item.quantity) {
                await session.abortTransaction()
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                })
            }

            // Update stock
            product.stock -= item.quantity
            await product.save({ session })
        }

        // Deduct from wallet
        wallet.balance -= totalAmount
        await wallet.save({ session })

        // Create order
        const order = await Order.create([{
            user: req.user._id,
            items,
            shippingAddress,
            totalAmount,
            paymentMethod: 'wallet',
            paymentStatus: 'completed',
            status: 'pending'
        }], { session })

        // Create transaction
        await Transaction.create([{
            user: req.user._id,
            type: 'debit',
            amount: totalAmount,
            description: `Payment for order ${order[0].orderId}`,
            balanceAfter: wallet.balance,
            order: order[0]._id
        }], { session })

        await session.commitTransaction()

        // Populate order items
        const populatedOrder = await Order.findById(order[0]._id)
            .populate('items.product', 'name imageUrl price')
            .populate('user', 'name email')

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order: populatedOrder
        })
    } catch (error) {
        await session.abortTransaction()
        next(error)
    } finally {
        session.endSession()
    }
}

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getUserOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('items.product', 'name imageUrl price category')

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
            total: orders.length
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product', 'name imageUrl price category')
            .populate('user', 'name email phone')

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        }

        // Make sure user is authorized
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this order'
            })
        }

        res.status(200).json({
            success: true,
            order
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res, next) => {
    try {
        const { status } = req.query

        let query = {}
        if (status) {
            query.status = status
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .populate('items.product', 'name imageUrl price')
            .populate('user', 'name email phone')

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
            total: orders.length
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body

        if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            })
        }

        const order = await Order.findById(req.params.id)

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        }

        order.status = status
        await order.save()

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            order
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res, next) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const order = await Order.findById(req.params.id).session(session)

        if (!order) {
            await session.abortTransaction()
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        }

        // Check authorization
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            await session.abortTransaction()
            return res.status(401).json({
                success: false,
                message: 'Not authorized to cancel this order'
            })
        }

        // Only allow cancellation if order is pending or processing
        if (!['pending', 'processing'].includes(order.status)) {
            await session.abortTransaction()
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled at this stage'
            })
        }

        // Refund to wallet
        const wallet = await Wallet.findOne({ user: order.user }).session(session)
        wallet.balance += order.totalAmount
        await wallet.save({ session })

        // Restore product stock
        for (const item of order.items) {
            const product = await Product.findById(item.product).session(session)
            if (product) {
                product.stock += item.quantity
                await product.save({ session })
            }
        }

        // Create refund transaction
        await Transaction.create([{
            user: order.user,
            type: 'credit',
            amount: order.totalAmount,
            description: `Refund for cancelled order ${order.orderId}`,
            balanceAfter: wallet.balance,
            order: order._id
        }], { session })

        // Update order status
        order.status = 'cancelled'
        await order.save({ session })

        await session.commitTransaction()

        res.status(200).json({
            success: true,
            message: 'Order cancelled and refund processed',
            order
        })
    } catch (error) {
        await session.abortTransaction()
        next(error)
    } finally {
        session.endSession()
    }
}