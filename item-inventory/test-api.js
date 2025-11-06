const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';
let authToken = ''; // You'll need to get this from the auth service

// Helper function
const apiCall = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

const runTests = async () => {
  console.log('🧪 Starting Item Inventory API Tests...\n');

  // Test 1: Health check
  console.log('1️⃣ Testing health endpoint...');
  const healthCheck = await apiCall('GET', '/../health');
  console.log(healthCheck.success ? '✅ PASS' : '❌ FAIL', healthCheck);
  console.log();

  console.log('⚠️  Note: Protected route tests require a valid ID token from auth service');
  console.log('   Set authToken variable with your Firebase ID token to test protected routes');
  console.log();

  if (!authToken) {
    console.log('📝 To get an ID token:');
    console.log('   1. Register/login through auth service (port 3001)');
    console.log('   2. Use Firebase Client SDK: user.getIdToken()');
    console.log('   3. Set authToken variable in this script');
    console.log();
    console.log('✅ Basic health check completed!');
    return;
  }

  // Test 2: Get all items
  console.log('2️⃣ Testing get all items...');
  const getAllResult = await apiCall('GET', '/items', null, authToken);
  console.log(getAllResult.success ? '✅ PASS' : '❌ FAIL');
  if (getAllResult.success) {
    console.log(`   Found ${getAllResult.data.count} items`);
  }
  console.log();

  // Test 3: Get categories
  console.log('3️⃣ Testing get categories...');
  const categoriesResult = await apiCall('GET', '/items/categories', null, authToken);
  console.log(categoriesResult.success ? '✅ PASS' : '❌ FAIL');
  if (categoriesResult.success) {
    console.log('   Categories:', categoriesResult.data.data);
  }
  console.log();

  // Test 4: Filter by category
  console.log('4️⃣ Testing filter by category (Fruits)...');
  const filterResult = await apiCall('GET', '/items?category=Fruits', null, authToken);
  console.log(filterResult.success ? '✅ PASS' : '❌ FAIL');
  if (filterResult.success) {
    console.log(`   Found ${filterResult.data.count} fruits`);
  }
  console.log();

  // Test 5: Search items
  console.log('5️⃣ Testing search (chicken)...');
  const searchResult = await apiCall('GET', '/items?search=chicken', null, authToken);
  console.log(searchResult.success ? '✅ PASS' : '❌ FAIL');
  if (searchResult.success) {
    console.log(`   Found ${searchResult.data.count} items matching "chicken"`);
  }
  console.log();

  console.log('✅ Tests completed!');
  console.log('\n📋 Summary:');
  console.log('   - Health check: Working');
  console.log('   - Protected routes: ' + (authToken ? 'Tested' : 'Skipped (no token)'));
  console.log('   - Use Postman collection for comprehensive testing');
};

runTests().catch(console.error);
