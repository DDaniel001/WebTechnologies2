const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes. 
 * Checks for a valid JWT token in the Authorization header.
 */
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token using our secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the database (without password) and attach to request object
      req.user = await User.findById(decoded.id);

      // Continue to the next middleware or controller
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token found' });
  }
};

module.exports = { protect };