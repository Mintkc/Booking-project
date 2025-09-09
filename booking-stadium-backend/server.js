import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/db.js';
import authRoutes from "./routes/authRoutes.js";
import stadiumRoutes from "./routes/stadiumRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import equipmentRoutes from "./routes/equipmentRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import path from 'path';
import { fileURLToPath } from 'url';
// import compression from 'compression';
// import helmet from 'helmet';
// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
// app.use(compression());
// app.use(helmet());
// Fix for `__dirname` in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

// Configure CORS
const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3000',
    'https://booking-stadium-nextjs.netlify.app',
    'https://admin-booking-stadium.netlify.app',
    'https://admin.booking-stadium.online',
    'https://booking-stadium.online',

];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g., mobile apps, Postman)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`CORS blocked origin: ${origin}`);
            callback(new Error('CORS not allowed for this origin'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // เพิ่ม PATCH
    credentials: true, // Allow cookies and authentication headers
    allowedHeaders: ['Content-Type', 'Authorization'], // เพิ่ม Header ที่ต้องการ
};



// Use CORS middleware with options
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/stadiums", stadiumRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/equipments", equipmentRoutes);
// ใช้ statsRoutes
app.use("/api/stats", statsRoutes);
// ✅ Route สำหรับจัดการพนักงาน
app.use("/api/staff", staffRoutes);

// Start Server
const PORT = process.env.PORT || 5008;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
