/**
 * Cart Service API Testing Script
 * 
 * Prerequisites:
 * 1. Start auth service: cd ../user-registration-login-auth && npm run dev
 * 2. Start item service: cd ../item-inventory && npm run dev
 * 3. Start cart service: npm run dev
 * 4. Run seed data in item service (optional but recommended)
 * 
 * Usage:
 * node test-api.js
 */

const axios = require('axios');

// Configuration
const CART_URL = 'http://localhost:3003/api/v1/cart';
const AUTH_URL = 'http://localhost:3001/api/v1/auth';
const ITEM_URL = 'http://localhost:3002/api/v1/items';

let authToken = '';
let userId = '';
let testItemId = '';

// Helper function for logging
const log = (message, data = null) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
  console.log('='.repeat(60));
};

const logError = (message, error) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`❌ ${message}`);
  if (error.response) {
    console.log('Status:', error.response.status);
    console.log('Data:', JSON.stringify(error.response.data, null, 2));
  } else {
    console.log('Error:', error.message);
  }
  console.log('='.repeat(60));
};

// Test functions
async function testHealthCheck() {
  try {
    const response = await axios.get('http://localhost:3003/health');
    log('Health Check', response.data);
    return true;
  } catch (error) {
    logError('Health Check Failed', error);
    return false;
  }
}

async function registerAndLogin() {
  try {
    // Register a test user
    const email = `test_cart_${Date.now()}@example.com`;
    const password = 'Test123!';
    
    const registerResponse = await axios.post(`${AUTH_URL}/register`, {
      email,
      password,
      displayName: 'Cart Test User'
    });
    
    authToken = registerResponse.data.data.idToken;
    userId = registerResponse.data.data.user.uid;
    
    log('User Registration', {
      email,
      userId,
      tokenReceived: !!authToken
    });
    
    return true;
  } catch (error) {
    logError('User Registration Failed', error);
    return false;
  }
}

async function getAvailableItem() {
  try {
    // Get first available item from inventory
    const response = await axios.get(`${ITEM_URL}?limit=1`);
    
    if (response.data.data.items && response.data.data.items.length > 0) {
      testItemId = response.data.data.items[0].id;
      log('Available Item Found', {
        itemId: testItemId,
        name: response.data.data.items[0].name,
        price: response.data.data.items[0].price,
        stock: response.data.data.items[0].stockQuantity
      });
      return true;
    } else {
      console.log('⚠️  No items found in inventory. Please run seed script in item service.');
      return false;
    }
  } catch (error) {
    logError('Failed to Get Available Item', error);
    return false;
  }
}

async function testGetEmptyCart() {
  try {
    const response = await axios.get(CART_URL, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log('Get Empty Cart', response.data);
    return true;
  } catch (error) {
    logError('Get Empty Cart Failed', error);
    return false;
  }
}

async function testAddToCart() {
  try {
    const response = await axios.post(CART_URL, {
      itemId: testItemId,
      quantity: 2
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log('Add Item to Cart', response.data);
    return true;
  } catch (error) {
    logError('Add to Cart Failed', error);
    return false;
  }
}

async function testGetCartWithItems() {
  try {
    const response = await axios.get(CART_URL, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log('Get Cart with Items', response.data);
    return true;
  } catch (error) {
    logError('Get Cart Failed', error);
    return false;
  }
}

async function testUpdateQuantity() {
  try {
    const response = await axios.put(`${CART_URL}/${testItemId}`, {
      quantity: 5
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log('Update Item Quantity', response.data);
    return true;
  } catch (error) {
    logError('Update Quantity Failed', error);
    return false;
  }
}

async function testValidateCart() {
  try {
    const response = await axios.get(`${CART_URL}/validate`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log('Validate Cart', response.data);
    return true;
  } catch (error) {
    logError('Validate Cart Failed', error);
    return false;
  }
}

async function testAddDuplicateItem() {
  try {
    // This should update quantity instead of adding duplicate
    const response = await axios.post(CART_URL, {
      itemId: testItemId,
      quantity: 3
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log('Add Duplicate Item (Should Update)', response.data);
    return true;
  } catch (error) {
    logError('Add Duplicate Item Failed', error);
    return false;
  }
}

async function testInvalidQuantity() {
  try {
    await axios.post(CART_URL, {
      itemId: testItemId,
      quantity: 0
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logError('Invalid Quantity Test', new Error('Should have failed but succeeded'));
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('Invalid Quantity Test (Expected to Fail)', {
        status: error.response.status,
        message: error.response.data.message
      });
      return true;
    }
    logError('Invalid Quantity Test', error);
    return false;
  }
}

async function testInvalidToken() {
  try {
    await axios.get(CART_URL, {
      headers: { 'Authorization': 'Bearer invalid_token_here' }
    });
    
    logError('Invalid Token Test', new Error('Should have failed but succeeded'));
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log('Invalid Token Test (Expected to Fail)', {
        status: error.response.status,
        message: error.response.data.message
      });
      return true;
    }
    logError('Invalid Token Test', error);
    return false;
  }
}

async function testRemoveItem() {
  try {
    const response = await axios.delete(`${CART_URL}/${testItemId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log('Remove Item from Cart', response.data);
    return true;
  } catch (error) {
    logError('Remove Item Failed', error);
    return false;
  }
}

async function testClearCart() {
  try {
    // First add an item
    await axios.post(CART_URL, {
      itemId: testItemId,
      quantity: 1
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    // Then clear cart
    const response = await axios.delete(CART_URL, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log('Clear Cart', response.data);
    return true;
  } catch (error) {
    logError('Clear Cart Failed', error);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  🛒 Cart Service API Test Suite                       ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Registration & Login', fn: registerAndLogin },
    { name: 'Get Available Item', fn: getAvailableItem },
    { name: 'Get Empty Cart', fn: testGetEmptyCart },
    { name: 'Add Item to Cart', fn: testAddToCart },
    { name: 'Get Cart with Items', fn: testGetCartWithItems },
    { name: 'Update Item Quantity', fn: testUpdateQuantity },
    { name: 'Validate Cart', fn: testValidateCart },
    { name: 'Add Duplicate Item', fn: testAddDuplicateItem },
    { name: 'Invalid Quantity (Error Test)', fn: testInvalidQuantity },
    { name: 'Invalid Token (Error Test)', fn: testInvalidToken },
    { name: 'Remove Item from Cart', fn: testRemoveItem },
    { name: 'Clear Cart', fn: testClearCart }
  ];
  
  for (const test of tests) {
    results.total++;
    console.log(`\n🧪 Running: ${test.name}...`);
    
    const success = await test.fn();
    if (success) {
      results.passed++;
    } else {
      results.failed++;
      // Don't stop on failure, continue testing
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  📊 Test Results Summary                               ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  Total Tests:  ${results.total.toString().padEnd(40)} ║`);
  console.log(`║  Passed:       ${results.passed.toString().padEnd(40)} ║`);
  console.log(`║  Failed:       ${results.failed.toString().padEnd(40)} ║`);
  console.log(`║  Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%${' '.repeat(36)} ║`);
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  if (results.failed === 0) {
    console.log('🎉 All tests passed successfully!');
  } else {
    console.log('⚠️  Some tests failed. Please check the logs above.');
  }
  
  process.exit(results.failed === 0 ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
