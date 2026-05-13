import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Event description is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['Workshop', 'Exhibition', 'Seminar', 'Auction', 'Meetup', 'Other'],
        required: true
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    location: {
        venue: String,
        address: String,
        city: String,
        state: String
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    onlineLink: {
        type: String
    },
    organizer: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String
    },
    maxAttendees: {
        type: Number,
        default: 0 // 0 means unlimited
    },
    rsvps: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rsvpDate: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['going', 'interested', 'not_going'],
            default: 'going'
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

// Index for queries
eventSchema.index({ startDate: 1 })
eventSchema.index({ type: 1 })

const Event = mongoose.model('Event', eventSchema)

export default Event