import User from '../models/user.js'
import Wallet from '../models/Wallet.js'
import generateToken from '../utils/generateToken.js'

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body

        // Check if user exists
        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            })
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            role: 'user'
        })

        // Create wallet for user
        await Wallet.create({
            user: user._id,
            balance: 0
        })

        // Generate token
        const token = generateToken(user._id)

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            })
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password')

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            })
        }

        // Check password
        const isPasswordValid = await user.matchPassword(password)

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        // Generate token
        const token = generateToken(user._id)

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
    try {
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0)
        })

        res.status(200).json({
            success: true,
            message: 'Logout successful'
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)

        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
    try {
        const { name, phone } = req.body

        const user = await User.findById(req.user._id)

        if (name) user.name = name
        if (phone) user.phone = phone

        await user.save()

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            })
        }

        const user = await User.findById(req.user._id).select('+password')

        // Check current password
        const isMatch = await user.matchPassword(currentPassword)

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            })
        }

        // Update password
        user.password = newPassword
        await user.save()

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        })
    } catch (error) {
        next(error)
    }
}