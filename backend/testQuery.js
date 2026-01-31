const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Exact query from getPendingAdmins function
    const pendingAdmins = await User.find({ 
      role: 'admin', 
      isApproved: { $ne: true }
    }).select('-password');
    
    console.log('Pending Admins Query Result:');
    console.log('Count:', pendingAdmins.length);
    pendingAdmins.forEach(admin => {
      console.log('- Name:', admin.name, 'Email:', admin.email, 'isApproved:', admin.isApproved, 'isSuperAdmin:', admin.isSuperAdmin);
    });
    
    // Filter out super admins
    const actuallyPending = pendingAdmins.filter(admin => !admin.isSuperAdmin);
    console.log('\nAfter filtering out super admins:');
    console.log('Count:', actuallyPending.length);
    actuallyPending.forEach(admin => {
      console.log('- Name:', admin.name, 'Email:', admin.email, 'isApproved:', admin.isApproved, 'isSuperAdmin:', admin.isSuperAdmin);
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
})();