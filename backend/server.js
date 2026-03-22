require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Import the database connection function
const connectDB = require('./src/config/db');

// Connect to MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Backend is ready!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));