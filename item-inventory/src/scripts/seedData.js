require('dotenv').config();
const { initializeFirebase, getFirestore, admin } = require('../config/firebase');

// Initialize Firebase
initializeFirebase();

// Sample food items for AkasaEats
const sampleItems = [
  // Fruits
  {
    name: 'Fresh Apple',
    description: 'Crisp and juicy red apples, perfect for a healthy snack',
    price: 2.99,
    category: 'Fruits',
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
  },
  {
    name: 'Banana Bunch',
    description: 'Fresh yellow bananas, rich in potassium',
    price: 1.99,
    category: 'Fruits',
    stock: 150,
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
  },
  {
    name: 'Orange Pack',
    description: 'Sweet and tangy oranges, vitamin C rich',
    price: 3.49,
    category: 'Fruits',
    stock: 80,
    imageUrl: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=400',
  },
  {
    name: 'Strawberry Box',
    description: 'Fresh strawberries, sweet and delicious',
    price: 4.99,
    category: 'Fruits',
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400',
  },
  {
    name: 'Mango',
    description: 'Ripe and sweet mangoes, tropical delight',
    price: 3.99,
    category: 'Fruits',
    stock: 70,
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400',
  },

  // Vegetables
  {
    name: 'Fresh Tomatoes',
    description: 'Vine-ripened tomatoes, perfect for salads',
    price: 2.49,
    category: 'Vegetables',
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1546470427-2661bc2cd1ba?w=400',
  },
  {
    name: 'Green Lettuce',
    description: 'Crisp lettuce leaves for fresh salads',
    price: 1.99,
    category: 'Vegetables',
    stock: 90,
    imageUrl: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400',
  },
  {
    name: 'Carrot Pack',
    description: 'Fresh crunchy carrots, vitamin A rich',
    price: 2.29,
    category: 'Vegetables',
    stock: 110,
    imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
  },
  {
    name: 'Broccoli',
    description: 'Fresh green broccoli, nutrient-dense',
    price: 2.79,
    category: 'Vegetables',
    stock: 75,
    imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400',
  },
  {
    name: 'Bell Peppers',
    description: 'Colorful bell peppers, sweet and crunchy',
    price: 3.29,
    category: 'Vegetables',
    stock: 85,
    imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400',
  },

  // Non-Veg
  {
    name: 'Grilled Chicken',
    description: 'Tender grilled chicken breast, protein-rich',
    price: 8.99,
    category: 'Non-Veg',
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
  },
  {
    name: 'Chicken Tikka',
    description: 'Spicy marinated chicken tikka, Indian style',
    price: 9.99,
    category: 'Non-Veg',
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
  },
  {
    name: 'Fish Fillet',
    description: 'Fresh fish fillet, omega-3 rich',
    price: 10.99,
    category: 'Non-Veg',
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
  },
  {
    name: 'Mutton Curry',
    description: 'Slow-cooked mutton curry with spices',
    price: 12.99,
    category: 'Non-Veg',
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
  },
  {
    name: 'Prawns',
    description: 'Fresh prawns, perfectly seasoned',
    price: 11.99,
    category: 'Non-Veg',
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
  },

  // Breads
  {
    name: 'Whole Wheat Bread',
    description: 'Freshly baked whole wheat bread loaf',
    price: 2.99,
    category: 'Breads',
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
  },
  {
    name: 'Garlic Naan',
    description: 'Soft and fluffy garlic naan bread',
    price: 1.99,
    category: 'Breads',
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
  },
  {
    name: 'Baguette',
    description: 'Crispy French baguette',
    price: 3.49,
    category: 'Breads',
    stock: 80,
    imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400',
  },
  {
    name: 'Croissant',
    description: 'Buttery and flaky croissants',
    price: 2.49,
    category: 'Breads',
    stock: 90,
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
  },
  {
    name: 'Pita Bread',
    description: 'Soft pita bread pockets',
    price: 2.29,
    category: 'Breads',
    stock: 110,
    imageUrl: 'https://images.unsplash.com/photo-1600054904350-1d493ae5f922?w=400',
  },

  // Beverages
  {
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    price: 3.99,
    category: 'Beverages',
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
  },
  {
    name: 'Mineral Water',
    description: 'Pure mineral water bottle',
    price: 1.49,
    category: 'Beverages',
    stock: 200,
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400',
  },
  {
    name: 'Green Tea',
    description: 'Antioxidant-rich green tea',
    price: 2.49,
    category: 'Beverages',
    stock: 150,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
  },
  {
    name: 'Coffee',
    description: 'Freshly brewed coffee',
    price: 2.99,
    category: 'Beverages',
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
  },
  {
    name: 'Mango Smoothie',
    description: 'Thick and creamy mango smoothie',
    price: 4.49,
    category: 'Beverages',
    stock: 80,
    imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400',
  },

  // Snacks
  {
    name: 'Mixed Nuts',
    description: 'Healthy mix of almonds, cashews, and walnuts',
    price: 5.99,
    category: 'Snacks',
    stock: 90,
    imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400',
  },
  {
    name: 'Potato Chips',
    description: 'Crispy potato chips, lightly salted',
    price: 2.99,
    category: 'Snacks',
    stock: 150,
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',
  },
  {
    name: 'Sandwich',
    description: 'Fresh vegetable sandwich',
    price: 4.99,
    category: 'Snacks',
    stock: 70,
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
  },
  {
    name: 'Samosa',
    description: 'Crispy fried samosas with potato filling',
    price: 1.99,
    category: 'Snacks',
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
  },
  {
    name: 'Spring Rolls',
    description: 'Crispy vegetable spring rolls',
    price: 3.99,
    category: 'Snacks',
    stock: 85,
    imageUrl: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=400',
  },
];

/**
 * Seed the database with sample items
 */
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    const db = getFirestore();
    const itemsRef = db.collection('items');

    // Check if items already exist
    const existingItems = await itemsRef.limit(1).get();
    if (!existingItems.empty) {
      console.log('⚠️  Database already contains items. Do you want to clear and reseed?');
      console.log('   Run with --force flag to clear existing data\n');
      
      // Check for --force flag
      if (!process.argv.includes('--force')) {
        console.log('   Skipping seeding. Use: npm run seed -- --force');
        process.exit(0);
      }

      console.log('🗑️  Clearing existing items...');
      const batch = db.batch();
      const snapshot = await itemsRef.get();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('✅ Existing items cleared\n');
    }

    // Add sample items
    console.log('📦 Adding sample items...\n');
    let count = 0;

    for (const item of sampleItems) {
      const itemData = {
        ...item,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await itemsRef.add(itemData);
      count++;
      console.log(`✓ Added: ${item.name} (${item.category}) - ID: ${docRef.id}`);
    }

    console.log(`\n✅ Successfully seeded ${count} items!`);
    console.log('\n📊 Items by category:');
    
    const categories = {};
    sampleItems.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });

    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} items`);
    });

    console.log('\n🎉 Database seeding complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
