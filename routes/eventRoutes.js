import express from 'express'
import {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    rsvpToEvent,
    cancelRsvp,
    getMyRsvps
} from '../controllers/eventController.js'
import protect from '../middleware/auth.js'
import admin from '../middleware/admin.js'

const router = express.Router()

// Public routes
router.get('/', getAllEvents)
router.get('/:id', getEventById)

// Protected routes
router.use(protect)
router.get('/my/rsvps', getMyRsvps)
router.post('/:id/rsvp', rsvpToEvent)
router.delete('/:id/rsvp', cancelRsvp)

// Admin routes
router.post('/', admin, createEvent)
router.put('/:id', admin, updateEvent)
router.delete('/:id', admin, deleteEvent)

export default router