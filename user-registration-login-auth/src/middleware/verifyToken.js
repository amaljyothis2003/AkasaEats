const { getAuth } = require('../config/firebase');

/**
 * Middleware to verify Firebase ID token
 * Attaches decoded user info to req.user
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. No token provided.',
      });
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Invalid token format.',
      });
    }

    // Verify the token using Firebase Admin
    // Try to verify as ID token first, if it fails, try custom token
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      
      // Attach user info to request object
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified,
      };
    } catch (verifyError) {
      // If ID token verification fails, the token might be a custom token
      // For custom tokens, we'll decode them manually
      // Custom tokens are JWTs signed by Firebase, we can verify the signature
      throw verifyError; // For now, just throw the error
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }

    if (error.code === 'auth/argument-error') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid token.',
    });
  }
};

module.exports = verifyToken;
