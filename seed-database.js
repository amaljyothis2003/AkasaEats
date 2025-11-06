const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./user-registration-login-auth/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// Sample users data
const sampleUsers = [
  {
    email: 'john@example.com',
    password: 'password123',
    name: 'John Doe'
  },
  {
    email: 'jane@example.com',
    password: 'password123',
    name: 'Jane Smith'
  },
  {
    email: 'test@akasaeats.com',
    password: 'test123456',
    name: 'Test User'
  }
];

// Sample products/items data
const sampleItems = [
  // Fruits
  {
    name: 'Fresh Apple',
    description: 'Crisp and sweet red apples',
    price: 3.99,
    category: 'Fruits',
    stock: 100,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400',
    available: true
  },
  {
    name: 'Banana',
    description: 'Fresh yellow bananas',
    price: 2.49,
    category: 'Fruits',
    stock: 150,
    unit: 'dozen',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
    available: true
  },
  {
    name: 'Orange',
    description: 'Juicy oranges',
    price: 4.99,
    category: 'Fruits',
    stock: 80,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=400',
    available: true
  },
  // Vegetables
  {
    name: 'Fresh Tomato',
    description: 'Ripe red tomatoes',
    price: 2.99,
    category: 'Vegetables',
    stock: 120,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=400',
    available: true
  },
  {
    name: 'Carrot',
    description: 'Fresh organic carrots',
    price: 1.99,
    category: 'Vegetables',
    stock: 90,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
    available: true
  },
  {
    name: 'Potato',
    description: 'Fresh potatoes',
    price: 1.49,
    category: 'Vegetables',
    stock: 200,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400',
    available: true
  },
  // Non-Veg
  {
    name: 'Chicken Breast',
    description: 'Fresh boneless chicken breast',
    price: 8.99,
    category: 'Non-Veg',
    stock: 50,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400',
    available: true
  },
  {
    name: 'Fish Fillet',
    description: 'Fresh fish fillet',
    price: 12.99,
    category: 'Non-Veg',
    stock: 30,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1534766438357-2b5b0c67b1b8?w=400',
    available: true
  },
  // Breads
  {
    name: 'Whole Wheat Bread',
    description: 'Fresh whole wheat bread loaf',
    price: 2.99,
    category: 'Breads',
    stock: 60,
    unit: 'loaf',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    available: true
  },
  {
    name: 'White Bread',
    description: 'Soft white bread loaf',
    price: 2.49,
    category: 'Breads',
    stock: 70,
    unit: 'loaf',
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400',
    available: true
  },
  // Beverages
  {
    name: 'Orange Juice',
    description: 'Fresh orange juice',
    price: 4.99,
    category: 'Beverages',
    stock: 40,
    unit: 'liter',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
    available: true
  },
  {
    name: 'Apple Juice',
    description: 'Fresh apple juice',
    price: 4.49,
    category: 'Beverages',
    stock: 45,
    unit: 'liter',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400',
    available: true
  },
  // Snacks
  {
    name: 'Potato Chips',
    description: 'Crispy potato chips',
    price: 3.99,
    category: 'Snacks',
    stock: 100,
    unit: 'pack',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',
    available: true
  },
  {
    name: 'Mixed Nuts',
    description: 'Roasted mixed nuts',
    price: 6.99,
    category: 'Snacks',
    stock: 60,
    unit: 'pack',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400',
    available: true
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Create users
    console.log('👤 Creating users...');
    for (const userData of sampleUsers) {
      try {
        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.name
        });

        // Create user document in Firestore
        await db.collection('users').doc(userRecord.uid).set({
          uid: userRecord.uid,
          name: userData.name,
          email: userData.email,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Created user: ${userData.email}`);
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`⚠️  User already exists: ${userData.email}`);
        } else {
          console.error(`❌ Error creating user ${userData.email}:`, error.message);
        }
      }
    }

    // Create items/products
    console.log('\n📦 Creating products/items...');
    for (const item of sampleItems) {
      try {
        const itemData = {
          ...item,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('items').add(itemData);
        console.log(`✅ Created item: ${item.name} (ID: ${docRef.id})`);
      } catch (error) {
        console.error(`❌ Error creating item ${item.name}:`, error.message);
      }
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users created: ${sampleUsers.length}`);
    console.log(`   Items created: ${sampleItems.length}`);
    console.log('\n📝 Sample credentials:');
    console.log('   Email: test@akasaeats.com');
    console.log('   Password: test123456');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

// Run the seeding
seedDatabase();
