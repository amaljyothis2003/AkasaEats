const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const verifyToken = require('../middleware/verifyToken');

/**
 * @route   GET /api/v1/cart
 * @desc    Get user's cart
 * @access  Protected
 */
router.get('/', verifyToken, cartController.getCart);

/**
 * @route   POST /api/v1/cart
 * @desc    Add item to cart
 * @access  Protected
 * @body    { itemId, quantity }
 */
router.post('/', verifyToken, cartController.addToCart);

/**
 * @route   PUT /api/v1/cart/:itemId
 * @desc    Update item quantity
 * @access  Protected
 * @body    { quantity }
 */
router.put('/:itemId', verifyToken, cartController.updateQuantity);

/**
 * @route   DELETE /api/v1/cart/:itemId
 * @desc    Remove item from cart
 * @access  Protected
 */
router.delete('/:itemId', verifyToken, cartController.removeFromCart);

/**
 * @route   DELETE /api/v1/cart
 * @desc    Clear entire cart
 * @access  Protected
 */
router.delete('/', verifyToken, cartController.clearCart);

/**
 * @route   GET /api/v1/cart/validate
 * @desc    Validate cart before checkout
 * @access  Protected
 */
router.get('/validate', verifyToken, cartController.validateCart);

module.exports = router;
