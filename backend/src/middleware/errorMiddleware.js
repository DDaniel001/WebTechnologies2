/**
 * Global Error Handler Middleware.
 * Catches all errors and returns a formatted JSON response.
 */
const errorHandler = (err, req, res, next) => {
  // Determine the status code (default to 500 if it's currently 200)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    // Stack trace is only shown in development mode, not in production
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };