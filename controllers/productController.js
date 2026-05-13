import Product from '../models/product.js'

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res, next) => {
    try {
        const { category, minPrice, maxPrice, search, featured } = req.query

        // Build query
        let query = { isActive: true }

        if (category) {
            query.category = category
        }

        if (minPrice || maxPrice) {
            query.price = {}
            if (minPrice) query.price.$gte = parseFloat(minPrice)
            if (maxPrice) query.price.$lte = parseFloat(maxPrice)
        }

        if (search) {
            query.$text = { $search: search }
        }

        if (featured === 'true') {
            query.featured = true
        }

        const products = await Product.find(query).sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            count: products.length,
            products,
            total: products.length
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }

        res.status(200).json({
            success: true,
            product
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = async (req, res, next) => {
    try {
        const { q } = req.query

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Please provide search query'
            })
        }

        const products = await Product.find({
            isActive: true,
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            count: products.length,
            products,
            total: products.length
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ featured: true, isActive: true })
            .sort({ createdAt: -1 })
            .limit(8)

        res.status(200).json({
            success: true,
            count: products.length,
            products
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
export const getProductsByCategory = async (req, res, next) => {
    try {
        const { category } = req.params

        const products = await Product.find({
            category,
            isActive: true
        }).sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            count: products.length,
            products
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Create product (Admin)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
    try {
        const productData = {
            ...req.body,
            image: req.file ? `/uploads/${req.file.filename}` : null
        }

        const product = await Product.create(productData)

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }

        product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        )

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }

        await product.deleteOne()

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        })
    } catch (error) {
        next(error)
    }
}