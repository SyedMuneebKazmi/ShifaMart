// Quick diagnostic script to test registration directly against the DB
require('dotenv').config();
const mongoose = require('mongoose');
const { connectMongoose } = require('./config/mongoConnection');
const User = require('./models/User');

async function testRegistration() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI ? 'SET (hidden)' : 'NOT SET');
    
    await connectMongoose();
    console.log('✅ Connected to MongoDB');
    
    // Try creating a user directly
    const userData = {
      name: 'Test Debug User',
      email: 'test_debug_direct_' + Date.now() + '@example.com',
      password: 'Test1234',
      role: 'patient',
      age: 26,
      gender: 'male',
      bloodGroup: 'B-',
    };
    
    console.log('Creating user with data:', userData);
    const user = await User.create(userData);
    console.log('✅ User created successfully:', user.toJSON());
    
    // Clean up
    await User.deleteOne({ _id: user._id });
    console.log('✅ Test user cleaned up');
    
  } catch (error) {
    console.error('❌ ERROR:', error.name, '-', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

testRegistration();
