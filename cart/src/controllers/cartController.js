const { getFirestore, admin } = require('../config/firebase');
const itemService = require('../services/itemService');

/**
 * Get user's cart
 */
const getCart = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const db = getFirestore();

    const cartDoc = await db.collection('carts').doc(uid).get();

    if (!cartDoc.exists) {
      return res.status(200).json({
        success: true,
        data: {
          userId: uid,
          items: [],
          total: 0,
          itemCount: 0,
        },
      });
    }

    const cartData = cartDoc.data();
    
    // Fetch item details for all cart items
    const token = req.headers.authorization.split('Bearer ')[1];
    const itemIds = cartData.items.map(item => item.itemId);
    const { items, errors } = await itemService.getMultipleItems(itemIds, token);

    // Merge cart items with their details
    const enrichedItems = cartData.items.map(cartItem => {
      const itemDetails = items.find(item => item.id === cartItem.itemId);
      return {
        itemId: cartItem.itemId,
        quantity: cartItem.quantity,
        addedAt: cartItem.addedAt,
        ...itemDetails,
        subtotal: itemDetails ? itemDetails.price * cartItem.quantity : 0,
      };
    });

    // Calculate total
    const total = enrichedItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const itemCount = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);

    res.status(200).json({
      success: true,
      data: {
        userId: uid,
        items: enrichedItems,
        total: parseFloat(total.toFixed(2)),
        itemCount,
        updatedAt: cartData.updatedAt,
      },
      ...(errors.length > 0 && { warnings: errors }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add item to cart
 */
const addToCart = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { itemId, quantity } = req.body;

    // Validation
    if (!itemId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide itemId and quantity',
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    const db = getFirestore();
    const token = req.headers.authorization.split('Bearer ')[1];

    // Verify item exists and check stock
    const item = await itemService.getItem(itemId, token);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    if (item.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${item.stock} available`,
        availableStock: item.stock,
      });
    }

    // Get or create cart
    const cartRef = db.collection('carts').doc(uid);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      // Create new cart
      await cartRef.set({
        userId: uid,
        items: [{
          itemId,
          quantity: parseInt(quantity),
          addedAt: admin.firestore.FieldValue.serverTimestamp(),
        }],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // Update existing cart
      const cartData = cartDoc.data();
      const existingItemIndex = cartData.items.findIndex(i => i.itemId === itemId);

      if (existingItemIndex > -1) {
        // Item already in cart, update quantity
        const newQuantity = cartData.items[existingItemIndex].quantity + parseInt(quantity);
        
        if (newQuantity > item.stock) {
          return res.status(400).json({
            success: false,
            message: `Cannot add ${quantity} more. Maximum stock is ${item.stock}. You already have ${cartData.items[existingItemIndex].quantity} in cart.`,
            currentQuantity: cartData.items[existingItemIndex].quantity,
            availableStock: item.stock,
          });
        }

        cartData.items[existingItemIndex].quantity = newQuantity;
      } else {
        // Add new item to cart
        cartData.items.push({
          itemId,
          quantity: parseInt(quantity),
          addedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      await cartRef.update({
        items: cartData.items,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Get updated cart
    const updatedCart = await cartRef.get();
    const updatedData = updatedCart.data();

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: {
        userId: uid,
        itemCount: updatedData.items.reduce((sum, item) => sum + item.quantity, 0),
        itemsInCart: updatedData.items.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update item quantity in cart
 */
const updateQuantity = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a non-negative number',
      });
    }

    const db = getFirestore();
    const token = req.headers.authorization.split('Bearer ')[1];
    const cartRef = db.collection('carts').doc(uid);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    // If quantity is 0, remove item
    if (quantity === 0) {
      return removeFromCart(req, res, next);
    }

    // Verify stock availability
    const item = await itemService.getItem(itemId, token);
    
    if (item.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${item.stock} available`,
        availableStock: item.stock,
      });
    }

    const cartData = cartDoc.data();
    const itemIndex = cartData.items.findIndex(i => i.itemId === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    cartData.items[itemIndex].quantity = parseInt(quantity);

    await cartRef.update({
      items: cartData.items,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: {
        userId: uid,
        itemId,
        newQuantity: quantity,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove item from cart
 */
const removeFromCart = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { itemId } = req.params;

    const db = getFirestore();
    const cartRef = db.collection('carts').doc(uid);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const cartData = cartDoc.data();
    const filteredItems = cartData.items.filter(i => i.itemId !== itemId);

    if (filteredItems.length === cartData.items.length) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    await cartRef.update({
      items: filteredItems,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: {
        userId: uid,
        remainingItems: filteredItems.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear entire cart
 */
const clearCart = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const db = getFirestore();

    await db.collection('carts').doc(uid).delete();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validate cart before checkout
 */
const validateCart = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const db = getFirestore();
    const token = req.headers.authorization.split('Bearer ')[1];

    const cartDoc = await db.collection('carts').doc(uid).get();

    if (!cartDoc.exists || cartDoc.data().items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    const cartData = cartDoc.data();
    
    // Check stock availability for all items
    const stockCheckItems = cartData.items.map(item => ({
      itemId: item.itemId,
      quantity: item.quantity,
    }));

    const stockResult = await itemService.checkStockAvailability(stockCheckItems, token);

    const unavailableItems = stockResult.data.filter(item => !item.available);

    if (unavailableItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some items are not available',
        unavailableItems,
      });
    }

    // Fetch item details for pricing
    const itemIds = cartData.items.map(item => item.itemId);
    const { items } = await itemService.getMultipleItems(itemIds, token);

    const cartItems = cartData.items.map(cartItem => {
      const itemDetails = items.find(item => item.id === cartItem.itemId);
      return {
        itemId: cartItem.itemId,
        quantity: cartItem.quantity,
        price: itemDetails?.price || 0,
        name: itemDetails?.name || 'Unknown',
        subtotal: (itemDetails?.price || 0) * cartItem.quantity,
      };
    });

    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.status(200).json({
      success: true,
      message: 'Cart is valid and ready for checkout',
      data: {
        items: cartItems,
        total: parseFloat(total.toFixed(2)),
        itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  validateCart,
};
