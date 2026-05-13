import Interest from '../models/Interest.js'
import Product from '../models/Product.js'

// @desc    Register interest in a product
// @route   POST /api/interests
// @access  Private
export const registerInterest = async (req, res, next) => {
    try {
        const { productId, priority } = req.body

        // Check if product exists
        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }

        // Check if interest already exists
        let interest = await Interest.findOne({
            user: req.user._id,
            product: productId
        })

        if (interest) {
            // Update priority if provided
            if (priority) {
                interest.priority = priority
                await interest.save()
            }

            return res.status(200).json({
                success: true,
                message: 'Interest already registered',
                interest
            })
        }

        // Create new interest
        interest = await Interest.create({
            user: req.user._id,
            product: productId,
            priority: priority || 'medium'
        })

        const populatedInterest = await Interest.findById(interest._id)
            .populate('product', 'name imageUrl price releaseDate')

        res.status(201).json({
            success: true,
            message: 'Interest registered successfully',
            interest: populatedInterest
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Get user interests
// @route   GET /api/interests
// @access  Private
export const getUserInterests = async (req, res, next) => {
    try {
        const interests = await Interest.find({ user: req.user._id })
            .populate('product', 'name imageUrl price releaseDate category stock')
            .sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            count: interests.length,
            interests
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Remove interest
// @route   DELETE /api/interests/:id
// @access  Private
export const removeInterest = async (req, res, next) => {
    try {
        const interest = await Interest.findById(req.params.id)

        if (!interest) {
            return res.status(404).json({
                success: false,
                message: 'Interest not found'
            })
        }

        // Check ownership
        if (interest.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            })
        }

        await interest.deleteOne()

        res.status(200).json({
            success: true,
            message: 'Interest removed successfully'
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Get all interests for a product (Admin)
// @route   GET /api/interests/product/:productId
// @access  Private/Admin
export const getProductInterests = async (req, res, next) => {
    try {
        const interests = await Interest.find({ product: req.params.productId })
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            count: interests.length,
            interests
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Get interest statistics (Admin)
// @route   GET /api/interests/stats
// @access  Private/Admin
export const getInterestStats = async (req, res, next) => {
    try {
        const stats = await Interest.aggregate([
            {
                $group: {
                    _id: '$product',
                    count: { $sum: 1 },
                    highPriority: {
                        $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
                    }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ])

        const populatedStats = await Product.populate(stats, {
            path: '_id',
            select: 'name imageUrl price category'
        })

        res.status(200).json({
            success: true,
            stats: populatedStats
        })
    } catch (error) {
        next(error)
    }
}