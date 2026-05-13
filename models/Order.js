import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },
    price: {
        type: Number,
        required: true
    }
})

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true }
    },
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative']
    },
    paymentMethod: {
        type: String,
        enum: ['wallet'],
        default: 'wallet'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
})

// Generate order ID before saving
orderSchema.pre('save', async function (next) {
    if (!this.orderId) {
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(2, 9).toUpperCase()
        this.orderId = `ORD-${timestamp}-${random}`
    }
    next()
})

// Index for faster queries
orderSchema.index({ user: 1, createdAt: -1 })
// orderSchema.index({ orderId: 1 })

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)

export default Order