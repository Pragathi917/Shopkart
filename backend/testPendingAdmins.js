const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const testPendingAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Get all admins to see their approval status
    console.log('=== ALL ADMINS ===');
    const allAdmins = await User.find({ role: 'admin' }).select('-password');
    allAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} - isApproved: ${admin.isApproved} (type: ${typeof admin.isApproved})`);
      // Check for special values
      if (admin.isApproved === null) {
        console.log(`  -> isApproved is NULL`);
      } else if (admin.isApproved === undefined) {
        console.log(`  -> isApproved is UNDEFINED`);
      } else if (admin.isApproved === false) {
        console.log(`  -> isApproved is FALSE`);
      } else if (admin.isApproved === true) {
        console.log(`  -> isApproved is TRUE`);
      } else {
        console.log(`  -> isApproved is something else: ${admin.isApproved}`);
      }
    });
    
    console.log('\n=== QUERY 1: isApproved: { $ne: true } ===');
    const pendingAdmins1 = await User.find({ 
      role: 'admin', 
      isApproved: { $ne: true }
    }).select('-password');
    
    console.log('Count:', pendingAdmins1.length);
    pendingAdmins1.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} - isApproved: ${admin.isApproved} (type: ${typeof admin.isApproved})`);
    });
    
    console.log('\n=== QUERY 2: isApproved: false ===');
    const pendingAdmins2 = await User.find({ 
      role: 'admin', 
      isApproved: false
    }).select('-password');
    
    console.log('Count:', pendingAdmins2.length);
    pendingAdmins2.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} - isApproved: ${admin.isApproved} (type: ${typeof admin.isApproved})`);
    });
    
    // Find the difference
    console.log('\n=== DIFFERENCE ===');
    const names1 = pendingAdmins1.map(a => a.name);
    const names2 = pendingAdmins2.map(a => a.name);
    const difference = names1.filter(name => !names2.includes(name));
    console.log('In query 1 but not query 2:', difference);
    
    // Check the specific user that's different
    if (difference.length > 0) {
      console.log(`\n=== CHECKING USER: ${difference[0]} ===`);
      const user = await User.findOne({ name: difference[0], role: 'admin' }).select('-password');
      console.log('Full user object:');
      console.log(JSON.stringify(user, null, 2));
    }
    
    console.log('\n===================================');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

testPendingAdmins();