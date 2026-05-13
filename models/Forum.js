import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const forumPostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Post title is required'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Post content is required'],
        trim: true
    },
    category: {
        type: String,
        enum: ['General', 'Buying/Selling', 'Stamp Values', 'History', 'Exhibitions', 'Tips & Tricks', 'Other'],
        default: 'General'
    },
    tags: [{
        type: String,
        trim: true
    }],
    comments: [commentSchema],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    views: {
        type: Number,
        default: 0
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

// Index for search
forumPostSchema.index({ title: 'text', content: 'text' })
forumPostSchema.index({ createdAt: -1 })

const Forum = mongoose.model('Forum', forumPostSchema)

export default Forum