import express from 'express'
import upload from '../middleware/upload.js'

import {
    getAllProducts,
    getProductById,
    searchProducts,
    getFeaturedProducts,
    getProductsByCategory,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js'
import protect from '../middleware/auth.js'
import admin from '../middleware/admin.js'

const router = express.Router()

// Public routes
router.get('/', getAllProducts)
router.get('/search', searchProducts)
router.get('/featured', getFeaturedProducts)
router.get('/category/:category', getProductsByCategory)
router.get('/:id', getProductById)

// Admin routes
router.use(protect, admin)
router.post('/', upload.single('image'), createProduct)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)

export default router