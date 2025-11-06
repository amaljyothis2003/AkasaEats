/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Firebase errors
  if (err.code && err.code.startsWith('auth/')) {
    return res.status(400).json({
      success: false,
      message: 'Authentication error',
      error: err.message,
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors,
    });
  }

  // Axios errors (from item service calls)
  if (err.isAxiosError) {
    return res.status(err.response?.status || 500).json({
      success: false,
      message: 'Error communicating with item service',
      error: err.response?.data || err.message,
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
