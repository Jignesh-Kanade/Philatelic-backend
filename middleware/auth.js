import jwt from 'jsonwebtoken'
import User from '../models/user.js'

const protect = async (req, res, next) => {
    try {
        let token

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        }

        // Check for token in cookies
        if (!token && req.cookies.token) {
            token = req.cookies.token
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            })
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password')

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                })
            }

            if (!req.user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated'
                })
            }

            next()
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            })
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        })
    }
}

export default protect