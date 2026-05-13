import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'
import Product from '../models/Product.js'
import Wallet from '../models/Wallet.js'

dotenv.config()

const products = [
    {
        name: 'Mahatma Gandhi 75th Anniversary',
        description: 'Commemorative stamp celebrating 75 years of independence and honoring Mahatma Gandhi.',
        category: 'Independence',
        price: 25,
        denomination: 5,
        stock: 100,
        imageUrl: 'https://images.unsplash.com/photo-1590698933947-a202b069a861?w=400',
        releaseDate: new Date('2022-08-15'),
        theme: 'Freedom Fighter',
        designer: 'Indian Postal Department',
        printingMethod: 'Offset',
        featured: true
    },
    {
        name: 'Bengal Tiger Conservation',
        description: 'Beautiful stamp showcasing the royal Bengal tiger, India\'s national animal.',
        category: 'Wildlife',
        price: 30,
        denomination: 10,
        stock: 150,
        imageUrl: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=400',
        releaseDate: new Date('2023-01-26'),
        theme: 'Wildlife Conservation',
        designer: 'Wildlife Institute',
        printingMethod: 'Lithography',
        featured: true
    },
    {
        name: 'Taj Mahal Heritage Series',
        description: 'Iconic Taj Mahal stamp from the UNESCO World Heritage series.',
        category: 'Heritage',
        price: 50,
        denomination: 25,
        stock: 80,
        imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400',
        releaseDate: new Date('2022-12-01'),
        theme: 'World Heritage',
        designer: 'Heritage Commission',
        printingMethod: 'Offset',
        featured: true
    },
    {
        name: 'Dr. APJ Abdul Kalam Tribute',
        description: 'Commemorating the life and contributions of India\'s Missile Man.',
        category: 'Personalities',
        price: 20,
        denomination: 5,
        stock: 200,
        imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400',
        releaseDate: new Date('2023-07-27'),
        theme: 'Great Personalities',
        designer: 'ISRO',
        printingMethod: 'Digital',
        featured: false
    },
    {
        name: 'Indian Cricket World Cup Victory',
        description: 'Celebrating India\'s historic cricket World Cup victories.',
        category: 'Sports',
        price: 35,
        denomination: 15,
        stock: 120,
        imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400',
        releaseDate: new Date('2023-06-25'),
        theme: 'Sports Achievement',
        designer: 'BCCI',
        printingMethod: 'Offset',
        featured: true
    },
    {
        name: 'Bharatanatyam Dance Form',
        description: 'Classical Indian dance Bharatanatyam depicted in vibrant colors.',
        category: 'Art & Culture',
        price: 40,
        denomination: 20,
        stock: 90,
        imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400',
        releaseDate: new Date('2023-04-14'),
        theme: 'Indian Classical Arts',
        designer: 'Kalakshetra Foundation',
        printingMethod: 'Lithography',
        featured: false
    },
    {
        name: 'Chandrayaan-3 Mission Success',
        description: 'Commemorating India\'s successful moon landing mission.',
        category: 'Science & Technology',
        price: 45,
        denomination: 25,
        stock: 110,
        imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400',
        releaseDate: new Date('2023-08-23'),
        theme: 'Space Exploration',
        designer: 'ISRO',
        printingMethod: 'Digital',
        featured: true
    },
    {
        name: 'Indian Lotus National Flower',
        description: 'Beautiful depiction of the sacred lotus, India\'s national flower.',
        category: 'Flora & Fauna',
        price: 18,
        denomination: 5,
        stock: 180,
        imageUrl: 'https://images.unsplash.com/photo-1508610048659-a06b669e4591?w=400',
        releaseDate: new Date('2023-03-21'),
        theme: 'National Symbols',
        designer: 'Botanical Survey',
        printingMethod: 'Offset',
        featured: false
    },
    {
        name: 'Red Fort Delhi',
        description: 'The magnificent Red Fort, symbol of India\'s rich history.',
        category: 'Monuments',
        price: 28,
        denomination: 10,
        stock: 140,
        imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400',
        releaseDate: new Date('2022-08-15'),
        theme: 'Historic Monuments',
        designer: 'Archaeological Survey',
        printingMethod: 'Lithography',
        featured: false
    },
    {
        name: 'Diwali Festival of Lights',
        description: 'Celebrating India\'s most beloved festival of lights and joy.',
        category: 'Events',
        price: 22,
        denomination: 5,
        stock: 160,
        imageUrl: 'https://images.unsplash.com/photo-1605806616949-1e87b487fc2f?w=400',
        releaseDate: new Date('2023-11-12'),
        theme: 'Indian Festivals',
        designer: 'Cultural Ministry',
        printingMethod: 'Offset',
        featured: true
    },
    {
        name: 'Subhash Chandra Bose Jayanti',
        description: 'Honoring Netaji Subhash Chandra Bose on his birth anniversary.',
        category: 'Personalities',
        price: 24,
        denomination: 5,
        stock: 95,
        imageUrl: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=400',
        releaseDate: new Date('2023-01-23'),
        theme: 'Freedom Fighters',
        designer: 'National Archives',
        printingMethod: 'Digital',
        featured: false
    },
    {
        name: 'Indian Peacock National Bird',
        description: 'Stunning representation of the Indian peacock in full plumage.',
        category: 'Wildlife',
        price: 32,
        denomination: 15,
        stock: 130,
        imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400',
        releaseDate: new Date('2023-02-15'),
        theme: 'National Symbols',
        designer: 'Wildlife Trust',
        printingMethod: 'Lithography',
        featured: true
    }
]

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('✅ MongoDB Connected for seeding')
    } catch (error) {
        console.error(`❌ Error: ${error.message}`)
        process.exit(1)
    }
}

const importData = async () => {
    try {
        await connectDB()

        // Clear existing data
        await Product.deleteMany()
        console.log('🗑️  Products cleared')

        // Insert products
        const createdProducts = await Product.insertMany(products)
        console.log(`✅ ${createdProducts.length} products added`)

        console.log('✅ Data Import Success!')
        process.exit()
    } catch (error) {
        console.error(`❌ Error: ${error.message}`)
        process.exit(1)
    }
}

const destroyData = async () => {
    try {
        await connectDB()

        await Order.deleteMany()
        await Product.deleteMany()
        await User.deleteMany()
        await Wallet.deleteMany()
        await Transaction.deleteMany()

        console.log('🗑️  All data destroyed!')
        process.exit()
    } catch (error) {
        console.error(`❌ Error: ${error.message}`)
        process.exit(1)
    }
}

// Run based on command line argument
if (process.argv[2] === '-d') {
    destroyData()
} else {
    importData()
}