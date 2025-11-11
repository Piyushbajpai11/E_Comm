const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ MongoDB Connected');

    const productCount = await Product.countDocuments();
    console.log(`\nProducts in database: ${productCount}`);

    if (productCount === 0) {
      console.log('\n⚠️  No products found in database!');
      console.log('Run: npm run seed');
    } else {
      const sampleProducts = await Product.find().limit(5).lean();
      console.log('\nSample products:');
      sampleProducts.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} - $${p.price}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nMake sure MongoDB is running!');
    console.log('For local MongoDB: mongod');
    console.log('Or use MongoDB Atlas and set MONGODB_URI in .env');
    process.exit(1);
  }
}

checkDatabase();

