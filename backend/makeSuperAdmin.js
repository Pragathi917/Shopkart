const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const makeSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Get email from command line argument
    const email = process.argv[2];
    
    if (!email) {
      console.log('❌ Please provide an email address!');
      console.log('Usage: node makeSuperAdmin.js <email>\n');
      console.log('Example: node makeSuperAdmin.js shadmin@gmail.com\n');
      process.exit(1);
    }

    // Find the user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`❌ User with email "${email}" not found!\n`);
      process.exit(1);
    }

    // Update user to be Super Admin
    user.isSuperAdmin = true;
    user.isApproved = true;
    user.role = 'admin';
    await user.save();

    console.log('✅ SUCCESS!\n');
    console.log(`User: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Super Admin: ✅ YES`);
    console.log(`Approved: ✅ YES\n`);
    console.log('🎉 This user is now a Super Admin with full privileges!\n');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

makeSuperAdmin();
