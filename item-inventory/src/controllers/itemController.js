const { getFirestore, getStorage, admin } = require('../config/firebase');
const path = require('path');
const fs = require('fs').promises;

/**
 * Get all items with optional filtering
 */
const getAllItems = async (req, res, next) => {
  try {
    const { category, search, inStock } = req.query;
    const db = getFirestore();
    let query = db.collection('items');

    // Filter by category
    if (category) {
      query = query.where('category', '==', category);
    }

    // Filter by stock availability
    if (inStock === 'true') {
      query = query.where('stock', '>', 0);
    }

    const snapshot = await query.get();
    let items = [];

    snapshot.forEach(doc => {
      items.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Filter by search term (name or description)
    if (search) {
      const searchLower = search.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get item by ID
 */
const getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getFirestore();

    const doc = await db.collection('items').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get items by category
 */
const getItemsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const db = getFirestore();

    const snapshot = await db.collection('items')
      .where('category', '==', category)
      .get();

    const items = [];
    snapshot.forEach(doc => {
      items.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json({
      success: true,
      category,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all categories
 */
const getCategories = async (req, res, next) => {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('items').get();

    const categories = new Set();
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.category) {
        categories.add(data.category);
      }
    });

    res.status(200).json({
      success: true,
      data: Array.from(categories).sort(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new item (Admin only)
 */
const createItem = async (req, res, next) => {
  try {
    const { name, description, price, category, stock } = req.body;

    // Validation
    if (!name || !price || !category || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, price, category, and stock',
      });
    }

    if (price < 0 || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price and stock must be non-negative',
      });
    }

    const db = getFirestore();
    
    // Handle image upload if file is provided
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadImageToStorage(req.file);
    }

    const itemData = {
      name,
      description: description || '',
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      imageUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('items').add(itemData);

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: {
        id: docRef.id,
        ...itemData,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update item (Admin only)
 */
const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock } = req.body;
    const db = getFirestore();

    // Check if item exists
    const doc = await db.collection('items').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    const updates = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be non-negative',
        });
      }
      updates.price = parseFloat(price);
    }
    if (category) updates.category = category;
    if (stock !== undefined) {
      if (stock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock must be non-negative',
        });
      }
      updates.stock = parseInt(stock);
    }

    // Handle image upload if file is provided
    if (req.file) {
      updates.imageUrl = await uploadImageToStorage(req.file);
    }

    await db.collection('items').doc(id).update(updates);

    // Get updated document
    const updatedDoc = await db.collection('items').doc(id).get();

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete item (Admin only)
 */
const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getFirestore();

    // Check if item exists
    const doc = await db.collection('items').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Delete image from storage if exists
    const itemData = doc.data();
    if (itemData.imageUrl) {
      try {
        await deleteImageFromStorage(itemData.imageUrl);
      } catch (error) {
        console.error('Error deleting image:', error.message);
      }
    }

    await db.collection('items').doc(id).delete();

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update item stock
 */
const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a non-negative number',
      });
    }

    const db = getFirestore();
    const doc = await db.collection('items').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    await db.collection('items').doc(id).update({
      stock: parseInt(stock),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedDoc = await db.collection('items').doc(id).get();

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check stock availability for multiple items
 */
const checkStockAvailability = async (req, res, next) => {
  try {
    const { items } = req.body; // Array of { itemId, quantity }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide items array',
      });
    }

    const db = getFirestore();
    const results = [];

    for (const item of items) {
      const { itemId, quantity } = item;
      const doc = await db.collection('items').doc(itemId).get();

      if (!doc.exists) {
        results.push({
          itemId,
          available: false,
          reason: 'Item not found',
        });
        continue;
      }

      const data = doc.data();
      results.push({
        itemId,
        available: data.stock >= quantity,
        currentStock: data.stock,
        requestedQuantity: quantity,
      });
    }

    const allAvailable = results.every(r => r.available);

    res.status(200).json({
      success: true,
      allAvailable,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to upload image to Firebase Storage
 */
const uploadImageToStorage = async (file) => {
  try {
    const bucket = getStorage().bucket();
    const fileName = `items/${Date.now()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    // Make file publicly accessible
    await fileUpload.makePublic();

    return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Helper function to delete image from Firebase Storage
 */
const deleteImageFromStorage = async (imageUrl) => {
  try {
    const bucket = getStorage().bucket();
    const fileName = imageUrl.split(`${bucket.name}/`)[1];
    if (fileName) {
      await bucket.file(fileName).delete();
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

module.exports = {
  getAllItems,
  getItemById,
  getItemsByCategory,
  getCategories,
  createItem,
  updateItem,
  deleteItem,
  updateStock,
  checkStockAvailability,
};
