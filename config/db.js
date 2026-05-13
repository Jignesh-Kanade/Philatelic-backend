import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`)

        // Create admin user if doesn't exist
        await createAdminUser()
    } catch (error) {
        console.error(`❌ Error: ${error.message}`)
        process.exit(1)
    }
}

// Create default admin user
const createAdminUser = async () => {
    try {
        const { default: User } = await import('../models/user.js')
        const { default: Wallet } = await import('../models/Wallet.js')

        const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL })

        if (!adminExists) {
            const admin = await User.create({
                name: 'Admin User',
                email: process.env.ADMIN_EMAIL || 'admin@philately.com',
                password: process.env.ADMIN_PASSWORD || 'Admin@123',
                phone: '9999999999',
                role: 'admin',
                isActive: true
            })

            // Create wallet for admin
            await Wallet.create({
                user: admin._id,
                balance: 0
            })

            //     console.log('✅ Admin user created successfully')
            //     console.log(`📧 Email: ${admin.email}`)
            //     console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`)
        }
    } catch (error) {
        console.error('Error creating admin user:', error.message)
    }
}

export default connectDB