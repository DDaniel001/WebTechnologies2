require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit'); // Added to prevent brute-force attacks
const connectDB = require('./src/config/db');

// Import the routes
const gameRoutes = require('./src/routes/gameRoutes');
const authRoutes = require('./src/routes/authRoutes');
const { errorHandler } = require('./src/middleware/errorMiddleware');

// Initialize database connection
connectDB();

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());

/**
 * Rate Limiting Configuration
 */
// General limiter: 100 requests per 15 minutes for any IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for Authentication (Login/Register)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Only 10 attempts per hour
  message: { message: 'Too many login/register attempts. Try again in an hour.' },
});

// Apply rate limiting to API routes
app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

/**
 * API Routes registration
 */
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);

// Health check route
app.get('/', (req, res) => res.send('Backend is ready!'));

/**
 * Global Error Handler Middleware
 */
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 3000; [cite: 1]
app.listen(PORT, () => {
  console.log(`-----------------------------------------`);
  console.log(`Server is running: http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop`);
  console.log(`-----------------------------------------`);
});