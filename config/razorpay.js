import Razorpay from 'razorpay'
import crypto from 'crypto'

// Initialize Razorpay instance with validation
let razorpayInstance = null

const initializeRazorpay = () => {
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
        console.error('⚠️  Razorpay credentials not found in environment variables')
        console.log('Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file')
        return null
    }

    if (keyId.trim() === '' || keySecret.trim() === '') {
        console.error('⚠️  Razorpay credentials are empty')
        return null
    }

    try {
        razorpayInstance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret
        })
        console.log('✅ Razorpay initialized successfully')
        return razorpayInstance
    } catch (error) {
        console.error('❌ Failed to initialize Razorpay:', error.message)
        return null
    }
}

// Get Razorpay instance
export const getRazorpayInstance = () => {
    if (!razorpayInstance) {
        return initializeRazorpay()
    }
    return razorpayInstance
}

// Verify Razorpay signature
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
    try {
        const keySecret = process.env.RAZORPAY_KEY_SECRET

        if (!keySecret) {
            throw new Error('Razorpay key secret not found')
        }

        const generatedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(`${orderId}|${paymentId}`)
            .digest('hex')

        return generatedSignature === signature
    } catch (error) {
        console.error('Signature verification error:', error)
        return false
    }
}

// Check if Razorpay is configured
export const isRazorpayConfigured = () => {
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    return !!(keyId && keySecret && keyId.trim() !== '' && keySecret.trim() !== '')
}

export default getRazorpayInstance