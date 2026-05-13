import express from 'express'
import {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    addComment,
    deleteComment,
    toggleLike,
    togglePin,
    toggleLock
} from '../controllers/forumController.js'
import protect from '../middleware/auth.js'
import admin from '../middleware/admin.js'

const router = express.Router()

// Public routes
router.get('/', getAllPosts)
router.get('/:id', getPostById)

// Protected routes
router.use(protect)
router.post('/', createPost)
router.put('/:id', updatePost)
router.delete('/:id', deletePost)
router.post('/:id/comments', addComment)
router.delete('/:id/comments/:commentId', deleteComment)
router.post('/:id/like', toggleLike)

// Admin routes
router.put('/:id/pin', admin, togglePin)
router.put('/:id/lock', admin, toggleLock)

export default router