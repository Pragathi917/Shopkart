const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Find all admins
    const admins = await User.find({ role: 'admin' }).select('-password');
    
    console.log('=== ADMIN USERS ===\n');
    
    if (admins.length === 0) {
      console.log('❌ No admin users found!\n');
    } else {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Super Admin: ${admin.isSuperAdmin ? '✅ YES' : '❌ NO'}`);
        console.log(`   Approved: ${admin.isApproved ? '✅ YES' : '⏰ PENDING'}`);
        console.log(`   Created: ${admin.createdAt}`);
        console.log('');
      });
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkSuperAdmin();
