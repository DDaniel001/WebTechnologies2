const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const { errorHandler } = require('./src/middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// General Rate Limiter (Prevent basic DoS)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20000, // Limit each IP to 100 requests per window
  message: { message: 'Too many requests from this IP, please try again later.' },
});

// Stricter limiter for Authentication (Login/Register)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20000, // Only 10 attempts per hour
  message: { message: 'Too many login/register attempts. Try again in an hour.' },
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/games', require('./src/routes/gameRoutes'));

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});