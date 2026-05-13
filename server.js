import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './config/db.js'
import errorHandler from './middleware/errorHandler.js'
import routes from './routes/index.js'
import path from 'path'
const __dirname = path.resolve()
// Load env vars
dotenv.config()

// Connect to database
connectDB()

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}))

// Routes
app.use('/api', routes)


app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Backend Running Successfully'
    })
})

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    })
})

// Error handler (must be last)
app.use(errorHandler)

// const PORT = process.env.PORT || 5000

// app.listen(PORT, () => {
//     console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
// })

export default app