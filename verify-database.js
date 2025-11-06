const admin = require('firebase-admin');
const serviceAccount = require('./user-registration-login-auth/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function verifyData() {
  console.log('🔍 Verifying database data...\n');

  try {
    // Check users
    const usersSnapshot = await db.collection('users').get();
    console.log(`👤 Users in database: ${usersSnapshot.size}`);
    usersSnapshot.forEach(doc => {
      const user = doc.data();
      console.log(`   - ${user.name} (${user.email})`);
    });

    // Check items
    const itemsSnapshot = await db.collection('items').get();
    console.log(`\n📦 Items in database: ${itemsSnapshot.size}`);
    
    const categories = {};
    itemsSnapshot.forEach(doc => {
      const item = doc.data();
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item.name);
    });

    console.log('\n📊 Items by category:');
    Object.keys(categories).forEach(category => {
      console.log(`\n   ${category}:`);
      categories[category].forEach(name => {
        console.log(`      - ${name}`);
      });
    });

    console.log('\n✅ Verification complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

verifyData();
