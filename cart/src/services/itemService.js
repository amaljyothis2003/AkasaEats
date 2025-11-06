const axios = require('axios');

const ITEM_SERVICE_URL = process.env.ITEM_SERVICE_URL || 'http://localhost:3002/api/v1';

/**
 * Get item details from Item Inventory service
 */
const getItem = async (itemId, userToken) => {
  try {
    const response = await axios.get(`${ITEM_SERVICE_URL}/items/${itemId}`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching item ${itemId}:`, error.message);
    throw error;
  }
};

/**
 * Check stock availability for multiple items
 */
const checkStockAvailability = async (items, userToken) => {
  try {
    const response = await axios.post(
      `${ITEM_SERVICE_URL}/items/check-stock`,
      { items },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error checking stock availability:', error.message);
    throw error;
  }
};

/**
 * Get multiple items details
 */
const getMultipleItems = async (itemIds, userToken) => {
  try {
    const promises = itemIds.map(id => getItem(id, userToken));
    const results = await Promise.allSettled(promises);
    
    const items = [];
    const errors = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        items.push(result.value);
      } else {
        errors.push({
          itemId: itemIds[index],
          error: result.reason.message,
        });
      }
    });

    return { items, errors };
  } catch (error) {
    console.error('Error fetching multiple items:', error.message);
    throw error;
  }
};

module.exports = {
  getItem,
  checkStockAvailability,
  getMultipleItems,
};
