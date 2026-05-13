// Generate order ID
export const generateOrderId = () => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9).toUpperCase()
    return `ORD-${timestamp}-${random}`
}

// Calculate delivery charge
export const calculateDeliveryCharge = (totalAmount, threshold = 500) => {
    return totalAmount >= threshold ? 0 : 50
}

// Validate pincode
export const isValidPincode = (pincode) => {
    return /^\d{6}$/.test(pincode)
}

// Validate phone
export const isValidPhone = (phone) => {
    return /^[6-9]\d{9}$/.test(phone)
}

// Format currency
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(amount)
}