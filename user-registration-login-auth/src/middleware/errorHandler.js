/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Firebase Auth errors
  if (err.code && err.code.startsWith('auth/')) {
    const errorMessages = {
      'auth/email-already-exists': 'Email already in use',
      'auth/invalid-email': 'Invalid email address',
      'auth/invalid-password': 'Password must be at least 6 characters',
      'auth/user-not-found': 'User not found',
      'auth/wrong-password': 'Invalid credentials',
      'auth/weak-password': 'Password is too weak',
      'auth/too-many-requests': 'Too many requests. Please try again later',
    };

    return res.status(400).json({
      success: false,
      message: errorMessages[err.code] || 'Authentication error',
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

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
