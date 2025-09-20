// server.js
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import authRoutes from "./routes/authRoutes.js";
import stadiumRoutes from "./routes/stadiumRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import equipmentRoutes from "./routes/equipmentRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
// import compression from 'compression';
// import helmet from 'helmet';

dotenv.config();

const app = express();
// app.use(compression());
// app.use(helmet());

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1) Connect to MongoDB
connectDB();

// 2) CORS
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
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else {
      console.error(`CORS blocked origin: ${origin}`);
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// 3) Static: serve uploaded images
//    - ทำให้รูปที่อัปโหลดเข้าถึงได้ที่ URL:  http://<HOST>/uploads/avatars/<filename>
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const AVATAR_DIR = path.join(UPLOAD_DIR, 'avatars');
fs.mkdirSync(AVATAR_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOAD_DIR));

// 4) Routes
app.use("/api/auth", authRoutes);
app.use("/api/stadiums", stadiumRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/equipments", equipmentRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/staff", staffRoutes); // รวม endpoint อัปโหลดรูป: POST /api/staff/:id/avatar

// 5) Health check (optional)
app.get('/health', (_req, res) => res.json({ ok: true }));

// 6) Start Server
const PORT = process.env.PORT || 5008;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Static uploads served at /uploads  (dir: ${UPLOAD_DIR})`);
});
