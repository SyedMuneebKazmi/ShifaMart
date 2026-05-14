const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('Testing login with:');
    console.log('Email: admin@shifamart.com');
    console.log('Password: Admin@123');
    console.log('---');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@shifamart.com',
      password: 'Admin@123'
    });
    
    console.log('✅ Admin Login Successful!');
    console.log('Token:', response.data.token.substring(0, 20) + '...');
    console.log('Role:', response.data.user.role);
  } catch (error) {
    console.error('❌ Login Failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
  process.exit(0);
};

testLogin();
