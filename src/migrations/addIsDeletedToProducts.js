const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
require('dotenv').config();

async function migrateProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');

    // Find the seller with email aman2@gmail.com
    const seller = await User.findOne({ email: 'aman2@gmail.com' });
    
    if (!seller) {
      console.log('❌ Seller with email aman2@gmail.com not found');
      process.exit(1);
    }

    console.log(`✅ Found seller: ${seller.firstName} ${seller.lastName} (${seller.email})`);
    console.log(`   Seller ID: ${seller._id}`);

    // Find all products for this seller
    const products = await Product.find({ userid: seller._id });
    
    console.log(`\n📦 Found ${products.length} products for this seller`);

    if (products.length === 0) {
      console.log('No products to migrate');
      process.exit(0);
    }

    // Update products that don't have isDeleted field
    const result = await Product.updateMany(
      { 
        userid: seller._id,
        isDeleted: { $exists: false }
      },
      { 
        $set: { 
          isDeleted: false,
          deletedAt: null
        } 
      }
    );

    console.log(`\n✅ Migration completed!`);
    console.log(`   Products updated: ${result.modifiedCount}`);
    console.log(`   Products matched: ${result.matchedCount}`);

    // Verify the migration
    const verifyCount = await Product.countDocuments({ 
      userid: seller._id,
      isDeleted: false 
    });
    
    console.log(`\n✅ Verification: ${verifyCount} products now have isDeleted: false`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateProducts();
