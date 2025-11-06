const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

// Test data
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'test123456',
  name: 'Test User'
};

let authToken = '';
let userId = '';

// Helper function to make requests
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

// Test cases
const runTests = async () => {
  console.log('🧪 Starting API Tests...\n');

  // Test 1: Health check
  console.log('1️⃣ Testing health endpoint...');
  const healthCheck = await apiCall('GET', '/../health');
  console.log(healthCheck.success ? '✅ PASS' : '❌ FAIL', healthCheck);
  console.log();

  // Test 2: Register user
  console.log('2️⃣ Testing user registration...');
  const registerResult = await apiCall('POST', '/auth/register', testUser);
  console.log(registerResult.success ? '✅ PASS' : '❌ FAIL', registerResult);
  
  if (registerResult.success) {
    userId = registerResult.data.data.uid;
    authToken = registerResult.data.data.customToken;
    console.log(`User ID: ${userId}`);
  }
  console.log();

  // Test 3: Get user by UID
  console.log('3️⃣ Testing get user by UID...');
  const getUserResult = await apiCall('GET', `/auth/user/${userId}`);
  console.log(getUserResult.success ? '✅ PASS' : '❌ FAIL', getUserResult);
  console.log();

  // Test 4: Register duplicate user (should fail)
  console.log('4️⃣ Testing duplicate registration (should fail)...');
  const duplicateResult = await apiCall('POST', '/auth/register', testUser);
  console.log(!duplicateResult.success ? '✅ PASS (correctly failed)' : '❌ FAIL', duplicateResult);
  console.log();

  // Test 5: Validation - missing fields
  console.log('5️⃣ Testing validation (missing fields)...');
  const validationResult = await apiCall('POST', '/auth/register', {
    email: 'test@test.com'
  });
  console.log(!validationResult.success ? '✅ PASS (correctly failed)' : '❌ FAIL', validationResult);
  console.log();

  // Note: Protected routes require Firebase Client SDK to get ID token
  console.log('⚠️  Note: Protected route tests require Firebase Client SDK to obtain ID token');
  console.log('   These routes include: /auth/profile, /auth/logout, etc.');
  console.log('   The customToken can be used with Firebase Client SDK signInWithCustomToken()');
  console.log();

  console.log('✅ Basic tests completed!');
  console.log('\n📋 Summary:');
  console.log(`   - User created: ${testUser.email}`);
  console.log(`   - User ID: ${userId}`);
  console.log(`   - Custom token available for client authentication`);
};

// Run tests
runTests().catch(console.error);
