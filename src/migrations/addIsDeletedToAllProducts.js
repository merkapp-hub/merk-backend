const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function migrateAllProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('🔍 Starting migration for ALL products...\n');

    // First, count total products
    const totalProducts = await Product.countDocuments({});
    console.log(`📦 Total products in database: ${totalProducts}`);

    // Count products that already have isDeleted field
    const productsWithField = await Product.countDocuments({ 
      isDeleted: { $exists: true } 
    });
    console.log(`✅ Products already having isDeleted field: ${productsWithField}`);

    // Count products that need migration
    const productsNeedingMigration = await Product.countDocuments({ 
      isDeleted: { $exists: false } 
    });
    console.log(`⚠️  Products needing migration: ${productsNeedingMigration}\n`);

    if (productsNeedingMigration === 0) {
      console.log('✅ All products already have isDeleted field. No migration needed!');
      process.exit(0);
    }

    // Show confirmation message
    console.log('📝 Migration will:');
    console.log('   - Add isDeleted: false to products without this field');
    console.log('   - Add deletedAt: null to products without this field');
    console.log('   - NOT delete or modify any existing data');
    console.log('   - Only update products that are missing these fields\n');

    // Perform the safe migration
    // This only adds fields to products that don't have them
    const result = await Product.updateMany(
      { 
        isDeleted: { $exists: false }  // Only update products without isDeleted field
      },
      { 
        $set: { 
          isDeleted: false,    // Set as not deleted
          deletedAt: null      // No deletion date
        } 
      }
    );

    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Migration Results:');
    console.log(`   - Products matched: ${result.matchedCount}`);
    console.log(`   - Products updated: ${result.modifiedCount}`);
    console.log(`   - Products acknowledged: ${result.acknowledged}\n`);

    // Verify the migration
    const verifyTotal = await Product.countDocuments({});
    const verifyWithField = await Product.countDocuments({ 
      isDeleted: { $exists: true } 
    });
    const verifyNotDeleted = await Product.countDocuments({ 
      isDeleted: false 
    });
    const verifyDeleted = await Product.countDocuments({ 
      isDeleted: true 
    });

    console.log('✅ Verification Results:');
    console.log(`   - Total products: ${verifyTotal}`);
    console.log(`   - Products with isDeleted field: ${verifyWithField}`);
    console.log(`   - Products marked as NOT deleted (isDeleted: false): ${verifyNotDeleted}`);
    console.log(`   - Products marked as deleted (isDeleted: true): ${verifyDeleted}\n`);

    if (verifyTotal === verifyWithField) {
      console.log('🎉 SUCCESS! All products now have the isDeleted field!');
    } else {
      console.log('⚠️  Warning: Some products might still be missing the field');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Run migration
console.log('🚀 Starting Safe Migration Script for All Products...\n');
migrateAllProducts();
