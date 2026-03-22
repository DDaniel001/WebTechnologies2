require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
// Import the routes
const gameRoutes = require('./src/routes/gameRoutes');
const authRoutes = require('./src/routes/authRoutes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Register the routes under /api/ prefix
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);

app.get('/', (req, res) => res.send('Backend is ready!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`-----------------------------------------`);
  console.log(`Server is running: http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop`);
  console.log(`-----------------------------------------`);
});