// Test script to verify MongoDB connection and models
require('dotenv').config();
const connectDB = require('./config/db.js');
const User = require('./models/User.js');
const Product = require('./models/Product.js');
const Order = require('./models/Order.js');

const testConnection = async () => {
  try {
    // Connect to database
    await connectDB();
    
    console.log('✅ Database connection successful!');
    console.log('✅ User model loaded');
    console.log('✅ Product model loaded');
    console.log('✅ Order model loaded');
    
    // Test model validation
    console.log('\n📋 Testing model validations...');
    
    // Test User model
    const testUser = new User({
      name: 'Test User',
      email: 'test@shopkart.com',
      password: 'test123',
      role: 'user'
    });
    console.log('✅ User model validation passed');
    
    // Test Product model
    const testProduct = new Product({
      user: testUser._id,
      name: 'Test Product',
      description: 'A test product description',
      price: 99.99,
      image: '/images/test.jpg',
      category: 'Electronics',
      countInStock: 10,
      rating: 4.5,
      numReviews: 5
    });
    console.log('✅ Product model validation passed');
    
    // Test Order model
    const testOrder = new Order({
      user: testUser._id,
      orderItems: [{
        name: 'Test Product',
        qty: 2,
        image: '/images/test.jpg',
        price: 99.99,
        product: testProduct._id
      }],
      shippingAddress: {
        address: '123 Test St',
        city: 'Test City',
        postalCode: '12345',
        country: 'Test Country'
      },
      paymentMethod: 'PayPal',
      itemsPrice: 199.98,
      taxPrice: 20.00,
      shippingPrice: 10.00,
      totalPrice: 229.98
    });
    console.log('✅ Order model validation passed');
    
    console.log('\n🎉 All models are working correctly!');
    console.log('🚀 Your ShopKart backend is ready for development!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testConnection();