import Forum from '../models/Forum.js'

// @desc    Get all forum posts
// @route   GET /api/forum
// @access  Public
export const getAllPosts = async (req, res, next) => {
    try {
        const { category, search, sort = '-createdAt' } = req.query

        let query = {}

        if (category) {
            query.category = category
        }

        if (search) {
            query.$text = { $search: search }
        }

        const posts = await Forum.find(query)
            .sort(sort)
            .populate('user', 'name email')
            .populate('comments.user', 'name')

        res.status(200).json({
            success: true,
            count: posts.length,
            posts
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Get single post
// @route   GET /api/forum/:id
// @access  Public
export const getPostById = async (req, res, next) => {
    try {
        const post = await Forum.findById(req.params.id)
            .populate('user', 'name email')
            .populate('comments.user', 'name')

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            })
        }

        // Increment views
        post.views += 1
        await post.save()

        res.status(200).json({
            success: true,
            post
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Create new post
// @route   POST /api/forum
// @access  Private
export const createPost = async (req, res, next) => {
    try {
        const { title, content, category, tags } = req.body

        const post = await Forum.create({
            user: req.user._id,
            title,
            content,
            category,
            tags: tags || []
        })

        const populatedPost = await Forum.findById(post._id).populate('user', 'name email')

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            post: populatedPost
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Update post
// @route   PUT /api/forum/:id
// @access  Private
export const updatePost = async (req, res, next) => {
    try {
        let post = await Forum.findById(req.params.id)

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            })
        }

        // Check ownership
        if (post.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this post'
            })
        }

        post = await Forum.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('user', 'name email')

        res.status(200).json({
            success: true,
            message: 'Post updated successfully',
            post
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Delete post
// @route   DELETE /api/forum/:id
// @access  Private
export const deletePost = async (req, res, next) => {
    try {
        const post = await Forum.findById(req.params.id)

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            })
        }

        // Check ownership
        if (post.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this post'
            })
        }

        await post.deleteOne()

        res.status(200).json({
            success: true,
            message: 'Post deleted successfully'
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Add comment to post
// @route   POST /api/forum/:id/comments
// @access  Private
export const addComment = async (req, res, next) => {
    try {
        const { content } = req.body

        const post = await Forum.findById(req.params.id)

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            })
        }

        if (post.isLocked) {
            return res.status(403).json({
                success: false,
                message: 'This post is locked and cannot accept new comments'
            })
        }

        post.comments.push({
            user: req.user._id,
            content
        })

        await post.save()

        const updatedPost = await Forum.findById(post._id)
            .populate('user', 'name email')
            .populate('comments.user', 'name')

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            post: updatedPost
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Delete comment
// @route   DELETE /api/forum/:id/comments/:commentId
// @access  Private
export const deleteComment = async (req, res, next) => {
    try {
        const post = await Forum.findById(req.params.id)

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            })
        }

        const comment = post.comments.id(req.params.commentId)

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            })
        }

        // Check ownership
        if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            })
        }

        comment.deleteOne()
        await post.save()

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Like/Unlike post
// @route   POST /api/forum/:id/like
// @access  Private
export const toggleLike = async (req, res, next) => {
    try {
        const post = await Forum.findById(req.params.id)

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            })
        }

        const likeIndex = post.likes.indexOf(req.user._id)

        if (likeIndex > -1) {
            // Unlike
            post.likes.splice(likeIndex, 1)
        } else {
            // Like
            post.likes.push(req.user._id)
        }

        await post.save()

        res.status(200).json({
            success: true,
            message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
            likesCount: post.likes.length,
            isLiked: likeIndex === -1
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Pin/Unpin post (Admin)
// @route   PUT /api/forum/:id/pin
// @access  Private/Admin
export const togglePin = async (req, res, next) => {
    try {
        const post = await Forum.findById(req.params.id)

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            })
        }

        post.isPinned = !post.isPinned
        await post.save()

        res.status(200).json({
            success: true,
            message: post.isPinned ? 'Post pinned' : 'Post unpinned',
            post
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Lock/Unlock post (Admin)
// @route   PUT /api/forum/:id/lock
// @access  Private/Admin
export const toggleLock = async (req, res, next) => {
    try {
        const post = await Forum.findById(req.params.id)

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            })
        }

        post.isLocked = !post.isLocked
        await post.save()

        res.status(200).json({
            success: true,
            message: post.isLocked ? 'Post locked' : 'Post unlocked',
            post
        })
    } catch (error) {
        next(error)
    }
}