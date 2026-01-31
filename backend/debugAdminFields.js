const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const debugAdminFields = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Get all admins without any filter
    const admins = await User.find({ role: 'admin' }).select('-password');
    
    console.log('=== ALL ADMIN USERS ===\n');
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email})`);
      console.log(`   isApproved value: ${admin.isApproved}`);
      console.log(`   isApproved type: ${typeof admin.isApproved}`);
      console.log(`   isApproved === false: ${admin.isApproved === false}`);
      console.log(`   isApproved == false: ${admin.isApproved == false}`);
      console.log(`   !isApproved: ${!admin.isApproved}`);
      console.log('');
    });
    
    console.log('=== TESTING DIFFERENT QUERIES ===\n');
    
    const query1 = await User.find({ role: 'admin', isApproved: false }).select('-password');
    console.log(`Query { role: 'admin', isApproved: false }: ${query1.length} results`);
    
    const query2 = await User.find({ role: 'admin', isApproved: { $ne: true } }).select('-password');
    console.log(`Query { role: 'admin', isApproved: { $ne: true } }: ${query2.length} results`);
    
    const query3 = await User.find({ role: 'admin', $or: [{ isApproved: false }, { isApproved: { $exists: false } }] }).select('-password');
    console.log(`Query with $or for false or undefined: ${query3.length} results`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

debugAdminFields();
