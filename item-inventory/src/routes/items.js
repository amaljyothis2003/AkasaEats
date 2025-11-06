const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const verifyToken = require('../middleware/verifyToken');
const upload = require('../middleware/upload');

/**
 * @route   GET /api/v1/items
 * @desc    Get all items (with optional filters)
 * @access  Protected
 * @query   category, search, inStock
 */
router.get('/', verifyToken, itemController.getAllItems);

/**
 * @route   GET /api/v1/items/categories
 * @desc    Get all available categories
 * @access  Protected
 */
router.get('/categories', verifyToken, itemController.getCategories);

/**
 * @route   GET /api/v1/items/category/:category
 * @desc    Get items by category
 * @access  Protected
 */
router.get('/category/:category', verifyToken, itemController.getItemsByCategory);

/**
 * @route   GET /api/v1/items/:id
 * @desc    Get item by ID
 * @access  Protected
 */
router.get('/:id', verifyToken, itemController.getItemById);

/**
 * @route   POST /api/v1/items
 * @desc    Create new item (Admin only)
 * @access  Protected
 * @body    { name, description, price, category, stock, image? }
 */
router.post('/', verifyToken, upload.single('image'), itemController.createItem);

/**
 * @route   PUT /api/v1/items/:id
 * @desc    Update item (Admin only)
 * @access  Protected
 * @body    { name?, description?, price?, category?, stock?, image? }
 */
router.put('/:id', verifyToken, upload.single('image'), itemController.updateItem);

/**
 * @route   DELETE /api/v1/items/:id
 * @desc    Delete item (Admin only)
 * @access  Protected
 */
router.delete('/:id', verifyToken, itemController.deleteItem);

/**
 * @route   PATCH /api/v1/items/:id/stock
 * @desc    Update item stock
 * @access  Protected
 * @body    { stock }
 */
router.patch('/:id/stock', verifyToken, itemController.updateStock);

/**
 * @route   POST /api/v1/items/check-stock
 * @desc    Check stock availability for multiple items
 * @access  Protected
 * @body    { items: [{ itemId, quantity }] }
 */
router.post('/check-stock', verifyToken, itemController.checkStockAvailability);

module.exports = router;
