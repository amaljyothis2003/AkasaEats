const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { email, password, name }
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/v1/auth/user/:uid
 * @desc    Get user by UID
 * @access  Public (but typically used internally)
 * @params  uid - User ID
 */
router.get('/user/:uid', authController.getUserByUid);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Protected (requires valid ID token)
 * @header  Authorization: Bearer <idToken>
 */
router.get('/profile', verifyToken, authController.getProfile);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update user profile
 * @access  Protected
 * @body    { name?, photoURL? }
 * @header  Authorization: Bearer <idToken>
 */
router.put('/profile', verifyToken, authController.updateProfile);

/**
 * @route   DELETE /api/v1/auth/user
 * @desc    Delete user account
 * @access  Protected
 * @header  Authorization: Bearer <idToken>
 */
router.delete('/user', verifyToken, authController.deleteUser);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Send email verification link
 * @access  Public
 * @body    { email }
 */
router.post('/verify-email', authController.sendEmailVerification);

/**
 * @route   POST /api/v1/auth/custom-token
 * @desc    Create custom token (for testing or admin use)
 * @access  Public (should be protected in production)
 * @body    { uid }
 */
router.post('/custom-token', authController.createCustomToken);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Revoke all refresh tokens (logout)
 * @access  Protected
 * @header  Authorization: Bearer <idToken>
 */
router.post('/logout', verifyToken, authController.revokeTokens);

module.exports = router;
