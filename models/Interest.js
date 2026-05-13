import mongoose from 'mongoose'

const interestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    notificationSent: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    }
}, {
    timestamps: true
})

// Compound index to prevent duplicate interests
interestSchema.index({ user: 1, product: 1 }, { unique: true })

const Interest = mongoose.model('Interest', interestSchema)

export default Interest