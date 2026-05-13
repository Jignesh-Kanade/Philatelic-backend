import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0, 'Amount must be positive']
    },
    description: {
        type: String,
        required: true
    },
    balanceAfter: {
        type: Number,
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    metadata: {
        razorpay_order_id: String,
        razorpay_payment_id: String,
        razorpay_signature: String
    }
}, {
    timestamps: true
})

// Compound index for efficient queries
transactionSchema.index({ user: 1, createdAt: -1 })
transactionSchema.index({ user: 1, type: 1 })

const Transaction = mongoose.model('Transaction', transactionSchema)

export default Transaction