const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const testAPI = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    console.log('=== TESTING BACKEND API LOGIC ===\n');
    
    // Test the exact query from the updated controller
    const pendingAdmins = await User.find({ 
      role: 'admin', 
      isApproved: { $ne: true }
    }).select('-password');
    
    console.log('Query: { role: "admin", isApproved: { $ne: true } }');
    console.log('Results found:', pendingAdmins.length);
    console.log('\nPending Admins:');
    
    // Filter out super admin
    const actuallyPending = pendingAdmins.filter(admin => !admin.isSuperAdmin);
    
    console.log('After filtering out Super Admin:', actuallyPending.length);
    console.log('\nDetailed List:');
    
    actuallyPending.forEach((admin, index) => {
      console.log(`\n${index + 1}. ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   isApproved: ${admin.isApproved}`);
      console.log(`   isSuperAdmin: ${admin.isSuperAdmin}`);
      console.log(`   ID: ${admin._id}`);
    });
    
    console.log('\n\n=== SIMULATED API RESPONSE ===');
    const response = {
      success: true,
      count: actuallyPending.length,
      pendingAdmins: actuallyPending.map(a => ({
        _id: a._id,
        name: a.name,
        email: a.email,
        role: a.role,
        isApproved: a.isApproved,
        isSuperAdmin: a.isSuperAdmin,
        createdAt: a.createdAt
      }))
    };
    console.log(JSON.stringify(response, null, 2));
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

testAPI();
