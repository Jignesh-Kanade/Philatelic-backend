import Event from '../models/Event.js'

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getAllEvents = async (req, res, next) => {
    try {
        const { type, upcoming, featured } = req.query

        let query = { isActive: true }

        if (type) {
            query.type = type
        }

        if (featured === 'true') {
            query.isFeatured = true
        }

        if (upcoming === 'true') {
            query.startDate = { $gte: new Date() }
        }

        const events = await Event.find(query)
            .sort({ startDate: 1 })
            .populate('rsvps.user', 'name email')

        res.status(200).json({
            success: true,
            count: events.length,
            events
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('rsvps.user', 'name email')

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            })
        }

        res.status(200).json({
            success: true,
            event
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Create event (Admin)
// @route   POST /api/events
// @access  Private/Admin
export const createEvent = async (req, res, next) => {
    try {
        const event = await Event.create(req.body)

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Update event (Admin)
// @route   PUT /api/events/:id
// @access  Private/Admin
export const updateEvent = async (req, res, next) => {
    try {
        let event = await Event.findById(req.params.id)

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            })
        }

        event = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )

        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            event
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Delete event (Admin)
// @route   DELETE /api/events/:id
// @access  Private/Admin
export const deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id)

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            })
        }

        await event.deleteOne()

        res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        })
    } catch (error) {
        next(error)
    }
}

// @desc    RSVP to event
// @route   POST /api/events/:id/rsvp
// @access  Private
export const rsvpToEvent = async (req, res, next) => {
    try {
        const { status } = req.body // going, interested, not_going
        const event = await Event.findById(req.params.id)

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            })
        }

        // Check if user already RSVP'd
        const existingRsvpIndex = event.rsvps.findIndex(
            rsvp => rsvp.user.toString() === req.user._id.toString()
        )

        if (existingRsvpIndex > -1) {
            // Update existing RSVP
            event.rsvps[existingRsvpIndex].status = status || 'going'
            event.rsvps[existingRsvpIndex].rsvpDate = Date.now()
        } else {
            // Check max attendees
            if (event.maxAttendees > 0 && event.rsvps.length >= event.maxAttendees) {
                return res.status(400).json({
                    success: false,
                    message: 'Event is full'
                })
            }

            // Add new RSVP
            event.rsvps.push({
                user: req.user._id,
                status: status || 'going'
            })
        }

        await event.save()

        const updatedEvent = await Event.findById(event._id)
            .populate('rsvps.user', 'name email')

        res.status(200).json({
            success: true,
            message: 'RSVP updated successfully',
            event: updatedEvent
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Cancel RSVP
// @route   DELETE /api/events/:id/rsvp
// @access  Private
export const cancelRsvp = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id)

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            })
        }

        event.rsvps = event.rsvps.filter(
            rsvp => rsvp.user.toString() !== req.user._id.toString()
        )

        await event.save()

        res.status(200).json({
            success: true,
            message: 'RSVP cancelled successfully'
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Get user's RSVPs
// @route   GET /api/events/my-rsvps
// @access  Private
export const getMyRsvps = async (req, res, next) => {
    try {
        const events = await Event.find({
            'rsvps.user': req.user._id,
            isActive: true
        }).sort({ startDate: 1 })

        res.status(200).json({
            success: true,
            count: events.length,
            events
        })
    } catch (error) {
        next(error)
    }
}