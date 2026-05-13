import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide stamp name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide description']
    },
    category: {
        type: String,
        required: [true, 'Please provide category'],
        enum: [
            'Independence',
            'Wildlife',
            'Personalities',
            'Heritage',
            'Sports',
            'Art & Culture',
            'Science & Technology',
            'Flora & Fauna',
            'Monuments',
            'Events'
        ]
    },
    price: {
        type: Number,
        required: [true, 'Please provide price'],
        min: [0, 'Price cannot be negative']
    },
    denomination: {
        type: Number,
        min: [0, 'Denomination cannot be negative']
    },
    stock: {
        type: Number,
        required: [true, 'Please provide stock quantity'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    image: {
        type: String,
        required: true
    },

    releaseDate: {
        type: Date
    },
    theme: {
        type: String
    },
    designer: {
        type: String
    },
    printingMethod: {
        type: String
    },
    featured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

// Index for search and filtering
productSchema.index({ name: 'text', description: 'text' })
productSchema.index({ category: 1, price: 1 })

const Product = mongoose.models.Product ||
    mongoose.model("Product", productSchema);

export default Product