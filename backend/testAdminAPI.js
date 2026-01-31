const axios = require('axios');
require('dotenv').config();

// Test the pending admins API endpoint
const testPendingAdminsAPI = async () => {
  try {
    console.log('Testing /api/users/pending-admins endpoint...');
    
    // You need to provide a valid super admin token here
    // Get this from your browser's localStorage after logging in as a super admin
    const superAdminToken = process.env.SUPER_ADMIN_TOKEN;
    
    if (!superAdminToken) {
      console.log('Please set SUPER_ADMIN_TOKEN in your .env file');
      console.log('You can get this from your browser console after logging in as super admin:');
      console.log('localStorage.getItem("userInfo")');
      return;
    }
    
    console.log('Using token:', superAdminToken.substring(0, 20) + '...');
    
    const response = await axios.get('http://localhost:5000/api/users/pending-admins', {
      headers: {
        'Authorization': `Bearer ${superAdminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('=== API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.log('Count:', response.data.count);
    console.log('====================');
    
  } catch (error) {
    console.error('=== API ERROR ===');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    console.error('==================');
  }
};

testPendingAdminsAPI();